import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';

import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../services/supabase_backend_service.dart';
import 'web_module_screen.dart';
import '../features/profile/services/profile_service.dart';

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
    final loc = await LocationService().getCurrentLocation();
    final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
    final profile = await ProfileService.getCurrentUserProfileDetails();
    if (mounted) {
      setState(() {
        _currentLocation = loc;
        _currentAddress = address;
        _pickupController.text = address;
        if (_nameController.text.isEmpty) _nameController.text = profile['name'] ?? '';
        if (_phoneController.text.isEmpty || _phoneController.text == '+91') {
          final p = profile['phone'] ?? '';
          _phoneController.text = p.isNotEmpty ? '+91$p' : '+91';
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

    final rideId = 'RIDE_${DateTime.now().millisecondsSinceEpoch}';
    final newRide = RideRequest(
      id: rideId,
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
    );

    // Send WhatsApp notification with auto-pinned live GPS location & maps link
    await WhatsAppService.openWhatsApp(phone: '919486335870', message: whatsappMessage);

    setState(() {
      _isBooking = false;
      _activeRideId = rideId; // Set active ride tracking!
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Ride requested for $riderName! WhatsApp booking message sent with live GPS location pin.'),
          backgroundColor: Colors.green.shade800,
        ),
      );
    }
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
                      final upiUri = Uri.parse(
                          "upi://pay?pa=9486335870@hdfcbank&pn=FAGO%20DriveO&am=${ride.estimatedFare.toStringAsFixed(0)}&cu=INR&tn=RideO%20Trip%20Payment");
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
          infoWindow: const InfoWindow(title: 'Dropoff Location'),
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
            icon: const Icon(Icons.language, color: Color(0xFF00FF00)),
            tooltip: 'Open Aishlee-Web RideO',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const WebModuleScreen(title: 'RideO - Aishlee Web Booking', modulePath: 'rideo'),
                ),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(target: initialPos, zoom: 14),
            onMapCreated: (controller) => _mapController = controller,
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
                          if (_isSearchingDropoff)
                            const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.red)),
                        ],
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
            child: _activeRideId != null
                ? _buildActiveRideTrackingSheet()
                : Container(
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
                            onPressed: _isBooking ? null : _showBookingConfirmationDialog,
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
        ],
      ),
    );
  }
}
