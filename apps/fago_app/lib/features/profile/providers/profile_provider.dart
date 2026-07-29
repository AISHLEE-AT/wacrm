import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/providers/cache_provider.dart';
import '../../../auth/auth_provider.dart';
import '../models/profile_model.dart';
import '../services/profile_service.dart';

final profileServiceProvider = Provider<ProfileService>((ref) {
  return ProfileService(Supabase.instance.client, ref.watch(cacheServiceProvider));
});

final currentProfileProvider = FutureProvider<ProfileModel?>((ref) async {
  final authState = ref.watch(authProvider);
  final userId = Supabase.instance.client.auth.currentUser?.id;

  // Strategy 1: Fetch by Supabase Auth User ID if available
  if (userId != null) {
    try {
      final profile = await ref.read(profileServiceProvider).getProfile(userId);
      if (profile != null && profile.fullName.isNotEmpty && profile.fullName != 'User') {
        return profile;
      }
    } catch (_) {}
  }

  // Strategy 2: Fetch profile by phone number from AuthState if available
  final phone = authState.phone;
  if (phone != null && phone.isNotEmpty) {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    final tenDigit = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
    try {
      final records = await Supabase.instance.client
          .from('profiles')
          .select('id, default_module, profile_complete, full_name, main_category, whatsapp, phone, role, email, address, upi_id, avatar_url')
          .or('phone.eq.$tenDigit,phone.eq.91$tenDigit,whatsapp.eq.$tenDigit,whatsapp.eq.91$tenDigit,email.ilike.%$tenDigit%');
      if (records.isNotEmpty) {
        return ProfileModel.fromJson(Map<String, dynamic>.from(records.first));
      }
    } catch (_) {}
  }

  // Strategy 3: Fallback ProfileModel populated directly from AuthState
  if (authState.role != UserRole.guest) {
    final effectivePhone = authState.phone ?? '9486335870';
    return ProfileModel(
      id: userId ?? '00000000-0000-0000-0000-000000000000',
      fullName: authState.fullName ?? (effectivePhone == '9486335870' ? 'Aishlee Technology' : 'FAGO User'),
      role: authState.role.name.toUpperCase(),
      whatsapp: effectivePhone,
      phone: effectivePhone,
      address: 'Live Location Active',
    );
  }

  return null;
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
