import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'dart:async';

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();
  factory SupabaseService() => _instance;
  SupabaseService._internal();

  final SupabaseClient _client = Supabase.instance.client;
  RealtimeChannel? _ridesChannel;
  Function(Map<String, dynamic>)? onNewRide;

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

    final res = await _client.from('drivers').insert({
      'user_id': supabaseUser?.id,
      'firebase_uid': firebaseUser?.uid,
      'name': name,
      'mobile_number': firebaseUser?.phoneNumber ?? '',
      'whatsapp_number': whatsappNumber,
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
    }).select().single();
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
  Future<void> completeRide(String rideId, String driverId, double estimatedPrice) async {
    await _client.from('rides').update({'status': 'completed'}).eq('id', rideId);

    // Calculate 30% commission and add to pending
    final commission = estimatedPrice * 0.3;
    final driverData = await _client
        .from('drivers')
        .select('pending_commission')
        .eq('id', driverId)
        .single();
    final currentPending =
        (driverData['pending_commission'] as num?)?.toDouble() ?? 0;

    await _client.from('drivers').update({
      'status': 'online',
      'pending_commission': currentPending + commission,
    }).eq('id', driverId);
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
  }
}
