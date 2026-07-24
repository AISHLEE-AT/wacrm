import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cache_service.dart';
import '../models/profile_model.dart';

class ProfileService {
  final SupabaseClient _supabase;
  final CacheService _cache;

  ProfileService(this._supabase, this._cache);

  /// Fetch current user's profile details (Name, WhatsApp Phone, Address, UPI ID)
  static Future<Map<String, String>> getCurrentUserProfileDetails() async {
    final user = Supabase.instance.client.auth.currentUser;
    String name = '';
    String phone = '';
    String address = '';
    String upiId = '';

    if (user != null) {
      final meta = user.userMetadata ?? {};
      if (meta['full_name'] != null && meta['full_name'].toString().isNotEmpty) {
        name = meta['full_name'].toString();
      } else if (meta['name'] != null && meta['name'].toString().isNotEmpty) {
        name = meta['name'].toString();
      }

      if (user.phone != null && user.phone!.isNotEmpty) {
        phone = user.phone!;
      } else if (meta['phone'] != null && meta['phone'].toString().isNotEmpty) {
        phone = meta['phone'].toString();
      } else if (meta['whatsapp'] != null && meta['whatsapp'].toString().isNotEmpty) {
        phone = meta['whatsapp'].toString();
      }

      try {
        final profileData = await Supabase.instance.client
            .from('profiles')
            .select('full_name, whatsapp, phone, address, upi_id')
            .eq('id', user.id)
            .maybeSingle();

        if (profileData != null) {
          if ((profileData['full_name'] ?? '').toString().isNotEmpty) {
            name = profileData['full_name'].toString();
          }
          final pPhone = (profileData['whatsapp'] ?? profileData['phone'] ?? '').toString();
          if (pPhone.isNotEmpty) {
            phone = pPhone;
          }
          if ((profileData['address'] ?? '').toString().isNotEmpty) {
            address = profileData['address'].toString();
          }
          if ((profileData['upi_id'] ?? '').toString().isNotEmpty) {
            upiId = profileData['upi_id'].toString();
          }
        }
      } catch (e) {
        debugPrint('Error fetching user profile details: $e');
      }
    }

    // Clean phone number to 10-digit format
    String cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.startsWith('91') && cleanPhone.length == 12) {
      cleanPhone = cleanPhone.substring(2);
    }

    return {
      'name': name.isNotEmpty ? name : 'User',
      'phone': cleanPhone.isNotEmpty ? cleanPhone : '',
      'address': address.isNotEmpty ? address : 'Tamil Nadu, India',
      'upi_id': upiId.isNotEmpty ? upiId : (cleanPhone.isNotEmpty ? '$cleanPhone@upi' : 'wacrm@upi'),
    };
  }

  Future<ProfileModel?> getProfile(String userId) async {
    final cacheKey = 'profile_$userId';
    
    try {
      final cached = _cache.getCache(cacheKey);
      if (cached != null) {
        return ProfileModel.fromJson(cached);
      }

      final response = await _supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .single();

      await _cache.setCache(cacheKey, response);
      return ProfileModel.fromJson(response);
    } catch (e) {
      debugPrint('Error fetching profile: $e');
      final cached = _cache.getCache(cacheKey);
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
      final cached = _cache.getCache(cacheKey);
      if (cached != null) {
        final list = (cached as List).map((x) => TransactionModel.fromJson(x)).toList();
        // Fire and forget update
        _fetchTransactions(userId, cacheKey); 
        return list;
      }

      return await _fetchTransactions(userId, cacheKey);
    } catch (e) {
      debugPrint('Error getting transactions: $e');
      return [];
    }
  }

  Future<List<TransactionModel>> _fetchTransactions(String userId, String cacheKey) async {
    final response = await _supabase
        .from('transactions')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    
    await _cache.setCache(cacheKey, response);
    return (response as List).map((x) => TransactionModel.fromJson(x)).toList();
  }

  Future<List<OrderModel>> getOrders(String userId) async {
    final cacheKey = 'orders_$userId';
    
    try {
      final cached = _cache.getCache(cacheKey);
      if (cached != null) {
        final list = (cached as List).map((x) => OrderModel.fromJson(x)).toList();
        _fetchOrders(userId, cacheKey); 
        return list;
      }

      return await _fetchOrders(userId, cacheKey);
    } catch (e) {
      debugPrint('Error getting orders: $e');
      return [];
    }
  }

  Future<List<OrderModel>> _fetchOrders(String userId, String cacheKey) async {
    final response = await _supabase
        .from('purchases')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    
    await _cache.setCache(cacheKey, response);
    return (response as List).map((x) => OrderModel.fromJson(x)).toList();
  }
}
