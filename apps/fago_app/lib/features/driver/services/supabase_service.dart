import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'dart:async';

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();
  factory SupabaseService() => _instance;
  SupabaseService._internal();

  final SupabaseClient _client = Supabase.instance.client;
  RealtimeChannel? _ridesChannel;
  RealtimeChannel? _driverChannel;
  Function(Map<String, dynamic>)? onNewRide;
  Function(Map<String, dynamic>)? onDriverUpdate;

  /// Register a new driver in the Supabase `drivers` table.
  Future<Map<String, dynamic>?> registerDriver({
    required String name,
    required String whatsappNumber,
    required String drivingLicense,
    required String vehicleRegistration,
    required String insuranceDetails,
    required String upiId,
    required String vehicleType,
  }) async {
    final firebaseUser = fb.FirebaseAuth.instance.currentUser;
    final supabaseUser = _client.auth.currentUser;

    final res = await _client.from('drivers').upsert({
      'user_id': supabaseUser?.id,
      'firebase_uid': firebaseUser?.uid,
      'name': name,
      'mobile_number': firebaseUser?.phoneNumber ?? supabaseUser?.phone ?? '',
      'whatsapp_number': whatsappNumber.isNotEmpty ? whatsappNumber : (firebaseUser?.phoneNumber ?? supabaseUser?.phone ?? ''),
      'driving_license': drivingLicense,
      'vehicle_registration': vehicleRegistration,
      'insurance_details': insuranceDetails,
      'upi_id': upiId,
      'vehicle_type': vehicleType,
      'status': 'offline',
      'is_verified': false,
      'wallet_balance': 0,
      'pending_commission': 0,
      'is_blocked': false,
    }, onConflict: 'user_id').select().single();
    return res;
  }

  /// Toggle driver online/offline status.
  Future<void> toggleStatus(String driverId, String newStatus) async {
    await _client.from('drivers').update({'status': newStatus}).eq('id', driverId);
  }

  /// Update driver's current GPS location.
  Future<void> updateLocation(String driverId, double lat, double lng) async {
    await _client.from('drivers').update({
      'current_lat': lat,
      'current_lng': lng,
    }).eq('id', driverId);
  }

  /// Get driver data by Supabase user_id.
  Future<Map<String, dynamic>?> getDriverByUserId(String userId) async {
    final res = await _client
        .from('drivers')
        .select()
        .eq('user_id', userId)
        .maybeSingle();
    return res;
  }

  /// Get driver data by Firebase UID.
  Future<Map<String, dynamic>?> getDriverByFirebaseUid(String firebaseUid) async {
    final res = await _client
        .from('drivers')
        .select()
        .eq('firebase_uid', firebaseUid)
        .maybeSingle();
    return res;
  }

  /// Subscribe to pending rides via Supabase Realtime.
  void subscribeToRides(Function(Map<String, dynamic>) onRide) {
    onNewRide = onRide;
    _ridesChannel = _client
        .channel('public:rides:pending')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'rides',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'status',
            value: 'pending',
          ),
          callback: (payload) {
            if (onNewRide != null) {
              onNewRide!(payload.newRecord);
            }
          },
        )
        .subscribe();
  }

  /// Subscribe to driver updates via Supabase Realtime (for wallet balance sync).
  void subscribeToDriver(String driverId, Function(Map<String, dynamic>) onUpdate) {
    onDriverUpdate = onUpdate;
    _driverChannel = _client
        .channel('public:drivers:update:$driverId')
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'drivers',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'id',
            value: driverId,
          ),
          callback: (payload) {
            if (onDriverUpdate != null && payload.newRecord.isNotEmpty) {
              onDriverUpdate!(payload.newRecord);
            }
          },
        )
        .subscribe();
  }

  /// Accept a ride and set driver status to busy.
  Future<Map<String, dynamic>?> acceptRide(String rideId, String driverId) async {
    final res = await _client.from('rides').update({
      'status': 'accepted',
      'driver_id': driverId,
    }).eq('id', rideId).select().single();

    // Set driver to busy
    await _client.from('drivers').update({'status': 'busy'}).eq('id', driverId);
    return res;
  }

  /// Complete a ride and calculate 30% commission.
  Future<void> completeRide(String rideId, String driverId) async {
    final rideData = await _client.from('rides').select('estimated_price').eq('id', rideId).single();
    final estimatedPrice = (rideData['estimated_price'] as num?)?.toDouble() ?? 0;

    await _client.from('rides').update({'status': 'completed'}).eq('id', rideId);

    // Calculate 30% commission and deduct from wallet balance
    const commissionRate = 0.30;
    final commission = (estimatedPrice * commissionRate).round();
    final driverData = await _client
        .from('drivers')
        .select('wallet_balance')
        .eq('id', driverId)
        .single();
    final currentBalance =
        (driverData['wallet_balance'] as num?)?.toDouble() ?? 0;

    await _client.from('drivers').update({
      'status': 'online',
      'wallet_balance': currentBalance - commission,
    }).eq('id', driverId);
  }

  Future<void> submitRating(String rideId, int rating, String type) async {
    final column = type == 'driver' ? 'driver_rating' : 'rider_rating';
    await _client.from('rides').update({column: rating}).eq('id', rideId);
  }

  /// Get all pending rides, newest first.
  Future<List<Map<String, dynamic>>> getPendingRides() async {
    final res = await _client
        .from('rides')
        .select()
        .eq('status', 'pending')
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }

  /// Clean up Realtime subscription.
  void dispose() {
    if (_ridesChannel != null) {
      _client.removeChannel(_ridesChannel!);
    }
    if (_driverChannel != null) {
      _client.removeChannel(_driverChannel!);
    }
  }
}
