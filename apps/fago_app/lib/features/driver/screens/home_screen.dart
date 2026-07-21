import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';
import 'dart:async';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import 'dart:math' as math;
import 'package:qr_flutter/qr_flutter.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  bool _isOnline = false;
  Timer? _locationTimer;
  final SupabaseService _supabaseService = SupabaseService();
  StreamSubscription? _ridesSubscription;

  double _pendingCommission = 0;
  double _walletBalance = 0;
  bool _isVerified = false;
  String? _driverId;
  String _driverName = '';
  String? _upiId;
  Map<String, dynamic>? _activeRide;
  List<Map<String, dynamic>> _pendingRides = [];

  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(13.0827, 80.2707),
    zoom: 14.4746,
  );

  @override
  void initState() {
    super.initState();
    _fetchDriverData();
    _determinePosition();
  }

  Future<void> _fetchDriverData() async {
    final firebaseUser = FirebaseAuth.instance.currentUser;
    if (firebaseUser == null) return;

    try {
      // Try by firebase UID first (more reliable before Supabase session)
      var driverData =
          await _supabaseService.getDriverByFirebaseUid(firebaseUser.uid);

      // Fallback to Supabase user_id if available
      if (driverData == null) {
        final supabaseUser = Supabase.instance.client.auth.currentUser;
        if (supabaseUser != null) {
          driverData =
              await _supabaseService.getDriverByUserId(supabaseUser.id);
        }
      }

      if (driverData != null && mounted) {
        setState(() {
          _driverId = driverData!['id']?.toString();
          _driverName = driverData['name'] ?? 'Driver';
          _upiId = driverData['upi_id'];
          _pendingCommission =
              (driverData['pending_commission'] as num?)?.toDouble() ?? 0;
          _walletBalance =
              (driverData['wallet_balance'] as num?)?.toDouble() ?? 0;
          _isVerified = driverData['is_verified'] ?? false;
          _isOnline = driverData['status'] == 'online';
        });
        
        // Subscribe to real-time wallet balance changes
        if (_driverId != null) {
          _supabaseService.subscribeToDriver(_driverId!, (updatedDriver) {
            if (mounted) {
              setState(() {
                if (updatedDriver.containsKey('wallet_balance')) {
                  _walletBalance = (updatedDriver['wallet_balance'] as num?)?.toDouble() ?? _walletBalance;
                }
                if (updatedDriver.containsKey('pending_commission')) {
                  _pendingCommission = (updatedDriver['pending_commission'] as num?)?.toDouble() ?? _pendingCommission;
                }
                if (updatedDriver.containsKey('status')) {
                  _isOnline = updatedDriver['status'] == 'online';
                }
              });
            }
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching driver data: $e");
    }
  }

  void _listenForRides() {
    _supabaseService.subscribeToRides((rideData) {
      if (_isOnline && mounted) {
        setState(() {
          _pendingRides.insert(0, rideData);
        });
      }
    });

    // Also fetch existing pending rides
    _fetchPendingRides();
  }

  Future<void> _fetchPendingRides() async {
    try {
      final rides = await _supabaseService.getPendingRides();
      if (mounted) {
        setState(() => _pendingRides = rides);
      }
    } catch (e) {
      debugPrint("Error fetching pending rides: $e");
    }
  }

  Future<void> _acceptRide(Map<String, dynamic> ride) async {
    if (_pendingCommission > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Cannot accept ride. Clear pending commission: ₹${_pendingCommission.toStringAsFixed(0)}'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    if (_driverId == null) return;

    try {
      final result = await _supabaseService.acceptRide(
        ride['id'].toString(),
        _driverId!,
      );
      if (result != null && mounted) {
        setState(() {
          _activeRide = ride;
          _pendingRides.removeWhere(
              (r) => r['id'].toString() == ride['id'].toString());
        });
        _showActiveRideSheet();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to accept: $e')),
        );
      }
    }
  }

  void _showActiveRideSheet() {
    if (_activeRide == null) return;
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.directions,
                        color: Colors.green, size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Text(
                    'Ride in Progress',
                    style: TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.phone, color: Colors.green),
                    onPressed: () => launchUrl(Uri.parse('tel:${_activeRide!['passenger_phone'] ?? ''}')),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FA),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildRideDetailRow(Icons.location_on, Colors.green,
                        'Pickup', _activeRide!['pickup_address'] ?? 'N/A'),
                    const Divider(height: 20),
                    _buildRideDetailRow(
                        Icons.flag,
                        Colors.red,
                        'Drop-off',
                        _activeRide!['dropoff_address'] ?? 'N/A'),
                    const Divider(height: 20),
                    Row(
                      children: [
                        const Icon(Icons.currency_rupee,
                            color: Color(0xFFFF8C00), size: 18),
                        const SizedBox(width: 8),
                        Text(
                          '₹${_activeRide!['estimated_price'] ?? 0}',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFFF8C00),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    final lat = _activeRide!['pickup_lat'];
                    final lng = _activeRide!['pickup_lng'];
                    if (lat != null && lng != null) {
                      launchUrl(Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving'), mode: LaunchMode.externalApplication);
                    }
                  },
                  icon: const Icon(Icons.location_on),
                  label: const Text(
                    'Navigate to Pickup',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    final lat = _activeRide!['dropoff_lat'];
                    final lng = _activeRide!['dropoff_lng'];
                    if (lat != null && lng != null) {
                      launchUrl(Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving'), mode: LaunchMode.externalApplication);
                    }
                  },
                  icon: const Icon(Icons.navigation),
                  label: const Text(
                    'Start Live Navigation',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _showPaymentDialog();
                  },
                  icon: const Icon(Icons.qr_code_2),
                  label: const Text(
                    'Collect Payment (UPI)',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRideDetailRow(
      IconData icon, Color color, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style:
                      const TextStyle(fontSize: 12, color: Color(0xFF999999))),
              Text(value,
                  style: const TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    );
  }

  void _showPaymentDialog() {
    if (_activeRide == null) return;
    final amount = _activeRide!['estimated_price'] ?? 0;
    // Fallback to Admin UPI if driver didn't provide one
    final targetUpiId = (_upiId != null && _upiId!.trim().isNotEmpty) ? _upiId : 'admin@upi';
    final upiUrl = 'upi://pay?pa=$targetUpiId&pn=${Uri.encodeComponent(_driverName)}&am=$amount&cu=INR';

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Collect Payment', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Ask rider to scan this QR to pay ₹$amount', textAlign: TextAlign.center),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: QrImageView(
                  data: upiUrl,
                  version: QrVersions.auto,
                  size: 200.0,
                ),
              ),
              const SizedBox(height: 12),
              Text('UPI ID: $targetUpiId', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _showActiveRideSheet(); // Go back to ride sheet
              },
              child: const Text('Back', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(context);
                await _completeRide();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Verify Payment & Complete', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _completeRide() async {
    if (_activeRide == null || _driverId == null) return;

    final rideId = _activeRide!['id'].toString();

    try {
      await _supabaseService.completeRide(
        rideId,
        _driverId!,
      );

      setState(() => _activeRide = null);
      await _fetchDriverData();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Ride Completed!'),
            backgroundColor: Colors.green,
          ),
        );
        
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) {
            return AlertDialog(
              title: const Text('Rate Passenger'),
              content: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: const Icon(Icons.star_border, color: Colors.orange, size: 32),
                    onPressed: () async {
                      Navigator.pop(context);
                      await _supabaseService.submitRating(rideId, index + 1, 'driver');
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thanks for rating!')));
                      }
                    },
                  );
                }),
              ),
            );
          }
        );
      }
    } catch (e) {
      debugPrint('Error completing ride: $e');
    }
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
    if (permission == LocationPermission.deniedForever) return;

    Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    setState(() => _currentPosition = position);
    _mapController?.animateCamera(CameraUpdate.newCameraPosition(
      CameraPosition(
          target: LatLng(position.latitude, position.longitude), zoom: 15),
    ));
  }

  void _toggleOnlineStatus() {
    if (!_isOnline && _pendingCommission > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'Cannot go online. Clear pending commission: ₹${_pendingCommission.toStringAsFixed(0)}'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final newStatus = !_isOnline;
    setState(() => _isOnline = newStatus);

    if (_driverId != null) {
      _supabaseService.toggleStatus(
          _driverId!, newStatus ? 'online' : 'offline');
    }

    if (newStatus) {
      _listenForRides();
      // Start location updates
      _startLocationUpdates();
    } else {
      _supabaseService.dispose();
      _locationTimer?.cancel();
      setState(() => _pendingRides.clear());
    }
  }

  void _startLocationUpdates() {
    _locationTimer?.cancel();
    _locationTimer = Timer.periodic(const Duration(seconds: 15), (_) async {
      if (_currentPosition != null && _driverId != null) {
        await _supabaseService.updateLocation(
          _driverId!,
          _currentPosition!.latitude,
          _currentPosition!.longitude,
        );
      }
    });
  }

  @override
  void dispose() {
    _locationTimer?.cancel();
    _ridesSubscription?.cancel();
    _supabaseService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: Column(
        children: [
          // Top bar with wallet and status
          Container(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 8,
              bottom: 16,
              left: 20,
              right: 20,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFFF8C00), Color(0xFFFFA040)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              children: [
                // Title row
                Row(
                  children: [
                    const Icon(Icons.local_taxi,
                        color: Colors.white, size: 26),
                    const SizedBox(width: 10),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DrivO Dashboard',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    if (!_isVerified)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.redAccent,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('Pending Verification', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    const Spacer(),
                    TextButton(
                      onPressed: () => context.pushReplacement('/rider'),
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: const Size(0, 30),
                      ),
                      child: const Text('Switch to Rider', style: TextStyle(fontSize: 12)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _isOnline
                            ? Colors.green
                            : Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _isOnline
                                  ? Colors.white
                                  : Colors.white70,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _isOnline ? 'ONLINE' : 'OFFLINE',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                // Wallet balance card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                            Icons.account_balance_wallet,
                            color: Colors.white,
                            size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Wallet Balance',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.85),
                                fontSize: 13,
                              ),
                            ),
                            Text(
                              '₹${_walletBalance.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (_pendingCommission > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '₹${_pendingCommission.toStringAsFixed(0)} due',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      if (_pendingCommission > 0)
                        const SizedBox(width: 8),
                      if (_pendingCommission > 0)
                        ElevatedButton(
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: const Text('Pay Commissions'),
                                content: Text('Please pay your pending commission of ₹${_pendingCommission.toStringAsFixed(0)} via UPI to:\n\n9486335870@hdfcbank\n\nAfter payment, admin will update your balance.'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context),
                                    child: const Text('OK'),
                                  )
                                ],
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.red,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                            minimumSize: const Size(0, 30),
                          ),
                          child: const Text('PAY NOW', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Commission warning bar
          if (_pendingCommission > 0)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                  horizontal: 20, vertical: 10),
              color: Colors.red.shade50,
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: Colors.red, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Pending commission: ₹${_pendingCommission.toStringAsFixed(0)}. Clear to go online.',
                      style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.w500,
                          fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),

          // Map + overlays
          Expanded(
            child: Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: _initialPosition,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  onMapCreated: (GoogleMapController controller) {
                    _mapController = controller;
                  },
                ),

                // Offline overlay
                if (!_isOnline && _activeRide == null)
                  Container(
                    color: Colors.black.withValues(alpha: 0.55),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.power_settings_new,
                                color: Colors.white, size: 48),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'You are offline',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Go online to receive ride requests',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.7),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Pending rides list overlay
                if (_isOnline && _pendingRides.isNotEmpty)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      constraints: BoxConstraints(
                        maxHeight:
                            MediaQuery.of(context).size.height * 0.4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(20)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 10,
                            offset: const Offset(0, -4),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFF8C00)
                                        .withValues(alpha: 0.1),
                                    borderRadius:
                                        BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.notifications_active,
                                      color: Color(0xFFFF8C00),
                                      size: 18),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  'Pending Rides (${_pendingRides.length})',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Flexible(
                            child: ListView.builder(
                              shrinkWrap: true,
                              padding: const EdgeInsets.only(bottom: 16),
                              itemCount: _pendingRides.length,
                              itemBuilder: (context, index) {
                                final ride = _pendingRides[index];
                                return _buildRideCard(ride);
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // GO ONLINE / GO OFFLINE button
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              bottom: MediaQuery.of(context).padding.bottom + 12,
              top: 12,
            ),
            color: Colors.white,
            child: SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: _toggleOnlineStatus,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isOnline
                      ? Colors.red.shade600
                      : const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 2,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _isOnline
                          ? Icons.power_settings_new
                          : Icons.play_arrow_rounded,
                      size: 24,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      _isOnline ? 'GO OFFLINE' : 'GO ONLINE',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRideCard(Map<String, dynamic> ride) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8E8E8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.location_on,
                    color: Colors.green, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    ride['pickup_address'] ?? 'Unknown pickup',
                    style: const TextStyle(fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.flag, color: Colors.red, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    ride['dropoff_address'] ?? 'Unknown dropoff',
                    style: const TextStyle(fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Text(
                  '₹${ride['estimated_price'] ?? 0}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFFF8C00),
                  ),
                ),
                const Spacer(),
                SizedBox(
                  height: 38,
                  child: ElevatedButton(
                    onPressed: () => _acceptRide(ride),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20),
                    ),
                    child: const Text(
                      'ACCEPT',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
