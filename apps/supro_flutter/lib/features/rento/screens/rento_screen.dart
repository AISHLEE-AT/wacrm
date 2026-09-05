import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../../core/env.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RentalItem {
  final String id;
  final String name;
  final String tamilName;
  final int rate;
  final String unit; // 'per_hour' | 'per_acre' | 'per_km' | 'all_inclusive'
  final String desc;
  final String icon;
  final List<int> quickCounts;

  const RentalItem({
    required this.id,
    required this.name,
    required this.tamilName,
    required this.rate,
    required this.unit,
    required this.desc,
    required this.icon,
    this.quickCounts = const [1, 2, 4, 8],
  });
}

class OperatorItem {
  final String id;
  final String name;
  final String phone;
  final String vehicle;
  final String category;
  final String icon;
  final String rating;
  final String distance;
  final double latitude;
  final double longitude;

  const OperatorItem({
    required this.id,
    required this.name,
    required this.phone,
    required this.vehicle,
    required this.category,
    required this.icon,
    required this.rating,
    required this.distance,
    required this.latitude,
    required this.longitude,
  });
}

enum RentOBookingState { idle, searching, accepted, inProgress, completed }

class RentoScreen extends StatefulWidget {
  const RentoScreen({super.key});

  @override
  State<RentoScreen> createState() => _RentoScreenState();
}

class _RentoScreenState extends State<RentoScreen> with SingleTickerProviderStateMixin {
  final Completer<GoogleMapController> _mapController = Completer<GoogleMapController>();

  // Active Category: 'agri' | 'cargo' | 'package' | 'tour'
  String _activeTab = 'agri';
  bool _isTamil = false;

  // Location States
  LatLng _location = const LatLng(10.7905, 78.7047);
  String _pickupAddress = 'Thanjavur, Tamil Nadu';
  final TextEditingController _pickupController = TextEditingController();

  LatLng _dropoffLocation = const LatLng(10.8200, 78.7300);
  String _dropoffAddress = 'Local Mandi / Market';
  final TextEditingController _dropoffController = TextEditingController();

  double _distanceKm = 4.5;

  // Catalog items
  final List<RentalItem> _agriEquipment = const [
    RentalItem(id: 'tractor_plow', name: 'Tractor (Plowing / Rotavator)', tamilName: 'டிராக்டர் (ஏர் உழுதல்)', rate: 450, unit: 'per_hour', desc: 'Mahindra / Swaraj 45-50 HP with rotavator', icon: '🚜', quickCounts: [1, 2, 4, 8]),
    RentalItem(id: 'paddy_harvester', name: 'Paddy Harvester (Track / Wheel)', tamilName: 'நெல் அறுவடை இயந்திரம்', rate: 1800, unit: 'per_acre', desc: 'Rubber Track & Wheel Type Harvester', icon: '🌾', quickCounts: [1, 2, 3, 5]),
    RentalItem(id: 'sugarcane_harvester', name: 'Sugarcane Harvester (Heavy Duty)', tamilName: 'கரும்பு அறுவடை இயந்திரம்', rate: 2400, unit: 'per_acre', desc: 'Continuous Row Harvester & Chopper', icon: '🎋', quickCounts: [1, 2, 3, 5]),
    RentalItem(id: 'pesticide_drone', name: 'Agri Spraying Drone (16L Tank)', tamilName: 'மருந்து தெளிக்கும் ட்ரோன்', rate: 350, unit: 'per_acre', desc: 'Fast Micron Spray for Paddy & Cotton', icon: '🛸', quickCounts: [1, 2, 5, 10]),
    RentalItem(id: 'power_tiller', name: 'Power Tiller & Weeder (12 HP)', tamilName: 'பவர் டில்லர் & களை எடுப்பான்', rate: 250, unit: 'per_hour', desc: 'Small Field & Vegetable Bed Tiller', icon: '⚙️', quickCounts: [1, 2, 4, 8]),
    RentalItem(id: 'agri_trailer', name: 'Agri Heavy Goods Trailer (5T)', tamilName: 'விவசாய சரக்கு டிரெய்லர்', rate: 300, unit: 'per_hour', desc: 'Farm to Mandi Crop Hauler Trailer', icon: '🚚', quickCounts: [1, 2, 4, 8]),
  ];

