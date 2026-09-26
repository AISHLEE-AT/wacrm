export const API_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.API_URL || 
  'https://mysupro.duckdns.org';

export const WABA_PHONE_NUMBER = "916381029380"; // SuprO Official WABA

export const endpoints = {
  authCheck: `${API_URL}/api/auth/check`,
  authVerify: `${API_URL}/api/auth/otp/verify`,
  authPinSet: `${API_URL}/api/auth/pin/set`,
  authPinLogin: `${API_URL}/api/auth/pin`,
  updateProfile: `${API_URL}/api/profile/update`,
};

