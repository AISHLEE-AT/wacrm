import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide MapType;
import 'package:http/http.dart' as http;

class VehicleCategory {
  final String id;
  final String name;
  final String tamilName;
  final IconData icon;
  final int baseFare;
  final int perKm;
  final String capacity;
  final String desc;

  const VehicleCategory({
    required this.id,
    required this.name,
    required this.tamilName,
    required this.icon,
    required this.baseFare,
    required this.perKm,
    required this.capacity,
    required this.desc,
  });
}

const List<VehicleCategory> VEHICLE_CATEGORIES = [
  VehicleCategory(id: 'bikeo', name: 'BikeO', tamilName: 'பைக்', icon: LucideIcons.bike, baseFare: 25, perKm: 7, capacity: '1 Person', desc: 'Fast & Affordable'),
  VehicleCategory(id: 'autoo', name: 'AutoO', tamilName: 'ஆட்டோ', icon: LucideIcons.car, baseFare: 40, perKm: 12, capacity: '3 Persons', desc: 'Everyday Travel'),
  VehicleCategory(id: 'minio', name: 'MiniO', tamilName: 'மினி கார்', icon: LucideIcons.carFront, baseFare: 80, perKm: 14, capacity: '4 Persons', desc: 'AC Hatchback'),
  VehicleCategory(id: 'primeo', name: 'PrimeO', tamilName: 'பிரைம் கார்', icon: LucideIcons.carTaxiFront, baseFare: 120, perKm: 18, capacity: '4 Persons', desc: 'Top Rated Sedans'),
  VehicleCategory(id: 'xlo', name: 'XL SUV', tamilName: 'எஸ்யூவி', icon: LucideIcons.truck, baseFare: 160, perKm: 22, capacity: '6 Persons', desc: 'Spacious Family SUV'),
  VehicleCategory(id: 'aceo', name: 'AceO', tamilName: 'டாடா ஏஸ்', icon: LucideIcons.truck, baseFare: 200, perKm: 25, capacity: '750 kg', desc: 'Mini Goods / Mandi'),
  VehicleCategory(id: 'trucko', name: 'TruckO', tamilName: 'லாரி', icon: LucideIcons.container, baseFare: 400, perKm: 45, capacity: '5 Tons', desc: 'Heavy Goods Transport'),
  VehicleCategory(id: 'tractoro', name: 'TractorO', tamilName: 'டிராக்டர்', icon: LucideIcons.tractor, baseFare: 450, perKm: 50, capacity: 'Field Work', desc: 'Plowing & Agri Transport'),
  VehicleCategory(id: 'harvestero', name: 'HarvesterO', tamilName: 'அறுவடை இயந்திரம்', icon: LucideIcons.wheat, baseFare: 800, perKm: 0, capacity: 'Farm', desc: 'Paddy & Crop Harvest'),
  VehicleCategory(id: 'buso', name: 'BusO', tamilName: 'பஸ்', icon: LucideIcons.bus, baseFare: 1200, perKm: 60, capacity: '40 Persons', desc: 'Group & Function Travel'),
  VehicleCategory(id: 'ambulanceo', name: 'AmbulanceO', tamilName: 'ஆம்புலன்ஸ்', icon: LucideIcons.cross, baseFare: 0, perKm: 0, capacity: 'Emergency', desc: 'Free 24/7 Emergency'),
];

class LocationPoint {
  final double lat;
  final double lng;
  final String name;

  LocationPoint({required this.lat, required this.lng, required this.name});
}

enum RideState { idle, searching, accepted, inProgress, completed }

class RideScreen extends ConsumerStatefulWidget {
  const RideScreen({super.key});

  @override
  ConsumerState<RideScreen> createState() => _RideScreenState();
}

class _RideScreenState extends ConsumerState<RideScreen> with SingleTickerProviderStateMixin {
  final Completer<GoogleMapController> _controller = Completer<GoogleMapController>();

  LocationPoint? _pickup;
  LocationPoint? _dropoff;

  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  VehicleCategory _selectedCategory = VEHICLE_CATEGORIES[0];
  double _distanceKm = 2.5;
  int _estimatedFare = 50;

  // Realtime Ride Tracking
  RideState _rideState = RideState.idle;
  Map<String, dynamic>? _currentRide;
  Map<String, dynamic>? _driverInfo;
  Timer? _pollingTimer;
  RealtimeChannel? _rideChannel;
  int _searchCountdown = 300;
  Timer? _countdownTimer;

