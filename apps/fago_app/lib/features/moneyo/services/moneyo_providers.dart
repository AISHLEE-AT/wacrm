import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/providers/cache_provider.dart';
import 'moneyo_service.dart';
import '../models/moneyo_model.dart';

final moneyoServiceProvider = Provider<MoneyoService>((ref) {
  final cacheService = ref.watch(cacheServiceProvider);
  return MoneyoService(Supabase.instance.client, cacheService);
});

final moneyoProvider = FutureProvider<List<MoneyoModel>>((ref) async {
  final service = ref.watch(moneyoServiceProvider);
  return service.getSavings();
});

final totalSavingsProvider = FutureProvider<double>((ref) async {
  final savings = await ref.watch(moneyoProvider.future);
  return savings.fold(0.0, (sum, item) => sum + item.amount);
});
