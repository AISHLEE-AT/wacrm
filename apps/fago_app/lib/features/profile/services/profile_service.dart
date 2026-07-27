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
      final rawEmailPhone = (user.email != null && user.email!.contains('@whatsapp.wacrm.local'))
          ? user.email!.split('@')[0].replaceAll(RegExp(r'\D'), '')
          : '';

      if (meta['full_name'] != null && meta['full_name'].toString().isNotEmpty && meta['full_name'] != 'User') {
        name = meta['full_name'].toString();
      } else if (meta['name'] != null && meta['name'].toString().isNotEmpty && meta['name'] != 'User') {
        name = meta['name'].toString();
      }

      if (user.phone != null && user.phone!.isNotEmpty) {
        phone = user.phone!;
      } else if (meta['phone'] != null && meta['phone'].toString().isNotEmpty) {
        phone = meta['phone'].toString();
      } else if (meta['whatsapp'] != null && meta['whatsapp'].toString().isNotEmpty) {
        phone = meta['whatsapp'].toString();
      } else if (rawEmailPhone.isNotEmpty) {
        phone = rawEmailPhone;
      }

      String cleanDigits = phone.replaceAll(RegExp(r'\D'), '');
      if (cleanDigits.startsWith('91') && cleanDigits.length == 12) {
        cleanDigits = cleanDigits.substring(2);
      } else if (cleanDigits.length > 10) {
        cleanDigits = cleanDigits.substring(cleanDigits.length - 10);
      }

      try {
        final List<dynamic> profileList = await Supabase.instance.client
            .from('profiles')
            .select('full_name, whatsapp, phone, address, upi_id')
            .or('id.eq.${user.id},user_id.eq.${user.id}${cleanDigits.isNotEmpty ? ",phone.eq.$cleanDigits,phone.eq.91$cleanDigits,whatsapp.eq.$cleanDigits,whatsapp.eq.91$cleanDigits" : ""}');

        if (profileList.isNotEmpty) {
          final profileData = profileList.first;
          if ((profileData['full_name'] ?? '').toString().isNotEmpty && profileData['full_name'] != 'User') {
            name = profileData['full_name'].toString();
          }
          final pPhone = (profileData['phone'] ?? profileData['whatsapp'] ?? '').toString();
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

    String cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.startsWith('91') && cleanPhone.length == 12) {
      cleanPhone = cleanPhone.substring(2);
    } else if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(cleanPhone.length - 10);
    }

    return {
      'name': name.isNotEmpty ? name : 'FAGO User',
      'phone': cleanPhone.isNotEmpty ? cleanPhone : '',
      'address': address.isNotEmpty ? address : 'Tamil Nadu, India',
      'upi_id': upiId.isNotEmpty ? upiId : (cleanPhone.isNotEmpty ? '$cleanPhone@upi' : ''),
    };
  }

  Future<ProfileModel?> getProfile(String userId) async {
    final cacheKey = 'profile_$userId';
    
    try {
      final sbUser = _supabase.auth.currentUser;
      final rawEmailPhone = (sbUser?.email != null && sbUser!.email!.contains('@whatsapp.wacrm.local'))
          ? sbUser.email!.split('@')[0].replaceAll(RegExp(r'\D'), '')
          : '';
      final rawPhone = sbUser?.phone ?? sbUser?.userMetadata?['phone']?.toString() ?? sbUser?.userMetadata?['whatsapp']?.toString() ?? rawEmailPhone;
      final cleanDigits = rawPhone.replaceAll(RegExp(r'\D'), '');
      final tenDigit = cleanDigits.length >= 10 ? cleanDigits.substring(cleanDigits.length - 10) : cleanDigits;

      final List<dynamic> responseList = await _supabase
          .from('profiles')
          .select()
          .or('id.eq.$userId,user_id.eq.$userId${tenDigit.isNotEmpty ? ",phone.eq.$tenDigit,phone.eq.91$tenDigit,whatsapp.eq.$tenDigit,whatsapp.eq.91$tenDigit" : ""}');

      Map<String, dynamic>? response;
      if (responseList.isNotEmpty) {
        response = Map<String, dynamic>.from(responseList.first);
      }

      if (response != null) {
        // Auto-heal phone/whatsapp in response if missing
        if ((response['whatsapp'] == null || response['whatsapp'].toString().isEmpty) && tenDigit.isNotEmpty) {
          response['whatsapp'] = tenDigit;
        }
        if ((response['phone'] == null || response['phone'].toString().isEmpty) && tenDigit.isNotEmpty) {
          response['phone'] = tenDigit;
        }

        // Auto-sync profile ID/phone into DB
        try {
          if (response['id'] != userId || response['whatsapp'] == null || response['whatsapp'].toString().isEmpty) {
            await _supabase.from('profiles').upsert({
              'id': userId,
              'phone': tenDigit.isNotEmpty ? tenDigit : response['phone'],
              'whatsapp': tenDigit.isNotEmpty ? tenDigit : response['whatsapp'],
              'full_name': response['full_name'] ?? sbUser?.userMetadata?['full_name'] ?? 'FAGO User',
              'updated_at': DateTime.now().toIso8601String(),
            });
          }
        } catch (_) {}

        await _cache.setCache(cacheKey, response);
        return ProfileModel.fromJson(response);
      }

      // If profile row doesn't exist in DB yet, construct default profile for the CURRENT user
      final formattedPhone = tenDigit.length == 10 ? '+91 $tenDigit' : '';
      final resolvedName = sbUser?.userMetadata?['full_name']?.toString() ?? (tenDigit.isNotEmpty ? 'User ${tenDigit.substring(tenDigit.length - 4)}' : 'FAGO User');

      final defaultProf = ProfileModel(
        id: userId,
        fullName: resolvedName,
        role: 'USER',
        whatsapp: formattedPhone,
        phone: formattedPhone,
        address: 'Live Location Active',
      );

      // Auto-create default profile row in DB
      try {
        if (tenDigit.isNotEmpty) {
          await _supabase.from('profiles').upsert({
            'id': userId,
            'phone': tenDigit,
            'whatsapp': tenDigit,
            'full_name': resolvedName,
            'updated_at': DateTime.now().toIso8601String(),
          });
        }
      } catch (_) {}

      return defaultProf;
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
