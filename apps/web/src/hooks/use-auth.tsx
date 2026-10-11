"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import {
  canEditSettings as canEditSettingsFor,
  canManageMembers as canManageMembersFor,
  canSendMessages as canSendMessagesFor,
  isAccountRole,
  type AccountRole,
} from "@/lib/auth/roles";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string | null;
  beta_features: string[];
  account_id: string | null;
  account_role: AccountRole | null;
  /** Area pincode — used by FAGO to auto-fill buyer/provider location */
  pincode: string | null;
  /** WhatsApp phone — used by FAGO for buyer contact */
  phone: string | null;
  whatsapp?: string | null;
  district?: string | null;
  location?: string | null;
  upi_id?: string | null;
  gemini_api_key?: string | null;
  category?: string | null;
  main_category?: string | null;
  default_module?: string | null;
  pinned_modules?: string[] | null;
  profile_complete?: boolean | null;
  last_whatsapp_inbound_at?: string | null;
  is_whatsapp_session_active?: boolean;
  whatsapp_window_expires_at?: string | null;
  whatsapp_hours_remaining?: number;
}

interface AccountSummary {
  id: string;
  name: string;
  /** Default deal currency (ISO-4217). NOT NULL DEFAULT 'USD' in the
   *  DB (migration 021); narrowed to DEFAULT_CURRENCY when absent. */
  default_currency: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  /**
   * Session-level loading. Flips to false as soon as we know whether
   * a user is signed in, *without* waiting for the profile row. Use
   * this for chrome (sidebar / header) that can render with just the
   * user object.
   */
  loading: boolean;
  /**
   * Profile-row loading. Stays true until `fetchProfile` settles
   * (success, missing row, or error). Code that branches on
   * `profile.beta_features` MUST gate on this — otherwise it sees the
   * `{ loading: false, profile: null }` window during initial load
   * and may take the "not opted in" branch incorrectly.
   */
  profileLoading: boolean;
  signOut: () => Promise<void>;
  /** Re-fetch the current user's profile row — call after a save from
   *  the settings form so header/sidebar reflect the change without a
   *  full page reload. */
  refreshProfile: () => Promise<void>;

  // ----------------------------------------------------------
  // Account-scoped context (added by the account-sharing series)
  //
  // All of these are nullable until `profileLoading` is false.
  // After the profile resolves they're guaranteed to be set,
  // because migration 017 made `account_id` / `account_role`
  // NOT NULL on `profiles`.
  // ----------------------------------------------------------

  /** Account id the current user belongs to. Null while loading. */
  accountId: string | null;
  /** Role within that account. Null while loading. */
  accountRole: AccountRole | null;
  /** Lightweight account meta — id + name + default_currency. Null while loading. */
  account: AccountSummary | null;
  /** Account default deal currency. Falls back to DEFAULT_CURRENCY
   *  while loading or when no account is resolved, so callers can use
   *  it unconditionally. */
  defaultCurrency: string;
  /** True if `accountRole === 'owner'`. */
  isOwner: boolean;
  /** True if `accountRole === 'admin'` (does NOT include owner — use canManageMembers for "admin or above"). */
  isAdmin: boolean;
  /** True if `accountRole === 'agent'`. */
  isAgent: boolean;
  /** True if `accountRole === 'viewer'`. */
  isViewer: boolean;
  /** True if the caller can manage members (admin+). */
  canManageMembers: boolean;
  /** True if the caller can edit account-wide settings (admin+). */
  canEditSettings: boolean;
  /** True if the caller can send messages and edit operational data (agent+). */
  canSendMessages: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider — wrap this around the dashboard layout.
 * Makes ONE getSession() call for the whole tree instead of one per
 * component, avoiding internal lock contention in the Supabase client.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  // Tracked separately from `loading`. The session settles fast (one
  // local cookie read); the profile fetch crosses the network and
  // settles later. Callers that gate on `profile.*` need to know which
  // window they're in — see the type doc above.
  const [profileLoading, setProfileLoading] = useState(true);