  // Map Polyline & Markers
  Set<Polyline> _polylines = {};
  Set<Marker> _markers = {};

  // Rating state
  int _ratingStars = 5;
  final TextEditingController _feedbackController = TextEditingController();
  StreamSubscription<Position>? _positionStreamSub;

  static const String _defaultAdminPhone = '916381029380';

  @override
  void initState() {
    super.initState();
    _determinePosition();
    _checkActiveRideOnMount();
  }

  @override
  void dispose() {
    _positionStreamSub?.cancel();
    _searchController.dispose();
    _feedbackController.dispose();
    _pollingTimer?.cancel();
    _countdownTimer?.cancel();
    if (_rideChannel != null) {
      Supabase.instance.client.removeChannel(_rideChannel!);
    }
    super.dispose();
  }

  // ─── INITIAL POSITION & REVERSE GEOCODING ───
  Future<void> _determinePosition() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        // 1. Instant last known position
        final lastKnown = await Geolocator.getLastKnownPosition();
        if (lastKnown != null && mounted) {
          setState(() {
            _pickup = LocationPoint(
              lat: lastKnown.latitude,
              lng: lastKnown.longitude,
              name: 'Current Location',
            );
            _updateMarkers();
          });
          final ctrl = await _mapController.future;
          ctrl.animateCamera(CameraUpdate.newLatLngZoom(LatLng(lastKnown.latitude, lastKnown.longitude), 15));
        }

