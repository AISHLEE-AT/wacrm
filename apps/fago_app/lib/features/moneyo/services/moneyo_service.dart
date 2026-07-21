import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cache_service.dart';
import '../models/moneyo_model.dart';

class MoneyoService {
  final SupabaseClient _supabase;
  final CacheService _cacheService;
  static const String _cacheKey = 'moneyo_savings_cache';

  MoneyoService(this._supabase, this._cacheService);

  Future<List<MoneyoModel>> getSavings({bool forceRefresh = false}) async {
    if (!forceRefresh) {
      final cachedData = _cacheService.getCache(_cacheKey);
      if (cachedData != null && cachedData is List) {
        return cachedData.map((json) => MoneyoModel.fromJson(json)).toList();
      }
    }

    final response = await _supabase
        .from('moneyo_savings')
        .select()
        .order('created_at', ascending: false);

    final List<MoneyoModel> savings = (response as List<dynamic>)
        .map((json) => MoneyoModel.fromJson(json))
        .toList();

    await _cacheService.setCache(_cacheKey, response);

    return savings;
  }
}
