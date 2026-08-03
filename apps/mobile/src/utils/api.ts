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
    const res = await fetch(`${endpoints.authCheck}?phone=${phone}`);
    return res.json();
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
