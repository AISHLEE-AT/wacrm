import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class LocationPoint {
  final double lat;
  final double lng;
  final String name;

  LocationPoint({required this.lat, required this.lng, required this.name});
}

class RideScreen extends ConsumerStatefulWidget {
  const RideScreen({super.key});

  @override
  ConsumerState<RideScreen> createState() => _RideScreenState();
}

class _RideScreenState extends ConsumerState<RideScreen> {
  final Completer<GoogleMapController> _controller = Completer<GoogleMapController>();
  
  Position? _currentLocation;
  LocationPoint? _pickup;
  LocationPoint? _dropoff;
  
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  String? _errorMsg;

  // Driver Peer-to-Peer state
  List<dynamic> _drivers = [];
  bool _searchingDrivers = false;
  Map<String, dynamic>? _selectedDriver;
  Map<String, dynamic>? _activeRide;

  static const String _wabaNumber = '916381029380';

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _errorMsg = 'Location services are disabled.';
      });
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _errorMsg = 'Location permissions are denied';
        });
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      setState(() {
        _errorMsg = 'Location permissions are permanently denied.';
      });
      return;
    } 

    try {
      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentLocation = position;
      });

      // Reverse geocode
      List<Placemark> placemarks = await Geocoding().placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      String name = 'Current Location';
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final parts = [p.street, p.subLocality, p.locality].where((e) => e != null && e.isNotEmpty).toList();
        if (parts.isNotEmpty) {
          name = parts.join(', ');
        }
      }

      setState(() {
        _pickup = LocationPoint(
          lat: position.latitude,
          lng: position.longitude,
          name: name,
        );
      });
    } catch (e) {
      if (_currentLocation != null) {
        setState(() {
          _pickup = LocationPoint(
            lat: _currentLocation!.latitude,
            lng: _currentLocation!.longitude,
            name: 'Current Location',
          );
        });
      }
    }
  }

  Future<void> _handleSearchDropoff(String query) async {
    if (query.trim().isEmpty) return;
    
    setState(() {
      _isSearching = true;
    });
    
    FocusScope.of(context).unfocus();

    try {
      List<Location> locations = await Geocoding().locationFromAddress(query);
      if (locations.isNotEmpty) {
        final loc = locations.first;
        
        List<Placemark> placemarks = await Geocoding().placemarkFromCoordinates(
          loc.latitude,
          loc.longitude,
        );
        
        String cleanName = query;
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          final parts = [p.street, p.locality].where((e) => e != null && e.isNotEmpty).toList();
          if (parts.isNotEmpty) {
            cleanName = parts.join(', ');
          }
        }

        setState(() {
          _dropoff = LocationPoint(
            lat: loc.latitude,
            lng: loc.longitude,
            name: cleanName,
          );
          _searchController.text = cleanName;
        });

        // Center map to show both pickup and dropoff
        if (_pickup != null) {
          final controller = await _controller.future;
          
          double minLat = _pickup!.lat < loc.latitude ? _pickup!.lat : loc.latitude;
          double maxLat = _pickup!.lat > loc.latitude ? _pickup!.lat : loc.latitude;
          double minLng = _pickup!.lng < loc.longitude ? _pickup!.lng : loc.longitude;
          double maxLng = _pickup!.lng > loc.longitude ? _pickup!.lng : loc.longitude;

          controller.animateCamera(
            CameraUpdate.newLatLngBounds(
              LatLngBounds(
                southwest: LatLng(minLat, minLng),
                northeast: LatLng(maxLat, maxLng),
              ),
              100.0, // padding
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not find that location. Try a different search.')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error searching location.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
      }
    }
  }

  Future<void> _searchDrivers() async {
    if (_pickup == null || _dropoff == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a drop-off location first.')),
      );
      return;
    }
    
    setState(() => _searchingDrivers = true);
    
    try {
      // Call our new RPC function
      final response = await Supabase.instance.client.rpc('get_nearby_drivers', params: {
        'pickup_lat': _pickup!.lat,
        'pickup_lon': _pickup!.lng,
        'radius_km': 2, // 2km radius
      });
      
      setState(() {
        _drivers = List<dynamic>.from(response);
        _searchingDrivers = false;
      });
      
      if (_drivers.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No drivers found within 2km. Trying virtual drivers...')),
          );
        }
      }
    } catch (e) {
      setState(() => _searchingDrivers = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error searching drivers: $e')),
        );
      }
    }
  }

  Future<void> _bookDriver(Map<String, dynamic> driver) async {
    setState(() => _searchingDrivers = true); // Use this to show a loading state on the button
    
    try {
      final supabase = Supabase.instance.client;
      // Generate a 4 digit OTP
      final otp = (1000 + (DateTime.now().millisecondsSinceEpoch % 9000)).toString();
      
      // Calculate basic price based on vehicle and distance. For now, flat rate test
      final price = 50.0;
      
      final rideResponse = await supabase.from('rides').insert({
        'customer_id': supabase.auth.currentUser?.id, 
        'driver_id': driver['id'],
        'pickup_latitude': _pickup!.lat,
        'pickup_longitude': _pickup!.lng,
        'pickup_address': _pickup!.name,
        'dropoff_latitude': _dropoff!.lat,
        'dropoff_longitude': _dropoff!.lng,
        'dropoff_address': _dropoff!.name,
        'vehicle_type': driver['vehicle_type'],
        'price': price,
        'status': 'pending',
        'otp': otp
      }).select().single();
      
      setState(() {
        _activeRide = rideResponse;
        _searchingDrivers = false;
      });
      
      // Setup Realtime Listener for driver acceptance
      supabase
        .channel('public:rides:id=${rideResponse['id']}')
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'rides',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'id',
            value: rideResponse['id'],
          ),
          callback: (payload) {
            final updatedRide = payload.newRecord;
            setState(() {
              _activeRide = updatedRide;
            });
            if (updatedRide['status'] == 'accepted') {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Driver accepted! Your OTP is: ${updatedRide['otp']}'),
                    backgroundColor: Colors.green,
                    duration: const Duration(seconds: 10),
                  ),
                );
              }
            } else if (updatedRide['status'] == 'completed') {
              // Trigger payment flow
            }
          }
        )
        .subscribe();
        
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ride requested! Waiting for driver...')),
        );
      }
    } catch (e) {
      setState(() => _searchingDrivers = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error booking ride: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_errorMsg != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0A0F1E),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(LucideIcons.mapPinOff, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text(
                  _errorMsg!,
                  style: const TextStyle(color: Colors.white, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _determinePosition,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Try Again'),
                )
              ],
            ),
          ),
        ),
      );
    }

    if (_currentLocation == null || _pickup == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0F1E),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Color(0xFF10B981)),
              SizedBox(height: 16),
              Text(
                'Fetching your location...',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16),
              ),
            ],
          ),
        ),
      );
    }

    Set<Marker> markers = {
      Marker(
        markerId: const MarkerId('pickup'),
        position: LatLng(_pickup!.lat, _pickup!.lng),
        infoWindow: InfoWindow(title: 'Pickup', snippet: _pickup!.name),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    };

    if (_dropoff != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('dropoff'),
          position: LatLng(_dropoff!.lat, _dropoff!.lng),
          infoWindow: InfoWindow(title: 'Drop-off', snippet: _dropoff!.name),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: Stack(
        children: [
          GoogleMap(
            mapType: MapType.normal,
            initialCameraPosition: CameraPosition(
              target: LatLng(_currentLocation!.latitude, _currentLocation!.longitude),
              zoom: 14.4746,
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            markers: markers,
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
            },
          ),
          
          // Search Bar Overlay
          Positioned(
            top: 60,
            left: 20,
            right: 20,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    offset: const Offset(0, 4),
                    blurRadius: 5,
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 12.0),
                    child: Icon(LucideIcons.search, color: Color(0xFF94A3B8), size: 20),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                      decoration: const InputDecoration(
                        hintText: 'Where to? (e.g. Marina Beach)',
                        hintStyle: TextStyle(color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.all(16),
                      ),
                      textInputAction: TextInputAction.search,
                      onSubmitted: _handleSearchDropoff,
                    ),
                  ),
                  if (_isSearching)
                    const Padding(
                      padding: EdgeInsets.only(right: 12.0),
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          
          // Recenter Button
          Positioned(
            right: 20,
            bottom: 300, // Above bottom sheet
            child: FloatingActionButton(
              heroTag: 'recenter',
              backgroundColor: Colors.white,
              onPressed: () async {
                final controller = await _controller.future;
                controller.animateCamera(
                  CameraUpdate.newCameraPosition(
                    CameraPosition(
                      target: LatLng(_pickup!.lat, _pickup!.lng),
                      zoom: 14.4746,
                    ),
                  ),
                );
              },
              child: const Icon(LucideIcons.navigation, color: Color(0xFF1E293B)),
            ),
          ),
          
          // Bottom Sheet UI
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFF111827),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
                border: Border(
                  top: BorderSide(color: Color(0xFF334155)),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    offset: Offset(0, -4),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'RideO Booking',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Location Row
                  Row(
                    children: [
                      // Dots and Line
                      Column(
                        children: [
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          Container(
                            width: 2,
                            height: 40,
                            color: const Color(0xFF334155),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                          ),
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      // Texts
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'PICKUP',
                              style: TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _pickup!.name,
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 24),
                            const Text(
                              'DROP-OFF',
                              style: TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _dropoff?.name ?? 'Search destination above',
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 24),
                  
                  if (_activeRide != null) ...[
                    // Active Ride UI
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF10B981)),
                      ),
                      child: Column(
                        children: [
                          Text(
                            _activeRide!['status'] == 'pending' 
                                ? 'Waiting for Driver to Accept...' 
                                : 'Driver Accepted!',
                            style: TextStyle(
                              color: _activeRide!['status'] == 'pending' ? Colors.orange : Colors.green,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 12),
                          if (_activeRide!['status'] == 'accepted')
                            Text(
                              'OTP: ${_activeRide!['otp']}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 4,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ] else if (_drivers.isNotEmpty) ...[
                    // Drivers List UI
                    const Text(
                      'Nearby Drivers',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 180,
                      child: ListView.builder(
                        itemCount: _drivers.length,
                        itemBuilder: (context, index) {
                          final driver = _drivers[index];
                          return Card(
                            color: const Color(0xFF1E293B),
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: Text(
                                driver['vehicle_type'] == 'bike' ? '🏍️' : 
                                driver['vehicle_type'] == 'auto' ? '🛺' : '🚕',
                                style: const TextStyle(fontSize: 24),
                              ),
                              title: Text(driver['name'], style: const TextStyle(color: Colors.white)),
                              subtitle: Text(
                                '${driver['vehicle_model']} • ${driver['distance_km'].toStringAsFixed(1)}km away',
                                style: const TextStyle(color: Color(0xFF94A3B8)),
                              ),
                              trailing: ElevatedButton(
                                onPressed: _searchingDrivers ? null : () => _bookDriver(driver),
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                                child: const Text('Book', style: TextStyle(color: Colors.white)),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => setState(() => _drivers = []),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent),
                      child: const Text('Cancel', style: TextStyle(color: Colors.redAccent)),
                    ),
                  ] else ...[
                    // Initial State UI
                    ElevatedButton.icon(
                      onPressed: (_dropoff != null && !_searchingDrivers) ? _searchDrivers : null,
                      icon: _searchingDrivers 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white))
                          : const Icon(LucideIcons.search, color: Colors.white),
                      label: Text(
                        _searchingDrivers ? 'Searching...' : 'Find Nearby Drivers',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        disabledBackgroundColor: const Color(0xFF0F172A),
                        foregroundColor: Colors.white,
                        disabledForegroundColor: Colors.white54,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: _dropoff == null 
                              ? const BorderSide(color: Color(0xFF334155)) 
                              : BorderSide.none,
                        ),
                      ),
                    ),
                  ],
                  
                  const SizedBox(height: 16),
                  
                  const Text(
                    'Connected to Aishlee CRM network',
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
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
