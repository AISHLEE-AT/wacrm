import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../services/supabase_backend_service.dart';
import '../features/driver/screens/driver_registration_screen.dart';
import 'rento_screen.dart';

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
  String _selectedCategory = 'Bike';
  double _estimatedFare = 0.0;
  bool _isBooking = false;
  bool _isSearchingDropoff = false;
  bool _isSearchingPickup = false;

  final TextEditingController _pickupController = TextEditingController();
  final TextEditingController _dropoffController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController(text: '+91');

  List<dynamic> _pickupSuggestions = [];
  List<dynamic> _dropoffSuggestions = [];

  final Map<String, Map<String, dynamic>> _categories = {
    'Bike': {'baseFare': 30, 'perKm': 10, 'icon': Icons.two_wheeler, 'color': Colors.orange},
    'Auto': {'baseFare': 50, 'perKm': 15, 'icon': Icons.electric_rickshaw, 'color': Colors.amber},
    'Car': {'baseFare': 100, 'perKm': 22, 'icon': Icons.directions_car, 'color': Colors.blue},
    'Van': {'baseFare': 250, 'perKm': 35, 'icon': Icons.airport_shuttle, 'color': Colors.purple},
    'Truck': {'baseFare': 400, 'perKm': 50, 'icon': Icons.local_shipping, 'color': Colors.brown},
    'Bus': {'baseFare': 600, 'perKm': 75, 'icon': Icons.directions_bus, 'color': Colors.teal},
  };

  List<String> _quickLandmarks = [
    'THALA THALAPATHY SALOON',
    'Bus Stand',
    'Railway Station',
    'Government Hospital',
    'Main Market Center',
  ];

  @override
  void initState() {
    super.initState();
    _prefillVerifiedUser();
    _fetchLiveLocation();
  }

  int _pinSelectionStep = 0; // 0 = Drag Pickup Pin, 1 = Drag Dropoff Pin, 2 = Confirm Vehicle & Fare
  LatLng? _cameraCenter;
  bool _isMovingMap = false;

  void _prefillVerifiedUser() {
    try {
      final sbUser = Supabase.instance.client.auth.currentUser;
      List<String> candidates = [
        sbUser?.phone ?? '',
        sbUser?.email ?? '',
        sbUser?.userMetadata?['phone']?.toString() ?? '',
        sbUser?.userMetadata?['whatsapp']?.toString() ?? '',
      ];

      String digits = '';
      for (var c in candidates) {
        if (c.isEmpty) continue;
        String clean = c.contains('@') ? c.split('@')[0] : c;
        clean = clean.replaceAll(RegExp(r'\D'), '');
        if (clean.startsWith('91') && clean.length == 12) clean = clean.substring(2);
        if (clean.length == 10 && !clean.startsWith('63423')) {
          digits = clean;
          break;
        }
      }

      if (digits.length == 10) {
        _phoneController.text = '+91 $digits';
      } else {
        _phoneController.text = '+91 94863 35870';
      }

      final name = sbUser?.userMetadata?['full_name'] ?? sbUser?.userMetadata?['name'];
      if (name != null && name.toString().isNotEmpty) {
        _nameController.text = name.toString();
      } else if (_nameController.text.isEmpty) {
        _nameController.text = 'Rider Partner';
      }
    } catch (_) {}
  }

  Future<void> _fetchLiveLocation() async {
    final loc = await LocationService().getCurrentLocation();
    final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
    final nearbyChips = await LocationService().getNearbyLandmarkSuggestions(loc.latitude, loc.longitude);
    if (mounted) {
      setState(() {
        _currentLocation = loc;
        _currentAddress = address;
        _pickupController.text = address;
        _quickLandmarks = nearbyChips.where((l) => !l.contains('Unnamed Road') && !l.contains('null')).toList();
      });
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(loc.latitude, loc.longitude), 15),
      );
    }
  }

  void _onCameraMove(CameraPosition position) {
    _cameraCenter = position.target;
    if (!_isMovingMap) {
      setState(() => _isMovingMap = true);
    }
  }

  void _onCameraIdle() async {
    if (_cameraCenter == null) return;
    final lat = _cameraCenter!.latitude;
    final lng = _cameraCenter!.longitude;
    final address = await LocationService().getAddressFromCoordinates(lat, lng);

    if (mounted) {
      setState(() {
        _isMovingMap = false;
        if (_pinSelectionStep == 0) {
          _currentLocation = Location(latitude: lat, longitude: lng);
          _currentAddress = address;
          _pickupController.text = address;
        } else if (_pinSelectionStep == 1) {
          _destinationLocation = Location(latitude: lat, longitude: lng);
          _destinationAddress = address;
          _dropoffController.text = address;
          _updateFare();
        }
      });
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

  Future<List<dynamic>> _fetchCombinedSuggestions(String query) async {
    List<dynamic> results = [];

    // 1. Google Native Geocoder Engine ($0 Cost, Native Google Play Services)
    try {
      final loc = await LocationService().searchAddressCoordinates(query);
      if (loc != null) {
        final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
        results.add({
          'display_name': '$query ($address)',
          'lat': loc.latitude.toString(),
          'lon': loc.longitude.toString(),
          'source': 'Google Maps',
        });
      }
    } catch (e) {
      debugPrint('Google Native Geocode query error: $e');
    }

    // 2. OpenStreetMap POI Search
    try {
      final res = await http.get(Uri.parse(
          'https://nominatim.openstreetmap.org/search?format=json&q=${Uri.encodeComponent(query)}&countrycodes=in&limit=5'));
      if (res.statusCode == 200) {
        final osmData = jsonDecode(res.body) as List;
        for (var item in osmData) {
          if (!results.any((r) => r['display_name'].toString().toLowerCase().contains(item['display_name'].toString().split(',')[0].toLowerCase()))) {
            results.add(item);
          }
        }
      }
    } catch (e) {
      debugPrint('OSM suggestion error: $e');
    }

    return results;
  }

  // Live Auto-Suggestions API for Pickup Place (Google + OpenStreetMap)
  Future<void> _onPickupQueryChanged(String query) async {
    if (query.trim().length < 3) {
      setState(() => _pickupSuggestions = []);
      return;
    }
    setState(() => _isSearchingPickup = true);
    try {
      final data = await _fetchCombinedSuggestions(query);
      if (mounted) setState(() => _pickupSuggestions = data);
    } catch (e) {
      debugPrint('Pickup suggestion error: $e');
    } finally {
      if (mounted) setState(() => _isSearchingPickup = false);
    }
  }

  // Live Auto-Suggestions API for Dropoff Place (Google + OpenStreetMap)
  Future<void> _onDropoffQueryChanged(String query) async {
    if (query.trim().length < 3) {
      setState(() => _dropoffSuggestions = []);
      return;
    }
    setState(() => _isSearchingDropoff = true);
    try {
      final data = await _fetchCombinedSuggestions(query);
      if (mounted) setState(() => _dropoffSuggestions = data);
    } catch (e) {
      debugPrint('Dropoff suggestion error: $e');
    } finally {
      if (mounted) setState(() => _isSearchingDropoff = false);
    }
  }

  void _selectPickupSuggestion(dynamic item) {
    final lat = double.parse(item['lat']);
    final lon = double.parse(item['lon']);
    final name = item['display_name'];

    setState(() {
      _currentLocation = Location(latitude: lat, longitude: lon);
      _currentAddress = name;
      _pickupController.text = name;
      _pickupSuggestions = [];
    });
    _updateFare();

    _mapController?.animateCamera(
      CameraUpdate.newLatLngZoom(LatLng(lat, lon), 15),
    );
  }

  void _selectDropoffSuggestion(dynamic item) {
    final lat = double.parse(item['lat']);
    final lon = double.parse(item['lon']);
    final name = item['display_name'];

    setState(() {
      _destinationLocation = Location(latitude: lat, longitude: lon);
      _destinationAddress = name;
      _dropoffController.text = name;
      _dropoffSuggestions = [];
    });
    _updateFare();

    _mapController?.animateCamera(
      CameraUpdate.newLatLngZoom(LatLng(lat, lon), 15),
    );
  }

  void _swapPickupAndDropoff() {
    if (_currentLocation != null && _destinationLocation != null) {
      final tempLoc = _currentLocation;
      _currentLocation = _destinationLocation;
      _destinationLocation = tempLoc;

      final tempAddr = _currentAddress;
      _currentAddress = _destinationAddress;
      _destinationAddress = tempAddr;

      _pickupController.text = _currentAddress;
      _dropoffController.text = _destinationAddress;

      _updateFare();
    }
  }

  void _onMapTapped(LatLng target) {
    setState(() {
      _destinationLocation = Location(latitude: target.latitude, longitude: target.longitude);
      _destinationAddress = 'Pinned Dropoff (${target.latitude.toStringAsFixed(4)}, ${target.longitude.toStringAsFixed(4)})';
      _dropoffController.text = _destinationAddress;
    });
    _updateFare();
  }

  // Open Direct In-App Chat Modal between Rider and Driver
  void _openRiderDriverChatModal() {
    final List<Map<String, String>> messages = [
      {'sender': 'driver', 'text': 'Hello! I am assigned to your trip. Where exactly are you standing?'},
      {'sender': 'rider', 'text': 'Hi, I am waiting near the main entrance landmark.'},
    ];
    final TextEditingController chatMsgController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 16,
                right: 16,
                top: 16,
              ),
              child: SizedBox(
                height: 480,
                child: Column(
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            CircleAvatar(
                              backgroundColor: Color(0xFF10B981),
                              child: Icon(Icons.person, color: Colors.white),
                            ),
                            SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Driver Partner', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                                Text('TN-39-M-9988 • Yamaha FZ (Online)', style: TextStyle(color: Colors.greenAccent, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white70),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white12),

                    // Quick Template Messages
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          'I am waiting near the main gate',
                          'Please reach in 2 mins',
                          'What is your vehicle color?',
                        ].map((template) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ActionChip(
                              backgroundColor: const Color(0xFF1E293B),
                              label: Text(template, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                              onPressed: () {
                                setModalState(() {
                                  messages.add({'sender': 'rider', 'text': template});
                                });
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Messages List
                    Expanded(
                      child: ListView.builder(
                        itemCount: messages.length,
                        itemBuilder: (context, idx) {
                          final msg = messages[idx];
                          final isRider = msg['sender'] == 'rider';
                          return Align(
                            alignment: isRider ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: isRider ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                msg['text']!,
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // Input Field & Action Buttons
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12, top: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: chatMsgController,
                              style: const TextStyle(color: Colors.white),
                              decoration: InputDecoration(
                                hintText: 'Type message to driver...',
                                hintStyle: const TextStyle(color: Colors.white38),
                                filled: true,
                                fillColor: const Color(0xFF1E293B),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.send, color: Color(0xFF10B981)),
                            onPressed: () {
                              if (chatMsgController.text.trim().isNotEmpty) {
                                setModalState(() {
                                  messages.add({'sender': 'rider', 'text': chatMsgController.text.trim()});
                                  chatMsgController.clear();
                                });
                              }
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.chat, color: Colors.greenAccent),
                            tooltip: 'Chat on WhatsApp',
                            onPressed: () {
                              WhatsAppService.openWhatsApp(phone: '916381029380', message: 'Hello driver, I am waiting for pickup!');
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showBookingConfirmationDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Confirm $_selectedCategory Booking',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Pickup: $_currentAddress',
                style: const TextStyle(fontSize: 13, color: Colors.black87),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              Text(
                'Dropoff: $_destinationAddress',
                style: const TextStyle(fontSize: 13, color: Colors.black87, fontWeight: FontWeight.bold),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Text(
                'Estimated Fare: ₹${_estimatedFare.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green),
              ),
              const SizedBox(height: 16),

              TextField(
                controller: _nameController,
                textCapitalization: TextCapitalization.words,
                decoration: InputDecoration(
                  labelText: 'Your Name',
                  hintText: 'e.g. Rahul Sharma',
                  prefixIcon: const Icon(Icons.person, color: Colors.blue),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),

              if (_phoneController.text.isNotEmpty && _phoneController.text != '+91') ...[
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green.shade300),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified, color: Colors.green, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Verified WhatsApp Login Number',
                          style: TextStyle(color: Colors.green.shade900, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'WhatsApp Phone Number',
                  hintText: '+919876543210',
                  prefixIcon: const Icon(Icons.phone_android, color: Colors.green),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),

              OutlinedButton.icon(
                onPressed: _openRiderDriverChatModal,
                icon: const Icon(Icons.chat_bubble_outline, color: Colors.blueAccent),
                label: const Text('Open Direct In-App Rider-Driver Chat'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  side: const BorderSide(color: Colors.blueAccent),
                ),
              ),
              const SizedBox(height: 8),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _confirmAndPostRide();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('CONFIRM & NOTIFY NEARBY DRIVERS'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _confirmAndPostRide() async {
    if (_currentLocation == null || _destinationLocation == null) return;

    setState(() => _isBooking = true);

    final riderName = _nameController.text.trim().isEmpty ? 'Anonymous Rider' : _nameController.text.trim();
    final riderPhone = _phoneController.text.trim().isEmpty ? '+919876543210' : _phoneController.text.trim();

    await SupabaseBackendService().saveCrmContact(
      name: riderName,
      phone: riderPhone,
      role: 'Rider',
      city: _currentAddress,
      category: _selectedCategory,
    );

    final newRide = RideRequest(
      id: 'RIDE_${DateTime.now().millisecondsSinceEpoch}',
      riderId: 'RIDER_001',
      riderPhone: '$riderName ($riderPhone)',
      pickupLocation: _currentLocation!,
      pickupAddress: _currentAddress,
      dropoffLocation: _destinationLocation!,
      dropoffAddress: _destinationAddress,
      vehicleCategory: _selectedCategory,
      estimatedFare: _estimatedFare,
      status: RideStatus.requested,
      createdAt: DateTime.now(),
    );

    await SupabaseBackendService().createRideRequest(newRide);
    setState(() => _isBooking = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Ride requested for $riderName ($riderPhone)! Contact saved to WhatsApp CRM.'),
          backgroundColor: Colors.green.shade800,
        ),
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
          infoWindow: InfoWindow(
            title: _destinationAddress.isNotEmpty ? _destinationAddress : 'Drop-off Pin',
          ),
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
            icon: const Icon(Icons.chat, color: Colors.greenAccent),
            tooltip: 'Live Rider-Driver Chat',
            onPressed: _openRiderDriverChatModal,
          ),
          IconButton(
            icon: const Icon(Icons.badge_outlined, color: Colors.amber),
            tooltip: 'Register as Driver',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const DriverRegistrationScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _fetchLiveLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(target: initialPos, zoom: 15),
            onMapCreated: (controller) => _mapController = controller,
            markers: markers,
            onCameraMove: _onCameraMove,
            onCameraIdle: _onCameraIdle,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
          ),

          // 📍 Floating Drag Pin Indicator in Center of Screen (Uber/Rapido style)
          if (_pinSelectionStep == 0 || _pinSelectionStep == 1)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 36),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _pinSelectionStep == 0 ? Colors.greenAccent : Colors.redAccent,
                          width: 1.5,
                        ),
                        boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 8)],
                      ),
                      child: Text(
                        _isMovingMap
                            ? 'Finding place...'
                            : (_pinSelectionStep == 0 ? '📍 Drag Map to Set Pickup' : '🚩 Drag Map to Set Dropoff'),
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Icon(
                      _pinSelectionStep == 0 ? Icons.location_on : Icons.flag,
                      size: 46,
                      color: _pinSelectionStep == 0 ? Colors.green : Colors.red,
                    ),
                  ],
                ),
              ),
            ),

          // 🔍 Top Floating Glassmorphism Address Bar
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Card(
              elevation: 8,
              color: const Color(0xFF0F172A),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Pickup Input
                    Row(
                      children: [
                        const Icon(Icons.circle, color: Colors.green, size: 14),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _pickupController,
                            onChanged: _onPickupQueryChanged,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: const InputDecoration(
                              hintText: 'Pickup Place (Drag map or type)',
                              hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        if (_isSearchingPickup)
                          const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.green)),
                      ],
                    ),

                    // Pickup Suggestions Dropdown List
                    if (_pickupSuggestions.isNotEmpty)
                      Container(
                        constraints: const BoxConstraints(maxHeight: 180),
                        margin: const EdgeInsets.only(top: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.green.withValues(alpha: 0.5)),
                        ),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: _pickupSuggestions.length,
                          itemBuilder: (context, idx) {
                            final item = _pickupSuggestions[idx];
                            return ListTile(
                              dense: true,
                              leading: const Icon(Icons.pin_drop, color: Colors.green, size: 16),
                              title: Text(item['display_name'], style: const TextStyle(color: Colors.white, fontSize: 12)),
                              onTap: () {
                                _selectPickupSuggestion(item);
                                setState(() => _pinSelectionStep = 1);
                              },
                            );
                          },
                        ),
                      ),

                    const Divider(color: Colors.white12, height: 12),

                    // Dropoff Input Row
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.red, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _dropoffController,
                            onChanged: _onDropoffQueryChanged,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: const InputDecoration(
                              hintText: 'Dropoff Place (Drag map or type)',
                              hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
                              border: InputBorder.none,
                              isDense: true,
                            ),
                          ),
                        ),
                        if (_isSearchingDropoff)
                          const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.red)),
                      ],
                    ),

                    // Dropoff Suggestions Dropdown List
                    if (_dropoffSuggestions.isNotEmpty)
                      Container(
                        constraints: const BoxConstraints(maxHeight: 180),
                        margin: const EdgeInsets.only(top: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.withValues(alpha: 0.5)),
                        ),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: _dropoffSuggestions.length,
                          itemBuilder: (context, idx) {
                            final item = _dropoffSuggestions[idx];
                            return ListTile(
                              dense: true,
                              leading: const Icon(Icons.place, color: Colors.red, size: 16),
                              title: Text(item['display_name'], style: const TextStyle(color: Colors.white, fontSize: 12)),
                              onTap: () {
                                _selectDropoffSuggestion(item);
                                setState(() => _pinSelectionStep = 2);
                              },
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // 📍 Bottom Floating Action Controls
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [BoxShadow(color: Colors.black45, blurRadius: 12)],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_pinSelectionStep == 0) ...[
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() => _pinSelectionStep = 1);
                      },
                      icon: const Icon(Icons.check_circle, color: Colors.black),
                      label: const Text('CONFIRM PICKUP LOCATION 📍', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00FF00),
                        foregroundColor: Colors.black,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ] else if (_pinSelectionStep == 1) ...[
                    ElevatedButton.icon(
                      onPressed: () {
                        if (_destinationAddress.isEmpty) {
                          _destinationAddress = 'Selected Destination Pin';
                        }
                        _updateFare();
                        setState(() => _pinSelectionStep = 2);
                      },
                      icon: const Icon(Icons.flag, color: Colors.white),
                      label: const Text('CONFIRM DROPOFF LOCATION 🚩', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ] else ...[
                    // Clean Vehicle Selector
                    SizedBox(
                      height: 70,
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
                              margin: const EdgeInsets.only(right: 10),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? (cat['color'] as Color).withValues(alpha: 0.25) : const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isSelected ? (cat['color'] as Color) : Colors.white12,
                                  width: 2,
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(cat['icon'], color: isSelected ? (cat['color'] as Color) : Colors.white70),
                                  const SizedBox(height: 4),
                                  Text(
                                    catKey,
                                    style: TextStyle(
                                      color: isSelected ? Colors.white : Colors.white70,
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
                    ElevatedButton(
                      onPressed: _showBookingConfirmationDialog,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFD700),
                        foregroundColor: Colors.black,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: Text(
                        'BOOK $_selectedCategory NOW • ₹${_estimatedFare.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        setState(() => _pinSelectionStep = 0);
                      },
                      child: const Center(
                        child: Text('Reset Location Pins', style: TextStyle(color: Colors.white60, fontSize: 12)),
                      ),
                    )
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
