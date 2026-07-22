import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/ride_request.dart';

class SupabaseBackendService {
  static final SupabaseBackendService _instance = SupabaseBackendService._internal();
  factory SupabaseBackendService() => _instance;
  SupabaseBackendService._internal();

  SupabaseClient get _client => Supabase.instance.client;

  /// Post a new ride request from Rider
  Future<RideRequest?> createRideRequest(RideRequest request) async {
    try {
      final response = await _client
          .from('ride_requests')
          .insert(request.toJson())
          .select()
          .single();
      return RideRequest.fromJson(response);
    } catch (e) {
      print('Supabase Create Ride Error: $e');
      return null;
    }
  }

  /// Realtime stream of active nearby ride requests for Drivers
  Stream<List<RideRequest>> getAvailableRidesStream() {
    try {
      return _client
          .from('ride_requests')
          .stream(primaryKey: ['id'])
          .eq('status', 'requested')
          .map((data) => data.map((json) => RideRequest.fromJson(json)).toList());
    } catch (e) {
      print('Supabase Stream Error: $e');
      return const Stream.empty();
    }
  }

  /// Driver accepts a ride request
  Future<bool> acceptRideRequest({
    required String rideId,
    required String driverId,
    required String driverPhone,
  }) async {
    try {
      await _client.from('ride_requests').update({
        'status': 'accepted',
        'driver_id': driverId,
        'driver_phone': driverPhone,
      }).eq('id', rideId);
      return true;
    } catch (e) {
      print('Supabase Accept Ride Error: $e');
      return false;
    }
  }

  /// Realtime status listener for a specific ride request
  Stream<RideRequest?> getRideStatusStream(String rideId) {
    try {
      return _client
          .from('ride_requests')
          .stream(primaryKey: ['id'])
          .eq('id', rideId)
          .map((data) => data.isNotEmpty ? RideRequest.fromJson(data.first) : null);
    } catch (e) {
      print('Supabase Ride Status Stream Error: $e');
      return const Stream.empty();
    }
  }

  /// Save Rider/Lead Contact to WhatsApp CRM Database for Future Follow-ups & CRM Marketing
  Future<bool> saveCrmContact({
    required String name,
    required String phone,
    required String role, // 'Rider' or 'Driver'
    String? city,
    String? category,
  }) async {
    try {
      final cleanPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
      await _client.from('contacts').upsert({
        'name': name.isEmpty ? 'Rider Lead' : name,
        'phone': cleanPhone,
        'role': role,
        'city': city ?? 'Unknown',
        'last_vehicle_category': category ?? 'General',
        'source': 'RideO Mobile App',
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      }, onConflict: 'phone');
      return true;
    } catch (e) {
      print('Supabase Save CRM Contact Error: $e');
      return false;
    }
  }
}
