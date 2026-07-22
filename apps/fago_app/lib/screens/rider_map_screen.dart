import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../services/supabase_backend_service.dart';

class RiderMapScreen extends StatefulWidget {
  const RiderMapScreen({Key? key}) : super(key: key);

  @override
  State<RiderMapScreen> createState() => _RiderMapScreenState();
}

class _RiderMapScreenState extends State<RiderMapScreen> {
  GoogleMapController? _mapController;
  Location? _currentLocation;
  Location? _destinationLocation;
  String _currentAddress = 'Detecting high-precision GPS...';
  String _destinationAddress = '';
  String _selectedCategory = 'Auto';
  double _estimatedFare = 0.0;
  bool _isBooking = false;
  RideRequest? _activeRide;

  final Map<String, Map<String, dynamic>> _categories = {
    'Bike': {'baseFare': 30, 'perKm': 10, 'icon': Icons.two_wheeler, 'color': Colors.orange},
    'Auto': {'baseFare': 50, 'perKm': 15, 'icon': Icons.electric_rickshaw, 'color': Colors.amber},
    'Car': {'baseFare': 100, 'perKm': 22, 'icon': Icons.directions_car, 'color': Colors.blue},
    'Van': {'baseFare': 250, 'perKm': 35, 'icon': Icons.airport_shuttle, 'color': Colors.purple},
    'Truck': {'baseFare': 400, 'perKm': 50, 'icon': Icons.local_shipping, 'color': Colors.brown},
    'Bus': {'baseFare': 600, 'perKm': 75, 'icon': Icons.directions_bus, 'color': Colors.teal},
  };

  @override
  void initState() {
    super.initState();
    _fetchLiveLocation();
  }

  Future<void> _fetchLiveLocation() async {
    final loc = await LocationService().getCurrentLocation();
    final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
    if (mounted) {
      setState(() {
        _currentLocation = loc;
        _currentAddress = address;
      });
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(loc.latitude, loc.longitude), 15),
      );
    }
  }

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    var p = 0.017453292519943295;
    var c = cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * asin(sqrt(a));
  }

  void _updateFare() {
    if (_currentLocation != null && _destinationLocation != null) {
      double distKm = _calculateDistance(
        _currentLocation!.latitude,
        _currentLocation!.longitude,
        _destinationLocation!.latitude,
        _destinationLocation!.longitude,
      );

      final cat = _categories[_selectedCategory]!;
      double fare = cat['baseFare'] + (distKm * cat['perKm']);
      setState(() {
        _estimatedFare = max(fare, (cat['baseFare'] as int).toDouble());
      });
    }
  }

  void _onMapTapped(LatLng target) async {
    setState(() {
      _destinationLocation = Location(latitude: target.latitude, longitude: target.longitude);
      _destinationAddress = 'Selected Destination Pin (${target.latitude.toStringAsFixed(3)}, ${target.longitude.toStringAsFixed(3)})';
    });
    _updateFare();

    final address = await LocationService().getAddressFromCoordinates(target.latitude, target.longitude);
    if (mounted) {
      setState(() {
        _destinationAddress = address;
      });
    }
  }

  Future<void> _requestRide() async {
    if (_currentLocation == null || _destinationLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select your destination on the map first.')),
      );
      return;
    }

    setState(() => _isBooking = true);

    final newRide = RideRequest(
      id: 'RIDE_${DateTime.now().millisecondsSinceEpoch}',
      riderId: 'RIDER_001',
      riderPhone: '+919876543210',
      pickupLocation: _currentLocation!,
      pickupAddress: _currentAddress,
      dropoffLocation: _destinationLocation!,
      dropoffAddress: _destinationAddress,
      vehicleCategory: _selectedCategory,
      estimatedFare: _estimatedFare,
      status: RideStatus.requested,
      createdAt: DateTime.now(),
    );

    final result = await SupabaseBackendService().createRideRequest(newRide);
    setState(() {
      _isBooking = false;
      _activeRide = result ?? newRide;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ride requested! Nearby drivers have been notified via WhatsApp Radar.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final initialPos = _currentLocation != null
        ? LatLng(_currentLocation!.latitude, _currentLocation!.longitude)
        : const LatLng(13.0827, 80.2707);

    Set<Marker> markers = {};
    if (_currentLocation != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('pickup'),
          position: LatLng(_currentLocation!.latitude, _currentLocation!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
          infoWindow: const InfoWindow(title: 'Pickup Location'),
        ),
      );
    }
    if (_destinationLocation != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('dropoff'),
          position: LatLng(_destinationLocation!.latitude, _destinationLocation!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: const InfoWindow(title: 'Drop-off Location'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('RideO - Book $_selectedCategory'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _fetchLiveLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(target: initialPos, zoom: 14),
            onMapCreated: (controller) => _mapController = controller,
            markers: markers,
            onTap: _onMapTapped,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
          ),

          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10)],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.circle, color: Colors.green, size: 14),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _currentAddress,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.red, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _destinationAddress.isEmpty ? 'Tap map to choose drop-off point' : _destinationAddress,
                          style: TextStyle(
                            color: _destinationAddress.isEmpty ? Colors.grey : Colors.black,
                            fontSize: 13,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 20),

                  SizedBox(
                    height: 80,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: _categories.keys.map((catKey) {
                        final isSelected = catKey == _selectedCategory;
                        final cat = _categories[catKey]!;
                        return GestureDetector(
                          onTap: () {
                            setState(() => _selectedCategory = catKey);
                            _updateFare();
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.only(right: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? (cat['color'] as Color).withOpacity(0.15) : Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? (cat['color'] as Color) : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(cat['icon'], color: isSelected ? (cat['color'] as Color) : Colors.black87),
                                const SizedBox(height: 4),
                                Text(
                                  catKey,
                                  style: TextStyle(
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (_destinationLocation != null) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Est. Fare: ₹${_estimatedFare.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green),
                        ),
                        ElevatedButton.icon(
                          onPressed: () {
                            WhatsAppService.openGoogleMapsApp(
                              destinationLat: _destinationLocation!.latitude,
                              destinationLng: _destinationLocation!.longitude,
                              originLat: _currentLocation?.latitude,
                              originLng: _currentLocation?.longitude,
                            );
                          },
                          icon: const Icon(Icons.directions, size: 18),
                          label: const Text('Route Preview ($0)'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue.shade800,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isBooking ? null : _requestRide,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isBooking
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text('BOOK $_selectedCategory NOW'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
