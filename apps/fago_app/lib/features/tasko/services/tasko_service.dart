import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cache_service.dart';
import '../models/tasko_model.dart';

class TaskoService {
  final SupabaseClient _supabase;
  final CacheService _cacheService;
  static const String _cacheKey = 'tasko_tasks_cache';

  TaskoService(this._supabase, this._cacheService);

  Future<List<TaskoModel>> getTasks({bool forceRefresh = false}) async {
    if (!forceRefresh) {
      final cachedData = _cacheService.getCache(_cacheKey);
      if (cachedData != null && cachedData is List) {
        return cachedData.map((json) => TaskoModel.fromJson(json)).toList();
      }
    }

    final response = await _supabase
        .from('tasko_tasks')
        .select()
        .order('created_at', ascending: false);

    final List<TaskoModel> tasks = (response as List<dynamic>)
        .map((json) => TaskoModel.fromJson(json))
        .toList();

    await _cacheService.setCache(_cacheKey, response);

    return tasks;
  }
}
