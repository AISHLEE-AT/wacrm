import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cache_service.dart';
import '../models/tradeo_model.dart';

class TradeoService {
  final SupabaseClient _supabase;
  final CacheService _cacheService;
  static const String _cacheKey = 'tradeo_listings_cache';

  TradeoService(this._supabase, this._cacheService);

  Future<List<TradeoModel>> getListings({bool forceRefresh = false}) async {
    if (!forceRefresh) {
      final cachedData = _cacheService.getCache(_cacheKey);
      if (cachedData != null && cachedData is List) {
        return cachedData.map((json) => TradeoModel.fromJson(json)).toList();
      }
    }

    final response = await _supabase
        .from('tradeo_listings')
        .select()
        .order('created_at', ascending: false);

    final List<TradeoModel> listings = (response as List<dynamic>)
        .map((json) => TradeoModel.fromJson(json))
        .toList();

    await _cacheService.setCache(_cacheKey, response);

    return listings;
  }
}
