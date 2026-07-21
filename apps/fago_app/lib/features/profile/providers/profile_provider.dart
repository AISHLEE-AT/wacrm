import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/providers/cache_provider.dart';
import '../models/profile_model.dart';
import '../services/profile_service.dart';

final profileServiceProvider = Provider<ProfileService>((ref) {
  return ProfileService(Supabase.instance.client, ref.watch(cacheServiceProvider));
});

final currentProfileProvider = FutureProvider<ProfileModel?>((ref) async {
  final userId = Supabase.instance.client.auth.currentUser?.id;
  if (userId == null) return null;
  return ref.read(profileServiceProvider).getProfile(userId);
});

final userTransactionsProvider = FutureProvider<List<TransactionModel>>((ref) async {
  final userId = Supabase.instance.client.auth.currentUser?.id;
  if (userId == null) return [];
  return ref.read(profileServiceProvider).getTransactions(userId);
});

final userOrdersProvider = FutureProvider<List<OrderModel>>((ref) async {
  final userId = Supabase.instance.client.auth.currentUser?.id;
  if (userId == null) return [];
  return ref.read(profileServiceProvider).getOrders(userId);
});
