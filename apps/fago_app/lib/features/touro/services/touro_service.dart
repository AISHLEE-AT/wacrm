import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cache_service.dart';
import '../models/touro_model.dart';

class TouroService {
  final SupabaseClient _supabase;
  final CacheService _cacheService;
  static const String _cacheKey = 'touro_tours_cache';

  TouroService(this._supabase, this._cacheService);

  Future<List<TouroModel>> getTours({bool forceRefresh = false}) async {
    // 1. Try to load from cache if not forcing refresh
    if (!forceRefresh) {
      final cachedData = _cacheService.getCache(_cacheKey);
      if (cachedData != null && cachedData is List) {
        return cachedData.map((json) => TouroModel.fromJson(json)).toList();
      }
    }

    // 2. Fetch from Supabase
    final response = await _supabase
        .from('touro')
        .select()
        .order('created_at', ascending: false);

    final List<TouroModel> tours = (response as List<dynamic>)
        .map((json) => TouroModel.fromJson(json))
        .toList();

    // 3. Update cache
    await _cacheService.setCache(_cacheKey, response);

    return tours;
  }
}
