// lib/core/env.dart — Centralized Environment & URL Configuration for SuprO Flutter
// Exact replica of apps/mobile/src/config/env.ts

class AppEnv {
  // ─── DuckDNS Unified OCI Endpoints ───
  static const String apiUrl = 'https://mysupro.duckdns.org';     // OCI Express Backend (Webhooks, WebSockets, APIs)
  static const String crmUrl = 'https://mysupro-crm.duckdns.org'; // Web CRM App & WebViews
  static const String authUrl = 'https://mysupro.duckdns.org';    // 100% OCI Backend (Zero Vercel)
  static const String cdnUrl = 'https://mysupro-cdn.duckdns.org'; // Static CDN & APK Distribution

  // ─── WhatsApp Integration Numbers ───
  static const String wabaPhone = '916381029380';
  static const String adminPhone = '916381029380';
  static const List<String> adminPhones = ['6381029380', '916381029380'];

  // ─── Payment Configuration ───
  static const String adminUpi = '6381029380@hdfcbank';

  // ─── Supabase Project Refs (Secondary Fallbacks) ───
  static const String supabaseUrl = 'https://gmahjdzqitbomtmdzlfp.supabase.co';
  static const String lmsSupabaseUrl = 'https://jjgdatjthyeesmgunnlp.supabase.co';
}
