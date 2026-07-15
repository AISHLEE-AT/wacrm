import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy_api_key_for_ssr_which_prevents_build_crashes",
  authDomain: "fago-letstravo.firebaseapp.com",
  projectId: "fago-letstravo",
  storageBucket: "fago-letstravo.firebasestorage.app",
  messagingSenderId: "367123164923",
  appId: "1:367123164923:web:5317beff9ed0c1143c7b80"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
