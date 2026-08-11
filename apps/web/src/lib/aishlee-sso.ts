/**
 * buildAishleeIframeUrl
 * ─────────────────────
 * Builds the full SSO-authenticated URL for embedding any Aishlee Web App
 * module inside a WACRM iframe.
 *
 * Call this ONLY after `user` is defined (not undefined). The caller is
 * responsible for checking `if (user === undefined) return;` before calling
 * this function.
 *
 * @param module   The Aishlee module path, e.g. 'moneyo', 'tasko', 'teacho'
 * @param user     The Supabase auth User object from useAuth()
 * @param profile  The WACRM profile object from useAuth()
 * @param session  The Supabase Session from getSession() — may be null
 * @param extra    Optional extra query params (e.g. { student, exam, gemini_api_key })
 */
export function buildAishleeIframeUrl(
  module: string,
  user: any,
  profile: any,
  session: any,
  extra: Record<string, string> = {}
): string {
  // Clean module path (remove leading slash if present)
  const cleanModule = module.startsWith('/') ? module.slice(1) : module;

  // ── 1. Phone ─────────────────────────────────────────────────────────────
  const rawPhone =
    profile?.phone ||
    user?.phone ||
    (user?.email?.includes('@whatsapp.wacrm.local')
      ? user.email.split('@')[0]
      : user?.email?.split('@')[0]) ||
    '';
  const phone = rawPhone.replace(/\D/g, '').slice(-10);

  // ── 2. Name ───────────────────────────────────────────────────────────────
  const name =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    'User';

  // ── 3. Base params ────────────────────────────────────────────────────────
  const params = new URLSearchParams({
    embed: 'true',
    phone,
    name,
    ...extra,
  });

  let url = `https://thamizhan.vercel.app/${cleanModule}?${params.toString()}`;

  return url;
}
