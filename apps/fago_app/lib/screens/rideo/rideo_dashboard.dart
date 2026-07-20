import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class RideODashboard extends ConsumerStatefulWidget {
  const RideODashboard({Key? key}) : super(key: key);

  @override
  ConsumerState<RideODashboard> createState() => _RideODashboardState();
}

class _RideODashboardState extends ConsumerState<RideODashboard> {
  final Completer<GoogleMapController> _controller = Completer();
  bool _isOnline = false;
  LatLng _currentLocation = const LatLng(11.1271, 78.6569); // Default TN
  StreamSubscription<Position>? _positionStream;
  DateTime? _lastUpdateTime;
  
  // Cost Optimization limit (60 seconds)
  static const int _updateIntervalSeconds = 60;

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
  }

  void _toggleOnline() {
    setState(() {
      _isOnline = !_isOnline;
    });

    if (_isOnline) {
      _startTracking();
    } else {
      _stopTracking();
    }
  }

  void _startTracking() {
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((Position position) {
      final newLoc = LatLng(position.latitude, position.longitude);
      setState(() {
        _currentLocation = newLoc;
      });

      _moveCamera(newLoc);

      final now = DateTime.now();
      if (_lastUpdateTime == null || now.difference(_lastUpdateTime!).inSeconds > _updateIntervalSeconds) {
        _updateLocationOnSupabase(newLoc);
        _lastUpdateTime = now;
      }
    });
  }

  void _stopTracking() {
    _positionStream?.cancel();
    _positionStream = null;
  }

  Future<void> _moveCamera(LatLng target) async {
    final GoogleMapController controller = await _controller.future;
    controller.animateCamera(CameraUpdate.newCameraPosition(
      CameraPosition(target: target, zoom: 16),
    ));
  }

  Future<void> _updateLocationOnSupabase(LatLng location) async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        await Supabase.instance.client.from('profiles').update({
          'latitude': location.latitude,
          'longitude': location.longitude,
          'updated_at': DateTime.now().toIso8601String(),
        }).eq('id', user.id);
        debugPrint('Location updated in DB (Cost-Optimized)');
      }
    } catch (e) {
      debugPrint('Error updating location: $e');
    }
  }

  @override
  void dispose() {
    _stopTracking();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('RideO Dashboard'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: ElevatedButton.icon(
              onPressed: _toggleOnline,
              icon: Icon(_isOnline ? Icons.power_settings_new : Icons.offline_bolt, color: Colors.white),
              label: Text(_isOnline ? 'Go Offline' : 'Go Online', style: const TextStyle(color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: _isOnline ? Colors.red : Colors.green,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
            ),
          )
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 2,
            child: _isOnline ? GoogleMap(
              mapType: MapType.normal,
              initialCameraPosition: CameraPosition(
                target: _currentLocation,
                zoom: 14,
              ),
              onMapCreated: (GoogleMapController controller) {
                _controller.complete(controller);
                // Set map style for dark mode here if desired
              },
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
              zoomControlsEnabled: false,
            ) : Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.location_off, size: 64, color: Colors.grey),
                    SizedBox(height: 16),
                    Text('You are offline. Go online to receive orders.', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Active Deliveries', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Expanded(
                    child: Center(
                      child: Text(_isOnline ? 'Waiting for orders...' : 'Offline'),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.monetization_on, color: Colors.orange),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Cost Optimization Active: Map updates limited to 60s intervals to conserve API & Battery.',
                            style: TextStyle(fontSize: 12, color: Colors.orange),
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
