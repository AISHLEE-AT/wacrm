// src/config/env.ts — Centralized Environment & URL Configuration for SuprO Mobile
export const ENV = {
  // ─── DuckDNS Unified Endpoints ───
  API_URL: 'https://mysupro.duckdns.org',           // OCI Express Backend (Webhooks, WebSockets, APIs)
  CRM_URL: 'https://mysupro-crm.duckdns.org',       // Web CRM App & WebViews
  CDN_URL: 'https://mysupro-cdn.duckdns.org',       // Static CDN & APK Distribution

  // ─── WhatsApp Integration Numbers ───
  // Meta WhatsApp Business Account (WABA) — Verified automated bot receiving webhooks & sending OTPs
  WABA_PHONE: '919486335870',
  
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