        // 2. High accuracy fresh GPS fix
        final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
        );

        List<Placemark> placemarks = await Geocoding().placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        );

        String name = 'Current Location';
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          final parts = [p.street, p.subLocality, p.locality].where((e) => e != null && e.isNotEmpty).toList();
          if (parts.isNotEmpty) name = parts.join(', ');
        }

        if (mounted) {
          setState(() {
            _pickup = LocationPoint(
              lat: position.latitude,
              lng: position.longitude,
              name: name,
            );
            _updateMarkers();
          });

          final ctrl = await _mapController.future;
          ctrl.animateCamera(CameraUpdate.newLatLngZoom(LatLng(position.latitude, position.longitude), 15));
        }

        // 3. Live continuous GPS position stream
        _positionStreamSub = Geolocator.getPositionStream(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10),
        ).listen((livePos) {
          if (mounted && _rideState == RideState.idle && _dropoff == null) {
            setState(() {
              _pickup = LocationPoint(
                lat: livePos.latitude,
                lng: livePos.longitude,
                name: _pickup?.name ?? 'Current Location',
              );
              _updateMarkers();
            });
          }
        });
      }
    } catch (e) {
      debugPrint('Error determining location: $e');
    }
  }

  // ─── CHECK ACTIVE RIDE ───
  Future<void> _checkActiveRideOnMount() async {
    final user = Supabase.instance.client.auth.currentUser;
    final phone = user?.phone ?? '';
    if (phone.isEmpty) return;

    try {
      final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
      final tenDigit = cleanPhone.length > 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
      
      final data = await Supabase.instance.client
          .from('rides')
          .select('*')
          .or('user_phone.ilike.%$tenDigit%,customer_phone.ilike.%$tenDigit%')
          .inFilter('status', ['pending', 'requested', 'accepted', 'driver_arrived', 'in_progress'])
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();

      if (data != null && mounted) {
        _handleRideStatusUpdate(data);
      }
    } catch (e) {
      debugPrint('Error checking active ride: $e');
    }
  }

  // ─── DISTANCE & FARE CALCULATION ───
  void _calculateDistanceAndFare() {
    if (_pickup == null || _dropoff == null) return;

    final dist = Geolocator.distanceBetween(
      _pickup!.lat,
      _pickup!.lng,
      _dropoff!.lat,
      _dropoff!.lng,
    ) / 1000.0;

    final distanceKm = max(1.0, double.parse(dist.toStringAsFixed(1)));
    int fare = _selectedCategory.baseFare + (_selectedCategory.perKm * distanceKm).round();
    if (_selectedCategory.id == 'ambulanceo') fare = 0;

    setState(() {
      _distanceKm = distanceKm;
      _estimatedFare = fare;
    });

    _fetchRoutePolyline();
  }

  // ─── OSRM ROAD POLYLINE ───
  Future<void> _fetchRoutePolyline() async {
    if (_pickup == null || _dropoff == null) return;
    try {
      final url = Uri.parse(
        'https://router.project-osrm.org/route/v1/driving/${_pickup!.lng},${_pickup!.lat};${_dropoff!.lng},${_dropoff!.lat}?overview=full&geometries=geojson',
      );
      final res = await http.get(url).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        final coords = json['routes']?[0]?['geometry']?['coordinates'] as List<dynamic>?;
        if (coords != null && coords.isNotEmpty) {
          final polylineCoords = coords.map((c) => LatLng(c[1] as double, c[0] as double)).toList();
          setState(() {
            _polylines = {
              Polyline(
                polylineId: const PolylineId('route'),
                points: polylineCoords,
                color: const Color(0xFF10B981),
                width: 5,
              )
            };
          });
          _fitMapBounds();
        }
      }
    } catch (e) {
      debugPrint('OSRM Polyline fallback: $e');
    }
  }

  void _updateMarkers() {
    Set<Marker> markers = {};
    if (_pickup != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('pickup'),
          position: LatLng(_pickup!.lat, _pickup!.lng),
          infoWindow: InfoWindow(title: 'Pickup', snippet: _pickup!.name),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        ),
      );
    }
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
    setState(() => _markers = markers);
  }

  Future<void> _fitMapBounds() async {
    if (_pickup == null || _dropoff == null) return;
    try {
      final controller = await _controller.future;
      double minLat = min(_pickup!.lat, _dropoff!.lat);
      double maxLat = max(_pickup!.lat, _dropoff!.lat);
      double minLng = min(_pickup!.lng, _dropoff!.lng);
      double maxLng = max(_pickup!.lng, _dropoff!.lng);

      controller.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(minLat, minLng),
            northeast: LatLng(maxLat, maxLng),
          ),
          80.0,
        ),
      );
    } catch (_) {}
  }

  // ─── SEARCH DROPOFF ADDRESS ───
  Future<void> _handleSearchDropoff(String query) async {
    if (query.trim().isEmpty) return;
    setState(() => _isSearching = true);
    FocusScope.of(context).unfocus();

    try {
      List<Location> locations = await Geocoding().locationFromAddress(query);
      if (locations.isNotEmpty) {
        final loc = locations.first;
        List<Placemark> placemarks = await Geocoding().placemarkFromCoordinates(loc.latitude, loc.longitude);
        String cleanName = query;
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          final parts = [p.street, p.subLocality, p.locality].where((e) => e != null && e.isNotEmpty).toList();
          if (parts.isNotEmpty) cleanName = parts.join(', ');
        }

        setState(() {
          _dropoff = LocationPoint(lat: loc.latitude, lng: loc.longitude, name: cleanName);
          _searchController.text = cleanName;
        });

        _updateMarkers();
        _calculateDistanceAndFare();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not find location. Please try another query.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSearching = false);
    }
  }

  // ─── BOOK RIDE DISPATCH & REALTIME POLLING ───
  Future<void> _bookRide() async {
    if (_pickup == null || _dropoff == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select both pickup and drop-off.')),
      );
      return;
    }

    final user = Supabase.instance.client.auth.currentUser;
    final phone = user?.phone ?? '9876543210';
    final customerName = user?.userMetadata?['full_name'] ?? 'Passenger';
    final otpCode = (1000 + Random().nextInt(9000)).toString();

    setState(() {
      _rideState = RideState.searching;
      _searchCountdown = 300;
    });

    final ridePayload = {
      'user_id': user?.id,
      'passenger_phone': phone,
      'passenger_name': customerName,
      'driver_phone': _defaultAdminPhone,
      'pickup_location': {'lat': _pickup!.lat, 'lng': _pickup!.lng, 'address': _pickup!.name},
      'drop_location': {'lat': _dropoff!.lat, 'lng': _dropoff!.lng, 'address': _dropoff!.name, 'distance_km': _distanceKm},
      'vehicle_category': _selectedCategory.id,
      'fare': _estimatedFare,
      'status': 'pending',
      'otp': otpCode,
      'created_at': DateTime.now().toIso8601String(),
    };

    try {
      final inserted = await Supabase.instance.client
          .from('rides')
          .insert(ridePayload)
          .select()
          .single();

      _currentRide = inserted;

      // Start active 1.5s polling loop
      _startPollingRideStatus(inserted['id']);

      // Start 300s (5:00 min) countdown timer with auto-expiry
      _startCountdownTimer();

      // Dispatch webhook notification
      http.post(
        Uri.parse('https://watscrm.vercel.app/api/rides/book'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'ride_id': inserted['id'],
          'customer_name': customerName,
          'customer_phone': phone,
          'pickup': _pickup!.name,
          'dropoff': _dropoff!.name,
          'fare': _estimatedFare,
          'vehicle': _selectedCategory.name,
        }),
      ).catchError((_) => http.Response('', 500));
    } catch (e) {
      debugPrint('Ride booking error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text('Booking error: $e')),
        );
        setState(() => _rideState = RideState.idle);
      }
    }
  }

  void _startCountdownTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_searchCountdown <= 1) {
        timer.cancel();
        if (_rideState == RideState.searching && mounted) {
          if (_currentRide != null && _currentRide!['id'] != null) {
            Supabase.instance.client
                .from('rides')
                .update({'status': 'expired'})
                .eq('id', _currentRide!['id'])
                .catchError((_) => null);
          }
          _cancelSearching('Ride Request Expired (5:00 mins)\n\nNo driver accepted your request within 5 minutes. Please try again.');
        }
      } else {
        setState(() => _searchCountdown--);
      }
    });
  }

  void _startPollingRideStatus(dynamic rideId) {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(milliseconds: 1500), (_) async {
      try {
        final data = await Supabase.instance.client
            .from('rides')
            .select('*')
            .eq('id', rideId)
            .maybeSingle();

        if (data != null && mounted) {
          _handleRideStatusUpdate(data);
        }
      } catch (_) {}
    });
  }

  void _handleRideStatusUpdate(Map<String, dynamic> ride) {
    final status = ride['status'];
    _currentRide = ride;

    if (status == 'accepted' || status == 'driver_arrived') {
      _countdownTimer?.cancel();
      setState(() {
        _rideState = RideState.accepted;
        _driverInfo = {
          'name': ride['driver_name'] ?? 'Assigned Partner',
          'phone': ride['driver_phone'] ?? _defaultAdminPhone,
          'vehicle_model': ride['vehicle_model'] ?? _selectedCategory.name,
          'vehicle_number': ride['vehicle_number'] ?? 'TN-49-AT-2026',
          'rating': 4.9,
          'otp': ride['otp'] ?? '1234',
        };
      });
    } else if (status == 'in_progress') {
      setState(() => _rideState = RideState.inProgress);
    } else if (status == 'completed') {
      _pollingTimer?.cancel();
      _countdownTimer?.cancel();
      setState(() => _rideState = RideState.completed);
      _showRatingDialog();
    } else if (status == 'cancelled') {
      _pollingTimer?.cancel();
      _countdownTimer?.cancel();
      setState(() {
        _rideState = RideState.idle;
        _currentRide = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ride has been cancelled.')),
      );
    }
  }

  Future<void> _cancelSearching([String? msg]) async {
    _pollingTimer?.cancel();
    _countdownTimer?.cancel();
    if (_currentRide != null) {
      await Supabase.instance.client
          .from('rides')
          .update({'status': 'cancelled'})
          .eq('id', _currentRide!['id']);
    }
    setState(() {
      _rideState = RideState.idle;
      _currentRide = null;
    });
    if (msg != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    }
  }

  void _launchWhatsApp(String phone, String text) async {
    final clean = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('whatsapp://send?phone=$clean&text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) launchUrl(uri);
  }

  void _launchCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) launchUrl(uri);
  }

  void _showRatingDialog() {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 54),
                const SizedBox(height: 16),
                const Text('Trip Completed!', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Total Fare: ₹${_currentRide?['total_fare'] ?? _estimatedFare}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                const Text('Rate your driver experience', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    final star = index + 1;
                    return IconButton(
                      icon: Icon(
                        LucideIcons.star,
                        color: star <= _ratingStars ? Colors.amber : const Color(0xFF334155),
                        size: 36,
                      ),
                      onPressed: () => setModalState(() => _ratingStars = star),
                    );
                  }),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      setState(() {
                        _rideState = RideState.idle;
                        _currentRide = null;
                        _dropoff = null;
                        _polylines.clear();
                      });
                      _updateMarkers();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('Submit Rating', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: Stack(
        children: [
          // ─── GOOGLE MAP ───
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: LatLng(_pickup?.lat ?? 10.7905, _pickup?.lng ?? 78.7047),
              zoom: 15,
            ),
            onMapCreated: (ctrl) => _controller.complete(ctrl),
            markers: _markers,
            polylines: _polylines,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
          ),

          // ─── TOP SEARCH BAR ───
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF0A0F1E).withOpacity(0.92),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF1E293B)),
                boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 10, offset: Offset(0, 4))],
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.search, color: Color(0xFF10B981), size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white, fontSize: 15),
                      decoration: const InputDecoration(
                        hintText: 'Where to? Enter drop-off destination',
                        hintStyle: TextStyle(color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                      ),
                      onSubmitted: _handleSearchDropoff,
                    ),
                  ),
                  if (_isSearching)
                    const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981)))
                ],
              ),
            ),
          ),

          // ─── BOTTOM BOOKING / TRACKING PANEL ───
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildBottomPanel(),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomPanel() {
    if (_rideState == RideState.searching) {
      return _buildSearchingView();
    } else if (_rideState == RideState.accepted || _rideState == RideState.inProgress) {
      return _buildAcceptedTrackingView();
    }
    return _buildVehicleSelectorView();
  }

  // ─── 11-CATEGORY VEHICLE SELECTOR VIEW ───
  Widget _buildVehicleSelectorView() {
    final bottomInset = MediaQuery.of(context).padding.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, max(24.0, bottomInset + 16)),
      decoration: const BoxDecoration(
        color: Color(0xFF0A0F1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [BoxShadow(color: Colors.black87, blurRadius: 20, offset: Offset(0, -6))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Select Ride Category', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              if (_dropoff != null)
                Text('$_distanceKm km • ₹$_estimatedFare', style: const TextStyle(color: Color(0xFF10B981), fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 96,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: VEHICLE_CATEGORIES.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final cat = VEHICLE_CATEGORIES[index];
                final isSelected = _selectedCategory.id == cat.id;
                final fare = cat.id == 'ambulanceo' ? 0 : cat.baseFare + (cat.perKm * _distanceKm).round();

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedCategory = cat;
                      _calculateDistanceAndFare();
                    });
                  },
                  child: Container(
                    width: 86,
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0x2610B981) : const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(cat.icon, color: isSelected ? const Color(0xFF10B981) : const Color(0xFF94A3B8), size: 26),
                        const SizedBox(height: 4),
                        Text(cat.name, style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 2),
                        Text(cat.id == 'ambulanceo' ? 'FREE' : '₹$fare', style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: _dropoff == null ? null : _bookRide,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                disabledBackgroundColor: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(
                _dropoff == null ? 'Search Destination Above' : 'Book ${_selectedCategory.name} • ₹$_estimatedFare',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: _dropoff == null ? const Color(0xFF94A3B8) : Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── SEARCHING MODAL VIEW ───
  Widget _buildSearchingView() {
    final bottomInset = MediaQuery.of(context).padding.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, max(24.0, bottomInset + 16)),
      decoration: const BoxDecoration(
        color: Color(0xFF0A0F1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(color: Color(0xFF10B981), strokeWidth: 4),
          ),
          const SizedBox(height: 16),
          Text('Searching Nearby ${_selectedCategory.name}...', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(
            'Connecting with active drivers • ${(_searchCountdown ~/ 60)}:${(_searchCountdown % 60).toString().padLeft(2, '0')} remaining (5:00 auto-expiry)',
            style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: _cancelSearching,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.redAccent),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Cancel Request', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // ─── ACCEPTED / IN-PROGRESS TRACKING VIEW ───
  Widget _buildAcceptedTrackingView() {
    final bottomInset = MediaQuery.of(context).padding.bottom;
    final otp = _driverInfo?['otp'] ?? '----';
    final name = _driverInfo?['name'] ?? 'Driver Partner';
    final vehicle = _driverInfo?['vehicle_model'] ?? 'Standard Vehicle';
    final plate = _driverInfo?['vehicle_number'] ?? 'TN-49-2026';
    final phone = _driverInfo?['phone'] ?? _defaultAdminPhone;

    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, max(24.0, bottomInset + 16)),
      decoration: const BoxDecoration(
        color: Color(0xFF0A0F1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [BoxShadow(color: Colors.black87, blurRadius: 20, offset: Offset(0, -6))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: const BoxDecoration(color: Color(0xFF1E293B), shape: BoxShape.circle),
                child: const Icon(LucideIcons.user, color: Color(0xFF10B981), size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text('$vehicle • $plate', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0x2610B981),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF10B981)),
                ),
                child: Column(
                  children: [
                    const Text('OTP', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                    Text(otp, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 2)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _launchCall(phone),
                  icon: const Icon(LucideIcons.phone, size: 18),
                  label: const Text('Call'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _launchWhatsApp(phone, 'Hi, I am waiting at pickup: ${_pickup?.name}'),
                  icon: const Icon(LucideIcons.messageCircle, size: 18),
                  label: const Text('WhatsApp'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