  const getJwtUserFromBrowser = useCallback((): User | null => {
    if (typeof window === "undefined") return null;
    try {
      let token = localStorage.getItem("sb-access-token") || "";
      if (!token && document.cookie) {
        const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
        if (match && match[1]) {
          token = decodeURIComponent(match[1]);
          try {
            localStorage.setItem("sb-access-token", token);
          } catch (_) {}
        }
      }
      if (!token) return null;
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp <= nowSec) return null;
      const cleanPhone = (payload.phone || "").replace(/\D/g, "").slice(-10);
      return {
        id: payload.id || payload.sub || (cleanPhone ? `user_${cleanPhone}` : "user_authenticated"),
        app_metadata: {},
        user_metadata: payload,
        aud: "authenticated",
        created_at: new Date().toISOString(),
        email: payload.email || "",
        phone: payload.phone || cleanPhone || "",
        role: payload.role || "user",
      } as User;
    } catch (_) {
      return null;
    }
  }, []);

  // Shared across init, auth-state-change listener, and the exposed
  // refreshProfile() callback. Reads the current session's user id and
  // pulls the matching profile row along with its account summary.
  const fetchProfile = useCallback(async (userId: string, userPhone?: string) => {
    const supabase = createClient();
    setProfileLoading(true);
    try {
      let data: any = null;
      let resolvedAuthUser: User | null = null;
      const cleanPhone = (userPhone || (typeof window !== "undefined" ? localStorage.getItem("user-phone") || "" : "")).replace(/\D/g, "").slice(-10);

      // 1. Primary: Fetch from authoritative OCI /api/auth/me or /api/auth/check
      if (typeof window !== "undefined") {
        try {
          let directToken = localStorage.getItem("sb-access-token") || "";
          if (!directToken && document.cookie) {
            const match = document.cookie.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
            if (match && match[1]) directToken = decodeURIComponent(match[1]);
          }
          const headers: Record<string, string> = {};
          if (directToken) headers["Authorization"] = `Bearer ${directToken}`;
          const meRes = await fetch("/api/auth/me", {
            cache: "no-store",
            credentials: "include",
            headers,
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.authenticated && meData.profile) {
              if (meData.user) {
                resolvedAuthUser = meData.user as User;
              }
              if (meData.token) {
                try {
                  localStorage.setItem("sb-access-token", meData.token);
                } catch (_) {}
              }
              data = {
                ...meData.profile,
                last_whatsapp_inbound_at: meData.last_whatsapp_inbound_at ?? meData.profile.last_whatsapp_inbound_at ?? null,
                is_whatsapp_session_active: meData.is_whatsapp_session_active ?? meData.profile.is_whatsapp_session_active,
                whatsapp_window_expires_at: meData.whatsapp_window_expires_at ?? meData.profile.whatsapp_window_expires_at ?? null,
                whatsapp_hours_remaining: meData.whatsapp_hours_remaining ?? meData.profile.whatsapp_hours_remaining,
              };
            }
          }
        } catch (_) {}

        if ((!data || !data.last_whatsapp_inbound_at) && cleanPhone) {
          try {
            const checkRes = await fetch(`/api/auth/check?phone=${cleanPhone}`, { cache: "no-store" });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.exists) {
                data = {
                  ...(data || {}),
                  id: data?.id || checkData.id || userId,
                  full_name: data?.full_name || checkData.full_name || checkData.name || null,
                  phone: data?.phone || cleanPhone,
                  whatsapp: data?.whatsapp || cleanPhone,
                  role: data?.role || checkData.role || "user",
                  main_category: data?.main_category || checkData.main_category || checkData.category || "Traveller",
                  upi_id: data?.upi_id || checkData.upi_id || null,
                  location: data?.location || checkData.location || null,
                  gemini_api_key: data?.gemini_api_key || checkData.gemini_api_key || null,
                  avatar_url: data?.avatar_url || checkData.avatar_url || null,
                  last_whatsapp_inbound_at: checkData.last_whatsapp_inbound_at || data?.last_whatsapp_inbound_at || null,
                  is_whatsapp_session_active: checkData.is_whatsapp_session_active ?? data?.is_whatsapp_session_active,
                  whatsapp_window_expires_at: checkData.whatsapp_window_expires_at ?? data?.whatsapp_window_expires_at ?? null,
                  whatsapp_hours_remaining: checkData.whatsapp_hours_remaining ?? data?.whatsapp_hours_remaining,
                };
              }
            }
          } catch (_) {}
        }
      }

      // 2. Fallback: Direct Supabase query
      if (!data && userId && !userId.startsWith("user_")) {
        const res = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        data = res.data;
      }

      if (!data && cleanPhone) {
        const res = await supabase
          .from("profiles")
          .select("*")
          .or(`phone.ilike.%${cleanPhone}%,whatsapp.ilike.%${cleanPhone}%`)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        data = res.data;
      }

      if (data) {
        const accountRole = isAccountRole(data.account_role)
          ? data.account_role
          : "owner";

        const resolvedPhone = (data.phone || data.whatsapp || cleanPhone || "") as string;
        const fallbackUser: User = resolvedAuthUser || {
          id: data.id || userId,
          app_metadata: {},
          user_metadata: {
            id: data.id || userId,
            phone: resolvedPhone,
            full_name: data.full_name || "",
            fullName: data.full_name || "",
            role: data.role || "user",
            category: data.main_category || data.category || "Traveller",
          },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          email: data.email || "",
          phone: resolvedPhone,
          role: data.role || "user",
        } as User;

        setUser((prev) => prev || fallbackUser);

        setProfile({
          ...data,
          id: data.id,
          full_name: data.full_name || null,
          email: data.email || "",
          avatar_url: data.avatar_url,
          role: data.role,
          main_category: data.main_category || data.category || null,
          beta_features: Array.isArray(data.beta_features) ? data.beta_features : [],
          account_id: data.account_id ?? "f21e8cdb-e27d-41fa-9aa4-af06ccdc0feb",
          account_role: accountRole,
          pincode: (data as Record<string, unknown>).pincode as string | null ?? null,
          phone: (data as Record<string, unknown>).phone as string | null ?? (data as Record<string, unknown>).whatsapp as string | null ?? null,
          upi_id: (data as Record<string, unknown>).upi_id as string | null ?? null,
          location: (data as Record<string, unknown>).location as string | null ?? null,
          last_whatsapp_inbound_at: data.last_whatsapp_inbound_at ?? null,
          is_whatsapp_session_active: data.is_whatsapp_session_active,
          whatsapp_window_expires_at: data.whatsapp_window_expires_at ?? null,
          whatsapp_hours_remaining: data.whatsapp_hours_remaining,
        } as any);
      }
    } catch (err) {
      console.error("[AuthProvider] fetchProfile threw:", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn("[AuthProvider] getSession() timed out");
        setLoading(false);
        setProfileLoading(false);
      }
    }, 6000);

    const init = async () => {
      try {
        // Fast path 1: Instant local/cookie token check (0ms wait, no network delay)
        let currentUser: User | null = getJwtUserFromBrowser();

        // If local/cookie token found, immediately set user and unblock UI rendering
        if (currentUser && mounted) {
          setUser(currentUser);
          setLoading(false);
          const phone = (currentUser as any).phone || (currentUser as any).user_metadata?.phone;
          await fetchProfile(currentUser.id, phone);
          return;
        }

        // Supabase session check (in background or if no direct token)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) console.error("[AuthProvider] getSession error:", error.message);

        if (!mounted) return;
        if (session?.user) {
          currentUser = session.user;
          setUser(currentUser);
          setLoading(false);
          const phone = currentUser.phone || currentUser.email;
          await fetchProfile(currentUser.id, phone);
          return;
        }

        // Fallback: If still no currentUser, call /api/auth/me to read HttpOnly cookies
        if (!currentUser && typeof window !== "undefined") {
          try {
            const meRes = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
            if (meRes.ok) {
              const meData = await meRes.json();
              if (meData.authenticated && meData.user && mounted) {
                currentUser = meData.user;
                setUser(currentUser);
                setLoading(false);
                if (meData.token) {
                  try {
                    localStorage.setItem("sb-access-token", meData.token);
                    document.cookie = `sb-access-token=${meData.token}; path=/; max-age=${30 * 86400}; SameSite=Lax`;
                  } catch (_) {}
                }
                if (meData.profile) {
                  setProfile({
                    ...meData.profile,
                    last_whatsapp_inbound_at: meData.last_whatsapp_inbound_at ?? meData.profile.last_whatsapp_inbound_at ?? null,
                    is_whatsapp_session_active: meData.is_whatsapp_session_active ?? meData.profile.is_whatsapp_session_active,
                    whatsapp_window_expires_at: meData.whatsapp_window_expires_at ?? meData.profile.whatsapp_window_expires_at ?? null,
                    whatsapp_hours_remaining: meData.whatsapp_hours_remaining ?? meData.profile.whatsapp_hours_remaining,
                  });
                  setProfileLoading(false);
                  return;
                }
              }
            }
          } catch (_) {}
        }

        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            const phone = (currentUser as any).phone || (currentUser as any).user_metadata?.phone;
            await fetchProfile(currentUser.id, phone);
          } else {
            setProfile(null);
            setAccount(null);
            setProfileLoading(false);
          }
        }
      } catch (err) {
        console.error("[AuthProvider] init threw:", err);
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(safetyTimer);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const currentUser = session.user;
        setUser(currentUser);
        const phone = (currentUser as any).phone || (currentUser as any).user_metadata?.phone;
        fetchProfile(currentUser.id, phone);
        setLoading(false);
        return;
      }

      // IMPORTANT: When authenticated via OCI JWT (sb-access-token in localStorage/cookie),
      // Supabase GoTrue emits INITIAL_SESSION or SIGNED_OUT with session=null.
      // Never wipe our active OCI JWT user/profile when a valid OCI token exists!
      const jwtUser = getJwtUserFromBrowser();
      if (jwtUser) {
        setUser((prev) => prev || jwtUser);
        setLoading(false);
        return;
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile, getJwtUserFromBrowser]);

  const signOut = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sb-access-token");
        localStorage.removeItem("sb-refresh-token");
        localStorage.removeItem("user-phone");
        document.cookie = "sb-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
    } catch (_) {}
    setUser(null);
    setProfile(null);
    setAccount(null);
    window.location.href = "/login";
  }, []);

  const refreshProfile = useCallback(async () => {
    const targetId = user?.id || profile?.id;
    const targetPhone = (user as any)?.phone || profile?.phone || undefined;
    if (!targetId && !targetPhone) return;
    await fetchProfile(targetId || "user_authenticated", targetPhone);
  }, [user, profile?.id, profile?.phone, fetchProfile]);

  // Derive the role booleans once per profile change rather than on
  // every consumer render. Cheap regardless, but the memo also gives
  // each derived value a stable identity for React.memo / useEffect
  // dependencies downstream.
  const derived = useMemo(() => {
    const role = profile?.account_role ?? "owner";
    const acctId = profile?.account_id ?? "f21e8cdb-e27d-41fa-9aa4-af06ccdc0feb";
    return {
      accountRole: role,
      accountId: acctId,
      isOwner: role === "owner",
      isAdmin: role === "admin",
      isAgent: role === "agent",
      isViewer: role === "viewer",
      canManageMembers: canManageMembersFor(role),
      canEditSettings: canEditSettingsFor(role),
      canSendMessages: canSendMessagesFor(role),
    };
  }, [profile?.account_role, profile?.account_id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        signOut,
        refreshProfile,
        account,
        defaultCurrency: account?.default_currency ?? DEFAULT_CURRENCY,
        ...derived,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — read the shared auth state from context.
 * Must be used inside an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback for components rendered outside the provider (shouldn't
    // happen in normal flow, but don't crash the page). Account state
    // collapses to least-privileged null — every `canX` boolean is
    // false so UI gates fail closed.
    return {
      user: null,
      profile: null,
      loading: false,
      profileLoading: false,
      signOut: async () => {
        window.location.href = "/login";
      },
      refreshProfile: async () => {},
      account: null,
      defaultCurrency: DEFAULT_CURRENCY,
      accountId: null,
      accountRole: null,
      isOwner: false,
      isAdmin: false,
      isAgent: false,
      isViewer: false,
      canManageMembers: false,
      canEditSettings: false,
      canSendMessages: false,
    };
  }
  return ctx;
}
