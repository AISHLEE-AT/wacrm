import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/services/cache_service.dart';
import '../../../services/device_auth_service.dart';
import '../models/profile_model.dart';

class ProfileService {
  final SupabaseClient _supabase;
  final CacheService _cache;

  ProfileService(this._supabase, this._cache);

  /// Fetch current user's profile details (Name, WhatsApp Phone, Address, UPI ID)
  static Future<Map<String, String>> getCurrentUserProfileDetails() async {
    final user = Supabase.instance.client.auth.currentUser;
    final regPhone = await DeviceAuthService.getRegisteredPhone();
    final regName = await DeviceAuthService.getRegisteredName();

    String name = regName ?? '';
    String phone = regPhone ?? '';
    String address = '';
    String upiId = '';

    final rawPhone = user?.phone ?? user?.userMetadata?['phone']?.toString() ?? user?.userMetadata?['whatsapp']?.toString() ?? regPhone ?? '';
    String cleanDigits = rawPhone.replaceAll(RegExp(r'\D'), '');
    if (cleanDigits.startsWith('91') && cleanDigits.length == 12) {
      cleanDigits = cleanDigits.substring(2);
    } else if (cleanDigits.length > 10) {
      cleanDigits = cleanDigits.substring(cleanDigits.length - 10);
    }

    if (cleanDigits.isNotEmpty) {
      phone = cleanDigits;
      try {
        final List<dynamic> profileList = await Supabase.instance.client
            .from('profiles')
            .select('full_name, whatsapp, phone, address, upi_id')
            .or('phone.eq.$cleanDigits,phone.eq.91$cleanDigits,whatsapp.eq.$cleanDigits,whatsapp.eq.91$cleanDigits${user != null ? ",id.eq.${user.id}" : ""}');

        if (profileList.isNotEmpty) {
          final profileData = profileList.first;
          final dbName = profileData['full_name']?.toString();
          if (dbName != null && dbName.isNotEmpty && dbName != 'User' && dbName != 'FAGO User') {
            name = dbName;
          }
          final pPhone = (profileData['whatsapp'] ?? profileData['phone'])?.toString();
          if (pPhone != null && pPhone.isNotEmpty) {
            final pClean = pPhone.replaceAll(RegExp(r'\D'), '');
            if (pClean.length >= 10) {
              phone = pClean.substring(pClean.length - 10);
            }
          }
          if ((profileData['address'] ?? '').toString().isNotEmpty) {
            address = profileData['address'].toString();
          }
          if ((profileData['upi_id'] ?? '').toString().isNotEmpty) {
            upiId = profileData['upi_id'].toString();
          }
        }
      } catch (e) {
        debugPrint('ProfileService fetch note: $e');
      }
    }

    if (name.isEmpty || name == 'User' || name == 'FAGO User') {
      if (phone == '9486335870') {
        name = 'Aishlee Technology';
      } else if (phone.isNotEmpty) {
        name = 'User ${phone.substring(phone.length > 4 ? phone.length - 4 : 0)}';
      } else {
        name = 'FAGO User';
      }
    }

    return {
      'name': name,
      'phone': phone,
      'address': address.isNotEmpty ? address : 'Tamil Nadu, India',
      'upi_id': upiId.isNotEmpty ? upiId : (phone.isNotEmpty ? '$phone@upi' : ''),
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
          .or('id.eq.$userId${tenDigit.isNotEmpty ? ",phone.eq.$tenDigit,phone.eq.91$tenDigit,whatsapp.eq.$tenDigit,whatsapp.eq.91$tenDigit" : ""}');

      Map<String, dynamic>? response;
      if (responseList.isNotEmpty) {
        response = Map<String, dynamic>.from(responseList.first);
      }

      if (response != null) {
        final existingName = (response['full_name'] ?? '').toString().trim();
        final finalResolvedName = (existingName.isNotEmpty && existingName != 'User' && existingName != 'FAGO User')
            ? existingName
            : (sbUser?.userMetadata?['full_name']?.toString().isNotEmpty == true && sbUser!.userMetadata!['full_name'] != 'User'
                ? sbUser.userMetadata!['full_name'].toString()
                : (tenDigit.isNotEmpty ? 'User ${tenDigit.substring(tenDigit.length - 4)}' : 'FAGO User'));

        response['full_name'] = finalResolvedName;

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
              'full_name': finalResolvedName,
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
    // Use upsert so it creates the row if it doesn't exist yet (common for WhatsApp-auth users)
    await _supabase.from('profiles').upsert({
      'id': userId,
      ...updates,
      'updated_at': DateTime.now().toIso8601String(),
    });
    final cacheKey = 'profile_$userId';
    await _cache.clearCache(cacheKey); // force refetch on next load
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
