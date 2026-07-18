import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:math' as math;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';
import 'package:geolocator/geolocator.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../../../auth/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../driver/services/supabase_service.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late GoogleMapController mapController;
  final LatLng _defaultCenter = const LatLng(13.0827, 80.2707); // Chennai center
  final SupabaseClient _supabase = Supabase.instance.client;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  LatLng? _currentLocation;
  LatLng? _pickup;
  LatLng? _dropoff;
  String _pickupAddress = "Current Location";
  String _dropoffAddress = "Where to?";
  
  bool _isBooking = false;
  bool _isLoadingMap = true;
  List<dynamic> _onlineDrivers = [];
  Map<String, dynamic>? _activeRide;
  
  Set<Polyline> _polylines = {};
  double? _exactDistanceKm;
  int? _exactDurationMins;

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
          .select('*, driver:drivers(*)')
          .eq('passenger_id', userId)
          .inFilter('status', ['pending', 'accepted', 'en_route'])
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();
      if (res != null) {
        setState(() => _activeRide = res);
        if (res['driver_id'] != null) {
          _subscribeToActiveDriver(res['driver_id']);
        }
      }
    } catch (e) {
      debugPrint("Active ride error: $e");
    }
  }

  void _subscribeToActiveDriver(String driverId) {
    if (_activeDriverChannel != null) {
      _supabase.removeChannel(_activeDriverChannel!);
    }
    
    // Initial fetch
    _supabase.from('drivers').select('*').eq('id', driverId).maybeSingle().then((data) {
      if (data != null && mounted) {
        setState(() => _activeDriverData = data);
      }
    });

    // Real-time updates
    _activeDriverChannel = _supabase.channel('public:drivers:active:$driverId').onPostgresChanges(
      event: PostgresChangeEvent.update, schema: 'public', table: 'drivers',
      filter: PostgresChangeFilter(type: PostgresChangeFilterType.eq, column: 'id', value: driverId),
      callback: (payload) {
        if (payload.newRecord.isNotEmpty && mounted) {
          setState(() => _activeDriverData = payload.newRecord);
        }
      }
    ).subscribe();
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
              if (payload.newRecord!['driver_id'] != null && _activeDriverData?['id'] != payload.newRecord!['driver_id']) {
                _subscribeToActiveDriver(payload.newRecord!['driver_id'].toString());
              }
            } else if (status == 'completed' || status == 'cancelled') {
              final rideId = payload.newRecord!['id'].toString();
              setState(() {
                _activeRide = null;
                _activeDriverData = null;
                if (_activeDriverChannel != null) {
                  _supabase.removeChannel(_activeDriverChannel!);
                  _activeDriverChannel = null;
                }
                _dropoff = null;
                _dropoffAddress = "Where to?";
                _polylines.clear();
                _exactDistanceKm = null;
                _exactDurationMins = null;
              });
              if (mounted && status == 'completed') {
                // Fetch driver details again to get UPI ID (since payload doesn't join)
                _supabase.from('drivers').select('*').eq('id', payload.newRecord!['driver_id']).maybeSingle().then((driverInfo) {
                  if (!mounted) return;
                  final upiId = driverInfo?['upi_id'];
                  final price = payload.newRecord!['estimated_price'] ?? 0;
                  final driverName = driverInfo?['name'] ?? 'Driver';
                  
                  showDialog(
                    context: context,
                    barrierDismissible: false,
                    builder: (context) {
                      return AlertDialog(
                        title: const Text('Payment & Rating', textAlign: TextAlign.center),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (upiId != null && upiId.toString().isNotEmpty) ...[
                              const Text('Scan to pay driver directly:', style: TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 10),
                              QrImageView(
                                data: 'upi://pay?pa=$upiId&pn=$driverName&am=$price',
                                version: QrVersions.auto,
                                size: 180.0,
                              ),
                              Text('Amount: ₹$price', style: const TextStyle(fontSize: 20, color: Colors.green, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 20),
                              const Divider(),
                              const SizedBox(height: 10),
                            ] else ...[
                              Text('Please pay ₹$price via Cash/UPI', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 20),
                            ],
                            const Text('Rate your ride:'),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(5, (index) {
                                return IconButton(
                                  icon: const Icon(Icons.star_border, color: Colors.orange, size: 32),
                                  onPressed: () async {
                                    Navigator.pop(context);
                                    await SupabaseService().submitRating(rideId, index + 1, 'rider');
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thanks for rating!')));
                                    }
                                  },
                                );
                              }),
                            ),
                          ],
                        ),
                      );
                    }
                  );
                });
              }
            } else {
              setState(() {
                _activeRide = null;
                _dropoff = null;
                _dropoffAddress = "Where to?";
                _polylines.clear();
                _exactDistanceKm = null;
                _exactDurationMins = null;
              });
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

  List<LatLng> _decodePolyline(String encoded) {
    List<LatLng> polyline = [];
    int index = 0, len = encoded.length;
    int lat = 0, lng = 0;

    while (index < len) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      polyline.add(LatLng(lat / 1E5, lng / 1E5));
    }
    return polyline;
  }

  Future<void> _getRoute() async {
    if (_pickup == null || _dropoff == null) return;
    
    final url = 'https://maps.googleapis.com/maps/api/directions/json?origin=${_pickup!.latitude},${_pickup!.longitude}&destination=${_dropoff!.latitude},${_dropoff!.longitude}&key=$_googleApiKey';
    final res = await http.get(Uri.parse(url));
    if (res.statusCode == 200) {
      final data = json.decode(res.body);
      if (data['routes'] != null && data['routes'].isNotEmpty) {
        final route = data['routes'][0];
        final leg = route['legs'][0];
        setState(() {
          _exactDistanceKm = leg['distance']['value'] / 1000.0;
          _exactDurationMins = (leg['duration']['value'] / 60.0).round();
          
          final points = _decodePolyline(route['overview_polyline']['points']);
          _polylines = {
            Polyline(
              polylineId: const PolylineId('route'),
              color: Colors.blue,
              width: 5,
              points: points,
            )
          };
        });
        
        final bounds = route['bounds'];
        mapController.animateCamera(CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(bounds['southwest']['lat'], bounds['southwest']['lng']),
            northeast: LatLng(bounds['northeast']['lat'], bounds['northeast']['lng']),
          ),
          50,
        ));
      }
    }
  }

  int _calculatePrice(double distanceKm, String vehicleType) {
    // Basic Surge Pricing Logic
    final now = DateTime.now();
    final hour = now.hour;
    double surgeMultiplier = 1.0;
    
    // Peak hours: 8 AM - 10 AM (8-10) and 5 PM - 8 PM (17-20)
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
      surgeMultiplier = 1.5;
    }
    
    if (vehicleType == 'bike') {
      return math.max(30, ((20 + distanceKm * 8) * surgeMultiplier).round());
    } else if (vehicleType == 'auto') {
      return math.max(40, ((30 + distanceKm * 15) * surgeMultiplier).round());
    } else {
      return math.max(70, ((50 + distanceKm * 20) * surgeMultiplier).round());
    }
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
      // Move camera and draw route
      if (isPickup) {
        mapController.animateCamera(CameraUpdate.newLatLng(_pickup!));
        if (_dropoff != null) _getRoute();
      } else if (_dropoff != null) {
        _getRoute();
      }
    }
  }

  Future<void> _bookRide(String vehicleType) async {
    if (_pickup == null || _dropoff == null) return;
    
    setState(() => _isBooking = true);

    try {
      // Use exact road distance if available, fallback to Haversine
      double distanceKm = _exactDistanceKm ?? _calculateDistance(_pickup!, _dropoff!);
      double price = _calculatePrice(distanceKm, vehicleType).toDouble();

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
      
      // Trigger push notification to drivers
      try {
        final bridgeUrl = dotenv.env['NEXT_API_URL'] ?? 'https://watscrm.vercel.app';
        await http.post(
          Uri.parse('$bridgeUrl/api/notify/request-ride'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'pickup_address': _pickupAddress,
            'dropoff_address': _dropoffAddress,
            'price': price,
          }),
        );
      } catch (e) {
        debugPrint('Failed to send push notification: $e');
      }
      
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
        _activeDriverData = null;
        if (_activeDriverChannel != null) {
          _supabase.removeChannel(_activeDriverChannel!);
          _activeDriverChannel = null;
        }
        _dropoff = null;
        _dropoffAddress = "Where to?";
        _polylines.clear();
        _exactDistanceKm = null;
        _exactDurationMins = null;
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
      
      // Draw live active driver
      if (_activeDriverData != null) {
        final driverLat = _activeDriverData!['current_lat'] ?? _activeDriverData!['lat'];
        final driverLng = _activeDriverData!['current_lng'] ?? _activeDriverData!['lng'];
        
        if (driverLat != null && driverLng != null) {
          final lat = (driverLat as num).toDouble();
          final lng = (driverLng as num).toDouble();
          final phone = _activeDriverData!['mobile_number'] ?? 'N/A';
          final vehicle = _activeDriverData!['vehicle_type'] == 'bike' ? 'Bike' : 'Car';
          
          markers.add(Marker(
            markerId: const MarkerId('active_driver'),
            position: LatLng(lat, lng),
            icon: BitmapDescriptor.defaultMarkerWithHue(_activeDriverData!['vehicle_type'] == 'bike' ? BitmapDescriptor.hueOrange : BitmapDescriptor.hueBlue),
            infoWindow: InfoWindow(
              title: 'Your Driver ($vehicle)',
              snippet: 'Ph: $phone',
            ),
          ));
        }
      }
    } else {
      if (_pickup != null) markers.add(Marker(markerId: const MarkerId('pickup'), position: _pickup!, icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen)));
      if (_dropoff != null) markers.add(Marker(markerId: const MarkerId('dropoff'), position: _dropoff!, icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)));
      
      // Show online drivers nearby
      final currentUserId = _supabase.auth.currentUser?.id;
      for (var i = 0; i < _onlineDrivers.length; i++) {
        final driver = _onlineDrivers[i];
        
        // Exclude self to avoid showing two items (self as driver + self as rider)
        if (driver['user_id'] == currentUserId) continue;

        // Use exact vehicle location from DB
        final driverLat = driver['current_lat'] ?? driver['lat'];
        final driverLng = driver['current_lng'] ?? driver['lng'];
        
        if (driverLat != null && driverLng != null) {
          final lat = (driverLat as num).toDouble();
          final lng = (driverLng as num).toDouble();
          final phone = driver['mobile_number'] ?? 'N/A';
          final vehicle = driver['vehicle_type'] == 'bike' ? 'Bike' : 'Car';
          
          markers.add(Marker(
            markerId: MarkerId('driver_${driver['id']}'),
            position: LatLng(lat, lng),
            icon: BitmapDescriptor.defaultMarkerWithHue(driver['vehicle_type'] == 'bike' ? BitmapDescriptor.hueOrange : BitmapDescriptor.hueBlue),
            infoWindow: InfoWindow(
              title: 'Driver ($vehicle)',
              snippet: 'Ph: $phone',
            ),
          ));
        }
      }
    }

    return Scaffold(
      key: _scaffoldKey,
      drawer: _buildDrawer(context),
      body: _isLoadingMap 
        ? const Center(child: CircularProgressIndicator())
        : Stack(
          children: [
            GoogleMap(
              onMapCreated: _onMapCreated,
              initialCameraPosition: CameraPosition(target: _pickup ?? _defaultCenter, zoom: 15.0),
              markers: markers,
              polylines: _polylines,
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
                  onPressed: () {
                    _scaffoldKey.currentState?.openDrawer();
                  },
                ),
              )
            ),
            
            Positioned(
              top: 50,
              right: 20,
              child: CircleAvatar(
                backgroundColor: Colors.greenAccent.shade100,
                child: IconButton(
                  icon: Icon(Icons.support_agent, color: Colors.green.shade800),
                  tooltip: 'WhatsApp Help',
                  onPressed: () async {
                    final url = Uri.parse('https://wa.me/916381029380?text=Hi%20Fago%20Support,%20I%20need%20help!');
                    if (await canLaunchUrl(url)) {
                      await launchUrl(url, mode: LaunchMode.externalApplication);
                    }
                  },
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
                          'Fastest • ~${_exactDurationMins ?? (_calculateDistance(_pickup!, _dropoff!) * 3).toStringAsFixed(0)} mins', 
                          Icons.motorcycle, 
                          _calculatePrice(_exactDistanceKm ?? _calculateDistance(_pickup!, _dropoff!), 'bike'), 
                          'bike'
                        ),
                        const SizedBox(height: 12),
                        // Auto Option
                        _buildVehicleCard(
                          'RidO Auto', 
                          'Standard • ~${_exactDurationMins ?? (_calculateDistance(_pickup!, _dropoff!) * 4).toStringAsFixed(0)} mins', 
                          Icons.local_taxi, 
                          _calculatePrice(_exactDistanceKm ?? _calculateDistance(_pickup!, _dropoff!), 'auto'), 
                          'auto'
                        ),
                        const SizedBox(height: 12),
                        // Cab Option
                        _buildVehicleCard(
                          'RidO Cab', 
                          'Comfort • ~${_exactDurationMins ?? (_calculateDistance(_pickup!, _dropoff!) * 4).toStringAsFixed(0)} mins', 
                          Icons.directions_car, 
                          _calculatePrice(_exactDistanceKm ?? _calculateDistance(_pickup!, _dropoff!), 'car'), 
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(_activeRide!['status'] == 'pending' ? 'Looking for drivers...' : 'Driver is on the way!', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      if (_activeRide!['status'] != 'pending') ...[
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.shade200)),
                          child: Row(
                            children: [
                              CircleAvatar(radius: 25, backgroundColor: Colors.green.shade100, child: Icon(Icons.person, color: Colors.green.shade700, size: 30)),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(_activeRide!['driver']?['name'] ?? 'Driver Assigned', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                    Text(_activeRide!['driver']?['vehicle_number'] ?? 'Vehicle Details', style: const TextStyle(color: Colors.grey, fontSize: 14)),
                                  ],
                                ),
                              ),
                              Container(
                                decoration: BoxDecoration(color: Colors.blue.shade50, shape: BoxShape.circle),
                                child: IconButton(
                                  icon: const Icon(Icons.phone, color: Colors.blue),
                                  onPressed: () => launchUrl(Uri.parse('tel:${_activeRide!['driver']?['mobile_number'] ?? _activeRide!['driver_phone'] ?? ''}')),
                                ),
                              )
                            ],
                          ),
                        ),
                      ],
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

  Widget _buildDrawer(BuildContext context) {
    final userPhone = _supabase.auth.currentUser?.phone ?? 'User';
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              color: Colors.green,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const CircleAvatar(
                  backgroundColor: Colors.white,
                  radius: 30,
                  child: Icon(Icons.person, size: 40, color: Colors.green),
                ),
                const SizedBox(height: 10),
                Text(
                  userPhone,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.history),
            title: const Text('Ride History'),
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate to history
            },
          ),
          if (ref.watch(authProvider).role == UserRole.admin)
            ListTile(
              leading: const Icon(Icons.admin_panel_settings, color: Colors.amber),
              title: const Text('Admin Dashboard', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
              onTap: () {
                Navigator.pop(context);
                context.push('/admin');
              },
            ),
          if (ref.watch(authProvider).role == UserRole.driver)
            ListTile(
              leading: const Icon(Icons.drive_eta, color: Colors.orange),
              title: const Text('Open Driver App', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
              onTap: () {
                Navigator.pop(context);
                context.push('/driver');
              },
            )
          else
            ListTile(
              leading: const Icon(Icons.drive_eta),
              title: const Text('Become a Driver'),
              onTap: () {
                Navigator.pop(context);
                context.push('/driver/register');
              },
            ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Logout', style: TextStyle(color: Colors.red)),
            onTap: () async {
              Navigator.pop(context);
              await _supabase.auth.signOut();
            },
          ),
        ],
      ),
    );
  }
}

