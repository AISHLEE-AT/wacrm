enum RideStatus { requested, accepted, arrived, inProgress, completed, cancelled }

class Location {
  final double latitude;
  final double longitude;

  const Location({
    required this.latitude,
    required this.longitude,
  });

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
      };

  factory Location.fromJson(Map<String, dynamic> json) => Location(
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
      );
}

class RideRequest {
  final String id;
  final String riderId;
  final String riderPhone;
  final Location pickupLocation;
  final String pickupAddress;
  final Location dropoffLocation;
  final String dropoffAddress;
  final String vehicleCategory; // Bike, Auto, Car, Van, Truck, Bus
  final double estimatedFare;
  final RideStatus status;
  final String? driverId;
  final String? driverPhone;
  final DateTime createdAt;

  RideRequest({
    required this.id,
    required this.riderId,
    required this.riderPhone,
    required this.pickupLocation,
    required this.pickupAddress,
    required this.dropoffLocation,
    required this.dropoffAddress,
    required this.vehicleCategory,
    required this.estimatedFare,
    required this.status,
    this.driverId,
    this.driverPhone,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'rider_id': riderId,
        'rider_phone': riderPhone,
        'pickup_location': pickupLocation.toJson(),
        'pickup_address': pickupAddress,
        'dropoff_location': dropoffLocation.toJson(),
        'dropoff_address': dropoffAddress,
        'vehicle_category': vehicleCategory,
        'estimated_fare': estimatedFare,
        'status': status.name,
        'driver_id': driverId,
        'driver_phone': driverPhone,
        'created_at': createdAt.toIso8601String(),
      };

  factory RideRequest.fromJson(Map<String, dynamic> json) => RideRequest(
        id: json['id'],
        riderId: json['rider_id'],
        riderPhone: json['rider_phone'] ?? '',
        pickupLocation: Location.fromJson(json['pickup_location']),
        pickupAddress: json['pickup_address'] ?? 'Pickup Location',
        dropoffLocation: Location.fromJson(json['dropoff_location']),
        dropoffAddress: json['dropoff_address'] ?? 'Dropoff Location',
        vehicleCategory: json['vehicle_category'] ?? 'Auto',
        estimatedFare: (json['estimated_fare'] as num).toDouble(),
        status: RideStatus.values.firstWhere(
          (e) => e.name == json['status'],
          orElse: () => RideStatus.requested,
        ),
        driverId: json['driver_id'],
        driverPhone: json['driver_phone'],
        createdAt: DateTime.parse(json['created_at']),
      );
}
