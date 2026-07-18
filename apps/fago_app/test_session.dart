import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  final sessionJson = jsonEncode({
    'access_token': 'test_token',
    'refresh_token': 'test_refresh',
    'expires_in': 3600,
    'token_type': 'bearer',
    'user': {
      'id': '1234-5678',
      'app_metadata': {},
      'user_metadata': {},
      'aud': 'authenticated',
      'created_at': DateTime.now().toIso8601String(),
    }
  });
  
  try {
    final session = Session.fromJson(jsonDecode(sessionJson));
    print('Success: \');
  } catch(e) {
    print('Error: \');
  }
}
