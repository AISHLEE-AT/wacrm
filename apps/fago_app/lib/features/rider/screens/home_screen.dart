import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:math' as math;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';
import 'package:geolocator/geolocator.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late GoogleMapController mapController;
  final LatLng _defaultCenter = const LatLng(13.0827, 80.2707); // Chennai center
  final SupabaseClient _supabase = Supabase.instance.client;

  LatLng? _currentLocation;
  LatLng? _pickup;
  LatLng? _dropoff;
  String _pickupAddress = "Current Location";
  String _dropoffAddress = "Where to?";
  
  bool _isBooking = false;
  bool _isLoadingMap = true;
  List<dynamic> _onlineDrivers = [];
  Map<String, dynamic>? _activeRide;

  // Use dotenv for Google Maps API Key
  final String _googleApiKey = dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';

  @override
  void initState() {
    super.initState();
    _initApp();
  }

  Future<void> _initApp() async {
    await _determinePosition();
    await _fetchOnlineDrivers();
    await _checkActiveRide();
    _listenToDrivers();
    _listenToRideStatus();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      _setFallbackLocation();
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _setFallbackLocation();
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      _setFallbackLocation();
      return;
    }

    try {
      Position position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentLocation = LatLng(position.latitude, position.longitude);
        _pickup = _currentLocation;
        _isLoadingMap = false;
      });
      _getAddressFromLatLng(_currentLocation!, true);
    } catch(e) {
      _setFallbackLocation();
    }
  }

  void _setFallbackLocation() {
    setState(() {
      _currentLocation = _defaultCenter;
      _pickup = _defaultCenter;
      _isLoadingMap = false;
    });
  }

  Future<void> _getAddressFromLatLng(LatLng position, bool isPickup) async {
    try {
      final url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.latitude},${position.longitude}&key=$_googleApiKey';
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['results'] != null && data['results'].length > 0) {
          final address = data['results'][0]['formatted_address'];
          setState(() {
            if (isPickup) {
              _pickupAddress = address;
            } else {
              _dropoffAddress = address;
            }
          });
        }
      }
    } catch (e) {
      debugPrint("Geocoding error: $e");
    }
  }

  Future<void> _fetchOnlineDrivers() async {
    try {
      final res = await _supabase.from('drivers').select('*').eq('status', 'online');
      setState(() {
        _onlineDrivers = res as List<dynamic>;
      });
    } catch (e) {
      debugPrint("Error fetching drivers: $e");
    }
  }

  void _listenToDrivers() {
    _supabase.channel('public:drivers').onPostgresChanges(
      event: PostgresChangeEvent.all, schema: 'public', table: 'drivers',
      callback: (payload) {
        _fetchOnlineDrivers();
      }
    ).subscribe();
  }

  Future<void> _checkActiveRide() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;
    try {
      final res = await _supabase
          .from('rides')
          .select('*')
          .eq('passenger_id', userId)
          .inFilter('status', ['pending', 'accepted', 'en_route'])
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();
      if (res != null) {
        setState(() => _activeRide = res);
      }
    } catch (e) {
      debugPrint("Active ride error: $e");
    }
  }

  void _listenToRideStatus() {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;
    _supabase.channel('public:rides').onPostgresChanges(
      event: PostgresChangeEvent.all, schema: 'public', table: 'rides',
      callback: (payload) {
        if (payload.newRecord != null) {
          if (payload.newRecord!['passenger_id'] == userId) {
            final status = payload.newRecord!['status'];
            if (['pending', 'accepted', 'en_route'].contains(status)) {
              setState(() => _activeRide = payload.newRecord);
            } else {
              setState(() => _activeRide = null);
            }
          }
        }
      }
    ).subscribe();
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  double _calculateDistance(LatLng start, LatLng end) {
    const double R = 6371; // Radius of the Earth in km
    final double dLat = (end.latitude - start.latitude) * math.pi / 180;
    final double dLon = (end.longitude - start.longitude) * math.pi / 180;
    final double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(start.latitude * math.pi / 180) *
            math.cos(end.latitude * math.pi / 180) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return R * c; 
  }

  Future<void> _searchPlace(BuildContext context, bool isPickup) async {
    final result = await showSearch(
      context: context,
      delegate: PlaceSearchDelegate(_googleApiKey, _currentLocation),
    );
    if (result != null) {
      setState(() {
        if (isPickup) {
          _pickup = LatLng(result['lat'], result['lng']);
          _pickupAddress = result['name'];
        } else {
          _dropoff = LatLng(result['lat'], result['lng']);
          _dropoffAddress = result['name'];
        }
      });
      // Move camera
      if (isPickup) {
        mapController.animateCamera(CameraUpdate.newLatLng(_pickup!));
      } else if (_dropoff != null) {
        mapController.animateCamera(CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(
              math.min(_pickup!.latitude, _dropoff!.latitude),
              math.min(_pickup!.longitude, _dropoff!.longitude),
            ),
            northeast: LatLng(
              math.max(_pickup!.latitude, _dropoff!.latitude),
              math.max(_pickup!.longitude, _dropoff!.longitude),
            ),
          ),
          50,
        ));
      }
    }
  }

  Future<void> _bookRide(String vehicleType) async {
    if (_pickup == null || _dropoff == null) return;
    
    setState(() => _isBooking = true);

    try {
      double distanceKm = _calculateDistance(_pickup!, _dropoff!);
      double baseRate = vehicleType == 'bike' ? 12 : 20;
      double price = math.max(50.0, (distanceKm * baseRate).roundToDouble());

      final userId = _supabase.auth.currentUser?.id;

      final res = await _supabase.from('rides').insert({
        'passenger_id': userId,
        'pickup_lat': _pickup!.latitude,
        'pickup_lng': _pickup!.longitude,
        'dropoff_lat': _dropoff!.latitude,
        'dropoff_lng': _dropoff!.longitude,
        'pickup_address': _pickupAddress,
        'dropoff_address': _dropoffAddress,
        'status': 'pending',
        'estimated_price': price,
        'distance_km': double.parse(distanceKm.toStringAsFixed(2)),
      }).select().single();

      setState(() => _activeRide = res);
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error booking ride: $e')));
    } finally {
      setState(() => _isBooking = false);
    }
  }
  
  Future<void> _cancelRide() async {
    if (_activeRide == null) return;
    try {
      await _supabase.from('rides').update({'status': 'cancelled'}).eq('id', _activeRide!['id']);
      setState(() {
        _activeRide = null;
        _dropoff = null;
        _dropoffAddress = "Where to?";
      });
    } catch(e) {
      debugPrint("Error canceling: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    Set<Marker> markers = {};
    
    if (_activeRide != null) {
      markers.add(Marker(markerId: const MarkerId('pickup'), position: LatLng(_activeRide!['pickup_lat'], _activeRide!['pickup_lng']), icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen)));
      markers.add(Marker(markerId: const MarkerId('dropoff'), position: LatLng(_activeRide!['dropoff_lat'], _activeRide!['dropoff_lng']), icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)));
    } else {
      if (_pickup != null) markers.add(Marker(markerId: const MarkerId('pickup'), position: _pickup!, icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen)));
      if (_dropoff != null) markers.add(Marker(markerId: const MarkerId('dropoff'), position: _dropoff!, icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)));
      
      // Show online drivers nearby
      for (var i = 0; i < _onlineDrivers.length; i++) {
        final driver = _onlineDrivers[i];
        // Generate random offset for simulation if we don't have their true real-time GPS in the DB yet
        final lat = (_pickup?.latitude ?? _defaultCenter.latitude) + (math.Random().nextDouble() - 0.5) * 0.02;
        final lng = (_pickup?.longitude ?? _defaultCenter.longitude) + (math.Random().nextDouble() - 0.5) * 0.02;
        markers.add(Marker(
          markerId: MarkerId('driver_${driver['id']}'),
          position: LatLng(lat, lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(driver['vehicle_type'] == 'bike' ? BitmapDescriptor.hueOrange : BitmapDescriptor.hueBlue),
        ));
      }
    }

    return Scaffold(
      body: _isLoadingMap 
        ? const Center(child: CircularProgressIndicator())
        : Stack(
          children: [
            GoogleMap(
              onMapCreated: _onMapCreated,
              initialCameraPosition: CameraPosition(target: _pickup ?? _defaultCenter, zoom: 15.0),
              markers: markers,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
            ),
            
            // App Bar Layer
            Positioned(
              top: 50,
              left: 20,
              child: CircleAvatar(
                backgroundColor: Colors.white,
                child: IconButton(
                  icon: const Icon(Icons.menu, color: Colors.black),
                  onPressed: () {},
                ),
              )
            ),
            
            if (_activeRide == null) ...[
              // Search Layer
              Positioned(
                top: 100,
                left: 20,
                right: 20,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, spreadRadius: 2)]
                  ),
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: () => _searchPlace(context, true),
                        child: Row(
                          children: [
                            const Icon(Icons.circle, color: Colors.green, size: 16),
                            const SizedBox(width: 12),
                            Expanded(child: Text(_pickupAddress, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                        child: Align(alignment: Alignment.centerLeft, child: Container(width: 2, height: 16, color: Colors.grey)),
                      ),
                      GestureDetector(
                        onTap: () => _searchPlace(context, false),
                        child: Row(
                          children: [
                            const Icon(Icons.stop, color: Colors.red, size: 16),
                            const SizedBox(width: 12),
                            Expanded(child: Text(_dropoffAddress, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: _dropoff == null ? Colors.grey : Colors.black), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          ],
                        ),
                      ),
                    ],
                  ),
                )
              ),
              
              // Bottom Sheet for Vehicles
              if (_pickup != null && _dropoff != null)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
                      boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 20, spreadRadius: 5)]
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Choose a Ride', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                            Text('${_calculateDistance(_pickup!, _dropoff!).toStringAsFixed(1)} km', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                          ],
                        ),
                        const SizedBox(height: 20),
                        
                        // Bike Option
                        _buildVehicleCard(
                          'RidO Bike', 
                          'Fastest • ~${(_calculateDistance(_pickup!, _dropoff!) * 3).toStringAsFixed(0)} mins', 
                          Icons.motorcycle, 
                          math.max(50, (_calculateDistance(_pickup!, _dropoff!) * 12).round()), 
                          'bike'
                        ),
                        const SizedBox(height: 12),
                        // Cab Option
                        _buildVehicleCard(
                          'RidO Cab', 
                          'Comfort • ~${(_calculateDistance(_pickup!, _dropoff!) * 4).toStringAsFixed(0)} mins', 
                          Icons.directions_car, 
                          math.max(50, (_calculateDistance(_pickup!, _dropoff!) * 20).round()), 
                          'car'
                        ),
                      ],
                    ),
                  )
                )
            ] else ...[
              // Active Ride Sheet
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
                    boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 20, spreadRadius: 5)]
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_activeRide!['status'] == 'pending' ? 'Looking for drivers...' : 'Driver is on the way!', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20),
                      if (_activeRide!['status'] == 'pending') const CircularProgressIndicator(),
                      const SizedBox(height: 20),
                      Text('Price: ₹${_activeRide!['estimated_price']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _cancelRide,
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade100, foregroundColor: Colors.red, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15))),
                          child: const Text('Cancel Ride', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        ),
                      )
                    ],
                  ),
                )
              )
            ]
          ],
        ),
    );
  }

  Widget _buildVehicleCard(String title, String subtitle, IconData icon, int price, String type) {
    return GestureDetector(
      onTap: _isBooking ? null : () => _bookRide(type),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          border: Border.all(color: Colors.grey.shade200),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            CircleAvatar(radius: 25, backgroundColor: Colors.green.shade100, child: Icon(icon, color: Colors.green.shade700, size: 30)),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                ],
              ),
            ),
            Text('₹$price', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}

