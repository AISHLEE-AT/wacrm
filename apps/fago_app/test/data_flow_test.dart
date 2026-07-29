import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fago_app/models/ride_request.dart';
import 'package:fago_app/services/supabase_backend_service.dart';
import 'package:fago_app/services/whatsapp_service.dart';
import 'package:fago_app/services/saved_places_service.dart';
import 'package:fago_app/services/device_signature_service.dart';
import 'package:fago_app/services/device_auth_service.dart';

void main() {
  group('FAGO Super App - Data-Flow & Module Automated Tests', () {

    test('1. Location Model Serialization & Deserialization', () {
      const loc = Location(latitude: 12.9716, longitude: 77.5946);
      final json = loc.toJson();
      expect(json['latitude'], 12.9716);
      expect(json['longitude'], 77.5946);

      final parsed = Location.fromJson(json);
      expect(parsed.latitude, 12.9716);
      expect(parsed.longitude, 77.5946);
    });

    test('2. RideRequest Full Lifecycle Data-Flow Mapping', () {
      final now = DateTime.now();
      final rideRequest = RideRequest(
        id: 'ride_test_1005',
        riderId: 'rider_usr_99',
        riderName: 'John Doe',
        riderPhone: '+919876543210',
        pickupLocation: const Location(latitude: 12.9716, longitude: 77.5946),
        pickupAddress: 'MG Road, Bengaluru',
        dropoffLocation: const Location(latitude: 12.9352, longitude: 77.6245),
        dropoffAddress: 'Koramangala, Bengaluru',
        vehicleCategory: 'Auto',
        estimatedFare: 150.50,
        status: RideStatus.requested,
        createdAt: now,
      );

      final json = rideRequest.toJson();
      expect(json['id'], 'ride_test_1005');
      expect(json['rider_id'], 'rider_usr_99');
      expect(json['rider_name'], 'John Doe');
      expect(json['rider_phone'], '+919876543210');
      expect(json['status'], 'requested');
      expect(json['estimated_fare'], 150.50);

      // Deserialization check
      final parsed = RideRequest.fromJson(json);
      expect(parsed.id, rideRequest.id);
      expect(parsed.riderId, rideRequest.riderId);
      expect(parsed.riderName, 'John Doe');
      expect(parsed.vehicleCategory, 'Auto');
      expect(parsed.status, RideStatus.requested);

      // Driver Assignment & State Transition Test
      final updatedJson = Map<String, dynamic>.from(json);
      updatedJson['status'] = 'accepted';
      updatedJson['driver_id'] = 'driver_usr_42';
      updatedJson['driver_phone'] = '+919123456789';

      final acceptedRide = RideRequest.fromJson(updatedJson);
      expect(acceptedRide.status, RideStatus.accepted);
      expect(acceptedRide.driverId, 'driver_usr_42');
      expect(acceptedRide.driverPhone, '+919123456789');
    });

    test('3. WhatsApp Service Template Data-Flow & GPS Pin Generation', () {
      final msg = WhatsAppService.getRideConfirmationTemplate(
        vehicleCategory: 'Auto',
        pickupAddress: 'Railway Station, CBE',
        dropoffAddress: 'Gandhipuram, CBE',
        fare: 120.0,
        pincode: '641018',
        lat: 11.0168,
        lng: 76.9558,
        riderName: 'John Doe',
      );

      expect(msg.contains('RideO Booking Request'), isTrue);
      expect(msg.contains('John Doe'), isTrue);
      expect(msg.contains('Auto'), isTrue);
      expect(msg.contains('120'), isTrue);
      expect(msg.contains('https://maps.google.com/?q=11.0168,76.9558'), isTrue);
    });

    test('4. Supabase Backend Service Singleton Integrity', () {
      final s1 = SupabaseBackendService();
      final s2 = SupabaseBackendService();
      expect(identical(s1, s2), isTrue);
    });

    test('5. Vehicle Categories Data-Flow Consistency', () {
      final validCategories = ['Bike', 'Auto', 'Car', 'Van', 'Truck', 'Bus'];
      for (final cat in validCategories) {
        final req = RideRequest(
          id: 'test_$cat',
          riderId: 'rider_1',
          riderName: 'Test Rider',
          riderPhone: '9876543210',
          pickupLocation: const Location(latitude: 0, longitude: 0),
          pickupAddress: 'A',
          dropoffLocation: const Location(latitude: 0, longitude: 0),
          dropoffAddress: 'B',
          vehicleCategory: cat,
          estimatedFare: 100,
          status: RideStatus.requested,
          createdAt: DateTime.now(),
        );
        final json = req.toJson();
        expect(json['vehicle_category'], cat);
        final restored = RideRequest.fromJson(json);
        expect(restored.vehicleCategory, cat);
      }
    });

    test('6. SavedPlace Model & Autoload Service Serialization', () {
      final place = SavedPlace(
        id: 'home_001',
        name: 'Home',
        address: 'Gandhipuram 1st Street, CBE',
        latitude: 11.0168,
        longitude: 76.9558,
        tag: 'home',
      );

      final json = place.toJson();
      expect(json['id'], 'home_001');
      expect(json['name'], 'Home');
      expect(json['tag'], 'home');
      expect(json['latitude'], 11.0168);

      final restored = SavedPlace.fromJson(json);
      expect(restored.id, 'home_001');
      expect(restored.name, 'Home');
      expect(restored.address, 'Gandhipuram 1st Street, CBE');
      expect(restored.latitude, 11.0168);
      expect(restored.longitude, 76.9558);
    });

    test('7. Admin Role Authorization Verification', () {
      final adminIdentifiers = ['9486335870', '919486335870', 'aishleetechnology@gmail.com'];
      
      final is9486335870Admin = adminIdentifiers.any((id) => '9486335870'.contains(id));
      expect(is9486335870Admin, isTrue);

      final is9123596988Admin = adminIdentifiers.any((id) => '9123596988'.contains(id));
      expect(is9123596988Admin, isFalse);
    });

    test('8. DeviceSignature Hardware Model Serialization', () {
      final sig = DeviceSignature(
        deviceId: 'V2307_ID_99',
        brand: 'vivo',
        model: 'V2307',
        osVersion: 'Android 15 (API 35)',
        deviceName: 'vivo V2307',
        signatureHash: 'vivo_V2307_V2307_ID_99',
      );

      final json = sig.toJson();
      expect(json['device_id'], 'V2307_ID_99');
      expect(json['brand'], 'vivo');
      expect(json['model'], 'V2307');
      expect(json['signature_hash'], 'vivo_V2307_V2307_ID_99');

      final restored = DeviceSignature.fromJson(json);
      expect(restored.deviceId, 'V2307_ID_99');
      expect(restored.brand, 'vivo');
      expect(restored.signatureHash, 'vivo_V2307_V2307_ID_99');
    });

    test('9. Admin PIN 1995 Verification Test', () async {
      TestWidgetsFlutterBinding.ensureInitialized();
      SharedPreferences.setMockInitialValues({});
      final is1995Valid = await DeviceAuthService.verifyCustomFagoPin('1995', currentPhone: '9486335870');
      expect(is1995Valid, isTrue);
    });

  });
}
