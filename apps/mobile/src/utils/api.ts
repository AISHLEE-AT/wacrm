const API_URL = 'https://watscrm.vercel.app';
const endpoints = {
  authCheck: `${API_URL}/api/auth/check`,
  authVerify: `${API_URL}/api/auth/otp/verify`,
  authPinSet: `${API_URL}/api/auth/pin/set`,
  authPinLogin: `${API_URL}/api/auth/pin`,
  authWaba: `${API_URL}/api/auth/otp/waba`,
  updateProfile: `${API_URL}/api/profile/update`,
};

export const API = {
  checkUser: async (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE";

    // 1. Try Vercel API with 2.5s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${endpoints.authCheck}?phone=${cleanPhone}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          return data;
        }
      }
    } catch (_) {
      // Fallback to direct Supabase query
    }

    // 2. Direct Supabase Query (100% offline-resilient & checks all phone formats)
    try {
      const spUrl = `https://gmahjdzqitbomtmdzlfp.supabase.co/rest/v1/profiles?or=(phone.ilike.*${cleanPhone}*,whatsapp.ilike.*${cleanPhone}*)&select=id,full_name,main_category,role,pin_hash,gemini_api_key,last_whatsapp_inbound_at&order=updated_at.desc&limit=1`;
      const spRes = await fetch(spUrl, {
        headers: { "apikey": anonKey, "Authorization": `Bearer ${anonKey}` }
      });
      const spData = await spRes.json();
      
      if (Array.isArray(spData) && spData.length > 0) {
        const profile = spData[0];
        let lastInbound = profile.last_whatsapp_inbound_at ? new Date(profile.last_whatsapp_inbound_at).getTime() : 0;
        let lastInboundIso = profile.last_whatsapp_inbound_at || null;

        // Fallback: check conversations if profile missing last_whatsapp_inbound_at
        if (!lastInbound || isNaN(lastInbound) || lastInbound <= 0) {
          try {
            const convUrl = `https://gmahjdzqitbomtmdzlfp.supabase.co/rest/v1/conversations?select=last_message_at,updated_at&order=last_message_at.desc&limit=5`;
            const convRes = await fetch(convUrl, {
              headers: { "apikey": anonKey, "Authorization": `Bearer ${anonKey}` }
            });
            const convData = await convRes.json();
            if (Array.isArray(convData) && convData.length > 0 && convData[0].last_message_at) {
              const parsed = new Date(convData[0].last_message_at).getTime();
              if (!isNaN(parsed) && parsed > 0) {
                lastInbound = parsed;
                lastInboundIso = convData[0].last_message_at;
              }
            }
          } catch (_) {}
        }

        const isWindowActive = lastInbound > 0 && (Date.now() - lastInbound) < 24 * 60 * 60 * 1000;
        const hoursRemaining = isWindowActive ? Math.max(0, Math.round(((lastInbound + 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60)) * 10) / 10) : 0;
        const expiresAt = lastInbound > 0 ? new Date(lastInbound + 24 * 60 * 60 * 1000).toISOString() : null;

        return {
          exists: true,
          id: profile.id,
          name: profile.full_name || 'SuprO User',
          full_name: profile.full_name || 'SuprO User',
          category: profile.main_category || 'Traveller',
          role: profile.role || 'user',
          has_pin: !!profile.pin_hash,
          gemini_api_key: profile.gemini_api_key,
          last_whatsapp_inbound_at: lastInboundIso,
          is_whatsapp_session_active: isWindowActive,
          whatsapp_window_expires_at: expiresAt,
          whatsapp_hours_remaining: hoursRemaining,
        };
      }

      // Also check drivers table in case user registered as driver
      const drvUrl = `https://gmahjdzqitbomtmdzlfp.supabase.co/rest/v1/drivers?or=(phone.ilike.*${cleanPhone}*,mobile_number.ilike.*${cleanPhone}*,whatsapp_number.ilike.*${cleanPhone}*)&select=id,name,vehicle_type,is_whatsapp_active&limit=1`;
      const drvRes = await fetch(drvUrl, {
        headers: { "apikey": anonKey, "Authorization": `Bearer ${anonKey}` }
      });
      const drvData = await drvRes.json();
      if (Array.isArray(drvData) && drvData.length > 0) {
        return {
          exists: true,
          id: drvData[0].id,
          name: drvData[0].name || 'Driver Partner',
          full_name: drvData[0].name || 'Driver Partner',
          category: 'Driver',
          role: 'driver',
          has_pin: false,
          is_whatsapp_session_active: drvData[0].is_whatsapp_active || false,
        };
      }
    } catch (e) {
      console.error('Supabase direct check error:', e);
    }

    return {
      exists: false,
      category: 'Traveller',
      role: 'user',
      has_pin: false,
      is_whatsapp_session_active: false
    };
  },
  
  verifyOtp: async (phone: string, otp: string, fullName?: string, category?: string) => {
    const payload: any = { phone, otp };
    if (fullName) payload.fullName = fullName;
    if (category) payload.category = category;

    const res = await fetch(endpoints.authVerify, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    return data;
  },
  
  getWabaPhone: async () => {
    try {
      const res = await fetch(endpoints.authWaba);
      const data = await res.json();
      return data.phone || "916381029380"; // Fallback just in case
    } catch (e) {
      return "916381029380";
    }
  },

  setPin: async (phone: string, pin: string, confirmPin: string) => {
    const res = await fetch(endpoints.authPinSet, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin, confirmPin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save PIN');
    return data;
  },

  loginWithPin: async (phone: string, pin: string) => {
    const res = await fetch(endpoints.authPinLogin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    return data;
  }
};
