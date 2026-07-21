import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/providers/cache_provider.dart';
import 'touro_service.dart';
import '../models/touro_model.dart';

final touroServiceProvider = Provider<TouroService>((ref) {
  final cacheService = ref.watch(cacheServiceProvider);
  return TouroService(Supabase.instance.client, cacheService);
});

final touroProvider = FutureProvider<List<TouroModel>>((ref) async {
  final service = ref.watch(touroServiceProvider);
  return service.getTours();
});
