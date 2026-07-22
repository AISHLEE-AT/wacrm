import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../services/supabase_backend_service.dart';
import '../features/driver/screens/driver_registration_screen.dart';

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
  bool _isSearching = false;

  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController(text: '+91');

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
    _fetchLiveLocation();
  }

  Future<void> _fetchLiveLocation() async {
    final loc = await LocationService().getCurrentLocation();
    final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
    final nearbyChips = await LocationService().getNearbyLandmarkSuggestions(loc.latitude, loc.longitude);
    if (mounted) {
      setState(() {
        _currentLocation = loc;
        _currentAddress = address;
        _quickLandmarks = nearbyChips;
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

  Future<void> _searchDestination(String query) async {
    if (query.trim().isEmpty) return;

    setState(() => _isSearching = true);
    
    // Add current locality context if available
    String fullQuery = query;
    if (_currentAddress.contains(',')) {
      final parts = _currentAddress.split(',');
      if (parts.length > 1) {
        fullQuery = '$query, ${parts[parts.length - 2]}';
      }
    }

    final searchedLoc = await LocationService().searchAddressCoordinates(fullQuery) ??
        await LocationService().searchAddressCoordinates(query);

    setState(() => _isSearching = false);

    if (searchedLoc != null) {
      _setDestinationCoordinates(searchedLoc.latitude, searchedLoc.longitude, query);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not locate "$query". Tap directly on the map to set pin.')),
        );
      }
    }
  }

  void _setDestinationCoordinates(double lat, double lng, [String? addressLabel]) async {
    setState(() {
      _destinationLocation = Location(latitude: lat, longitude: lng);
      _destinationAddress = addressLabel ?? 'Selected Pin ($lat, $lng)';
    });
    _updateFare();

    _mapController?.animateCamera(
      CameraUpdate.newLatLngZoom(LatLng(lat, lng), 15),
    );

    final resolvedAddress = await LocationService().getAddressFromCoordinates(lat, lng);
    if (mounted) {
      setState(() {
        _destinationAddress = resolvedAddress;
      });
    }
  }

  void _onMapTapped(LatLng target) {
    _setDestinationCoordinates(target.latitude, target.longitude);
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
                  labelText: 'Your WhatsApp Phone Number',
                  hintText: '+919876543210',
                  prefixIcon: const Icon(Icons.phone_android, color: Colors.green),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),

              OutlinedButton.icon(
                onPressed: () {
                  WhatsAppService.openUpiPayment(
                    upiId: 'wacrm@upi',
                    name: 'WACRM RideO Fare',
                    amount: _estimatedFare,
                    note: 'RideO $_selectedCategory Fare',
                  );
                },
                icon: const Icon(Icons.account_balance_wallet, color: Colors.indigo),
                label: Text('Pay ₹${_estimatedFare.toStringAsFixed(0)} via UPI (GPay / PhonePe / Paytm)'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 44),
                  side: const BorderSide(color: Colors.indigo),
                ),
              ),
              const SizedBox(height: 12),

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
                  child: Text('CONFIRM & NOTIFY NEARBY DRIVERS'),
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

    // 1. Save Lead Contact directly to WhatsApp CRM Contacts list for future marketing/follow-up
    await SupabaseBackendService().saveCrmContact(
      name: riderName,
      phone: riderPhone,
      role: 'Rider',
      city: _currentAddress,
      category: _selectedCategory,
    );

    // 2. Create Ride Request
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
          // 💬 Support Chat Button
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline, color: Colors.greenAccent),
            tooltip: 'WhatsApp Support',
            onPressed: () {
              WhatsAppService.openWhatsApp(
                phone: '+919876543210',
                message: 'Hello WACRM Support! I have a question about booking a ride or registering as a driver.',
              );
            },
          ),
          // 🚚 Driver Registration Quick Link
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
            initialCameraPosition: CameraPosition(target: initialPos, zoom: 14),
            onMapCreated: (controller) => _mapController = controller,
            markers: markers,
            onTap: _onMapTapped,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
          ),

          // 🔍 Top Floating Search Bar
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Card(
              elevation: 6,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: Colors.black54),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        textInputAction: TextInputAction.search,
                        onSubmitted: _searchDestination,
                        decoration: const InputDecoration(
                          hintText: 'Search place (e.g. THALA THALAPATHY SALOON)...',
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                    if (_isSearching)
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    else
                      IconButton(
                        icon: const Icon(Icons.arrow_forward, color: Colors.black87),
                        onPressed: () => _searchDestination(_searchController.text),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // 📍 Bottom Card Controls
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
                          _destinationAddress.isEmpty ? 'Search place above or tap map to set pin' : _destinationAddress,
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
                  const SizedBox(height: 8),

                  // Quick Landmark Suggestion Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _quickLandmarks.map((landmark) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ActionChip(
                            avatar: const Icon(Icons.place, size: 14, color: Colors.redAccent),
                            label: Text(landmark, style: const TextStyle(fontSize: 11)),
                            onPressed: () {
                              _searchController.text = landmark;
                              _searchDestination(landmark);
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const Divider(height: 16),

                  SizedBox(
                    height: 75,
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
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                  const SizedBox(height: 10),

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
                          label: const Text('Route Preview (\$0)'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue.shade800,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                  ],

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isBooking
                          ? null
                          : () {
                              if (_destinationLocation == null) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Please select your destination on map or search above.')),
                                );
                                return;
                              }
                              _showBookingConfirmationDialog();
                            },
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
