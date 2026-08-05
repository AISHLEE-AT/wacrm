import 'package:supabase_flutter/supabase_flutter.dart';

/// Separate Supabase DB instance specifically for the GameO module
/// This prevents high-frequency game telemetry (like Ghost racing coordinates)
/// from bogging down the main SuprO ecosystem database.

const String _gameoSupabaseUrl = String.fromEnvironment('GAMEO_SUPABASE_URL', defaultValue: 'https://maznlybuvhcobppndxsg.supabase.co');
const String _gameoSupabaseAnonKey = String.fromEnvironment('GAMEO_SUPABASE_ANON_KEY', defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hem5seWJ1dmhjb2JwcG5keHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTc0NDAsImV4cCI6MjEwMTQ3MzQ0MH0.h47SZoRDleIEEo-Ms0cLLI67bEbFlIRTta_wXmvZoFc');

class GameOSupabase {
  static SupabaseClient? _client;

  static Future<void> initialize() async {
    // We cannot use Supabase.initialize() a second time for a different URL in the same app easily
    // using the singleton pattern. However, the SupabaseClient constructor allows multiple instances.
    _client = SupabaseClient(_gameoSupabaseUrl, _gameoSupabaseAnonKey);
  }

  static SupabaseClient get client {
    _client ??= SupabaseClient(_gameoSupabaseUrl, _gameoSupabaseAnonKey);
    return _client!;
  }
}
