import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/providers/cache_provider.dart';
import 'tradeo_service.dart';
import '../models/tradeo_model.dart';

final tradeoServiceProvider = Provider<TradeoService>((ref) {
  final cacheService = ref.watch(cacheServiceProvider);
  return TradeoService(Supabase.instance.client, cacheService);
});

final tradeoProvider = FutureProvider<List<TradeoModel>>((ref) async {
  final service = ref.watch(tradeoServiceProvider);
  return service.getListings();
});
