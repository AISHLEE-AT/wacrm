import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  final userJson = {
    "id": "1234-5678",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "",
    "phone": "919486335870",
    "app_metadata": {
      "provider": "phone",
      "providers": ["phone"]
    },
    "user_metadata": {},
    "identities": [
      {
        "identity_id": "9486335870",
        "id": "1234-5678",
        "user_id": "1234-5678",
        "identity_data": {
          "phone": "919486335870",
          "provider": "phone"
        },
        "provider": "phone",
        "last_sign_in_at": "2024-03-22T10:00:00Z",
        "created_at": "2024-03-22T10:00:00Z",
        "updated_at": "2024-03-22T10:00:00Z"
      }
    ],
    "created_at": "2024-03-22T10:00:00Z",
    "updated_at": "2024-03-22T10:00:00Z"
  };

  final sessionJson = jsonEncode({
    'access_token': 'test_token',
    'refresh_token': 'test_refresh',
    'expires_in': 3600,
    'token_type': 'bearer',
    'user': userJson
  });

  try {
    final session = Session.fromJson(jsonDecode(sessionJson));
    print('Success: ${session?.user.id}');
  } catch(e, st) {
    print('Error: $e\n$st');
  }
}
