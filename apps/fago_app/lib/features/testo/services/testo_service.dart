import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/testo_model.dart';

class TestOService {
  final SupabaseClient _supabase;

  TestOService(this._supabase);

  Future<List<TestoTest>> getTests() async {
    final response = await _supabase
        .from('testo_tests')
        .select()
        .order('created_at', ascending: false);
    
    return (response as List<dynamic>)
        .map((json) => TestoTest.fromJson(json))
        .toList();
  }
}