class PlaceSearchDelegate extends SearchDelegate {
  final String apiKey;
  final LatLng? userLocation;
  String _sessionToken = const Uuid().v4();
  
  PlaceSearchDelegate(this.apiKey, this.userLocation);

  Future<List<dynamic>> _fetchSuggestions(String query) async {
    if (query.isEmpty) {
      if (userLocation == null) return [];
      // Nearby places fallback
      final url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation!.latitude},${userLocation!.longitude}&radius=5000&type=point_of_interest&key=$apiKey';
      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final results = data['results'] as List<dynamic>? ?? [];
        return results.take(5).toList();
      }
      return [];
    }
    
    // Autocomplete
    String url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=$query&key=$apiKey&components=country:in&sessiontoken=$_sessionToken';
    if (userLocation != null) {
      url += '&location=${userLocation!.latitude},${userLocation!.longitude}&radius=5000';
    }
    final res = await http.get(Uri.parse(url));
    if (res.statusCode == 200) {
      final data = json.decode(res.body);
      return data['predictions'] ?? [];
    }
    return [];
  }
  
  Future<Map<String, dynamic>?> _getPlaceDetails(String placeId, String fallbackName) async {
    final url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=$placeId&key=$apiKey&fields=geometry,name,place_id&sessiontoken=$_sessionToken';
    final res = await http.get(Uri.parse(url));
    if (res.statusCode == 200) {
      // Regenerate session token after completing a session
      _sessionToken = const Uuid().v4();
      final data = json.decode(res.body);
      if (data['result'] != null) {
        final loc = data['result']['geometry']['location'];
        return {
          'name': data['result']['name'] ?? fallbackName,
          'lat': loc['lat'],
          'lng': loc['lng']
        };
      }
    }
    return null;
  }

  @override
  List<Widget>? buildActions(BuildContext context) {
    return [
      IconButton(icon: const Icon(Icons.clear), onPressed: () => query = ''),
    ];
  }

  @override
  Widget? buildLeading(BuildContext context) {
    return IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => close(context, null));
  }

  @override
  Widget buildResults(BuildContext context) {
    return buildSuggestions(context);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _fetchSuggestions(query),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final results = snapshot.data!;
        
        return ListView.builder(
          itemCount: results.length,
          itemBuilder: (context, index) {
            final place = results[index];
            final name = place['description'] ?? place['name'];
            final placeId = place['place_id'];
            
            return ListTile(
              leading: const Icon(Icons.location_on, color: Colors.grey),
              title: Text(name),
              onTap: () async {
                if (place['geometry'] != null) {
                  // Coming from nearby search which already has lat/lng
                  close(context, {
                    'name': name,
                    'lat': place['geometry']['location']['lat'],
                    'lng': place['geometry']['location']['lng']
                  });
                } else {
                  // Need to fetch details for autocomplete prediction
                  final details = await _getPlaceDetails(placeId, name);
                  close(context, details);
                }
              },
            );
          },
        );
      },
    );
  }
}
