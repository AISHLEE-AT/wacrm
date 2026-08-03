import { endpoints } from '@wacrm/shared/config';

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
    // We can hardcode it from config, or fetch it dynamically if the API exposes it
    return import('@wacrm/shared/config').then(m => m.WABA_PHONE_NUMBER);
  }
};
