import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cache_service.dart';
import '../models/tvo_model.dart';

class TvoService {
  final SupabaseClient _supabase;
  final CacheService _cacheService;
  static const String _cacheKey = 'tvo_videos_cache';

  TvoService(this._supabase, this._cacheService);

  Future<List<TvoModel>> getVideos({bool forceRefresh = false}) async {
    if (!forceRefresh) {
      final cachedData = _cacheService.getCache(_cacheKey);
      if (cachedData != null && cachedData is List) {
        return cachedData.map((json) => TvoModel.fromJson(json)).toList();
      }
    }

    final response = await _supabase
        .from('tvo_videos')
        .select()
        .order('created_at', ascending: false);

    final List<TvoModel> videos = (response as List<dynamic>)
        .map((json) => TvoModel.fromJson(json))
        .toList();

    await _cacheService.setCache(_cacheKey, response);

    return videos;
  }
}
