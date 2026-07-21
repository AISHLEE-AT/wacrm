import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/providers/cache_provider.dart';
import 'tvo_service.dart';
import '../models/tvo_model.dart';

final tvoServiceProvider = Provider<TvoService>((ref) {
  final cacheService = ref.watch(cacheServiceProvider);
  return TvoService(Supabase.instance.client, cacheService);
});

final tvoProvider = FutureProvider<List<TvoModel>>((ref) async {
  final service = ref.watch(tvoServiceProvider);
  return service.getVideos();
});
