import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/providers/cache_provider.dart';
import 'tasko_service.dart';
import '../models/tasko_model.dart';

final taskoServiceProvider = Provider<TaskoService>((ref) {
  final cacheService = ref.watch(cacheServiceProvider);
  return TaskoService(Supabase.instance.client, cacheService);
});

final taskoProvider = FutureProvider<List<TaskoModel>>((ref) async {
  final service = ref.watch(taskoServiceProvider);
  return service.getTasks();
});
