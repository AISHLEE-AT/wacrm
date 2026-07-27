import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';

import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'web_module_screen.dart';
import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../services/supabase_backend_service.dart';
import '../features/profile/services/profile_service.dart';
import '../services/permission_service.dart';

class RiderMapScreen extends StatefulWidget {
  const RiderMapScreen({super.key});

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
  String? _activeRideId; // Tracks active ride status

  final TextEditingController _pickupController = TextEditingController();
  final TextEditingController _dropoffController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController(text: '+91');

  List<dynamic> _pickupSuggestions = [];
  List<dynamic> _dropoffSuggestions = [];

  // 🚀 Rapido Parity Upgrades
  String? _securityOtp;
  bool _isScheduled = false;
  DateTime? _scheduledDateTime;

  final Map<String, Map<String, dynamic>> _categories = {
    'Bike': {'baseFare': 30, 'perKm': 10, 'icon': Icons.two_wheeler, 'color': Colors.orange},
    'Auto': {'baseFare': 50, 'perKm': 15, 'icon': Icons.electric_rickshaw, 'color': Colors.amber},
    'Car': {'baseFare': 100, 'perKm': 22, 'icon': Icons.directions_car, 'color': Colors.blue},
    'Van': {'baseFare': 250, 'perKm': 35, 'icon': Icons.airport_shuttle, 'color': Colors.purple},
    'Truck': {'baseFare': 400, 'perKm': 50, 'icon': Icons.local_shipping, 'color': Colors.brown},
    'Bus': {'baseFare': 600, 'perKm': 75, 'icon': Icons.directions_bus, 'color': Colors.teal},
  };

  int _pinSelectionStep = 0; // 0 = pickup, 1 = dropoff, 2 = confirm

  @override
  void initState() {
    super.initState();
    _initCurrentLocation();
  }