  final List<RentalItem> _cargoVehicles = const [
    RentalItem(id: 'tata_ace', name: 'Tata Ace (Chota Hathi)', tamilName: 'டாடா ஏஸ் (சோட்டா ஹாத்தி)', rate: 250, unit: 'per_km', desc: '750 kg capacity • Ideal for Mandi Veggies', icon: '🚚'),
    RentalItem(id: 'bolero_maxi', name: 'Bolero Maxi Truck', tamilName: 'போலிரோ மேக்ஸி டிரக்', rate: 400, unit: 'per_km', desc: '1.5 Tons • Farm Produce & Paddy Sacks', icon: '🛻'),
    RentalItem(id: 'leyland_dost', name: 'Ashok Leyland Dost', tamilName: 'அசோக் லேலேண்ட் தோஸ்ட்', rate: 450, unit: 'per_km', desc: '1.8 Tons • Inter-district Mandi Cargo', icon: '🚛'),
    RentalItem(id: 'eicher_lorry', name: 'Eicher 10.90 Lorry', tamilName: 'ஐச்சர் 10.90 லாரி', rate: 900, unit: 'per_km', desc: '5 Tons • Bulk Grain & Sugarcane Supply', icon: '🚛'),
    RentalItem(id: 'tipper_10w', name: '10-Wheeler Tipper', tamilName: '10 சக்கர டிப்பர்', rate: 1800, unit: 'per_km', desc: '15 Tons • Heavy Sand, Soil & Gravel', icon: '🚜'),
  ];

  final List<RentalItem> _hourlyPackages = const [
    RentalItem(id: 'pkg_2h20k', name: '2 Hours / 20 KM', tamilName: '2 மணி நேரம் / 20 கி.மீ', rate: 499, unit: 'per_pkg', desc: 'City Hospital, Mandi & Local Errands', icon: '⏱️'),
    RentalItem(id: 'pkg_4h40k', name: '4 Hours / 40 KM', tamilName: '4 மணி நேரம் / 40 கி.மீ', rate: 899, unit: 'per_pkg', desc: 'Shopping, Bank & Sub-Registrar Visits', icon: '⏱️'),
    RentalItem(id: 'pkg_8h80k', name: '8 Hours / 80 KM', tamilName: '8 மணி நேரம் / 80 கி.மீ', rate: 1699, unit: 'per_pkg', desc: 'Full Day Outstation & Family Functions', icon: '⏱️'),
    RentalItem(id: 'pkg_12h120k', name: '12 Hours / 120 KM', tamilName: '12 மணி நேரம் / 120 கி.மீ', rate: 2399, unit: 'per_pkg', desc: 'Long Inter-City Round Trip', icon: '⏱️'),
  ];

  final List<RentalItem> _tourPackages = const [
    RentalItem(id: 'tour_ooty', name: 'Ooty Hill Station Tour', tamilName: 'ஊட்டி மலை சுற்றுலா', rate: 4500, unit: 'all_inclusive', desc: 'Tea Gardens, Lake, Botanical Garden & Pykara', icon: '🏔️'),
    RentalItem(id: 'tour_kodai', name: 'Kodaikanal Hill Tour', tamilName: 'கொடைக்கானல் சுற்றுலா', rate: 4800, unit: 'all_inclusive', desc: 'Pillar Rocks, Lake, Coakers Walk & Falls', icon: '🌲'),
    RentalItem(id: 'tour_rameswaram', name: 'Rameswaram Temple & Sea', tamilName: 'ராமேஸ்வரம் ஆன்மீக சுற்றுலா', rate: 5200, unit: 'all_inclusive', desc: 'Temple Darshan, Dhanushkodi Beach & Bridge', icon: '🛕'),
    RentalItem(id: 'tour_girivalam', name: 'Thiruvannamalai Girivalam', tamilName: 'திருவண்ணாமலை கிரிவலம்', rate: 3800, unit: 'all_inclusive', desc: 'Full Moon Girivalam & Temple Darshan Cab', icon: '🕉️'),
    RentalItem(id: 'tour_madurai_tanjore', name: 'Madurai & Tanjore Heritage', tamilName: 'மதுரை & தஞ்சை பாரம்பரிய சுற்றுலா', rate: 4200, unit: 'all_inclusive', desc: 'Meenakshi Temple & Big Temple Heritage', icon: '🏰'),
  ];

  late RentalItem _selectedItem;
  int _quantityCount = 1;
  int _estimatedFare = 450;
  String _paymentMode = 'UPI'; // 'UPI' | 'CASH'
  bool _isOptionsExpanded = false;

