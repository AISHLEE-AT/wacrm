import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../services/supabase_backend_service.dart';
import '../features/driver/screens/driver_registration_screen.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({Key? key}) : super(key: key);

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  bool _isOnline = true;
  Location? _driverLocation;
  String _driverAddress = 'Detecting high-precision driver location...';
  final String _driverPhone = '+919486335870';
  final String _driverId = 'DRIVER_007';

  @override
  void initState() {
    super.initState();
    _initDriverLocation();
  }

  Future<void> _initDriverLocation() async {
    final loc = await LocationService().getCurrentLocation();
    final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
    if (mounted) {
      setState(() {
        _driverLocation = loc;
        _driverAddress = address;
      });
    }
  }

  Future<void> _acceptRide(RideRequest ride) async {
    HapticFeedback.vibrate();
    final success = await SupabaseBackendService().acceptRideRequest(
      rideId: ride.id,
      driverId: _driverId,
      driverPhone: _driverPhone,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Accepted ride for ${ride.vehicleCategory}! Contacting rider via WhatsApp...')),
      );

      // Connect with rider on WhatsApp
      WhatsAppService.openWhatsApp(
        phone: ride.riderPhone,
        message: 'Hello! I am your ${ride.vehicleCategory} driver on DriveO. I have accepted your ride from ${ride.pickupAddress} to ${ride.dropoffAddress}. Estimated fare: ₹${ride.estimatedFare.toStringAsFixed(0)}. I am on my way!',
      );
    }
  }

  Future<void> _updateStatus(String rideId, String newStatus) async {
    HapticFeedback.vibrate();
    await SupabaseBackendService().updateRideStatus(rideId: rideId, status: newStatus);
  }

  void _openGoogleMapsNav(double lat, double lng) async {
    final Uri url = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=$lat,$lng");
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  Widget _buildActiveTripCard(RideRequest ride) {
    String statusLabel = "Accepted (On the way)";
    Color statusColor = Colors.orange;
    if (ride.status == RideStatus.arrived) {
      statusLabel = "Arrived at Pickup";
      statusColor = Colors.blue;
    } else if (ride.status == RideStatus.inProgress) {
      statusLabel = "Trip in Progress";
      statusColor = Colors.green;
    }

    return Card(
      margin: const EdgeInsets.all(16),
      color: const Color(0xFF1E1E1E),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: statusColor, width: 2)),
      elevation: 8,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    "🚨 ACTIVE RIDE: $statusLabel",
                    style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
                Text(
                  "₹${ride.estimatedFare.toStringAsFixed(0)}",
                  style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.w900, fontSize: 22),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Rider Info
            Row(
              children: [
                const Icon(Icons.person, color: Colors.white70, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text("Rider: ${ride.riderPhone}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ),
                IconButton(
                  onPressed: () => WhatsAppService.openWhatsApp(phone: ride.riderPhone, message: "Hi, I am your driver!"),
                  icon: const Icon(Icons.chat, color: Color(0xFF25D366)),
                ),
                IconButton(
                  onPressed: () async {
                    final clean = ride.riderPhone.replaceAll(RegExp(r'\D'), '');
                    final url = Uri.parse("tel:+$clean");
                    if (await canLaunchUrl(url)) await launchUrl(url);
                  },
                  icon: const Icon(Icons.phone, color: Colors.blueAccent),
                ),
              ],
            ),
            const Divider(color: Colors.white24, height: 20),

            // Pickup
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.circle, color: Colors.greenAccent, size: 14),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("PICKUP LOCATION", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                      Text(ride.pickupAddress, style: const TextStyle(color: Colors.white, fontSize: 13)),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green.shade800, foregroundColor: Colors.white),
                  onPressed: () => _openGoogleMapsNav(ride.pickupLocation.latitude, ride.pickupLocation.longitude),
                  icon: const Icon(Icons.navigation, size: 14),
                  label: const Text("Nav Pickup", style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Dropoff
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.location_on, color: Colors.redAccent, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("DROPOFF LOCATION", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                      Text(ride.dropoffAddress, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue.shade800, foregroundColor: Colors.white),
                  onPressed: () => _openGoogleMapsNav(ride.dropoffLocation.latitude, ride.dropoffLocation.longitude),
                  icon: const Icon(Icons.navigation, size: 14),
                  label: const Text("Nav Dropoff", style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Driver Action Stepper Buttons
            if (ride.status == RideStatus.accepted)
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, foregroundColor: Colors.white),
                  onPressed: () => _updateStatus(ride.id, 'arrived'),
                  icon: const Icon(Icons.location_city),
                  label: const Text("📍 MARK ARRIVED AT PICKUP", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),

            if (ride.status == RideStatus.arrived)
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00), foregroundColor: Colors.black),
                  onPressed: () => _updateStatus(ride.id, 'in_progress'),
                  icon: const Icon(Icons.play_arrow),
                  label: const Text("🚀 START TRIP (Rider Onboard)", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),

            if (ride.status == RideStatus.inProgress)
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.purpleAccent, foregroundColor: Colors.white),
                  onPressed: () => _updateStatus(ride.id, 'completed'),
                  icon: const Icon(Icons.check_circle_outline),
                  label: Text("🏁 COMPLETE RIDE & COLLECT ₹${ride.estimatedFare.toStringAsFixed(0)}", style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        title: const Text('DriveO - Driver Radar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF141414),
        actions: [
          Switch(
            value: _isOnline,
            onChanged: (val) => setState(() => _isOnline = val),
            activeColor: const Color(0xFF00FF00),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: _isOnline ? const Color(0xFF1B2E1E) : const Color(0xFF222222),
            child: Row(
              children: [
                Icon(
                  _isOnline ? Icons.radar : Icons.power_settings_new,
                  color: _isOnline ? const Color(0xFF00FF00) : Colors.grey,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isOnline ? 'Driver Online - Radar Active' : 'Driver Offline',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                      ),
                      Text(
                        _driverAddress,
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Daily Driver Earnings & Trips Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF141414),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.account_balance_wallet, color: Color(0xFF00FF00), size: 18),
                    SizedBox(width: 6),
                    Text("Today's Earnings: ", style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text("₹1,250", style: TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white10,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text("5 Trips Completed", style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

          if (Supabase.instance.client.auth.currentUser == null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: Colors.amber.shade900,
              child: Row(
                children: [
                  const Icon(Icons.shield, color: Colors.white, size: 24),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Driver Auth & Registration', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                        Text('Authenticate your driver account to accept rides.', style: TextStyle(fontSize: 11, color: Colors.white70)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const DriverRegistrationScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    ),
                    child: const Text('REGISTER', style: TextStyle(fontSize: 11)),
                  ),
                ],
              ),
            ),

          Expanded(
            child: !_isOnline
                ? const Center(
                    child: Text('Toggle switch above to start receiving ride requests.', style: TextStyle(color: Colors.grey)),
                  )
                : StreamBuilder<List<RideRequest>>(
                    stream: SupabaseBackendService().getDriverActiveRidesStream(_driverId, _driverPhone),
                    builder: (context, activeSnapshot) {
                      final activeRides = activeSnapshot.data ?? [];
                      if (activeRides.isNotEmpty) {
                        // Driver has an ACTIVE accepted ride! Show Active Trip view!
                        return SingleChildScrollView(
                          child: _buildActiveTripCard(activeRides.first),
                        );
                      }

                      // Otherwise, show stream of available requested rides
                      return StreamBuilder<List<RideRequest>>(
                        stream: SupabaseBackendService().getAvailableRidesStream(),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState == ConnectionState.waiting) {
                            return const Center(child: CircularProgressIndicator(color: Color(0xFF00FF00)));
                          }

                          final rides = snapshot.data ?? [];
                          if (rides.isEmpty) {
                            return const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.wifi_tethering, size: 48, color: Colors.grey),
                                  SizedBox(height: 12),
                                  Text('Searching for nearby ride requests...', style: TextStyle(color: Colors.grey)),
                                ],
                              ),
                            );
                          }

                          return ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: rides.length,
                            itemBuilder: (context, index) {
                              final ride = rides[index];
                              return Card(
                                color: const Color(0xFF1E1E1E),
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 3,
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Chip(
                                            label: Text(
                                              ride.vehicleCategory,
                                              style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                                            ),
                                            backgroundColor: const Color(0xFF00FF00),
                                          ),
                                          Text(
                                            '₹${ride.estimatedFare.toStringAsFixed(0)}',
                                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF00FF00)),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Icon(Icons.circle, color: Colors.greenAccent, size: 12),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text('Pickup: ${ride.pickupAddress}', style: const TextStyle(fontSize: 13, color: Colors.white)),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          const Icon(Icons.location_on, color: Colors.redAccent, size: 14),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text('Dropoff: ${ride.dropoffAddress}', style: const TextStyle(fontSize: 13, color: Colors.white)),
                                          ),
                                        ],
                                      ),
                                      const Divider(height: 20, color: Colors.white24),

                                      Row(
                                        children: [
                                          Expanded(
                                            child: OutlinedButton.icon(
                                              onPressed: () => _openGoogleMapsNav(ride.pickupLocation.latitude, ride.pickupLocation.longitude),
                                              icon: const Icon(Icons.navigation, size: 16),
                                              label: const Text('Nav to Pickup'),
                                              style: OutlinedButton.styleFrom(foregroundColor: Colors.white),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: ElevatedButton.icon(
                                              onPressed: () => _acceptRide(ride),
                                              icon: const Icon(Icons.check_circle, size: 16),
                                              label: const Text('ACCEPT RIDE'),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: const Color(0xFF00FF00),
                                                foregroundColor: Colors.black,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