class PlaceSearchDelegate extends SearchDelegate {
  final String apiKey;
  final LatLng? userLocation;
  String _sessionToken = const Uuid().v4();
  
  PlaceSearchDelegate(this.apiKey, this.userLocation);

  Future<void> _saveRecentPlace(Map<String, dynamic> place) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> recent = prefs.getStringList('recent_places') ?? [];
    
    // Remove if exists to move to top
    recent.removeWhere((p) => json.decode(p)['name'] == place['name']);
    
    recent.insert(0, json.encode(place));
    if (recent.length > 5) {
      recent = recent.sublist(0, 5); // Keep top 5
    }
    await prefs.setStringList('recent_places', recent);
  }

  Future<List<Map<String, dynamic>>> _getRecentPlaces() async {
    final prefs = await SharedPreferences.getInstance();
    List<String> recent = prefs.getStringList('recent_places') ?? [];
    return recent.map((p) => json.decode(p) as Map<String, dynamic>).toList();
  }

  Future<Map<String, dynamic>> _fetchSuggestions(String query) async {
    if (query.isEmpty) {
      List<Map<String, dynamic>> recentPlaces = await _getRecentPlaces();
      List<dynamic> nearbyPlaces = [];

      if (userLocation != null) {
        // Nearby 10km places fallback
        final url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation!.latitude},${userLocation!.longitude}&radius=10000&type=point_of_interest&key=$apiKey';
        final res = await http.get(Uri.parse(url));
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          final results = data['results'] as List<dynamic>? ?? [];
          nearbyPlaces = results.take(10).toList();
        }
      }
      return {
        'recent': recentPlaces,
        'nearby': nearbyPlaces,
        'autocomplete': []
      };
    }
    
    // Autocomplete with strict radius and location bias (10km)
    String url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=$query&key=$apiKey&sessiontoken=$_sessionToken';
    if (userLocation != null) {
      url += '&location=${userLocation!.latitude},${userLocation!.longitude}&radius=10000&strictbounds=true';
    }
    url += '&components=country:in'; // Restrict to India for accuracy (Uber/Rapido clone mostly in IN)

    final res = await http.get(Uri.parse(url));
    if (res.statusCode == 200) {
      final data = json.decode(res.body);
      return {
        'recent': [],
        'nearby': [],
        'autocomplete': data['predictions'] ?? []
      };
    }
    return {
      'recent': [],
      'nearby': [],
      'autocomplete': []
    };
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
  ThemeData appBarTheme(BuildContext context) {
    final theme = Theme.of(context);
    return theme.copyWith(
      appBarTheme: theme.appBarTheme.copyWith(
        backgroundColor: theme.scaffoldBackgroundColor,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        border: InputBorder.none,
      ),
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _fetchSuggestions(query),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator(color: Colors.greenAccent));
        
        final data = snapshot.data!;
        final List<dynamic> recent = data['recent'];
        final List<dynamic> nearby = data['nearby'];
        final List<dynamic> autocomplete = data['autocomplete'];

        if (query.isEmpty) {
          return Container(
            color: Theme.of(context).scaffoldBackgroundColor,
            child: ListView(
              children: [
                if (recent.isNotEmpty) ...[
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Recent Places', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                  ),
                  ...recent.map((place) => ListTile(
                    leading: const Icon(Icons.history, color: Colors.grey),
                    title: Text(place['name'], style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black)),
                    onTap: () async {
                      close(context, place);
                    },
                  )),
                  const Divider(),
                ],
                if (nearby.isNotEmpty) ...[
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Nearby Places (10km)', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                  ),
                  ...nearby.map((place) {
                    final name = place['name'] ?? 'Unknown place';
                    return ListTile(
                      leading: const Icon(Icons.location_on, color: Colors.grey),
                      title: Text(name, style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black)),
                      onTap: () async {
                        final details = {
                          'name': name,
                          'lat': place['geometry']['location']['lat'],
                          'lng': place['geometry']['location']['lng']
                        };
                        await _saveRecentPlace(details);
                        close(context, details);
                      },
                    );
                  }),
                ]
              ],
            ),
          );
        }

        if (autocomplete.isEmpty) {
          return Center(
            child: Text('No results found', style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black54)),
          );
        }

        return Container(
          color: Theme.of(context).scaffoldBackgroundColor,
          child: ListView.builder(
            itemCount: autocomplete.length,
            itemBuilder: (context, index) {
              final place = autocomplete[index];
              final name = place['description'] ?? 'Unknown place';
              final placeId = place['place_id'];
              
              return ListTile(
                leading: const Icon(Icons.location_on, color: Colors.grey),
                title: Text(name, style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color ?? Colors.black)),
                onTap: () async {
                  final details = await _getPlaceDetails(placeId, name);
                  if (details != null) {
                    await _saveRecentPlace(details);
                    close(context, details);
                  }
                },
              );
            },
          ),
        );
      },
    );
  }
}