  // Booking Lifecycle
  RentOBookingState _bookingState = RentOBookingState.idle;
  Map<String, dynamic>? _activeBooking;
  int _searchCountdown = 45;
  Timer? _countdownTimer;
  int _ratingStars = 5;

  Set<Marker> _markers = {};
  List<OperatorItem> _nearbyOperators = [];
  StreamSubscription<Position>? _positionStreamSub;

  static const String _defaultAdminPhone = '916381029380';

  @override
  void initState() {
    super.initState();
    _selectedItem = _agriEquipment[0];
    _calculateFare();
    _initLocation();
  }

  @override
  void dispose() {
    _positionStreamSub?.cancel();
    _countdownTimer?.cancel();
    _pickupController.dispose();
    _dropoffController.dispose();
    super.dispose();
  }

  Future<void> _initLocation() async {
    try {
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }

      if (perm == LocationPermission.always || perm == LocationPermission.whileInUse) {
        // 1. Instant last known position
        final lastPos = await Geolocator.getLastKnownPosition();
        if (lastPos != null && mounted) {
          setState(() {
            _location = LatLng(lastPos.latitude, lastPos.longitude);
          });
          _reverseGeocode(lastPos.latitude, lastPos.longitude);
          _generateNearbyOperators(lastPos.latitude, lastPos.longitude);
        }

        // 2. High accuracy fresh position
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
        );
        if (mounted) {
          setState(() {
            _location = LatLng(pos.latitude, pos.longitude);
          });
          _reverseGeocode(pos.latitude, pos.longitude);
          _generateNearbyOperators(pos.latitude, pos.longitude);

          final ctrl = await _mapController.future;
          ctrl.animateCamera(CameraUpdate.newLatLngZoom(_location, 15));
        }

        // 3. Live continuous GPS position stream
        _positionStreamSub = Geolocator.getPositionStream(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10),
        ).listen((livePos) {
          if (mounted && _bookingState == RentOBookingState.idle) {
            setState(() {
              _location = LatLng(livePos.latitude, livePos.longitude);
            });
            _updateMarkers();
          }
        });
      } else {
        _generateNearbyOperators(_location.latitude, _location.longitude);
      }
    } catch (_) {
      _generateNearbyOperators(_location.latitude, _location.longitude);
    }
  }

  Future<void> _reverseGeocode(double lat, double lng) async {
    try {
      final placemarks = await Geocoding().placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final addr = '${p.subLocality ?? p.locality ?? ''}, ${p.administrativeArea ?? 'Tamil Nadu'}';
        setState(() {
          _pickupAddress = addr.isNotEmpty ? addr : 'Thanjavur, Tamil Nadu';
          _pickupController.text = _pickupAddress;
        });
      }
    } catch (_) {}
  }

  void _generateNearbyOperators(double lat, double lng) {
    _nearbyOperators = [
      OperatorItem(id: 'op1', name: 'Murugan Agri Services', phone: '9344532738', vehicle: 'Mahindra 575 DI (Plowing)', category: 'agri', icon: '🚜', rating: '4.9', distance: '1.2 km away', latitude: lat + 0.007, longitude: lng + 0.006),
      OperatorItem(id: 'op2', name: 'Selvam Cargo Transport', phone: '9123596988', vehicle: 'Tata Ace (TN 45 BB 8291)', category: 'cargo', icon: '🚚', rating: '4.85', distance: '1.8 km away', latitude: lat - 0.008, longitude: lng - 0.007),
      OperatorItem(id: 'op3', name: 'Thanjavur Harvester Co.', phone: '6381029380', vehicle: 'Paddy Track Harvester', category: 'agri', icon: '🌾', rating: '4.95', distance: '2.5 km away', latitude: lat + 0.012, longitude: lng - 0.009),
    ];
    _updateMarkers();
  }

  void _updateMarkers() {
    final markers = <Marker>{};

    // User Pickup Marker
    markers.add(
      Marker(
        markerId: const MarkerId('pickup_marker'),
        position: _location,
        infoWindow: InfoWindow(title: _isTamil ? 'வயல்வெளி / தொடக்க இடம்' : 'Pickup / Farm Field', snippet: _pickupAddress),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    );

    // Dropoff Marker for Cargo & Tours
    if (_activeTab != 'agri') {
      markers.add(
        Marker(
          markerId: const MarkerId('dropoff_marker'),
          position: _dropoffLocation,
          infoWindow: InfoWindow(title: _isTamil ? 'சேருமிடம் / சந்தை' : 'Destination / Mandi Hub', snippet: _dropoffAddress),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        ),
      );
    }

    // Nearby Operators
    for (final op in _nearbyOperators) {
      markers.add(
        Marker(
          markerId: MarkerId('op_${op.id}'),
          position: LatLng(op.latitude, op.longitude),
          infoWindow: InfoWindow(title: op.name, snippet: '${op.vehicle} • ⭐ ${op.rating}'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        ),
      );
    }

    setState(() => _markers = markers);
  }

  void _calculateFare() {
    int total = _selectedItem.rate;
    if (_activeTab == 'agri') {
      total = _selectedItem.rate * _quantityCount;
    } else if (_activeTab == 'cargo') {
      total = _selectedItem.rate + (_distanceKm * 20).round();
    } else {
      total = _selectedItem.rate;
    }
    setState(() => _estimatedFare = total);
  }

  void _confirmBooking() async {
    setState(() {
      _bookingState = RentOBookingState.searching;
      _searchCountdown = 45;
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (_searchCountdown > 1) {
        setState(() => _searchCountdown--);
      } else {
        t.cancel();
        // Auto-match nearby operator
        _onDriverMatched();
      }
    });

    // Save to OCI Backend
    try {
      final prefs = await SharedPreferences.getInstance();
      final phone = prefs.getString('user_phone') ?? '919344532738';
      final name = prefs.getString('user_name') ?? 'SuprO Customer';
      final bookingCode = 'RENTO-${1000 + Random().nextInt(9000)}';

      final res = await http.post(
        Uri.parse('${AppEnv.apiUrl}/api/rento/bookings'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'machinery_id': _selectedItem.id,
          'customer_name': name,
          'customer_phone': phone,
          'booking_location': _pickupAddress,
          'booking_date': DateTime.now().toIso8601String(),
          'booking_code': bookingCode,
          'vehicle_type': _selectedItem.name,
          'category': _activeTab,
          'quantity': _quantityCount,
          'unit': _selectedItem.unit,
          'total_fare': _estimatedFare,
          'payment_mode': _paymentMode,
          'status': 'searching',
        }),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        _activeBooking = jsonDecode(res.body);
      }
    } catch (_) {}
  }

  void _onDriverMatched() {
    _countdownTimer?.cancel();
    final matchedOp = _nearbyOperators.isNotEmpty ? _nearbyOperators.first : OperatorItem(
      id: 'op1',
      name: 'Murugan Agri Services',
      phone: _defaultAdminPhone,
      vehicle: _selectedItem.name,
      category: _activeTab,
      icon: _selectedItem.icon,
      rating: '4.9',
      distance: '1.2 km away',
      latitude: _location.latitude + 0.005,
      longitude: _location.longitude + 0.005,
    );

    setState(() {
      _bookingState = RentOBookingState.accepted;
      _activeBooking = {
        'code': 'RENTO-${1000 + Random().nextInt(9000)}',
        'otp': '${1000 + Random().nextInt(9000)}',
        'operator_name': matchedOp.name,
        'operator_phone': matchedOp.phone,
        'operator_vehicle': matchedOp.vehicle,
        'rating': matchedOp.rating,
      };
    });
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

  void _payViaUPI() async {
    final url = Uri.parse('upi://pay?pa=9344532738@ybl&pn=SuprO%20RentO&am=$_estimatedFare&cu=INR');
    if (await canLaunchUrl(url)) {
      launchUrl(url);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please install GPay, PhonePe, or Paytm.')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: Stack(
        children: [
          // ─── 1. FULLSCREEN INTERACTIVE GOOGLE MAP ───
          GoogleMap(
            initialCameraPosition: CameraPosition(target: _location, zoom: 14),
            onMapCreated: (ctrl) => _mapController.complete(ctrl),
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            onTap: (latLng) {
              setState(() {
                _location = latLng;
                _reverseGeocode(latLng.latitude, latLng.longitude);
                _updateMarkers();
              });
            },
          ),

          // ─── 2. TOP HEADER BAR ───
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF0A0F1E).withOpacity(0.94),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF1E293B)),
                boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 10, offset: Offset(0, 4))],
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.arrowLeft, color: Colors.white, size: 22),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_isTamil ? 'ரென்ட்ஓ தமிழ்நாடு' : 'RentO Tamil Nadu', style: const TextStyle(color: Color(0xFF10B981), fontSize: 17, fontWeight: FontWeight.bold)),
                        Text(_isTamil ? 'வேளாண் இயந்திரங்கள் & வாடகை சேவை' : 'Agri Machinery, Cargo & Rentals', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      ],
                    ),
                  ),
                  // Bilingual Toggle
                  GestureDetector(
                    onTap: () => setState(() => _isTamil = !_isTamil),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: _isTamil ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(_isTamil ? 'தமிழ்' : 'English', style: TextStyle(color: _isTamil ? Colors.black : const Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Emergency SOS
                  IconButton(
                    icon: const Icon(LucideIcons.shieldAlert, color: Colors.redAccent, size: 22),
                    onPressed: () {
                      _launchCall('112');
                      _launchWhatsApp(_defaultAdminPhone, 'SOS EMERGENCY - RentO Field Location: https://maps.google.com/?q=${_location.latitude},${_location.longitude}');
                    },
                  ),
                ],
              ),
            ),
          ),

          // ─── 3. FLOATING 4-CATEGORY TABS ───
          Positioned(
            top: MediaQuery.of(context).padding.top + 76,
            left: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF0A0F1E).withOpacity(0.92),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                children: [
                  _buildTabBtn('agri', LucideIcons.wrench, _isTamil ? 'விவசாயம்' : 'Agri', _agriEquipment[0]),
                  _buildTabBtn('cargo', LucideIcons.truck, _isTamil ? 'சரக்கு' : 'Cargo', _cargoVehicles[0]),
                  _buildTabBtn('package', LucideIcons.clock, _isTamil ? 'மணி நேரம்' : 'Packages', _hourlyPackages[0]),
                  _buildTabBtn('tour', LucideIcons.compass, _isTamil ? 'சுற்றுலா' : 'Tours', _tourPackages[0]),
                ],
              ),
            ),
          ),

          // ─── 4. BOTTOM ACTION SHEET (Compact or Expanded) ───
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildBottomPanel(bottomInset),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBtn(String tab, IconData icon, String label, RentalItem defaultItem) {
    final isSelected = _activeTab == tab;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _activeTab = tab;
            _selectedItem = defaultItem;
            _quantityCount = 1;
            _calculateFare();
            _updateMarkers();
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF10B981) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 14, color: isSelected ? Colors.black : const Color(0xFF94A3B8)),
              const SizedBox(width: 4),
              Text(label, style: TextStyle(color: isSelected ? Colors.black : const Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomPanel(double bottomInset) {
    if (_bookingState == RentOBookingState.searching) {
      return _buildSearchingView(bottomInset);
    } else if (_bookingState == RentOBookingState.accepted || _bookingState == RentOBookingState.inProgress) {
      return _buildAcceptedView(bottomInset);
    } else if (_bookingState == RentOBookingState.completed) {
      return _buildCompletedView(bottomInset);
    }

    // IDLE: Compact 1-Tap Bar or Expandable Catalog
    if (!_isOptionsExpanded) {
      return Container(
        padding: EdgeInsets.fromLTRB(16, 12, 16, max(24.0, bottomInset + 16)),
        decoration: const BoxDecoration(
          color: Color(0xFF0A0F1E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [BoxShadow(color: Colors.black87, blurRadius: 20, offset: Offset(0, -6))],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _isOptionsExpanded = true),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF1E293B)),
                      ),
                      child: Row(
                        children: [
                          Text(_selectedItem.icon, style: const TextStyle(fontSize: 20)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_isTamil ? _selectedItem.tamilName : _selectedItem.name, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold), maxLines: 1),
                                Text('₹${_selectedItem.rate}/${_selectedItem.unit == 'per_acre' ? 'acre' : 'hr'}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                          const Text('Options ▾', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
                if (_activeTab == 'agri') ...[
                  const SizedBox(width: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF1E293B)),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          icon: const Icon(LucideIcons.minus, size: 14, color: Colors.white),
                          onPressed: () {
                            if (_quantityCount > 1) {
                              setState(() {
                                _quantityCount--;
                                _calculateFare();
                              });
                            }
                          },
                        ),
                        Text('$_quantityCount ${_selectedItem.unit == 'per_acre' ? 'Ac' : 'Hr'}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        IconButton(
                          icon: const Icon(LucideIcons.plus, size: 14, color: Colors.white),
                          onPressed: () {
                            setState(() {
                              _quantityCount++;
                              _calculateFare();
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _confirmBooking,
                icon: const Icon(LucideIcons.zap, size: 18, color: Colors.black),
                label: Text(_isTamil ? 'முன்பதிவை உறுதி செய் • ₹$_estimatedFare' : 'Confirm RentO Booking • ₹$_estimatedFare', style: const TextStyle(color: Colors.black, fontSize: 15, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // EXPANDED OPTIONS SHEET
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.72),
      padding: EdgeInsets.fromLTRB(16, 12, 16, max(24.0, bottomInset + 16)),
      decoration: const BoxDecoration(
        color: Color(0xFF0A0F1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [BoxShadow(color: Colors.black87, blurRadius: 20, offset: Offset(0, -6))],
      ),
      child: ListView(
        shrinkWrap: true,
        children: [
          Center(
            child: GestureDetector(
              onTap: () => setState(() => _isOptionsExpanded = false),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: const Text('Show Map ▴', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 13, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
          const SizedBox(height: 8),
          // Items Grid
          ...(_activeTab == 'agri' ? _agriEquipment : _activeTab == 'cargo' ? _cargoVehicles : _activeTab == 'package' ? _hourlyPackages : _tourPackages).map((item) {
            final isSel = _selectedItem.id == item.id;
            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedItem = item;
                  _calculateFare();
                });
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isSel ? const Color(0x2610B981) : const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isSel ? const Color(0xFF10B981) : const Color(0xFF1E293B), width: isSel ? 2 : 1),
                ),
                child: Row(
                  children: [
                    Text(item.icon, style: const TextStyle(fontSize: 28)),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_isTamil ? item.tamilName : item.name, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text(item.desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                        ],
                      ),
                    ),
                    Text('₹${item.rate}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () {
                setState(() => _isOptionsExpanded = false);
                _confirmBooking();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(_isTamil ? 'தேர்ந்தெடு • ₹$_estimatedFare' : 'Proceed with ${_selectedItem.name} • ₹$_estimatedFare', style: const TextStyle(color: Colors.black, fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchingView(double bottomInset) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, max(24.0, bottomInset + 16)),
      decoration: const BoxDecoration(
        color: Color(0xFF0A0F1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(width: 48, height: 48, child: CircularProgressIndicator(color: Color(0xFF10B981), strokeWidth: 4)),
          const SizedBox(height: 16),
          Text(_isTamil ? 'இயந்திர ஆபரேட்டரைத் தேடுகிறது...' : 'Finding Nearby Machinery Operator...', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text('$_searchCountdown s remaining (Auto-Connecting)', style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () => setState(() => _bookingState = RentOBookingState.idle),
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

  Widget _buildAcceptedView(double bottomInset) {
    final otp = _activeBooking?['otp'] ?? '8291';
    final name = _activeBooking?['operator_name'] ?? 'Murugan Agri Services';
    final vehicle = _activeBooking?['operator_vehicle'] ?? _selectedItem.name;
    final phone = _activeBooking?['operator_phone'] ?? _defaultAdminPhone;

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
                child: const Center(child: Text('🚜', style: TextStyle(fontSize: 24))),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(vehicle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
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
                  onPressed: () => _launchWhatsApp(phone, 'Hi, regarding RentO Booking ${_activeBooking?['code']}. My farm field GPS: https://maps.google.com/?q=${_location.latitude},${_location.longitude}'),
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
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () => setState(() => _bookingState = RentOBookingState.completed),
              icon: const Icon(LucideIcons.checkCircle, size: 18, color: Colors.black),
              label: const Text('Complete Job', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompletedView(double bottomInset) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, max(24.0, bottomInset + 16)),
      decoration: const BoxDecoration(
        color: Color(0xFF0A0F1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 54),
          const SizedBox(height: 12),
          const Text('Rental Completed!', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text('Total Fare: ₹$_estimatedFare', style: const TextStyle(color: Color(0xFF10B981), fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          // UPI Payment CTA
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: _payViaUPI,
              icon: const Icon(LucideIcons.indianRupee, size: 18, color: Colors.black),
              label: const Text('Pay with UPI (GPay / PhonePe)', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () {
                setState(() {
                  _bookingState = RentOBookingState.idle;
                  _activeBooking = null;
                });
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF1E293B)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Done & Back to Map', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
