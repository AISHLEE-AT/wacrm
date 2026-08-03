export const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://192.168.1.100:3000' // Local development IP (Update as needed)
  : 'https://watscrm.vercel.app';

export const WABA_PHONE_NUMBER = "919486335870"; // From web app login logic

export const endpoints = {
  authCheck: `${API_URL}/api/auth/check`,
  authVerify: `${API_URL}/api/auth/otp/verify`,
  authPinSet: `${API_URL}/api/auth/pin/set`,
  authPinLogin: `${API_URL}/api/auth/pin`,
  updateProfile: `${API_URL}/api/profile/update`,
};
