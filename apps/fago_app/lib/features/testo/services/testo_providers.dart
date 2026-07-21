import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'testo_service.dart';
import '../models/testo_model.dart';

final testoServiceProvider = Provider<TestOService>((ref) {
  return TestOService(Supabase.instance.client);
});

final testoTestsProvider = FutureProvider<List<TestoTest>>((ref) async {
  final service = ref.watch(testoServiceProvider);
  return service.getTests();
});
