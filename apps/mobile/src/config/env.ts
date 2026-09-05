// src/config/env.ts — Centralized Environment & URL Configuration for SuprO Mobile
export const ENV = {
  // ─── DuckDNS Unified Endpoints ───
  API_URL: 'https://mysupro.duckdns.org',           // OCI Express Backend (Webhooks, WebSockets, APIs)
  CRM_URL: 'https://mysupro-crm.duckdns.org',       // Web CRM App & WebViews
  AUTH_URL: 'https://mysupro.duckdns.org',          // 100% OCI Backend (Zero Vercel)
  CDN_URL: 'https://mysupro-cdn.duckdns.org',       // Static CDN & APK Distribution

  // ─── WhatsApp Integration Numbers ───
  // User Configured: Route OTP requests via Admin Phone 916381029380
  WABA_PHONE: '916381029380',
  
  // Admin Support & Hotline (Course Guide, BDO Hotline, Human Support)
  ADMIN_PHONE: '916381029380',
  ADMIN_PHONES: ['6381029380', '916381029380'],
  
  // UPI Configuration
  ADMIN_UPI: '6381029380@hdfcbank',

  // Supabase Project Ref
  SUPABASE_URL: 'https://gmahjdzqitbomtmdzlfp.supabase.co',
  LMS_SUPABASE_URL: 'https://jjgdatjthyeesmgunnlp.supabase.co',
};

export default ENV;
