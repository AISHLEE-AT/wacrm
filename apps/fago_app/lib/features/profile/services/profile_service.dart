import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/services/cache_service.dart';
import '../models/profile_model.dart';

class ProfileService {
  final SupabaseClient _supabase;
  final CacheService _cache;

  ProfileService(this._supabase, this._cache);

  Future<ProfileModel?> getProfile(String userId) async {
    final cacheKey = 'profile_$userId';
    
    try {
      final cached = await _cache.getCachedData(cacheKey);
      if (cached != null) {
        return ProfileModel.fromJson(cached);
      }

      final response = await _supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .single();

      await _cache.setCachedData(cacheKey, response);
      return ProfileModel.fromJson(response);
    } catch (e) {
      print('Error fetching profile: $e');
      final cached = await _cache.getCachedData(cacheKey);
      if (cached != null) {
        return ProfileModel.fromJson(cached);
      }
      return null;
    }
  }

  Future<void> updateProfile(String userId, Map<String, dynamic> updates) async {
    await _supabase.from('profiles').update(updates).eq('id', userId);
    final cacheKey = 'profile_$userId';
    await _cache.clearCache(cacheKey); // force refetch
  }

  Future<List<TransactionModel>> getTransactions(String userId) async {
    final cacheKey = 'transactions_$userId';
    
    try {
      final cached = await _cache.getCachedData(cacheKey);
      if (cached != null) {
        final list = (cached as List).map((x) => TransactionModel.fromJson(x)).toList();
        // Fire and forget update
        _fetchTransactions(userId, cacheKey); 
        return list;
      }

      return await _fetchTransactions(userId, cacheKey);
    } catch (e) {
      print('Error getting transactions: $e');
      return [];
    }
  }

  Future<List<TransactionModel>> _fetchTransactions(String userId, String cacheKey) async {
    final response = await _supabase
        .from('transactions')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    
    await _cache.setCachedData(cacheKey, response);
    return (response as List).map((x) => TransactionModel.fromJson(x)).toList();
  }

  Future<List<OrderModel>> getOrders(String userId) async {
    final cacheKey = 'orders_$userId';
    
    try {
      final cached = await _cache.getCachedData(cacheKey);
      if (cached != null) {
        final list = (cached as List).map((x) => OrderModel.fromJson(x)).toList();
        _fetchOrders(userId, cacheKey); 
        return list;
      }

      return await _fetchOrders(userId, cacheKey);
    } catch (e) {
      print('Error getting orders: $e');
      return [];
    }
  }

  Future<List<OrderModel>> _fetchOrders(String userId, String cacheKey) async {
    final response = await _supabase
        .from('purchases')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    
    await _cache.setCachedData(cacheKey, response);
    return (response as List).map((x) => OrderModel.fromJson(x)).toList();
  }
}
