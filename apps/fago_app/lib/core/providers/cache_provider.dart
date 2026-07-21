import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/cache_service.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('sharedPreferencesProvider must be overridden in ProviderScope');
});

final cacheServiceProvider = Provider<CacheService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return CacheService(prefs);
});
