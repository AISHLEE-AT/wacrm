import 'package:supabase_flutter/supabase_flutter.dart';
void main() async {
  try {
    final auth = SupabaseClient('https://mock.com', 'mock').auth;
    auth.recoverSession('{"access_token":"a","refresh_token":"b","expires_in":3600}');
    print("Success");
  } catch (e) {
    print("Error: \");
  }
}