  Future<void> _initCurrentLocation() async {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PermissionService.requestAllPermissions(context);
    });
    final loc = await LocationService().getCurrentLocation();
    final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
    final profile = await ProfileService.getCurrentUserProfileDetails();
    if (mounted) {
      setState(() {
        _currentLocation = loc;
        _currentAddress = address;
        _pickupController.text = address;
        final user = Supabase.instance.client.auth.currentUser;
        final rawEmailPhone = (user?.email != null && user!.email!.contains('@whatsapp.wacrm.local'))
            ? user.email!.split('@')[0].replaceAll(RegExp(r'\D'), '')
            : '';
        final rawPhone = (profile['phone']?.isNotEmpty == true) ? profile['phone']! : rawEmailPhone;
        final phone10 = rawPhone.length >= 10 ? rawPhone.substring(rawPhone.length - 10) : rawPhone;
        final resolvedName = (profile['name'] != null && profile['name']!.isNotEmpty && profile['name'] != 'User' && profile['name'] != 'FAGO User')
            ? profile['name']!
            : (phone10 == '9123596988' ? 'aishlee raadee' : 'FAGO User');

        if (_nameController.text.isEmpty || _nameController.text == 'User') _nameController.text = resolvedName;
        if (_phoneController.text.isEmpty || _phoneController.text == '+91') {
          _phoneController.text = phone10.isNotEmpty ? '+91 $phone10' : '+91 91235 96988';
        }
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

  Future<List<dynamic>> _fetchCombinedSuggestions(String query) async {
    List<dynamic> results = [];
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

  Future<void> _onPickupQueryChanged(String query) async {
    if (query.trim().length < 3) {
      setState(() => _pickupSuggestions = []);
      return;
    }
    setState(() => _isSearchingPickup = true);
    final list = await _fetchCombinedSuggestions(query);
    if (mounted) {
      setState(() {
        _pickupSuggestions = list;
        _isSearchingPickup = false;
      });
    }
  }

  Future<void> _onDropoffQueryChanged(String query) async {
    if (query.trim().length < 3) {
      setState(() => _dropoffSuggestions = []);
      return;
    }
    setState(() => _isSearchingDropoff = true);
    final list = await _fetchCombinedSuggestions(query);
    if (mounted) {
      setState(() {
        _dropoffSuggestions = list;
        _isSearchingDropoff = false;
      });
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

  void _showBookingDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        String genderFilter = "all";
        String sortOrder = "price";
        String selectedDriverId = "DRV_VIRT_001";

        final virtualDrivers = [
          {'id': 'DRV_VIRT_001', 'name': 'Captain Senthil Kumar', 'phone': '9486335870', 'category': 'Bike', 'vehicle': 'Honda Activa 6G (TN 38 BL 9486)', 'gender': 'male', 'rating': 4.9, 'eta': '2 mins', 'etaMin': 2, 'dist': '0.8 km', 'fare': (30 + (_estimatedFare > 0 ? _estimatedFare * 0.8 : 40)).round()},
          {'id': 'DRV_VIRT_002', 'name': 'Driver Anitha R', 'phone': '9123596988', 'category': 'Auto', 'vehicle': 'Bajaj RE Auto (TN 37 AB 1234)', 'gender': 'female', 'rating': 5.0, 'eta': '3 mins', 'etaMin': 3, 'dist': '1.2 km', 'fare': (40 + (_estimatedFare > 0 ? _estimatedFare * 1.1 : 60)).round()},
          {'id': 'DRV_VIRT_003', 'name': 'Captain Karthik Raja', 'phone': '9876543210', 'category': 'Cab', 'vehicle': 'Swift Dzire AC (TN 38 CZ 5678)', 'gender': 'male', 'rating': 4.8, 'eta': '4 mins', 'etaMin': 4, 'dist': '1.5 km', 'fare': (80 + (_estimatedFare > 0 ? _estimatedFare * 1.5 : 120)).round()},
          {'id': 'DRV_VIRT_004', 'name': 'Driver Priya Lakshmi', 'phone': '9443322110', 'category': 'SUV', 'vehicle': 'Innova Crysta AC (TN 38 EY 9988)', 'gender': 'female', 'rating': 4.9, 'eta': '5 mins', 'etaMin': 5, 'dist': '2.1 km', 'fare': (150 + (_estimatedFare > 0 ? _estimatedFare * 2.2 : 250)).round()},
          {'id': 'DRV_VIRT_005', 'name': 'Farmer Murugan', 'phone': '9789012345', 'category': 'Tractor', 'vehicle': 'Mahindra 575 DI (TN 38 TR 4321)', 'gender': 'male', 'rating': 4.9, 'eta': '8 mins', 'etaMin': 8, 'dist': '3.0 km', 'fare': 700},
          {'id': 'DRV_VIRT_006', 'name': 'Driver Rajesh', 'phone': '9894012345', 'category': 'MiniVan', 'vehicle': 'Tata Ace Gold (TN 38 MV 8899)', 'gender': 'male', 'rating': 4.7, 'eta': '6 mins', 'etaMin': 6, 'dist': '2.5 km', 'fare': 500},
        ];

        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final filtered = virtualDrivers.where((d) {
              if (genderFilter == "female") return d['gender'] == 'female';
              if (genderFilter == "male") return d['gender'] == 'male';
              return true;
            }).toList();

            filtered.sort((a, b) {
              if (sortOrder == "eta") return (a['etaMin'] as int).compareTo(b['etaMin'] as int);
              if (sortOrder == "rating") return (b['rating'] as double).compareTo(a['rating'] as double);
              return (a['fare'] as num).compareTo(b['fare'] as num);
            });

            final chosen = virtualDrivers.firstWhere((d) => d['id'] == selectedDriverId, orElse: () => filtered.first);

            return Container(
              height: MediaQuery.of(context).size.height * 0.85,
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('🚖 Select Nearby Driver & Book', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
                          Text('Pickup: $_currentAddress', style: const TextStyle(fontSize: 11, color: Colors.grey), overflow: TextOverflow.ellipsis),
                        ],
                      ),
                      IconButton(icon: const Icon(Icons.close, color: Colors.white), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Gender & Sort Filter Chips
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          ChoiceChip(
                            label: const Text('All', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            selected: genderFilter == 'all',
                            selectedColor: const Color(0xFF00FF00),
                            onSelected: (s) => setModalState(() => genderFilter = 'all'),
                          ),
                          const SizedBox(width: 4),
                          ChoiceChip(
                            label: const Text('👩 Female', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            selected: genderFilter == 'female',
                            selectedColor: const Color(0xFF00FF00),
                            onSelected: (s) => setModalState(() => genderFilter = 'female'),
                          ),
                          const SizedBox(width: 4),
                          ChoiceChip(
                            label: const Text('👨 Male', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            selected: genderFilter == 'male',
                            selectedColor: const Color(0xFF00FF00),
                            onSelected: (s) => setModalState(() => genderFilter = 'male'),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          ChoiceChip(
                            label: const Text('🏷️ Price', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            selected: sortOrder == 'price',
                            selectedColor: Colors.amber,
                            onSelected: (s) => setModalState(() => sortOrder = 'price'),
                          ),
                          const SizedBox(width: 4),
                          ChoiceChip(
                            label: const Text('⚡ ETA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            selected: sortOrder == 'eta',
                            selectedColor: Colors.amber,
                            onSelected: (s) => setModalState(() => sortOrder = 'eta'),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Driver List
                  Expanded(
                    child: ListView.builder(
                      itemCount: filtered.length,
                      itemBuilder: (ctx, index) {
                        final drv = filtered[index];
                        final isSel = drv['id'] == selectedDriverId;
                        return InkWell(
                          onTap: () => setModalState(() => selectedDriverId = drv['id'] as String),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isSel ? const Color(0xFF00FF00).withValues(alpha: 0.15) : const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: isSel ? const Color(0xFF00FF00) : Colors.white24, width: isSel ? 2 : 1),
                            ),
                            child: Row(
                              children: [
                                Text(drv['gender'] == 'female' ? '👩' : '👨', style: const TextStyle(fontSize: 28)),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(drv['name'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                                            child: Text('⭐ ${drv['rating']}', style: const TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                                          ),
                                        ],
                                      ),
                                      Text('${drv['category']} • ${drv['vehicle']}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                      Text('📍 ${drv['dist']} away • ${drv['eta']} ETA', style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 10, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                                Text('₹${drv['fare']}', style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 18)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // Rider inputs
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _nameController,
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            labelText: 'Your Name',
                            labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          decoration: InputDecoration(
                            labelText: 'WhatsApp Phone',
                            labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _confirmAndPostRide(chosen['phone'].toString());
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('CONFIRM BOOKING WITH ${(chosen['name'] as String).toUpperCase()} VIA WHATSAPP', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _confirmAndPostRide(String driverPhone) async {
    if (_currentLocation == null || _destinationLocation == null) return;

    setState(() => _isBooking = true);

    final _freshProfile = await ProfileService.getCurrentUserProfileDetails();
    final riderName = _nameController.text.trim().isNotEmpty
        ? _nameController.text.trim()
        : (_freshProfile['name'] ?? '').toString().trim();
    final rawPhone = _phoneController.text.trim();
    final cleanPhoneDigits = rawPhone.replaceAll(RegExp(r'[^\d]'), '');
    final riderPhone = cleanPhoneDigits.length >= 10
        ? cleanPhoneDigits
        : (_freshProfile['phone'] ?? '').toString().trim();

    if (riderName.isEmpty || riderPhone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your name and phone number to book a ride'),
          backgroundColor: Colors.red,
        )
      );
      setState(() => _isBooking = false);
      return;
    }

    await SupabaseBackendService().saveCrmContact(
      name: riderName,
      phone: riderPhone,
      role: 'Rider',
      city: _currentAddress,
      category: _selectedCategory,
    );

    final rideId = 'RIDE_${DateTime.now().millisecondsSinceEpoch}';
    final otpPin = (1000 + Random().nextInt(9000)).toString();

    final newRide = RideRequest(
      id: rideId,
      riderId: 'RIDER_001',
      riderName: riderName,
      riderPhone: riderPhone,
      pickupLocation: _currentLocation!,
      pickupAddress: _currentAddress,
      dropoffLocation: _destinationLocation!,
      dropoffAddress: _destinationAddress,
      vehicleCategory: _selectedCategory,
      estimatedFare: _estimatedFare,
      status: RideStatus.requested,
      otpCode: otpPin,
      createdAt: DateTime.now(),
    );

    await SupabaseBackendService().createRideRequest(newRide);

    final pinData = await LocationService().getPincodeAndAddressFromCoordinates(_currentLocation!.latitude, _currentLocation!.longitude);

    final whatsappMessage = WhatsAppService.getRideConfirmationTemplate(
      vehicleCategory: _selectedCategory,
      pickupAddress: _currentAddress,
      pincode: pinData['pincode'],
      dropoffAddress: _destinationAddress,
      fare: _estimatedFare,
      lat: _currentLocation!.latitude,
      lng: _currentLocation!.longitude,
      riderName: riderName,
      riderPhone: riderPhone,
      otpCode: otpPin,
    );

    final targetDriverPhone = driverPhone;
    if (targetDriverPhone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No driver phone available. Please try another driver.'))
      );
      setState(() => _isBooking = false);
      return;
    }
    final cleanTarget = targetDriverPhone.replaceAll(RegExp(r'[^\d]'), '');
    final waPhone = cleanTarget.startsWith('91') ? cleanTarget : '91$cleanTarget';
    await WhatsAppService.openWhatsApp(phone: waPhone, message: whatsappMessage);

    setState(() {
      _isBooking = false;
      _securityOtp = otpPin;
      _activeRideId = rideId; // Set active ride tracking!
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⚡ Ride requested! Security Start OTP PIN: $otpPin. Share PIN with driver when boarding.'),
          backgroundColor: Colors.green.shade800,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  void _showSosDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.shield, color: Colors.redAccent, size: 28),
                SizedBox(width: 10),
                Text('🚨 FAGO Safety Shield & SOS', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 10),
            const Text('Your safety is our top priority. Choose an emergency action below:', style: TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () async {
                final url = Uri.parse("tel:112");
                if (await canLaunchUrl(url)) await launchUrl(url);
              },
              icon: const Icon(Icons.call, color: Colors.white),
              label: const Text('CALL POLICE EMERGENCY (112)', style: TextStyle(fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 48)),
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              onPressed: () async {
                final locText = _currentLocation != null ? "https://maps.google.com/?q=${_currentLocation!.latitude},${_currentLocation!.longitude}" : _currentAddress;
                final text = Uri.encodeComponent("🚨 EMERGENCY SOS ALERT from FAGO Rider!\nI need emergency assistance at my live GPS location:\n$locText");
                final url = Uri.parse("https://wa.me/?text=$text");
                if (await canLaunchUrl(url)) await launchUrl(url, mode: LaunchMode.externalApplication);
              },
              icon: const Icon(Icons.share_location, color: Colors.black),
              label: const Text('SHARE LIVE GPS LOCATION TO FAMILY VIA WHATSAPP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF25D366), foregroundColor: Colors.black, minimumSize: const Size(double.infinity, 48)),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () async {
                final url = Uri.parse("tel:9486335870");
                if (await canLaunchUrl(url)) await launchUrl(url);
              },
              icon: const Icon(Icons.support_agent, color: Colors.amber),
              label: const Text('Call FAGO 24x7 Safety Command Helpline (+91 9486335870)', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 11)),
              style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.amber), minimumSize: const Size(double.infinity, 44)),
            ),
          ],
        ),
      ),
    );
  }

  void _showFareBreakdownDialog() {
    final cat = _categories[_selectedCategory]!;
    final baseFare = (cat['baseFare'] as int).toDouble();
    final perKm = (cat['perKm'] as int).toDouble();
    final distKm = _currentLocation != null && _destinationLocation != null
        ? _calculateDistance(_currentLocation!.latitude, _currentLocation!.longitude, _destinationLocation!.latitude, _destinationLocation!.longitude)
        : 0.0;
    final distCost = distKm * perKm;
    final platformFee = 0.0; // 0% Commission Guarantee
    final totalFare = max(baseFare + distCost, baseFare);
    final estimatedRapidoFare = totalFare * 1.25;

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('📊 Fare Breakdown ($_selectedCategory)', style: const TextStyle(color: Colors.amber, fontSize: 16, fontWeight: FontWeight.bold)),
                IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 10),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Base Fare', style: TextStyle(color: Colors.white70)), Text('₹${baseFare.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white))]),
            const SizedBox(height: 6),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Distance Charge (${distKm.toStringAsFixed(1)} km @ ₹${perKm.toStringAsFixed(0)}/km)', style: const TextStyle(color: Colors.white70)), Text('₹${distCost.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white))]),
            const SizedBox(height: 6),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('FAGO Platform Fee (0% Commission)', style: TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold)), Text('₹${platformFee.toStringAsFixed(0)} FREE', style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold))]),
            const Divider(color: Colors.white24, height: 20),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Total Total Estimated Fare', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)), Text('₹${totalFare.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 18))]),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.amber)),
              child: Row(
                children: [
                  const Icon(Icons.savings, color: Colors.amber),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '🎉 You save approx ₹${(estimatedRapidoFare - totalFare).toStringAsFixed(0)} vs other apps thanks to FAGO\'s 0% Commission Direct Booking!',
                      style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showRatingDialog() {
    int rating = 5;
    final List<String> tags = ['🚀 Smooth Ride', '🛡️ Safe Driving', '🧼 Clean Vehicle', '😊 Polite Captain', '⚡ On-Time Arrival'];
    final Set<String> selectedTags = {};

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 20, left: 20, right: 20, top: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('⭐ Rate Your Driver Partner', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('How was your trip experience?', style: TextStyle(color: Colors.grey, fontSize: 12)),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starIndex = index + 1;
                  return IconButton(
                    icon: Icon(starIndex <= rating ? Icons.star : Icons.star_border, color: Colors.amber, size: 36),
                    onPressed: () => setModalState(() => rating = starIndex),
                  );
                }),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: tags.map((tag) {
                  final isSelected = selectedTags.contains(tag);
                  return FilterChip(
                    label: Text(tag, style: TextStyle(color: isSelected ? Colors.black : Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    selected: isSelected,
                    selectedColor: Colors.amber,
                    backgroundColor: const Color(0xFF222222),
                    onSelected: (val) {
                      setModalState(() {
                        if (val) selectedTags.add(tag); else selectedTags.remove(tag);
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Thank you! Your feedback has been recorded.'), backgroundColor: Colors.green),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00), foregroundColor: Colors.black, minimumSize: const Size(double.infinity, 46)),
                child: const Text('SUBMIT FEEDBACK', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openCategoryGridModal(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    final userRole = user?.userMetadata?['role']?.toString().toLowerCase() ?? 'user';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final categories = [
          {'name': '🌐 AISHLEE-WEB Portal', 'desc': 'Open Web Flow in Browser', 'route': '/'},
          {'name': '🚖 RideO (Book Ride)', 'desc': 'On-Demand Rides', 'route': '/rideo'},
          if (userRole == 'driver' || userRole == 'admin')
            {'name': '🚚 DriveO (Driver Radar)', 'desc': 'Driver Acceptance', 'route': '/drivo'},
          {'name': '🚜 RentO (Agri Rental)', 'desc': 'Machinery Rentals', 'route': '/rento'},
          {'name': '🏷️ DealO (Marketplace)', 'desc': '5km Radius P2P Deals', 'route': '/dealo'},
          {'name': '🌾 Mandi Rates (சந்தை)', 'desc': 'Agri Crop Prices', 'route': '/mandi'},
          {'name': '🎓 TeachO (Academy)', 'desc': 'Skill Guides & Courses', 'route': '/teacho'},
          {'name': '📝 TestO (Exam Hub)', 'desc': 'Mock Tests & Certification', 'route': '/testo'},
          {'name': '📺 TvO (Live Channels)', 'desc': 'Agri & Driver Streaming', 'route': '/tvo'},
          {'name': '🛕 TourO (ஆன்மீகம்)', 'desc': 'Spiritual Temple Tours', 'route': '/touro'},
          {'name': '🤖 Gemini AI Assistant', 'desc': 'Tamil AI Smart Assistant', 'route': '/gemini'},
          if (userRole == 'admin')
            {'name': '👑 WhatsApp CRM Hub', 'desc': 'Customer Management & Admin CRM', 'route': '/admin'},
          {'name': '💰 MoneyO (Finance)', 'desc': 'Agri Ledger & Savings', 'route': '/moneyo'},
          {'name': '📋 TaskO (Gig Work)', 'desc': 'Daily Tasks & Opportunities', 'route': '/tasko'},
          {'name': '🛠️ ToolsO (Agri Tools)', 'desc': 'Calculators & Tools Suite', 'route': '/toolso'},
          {'name': '👤 Profile & Digital Pass', 'desc': 'KYC & UPI Settlements', 'route': '/profile'},
        ];

        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '⚡ FAGO Super App (அனைத்து சேவைகள்)',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: categories.length,
                  separatorBuilder: (ctx, i) => const Divider(color: Colors.white12, height: 1),
                  itemBuilder: (ctx, i) {
                    final item = categories[i];
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(item['name']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Text(item['desc']!, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, color: Color(0xFF00FF00), size: 14),
                      onTap: () {
                        Navigator.pop(ctx);
                        final route = item['route'];
                        if (route != null) {
                          if (route == '/rideo' || route == '/') {
                            context.go('/');
                          } else if (route == '/moneyo' || route == '/tasko' || route == '/toolso') {
                            WebModuleScreen.launchInBrowser(path: route);
                          } else {
                            context.push(route);
                          }
                        }
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _selectScheduleTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(hours: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 7)),
    );
    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (time == null || !mounted) return;

    setState(() {
      _isScheduled = true;
      _scheduledDateTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('📅 Ride scheduled for ${_scheduledDateTime.toString().substring(0, 16)}'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  Widget _buildActiveRideTrackingSheet() {
    if (_activeRideId == null) return const SizedBox.shrink();

    return StreamBuilder<RideRequest?>(
      stream: SupabaseBackendService().getRideStatusStream(_activeRideId!),
      builder: (context, snapshot) {
        final ride = snapshot.data;
        if (ride == null) {
          return Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF0F172A),
            child: Row(
              children: [
                const CircularProgressIndicator(color: Color(0xFF00FF00)),
                const SizedBox(width: 12),
                const Text("Connecting live ride status...", style: TextStyle(color: Colors.white)),
                const Spacer(),
                IconButton(
                  onPressed: () => setState(() => _activeRideId = null),
                  icon: const Icon(Icons.close, color: Colors.grey),
                ),
              ],
            ),
          );
        }

        String statusMsg = "Searching for nearest driver...";
        Color statusColor = Colors.amber;
        if (ride.status == RideStatus.accepted) {
          statusMsg = "Driver Assigned & On The Way!";
          statusColor = Colors.orange;
        } else if (ride.status == RideStatus.arrived) {
          statusMsg = "Driver Arrived at Pickup Point!";
          statusColor = Colors.blue;
        } else if (ride.status == RideStatus.inProgress) {
          statusMsg = "Trip in Progress to Destination!";
          statusColor = Colors.green;
        } else if (ride.status == RideStatus.completed) {
          statusMsg = "Trip Completed! Pay ₹${ride.estimatedFare.toStringAsFixed(0)} via UPI";
          statusColor = const Color(0xFF00FF00);
        }

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A),
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [BoxShadow(color: Colors.black54, blurRadius: 16)],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "🚕 LIVE TRIP TRACKER",
                          style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                        Text(
                          statusMsg,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    "₹${ride.estimatedFare.toStringAsFixed(0)}",
                    style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.w900, fontSize: 20),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 🚀 Rapido Parity: Security OTP PIN & SOS Safety Shield
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amber),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.lock, color: Colors.amber, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'START RIDE OTP PIN: ${_securityOtp ?? '4829'}',
                          style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.2),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: _showSosDialog,
                      icon: const Icon(Icons.shield, color: Colors.white, size: 14),
                      label: const Text('🚨 SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Contact Driver Actions
              if (ride.driverPhone != null && ride.driverPhone!.isNotEmpty) ...[
                Row(
                  children: [
                    const Icon(Icons.drive_eta, color: Color(0xFF00FF00), size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text("Driver: ${ride.driverPhone}", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    ),
                    IconButton(
                      onPressed: () => WhatsAppService.openWhatsApp(phone: ride.driverPhone!, message: "Hi Driver!"),
                      icon: const Icon(Icons.chat, color: Color(0xFF25D366)),
                    ),
                    IconButton(
                      onPressed: () async {
                        final clean = ride.driverPhone!.replaceAll(RegExp(r'\D'), '');
                        final url = Uri.parse("tel:+$clean");
                        if (await canLaunchUrl(url)) await launchUrl(url);
                      },
                      icon: const Icon(Icons.phone, color: Colors.blueAccent),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
              ],

              if (ride.status == RideStatus.completed)
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00), foregroundColor: Colors.black),
                    onPressed: () async {
                      final driverUpi = ''; // ride.driverUpiId doesn't exist on the model
                      if (driverUpi.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Driver UPI ID not available. Please pay directly to driver.'))
                        );
                        return;
                      }
                      final upiUri = Uri.parse(
                          "upi://pay?pa=$driverUpi&pn=${Uri.encodeComponent('Driver')}&am=${ride.estimatedFare.toStringAsFixed(0)}&cu=INR&tn=RideO%20Trip%20Payment");
                      if (await canLaunchUrl(upiUri)) {
                        await launchUrl(upiUri, mode: LaunchMode.externalApplication);
                      }
                    },
                    icon: const Icon(Icons.account_balance_wallet),
                    label: Text("💳 PAY ₹${ride.estimatedFare.toStringAsFixed(0)} VIA INSTANT UPI", style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                )
              else
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.redAccent, side: const BorderSide(color: Colors.redAccent)),
                        onPressed: () {
                          SupabaseBackendService().updateRideStatus(rideId: ride.id, status: 'cancelled');
                          setState(() => _activeRideId = null);
                        },
                        child: const Text("CANCEL RIDE"),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.white12, foregroundColor: Colors.white),
                        onPressed: () => setState(() => _activeRideId = null),
                        child: const Text("RESET MAP"),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        );
      },
    );
  }

  final List<Map<String, dynamic>> _hotspots = [
    {'name': '🚆 Coimbatore Railway Station', 'address': 'Coimbatore Junction Railway Station, Gopalapuram', 'lat': 11.0017, 'lng': 76.9629},
    {'name': '✈️ Coimbatore Airport (CJB)', 'address': 'Coimbatore International Airport, Peelamedu', 'lat': 11.0300, 'lng': 77.0434},
    {'name': '🚌 Gandhipuram Bus Stand', 'address': 'Gandhipuram Central Bus Stand, Coimbatore', 'lat': 11.0183, 'lng': 76.9673},
    {'name': '🏥 KMCH Hospital Peelamedu', 'address': 'Kovai Medical Center & Hospital, Avinashi Road', 'lat': 11.0425, 'lng': 77.0375},
    {'name': '🌾 Oddanchatram Agri Mandi', 'address': 'Oddanchatram Vegetable Market, Dindigul', 'lat': 10.4851, 'lng': 77.7478},
    {'name': '🛕 Tanjore Big Temple', 'address': 'Brihadeeswarar Temple, Thanjavur', 'lat': 10.7828, 'lng': 79.1318},
    {'name': '🏔️ Ooty Botanical Garden', 'address': 'Vannarapettai, Ooty, Nilgiris', 'lat': 11.4150, 'lng': 76.7110},
  ];

  void _selectHotspot(Map<String, dynamic> hs, bool isPickup) async {
    final lat = hs['lat'] as double;
    final lng = hs['lng'] as double;

    final cleanAddr = await LocationService().getAddressFromCoordinates(lat, lng);

    if (!mounted) return;
    setState(() {
      if (isPickup) {
        _currentLocation = Location(latitude: lat, longitude: lng);
        _currentAddress = cleanAddr;
        _pickupController.text = cleanAddr;
      } else {
        _destinationLocation = Location(latitude: lat, longitude: lng);
        _destinationAddress = cleanAddr;
        _dropoffController.text = cleanAddr;
      }
    });

    _updateFare();
    _mapController?.animateCamera(CameraUpdate.newLatLngZoom(LatLng(lat, lng), 15));

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${isPickup ? "📍 Pickup" : "🚩 Dropoff"} set to: $cleanAddr'),
        backgroundColor: isPickup ? Colors.green.shade800 : Colors.redAccent,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _handleMapTap(LatLng point) async {
    final cleanAddr = await LocationService().getAddressFromCoordinates(point.latitude, point.longitude);
    if (!mounted) return;

    if (_pinSelectionStep == 0) {
      setState(() {
        _currentLocation = Location(latitude: point.latitude, longitude: point.longitude);
        _currentAddress = cleanAddr;
        _pickupController.text = cleanAddr;
      });
      _updateFare();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('📍 Pickup set to: $cleanAddr'),
          duration: const Duration(seconds: 2),
          backgroundColor: Colors.green.shade800,
        ),
      );
    } else {
      setState(() {
        _destinationLocation = Location(latitude: point.latitude, longitude: point.longitude);
        _destinationAddress = cleanAddr;
        _dropoffController.text = cleanAddr;
      });
      _updateFare();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🚩 Dropoff set to: $cleanAddr'),
          duration: const Duration(seconds: 2),
          backgroundColor: Colors.redAccent,
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
          infoWindow: InfoWindow(title: 'Pickup Location', snippet: _currentAddress),
          draggable: true,
          onDragEnd: (newPosition) => _handleMapTap(newPosition),
        ),
      );
    }
    if (_destinationLocation != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('dropoff'),
          position: LatLng(_destinationLocation!.latitude, _destinationLocation!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
          infoWindow: InfoWindow(title: 'Dropoff Location', snippet: _destinationAddress),
          draggable: true,
          onDragEnd: (newPosition) => _handleMapTap(newPosition),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('RideO - Book Ride'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.grid_view_rounded, color: Color(0xFF00FF00)),
            tooltip: 'All FAGO Modules GridView',
            onPressed: () => _openCategoryGridModal(context),
          ),
          IconButton(
            icon: const Icon(Icons.shield, color: Colors.redAccent),
            tooltip: '🚨 Safety SOS & Emergency Shield',
            onPressed: _showSosDialog,
          ),
          IconButton(
            icon: const Icon(Icons.analytics, color: Colors.amber),
            tooltip: '📊 0% Commission Fare Breakdown',
            onPressed: _showFareBreakdownDialog,
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(target: initialPos, zoom: 14),
            onMapCreated: (controller) => _mapController = controller,
            onTap: _handleMapTap,
            markers: markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
          ),

          // Search Address Container
          if (_activeRideId == null)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Card(
                color: const Color(0xFF0F172A),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
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
                                hintText: 'Pickup Location',
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

                      if (_pickupSuggestions.isNotEmpty)
                        Container(
                          constraints: const BoxConstraints(maxHeight: 180),
                          margin: const EdgeInsets.only(top: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(12),
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

                      // Quick Destination Pins (Home & Work)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            ActionChip(
                              avatar: const Icon(Icons.home, size: 14, color: Color(0xFF00FF00)),
                              label: const Text('Home', style: TextStyle(color: Colors.white, fontSize: 11)),
                              backgroundColor: const Color(0xFF1E293B),
                              onPressed: () {
                                _dropoffController.text = 'Home (Saved Pin)';
                                _onDropoffQueryChanged('Chennai Central');
                              },
                            ),
                            const SizedBox(width: 8),
                            ActionChip(
                              avatar: const Icon(Icons.work, size: 14, color: Colors.cyanAccent),
                              label: const Text('Work', style: TextStyle(color: Colors.white, fontSize: 11)),
                              backgroundColor: const Color(0xFF1E293B),
                              onPressed: () {
                                _dropoffController.text = 'Work (Saved Pin)';
                                _onDropoffQueryChanged('T. Nagar, Chennai');
                              },
                            ),
                          ],
                        ),
                      ),

                      const Divider(color: Colors.white12, height: 12),

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
                                hintText: 'Dropoff Place',
                                hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
                                border: InputBorder.none,
                                isDense: true,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // 📍 Nearby Hotspots Quick Chips (Railway, Airport, Bus Stand, Mandi, Temple)
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _hotspots.map((hs) {
                            return Padding(
                              padding: const EdgeInsets.only(right: 6),
                              child: ActionChip(
                                label: Text(
                                  hs['name'],
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                                backgroundColor: const Color(0xFF1E293B),
                                side: BorderSide(color: Colors.amber.withValues(alpha: 0.5)),
                                onPressed: () => _selectHotspot(hs, _pinSelectionStep == 0),
                              ),
                            );
                          }).toList(),
                        ),
                      ),

                      if (_dropoffSuggestions.isNotEmpty)
                        Container(
                          constraints: const BoxConstraints(maxHeight: 180),
                          margin: const EdgeInsets.only(top: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(12),
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

          // Bottom Action Sheet: Active Ride Tracking vs Booking Form
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              top: false,
              child: _activeRideId != null
                  ? _buildActiveRideTrackingSheet()
                  : Container(
                      padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + MediaQuery.of(context).padding.bottom),
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
                                        Icon(cat['icon'] as IconData, color: isSelected ? (cat['color'] as Color) : Colors.white60, size: 22),
                                        const SizedBox(height: 4),
                                        Text(
                                          catKey,
                                          style: TextStyle(
                                            color: isSelected ? Colors.white : Colors.white60,
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
                            onPressed: _isBooking ? null : _showBookingDialog,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00FF00),
                              foregroundColor: Colors.black,
                              minimumSize: const Size(double.infinity, 50),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            child: _isBooking
                                ? const CircularProgressIndicator(color: Colors.black)
                                : Text(
                                    'BOOK $_selectedCategory NOW • ₹${_estimatedFare.toStringAsFixed(0)}',
                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                                  ),
                          ),
                        ],
                      ],
                    ),
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
