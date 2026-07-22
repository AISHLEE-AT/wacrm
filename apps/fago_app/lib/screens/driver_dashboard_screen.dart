import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
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
  final String _driverPhone = '+919876543211';

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
      driverId: 'DRIVER_007',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('DriveO - Driver Radar'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          Switch(
            value: _isOnline,
            onChanged: (val) => setState(() => _isOnline = val),
            activeColor: Colors.greenAccent,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: _isOnline ? Colors.green.shade50 : Colors.grey.shade200,
            child: Row(
              children: [
                Icon(
                  _isOnline ? Icons.radar : Icons.power_settings_new,
                  color: _isOnline ? Colors.green : Colors.grey,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isOnline ? 'Driver Online - Radar Active' : 'Driver Offline',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        _driverAddress,
                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (Supabase.instance.client.auth.currentUser == null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: Colors.amber.shade100,
              child: Row(
                children: [
                  const Icon(Icons.shield, color: Colors.brown, size: 24),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Driver Auth & Vehicle Registration', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('Authenticate your driver account to accept rides.', style: TextStyle(fontSize: 11)),
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
                    child: Text('Toggle switch above to start receiving ride requests.'),
                  )
                : StreamBuilder<List<RideRequest>>(
                    stream: SupabaseBackendService().getAvailableRidesStream(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      final rides = snapshot.data ?? [];
                      if (rides.isEmpty) {
                        return const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.wifi_tethering, size: 48, color: Colors.grey),
                              SizedBox(height: 12),
                              Text('Searching for nearby ride requests...'),
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
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                        ),
                                        backgroundColor: Colors.black,
                                      ),
                                      Text(
                                        '₹${ride.estimatedFare.toStringAsFixed(0)}',
                                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.circle, color: Colors.green, size: 12),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text('Pickup: ${ride.pickupAddress}', style: const TextStyle(fontSize: 13)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, color: Colors.red, size: 14),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text('Dropoff: ${ride.dropoffAddress}', style: const TextStyle(fontSize: 13)),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 20),

                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton.icon(
                                          onPressed: () {
                                            WhatsAppService.openGoogleMapsApp(
                                              destinationLat: ride.pickupLocation.latitude,
                                              destinationLng: ride.pickupLocation.longitude,
                                              originLat: _driverLocation?.latitude,
                                              originLng: _driverLocation?.longitude,
                                            );
                                          },
                                          icon: const Icon(Icons.navigation, size: 16),
                                          label: const Text('Nav to Pickup (\$0)'),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          onPressed: () => _acceptRide(ride),
                                          icon: const Icon(Icons.check_circle, size: 16),
                                          label: const Text('ACCEPT RIDE'),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.green.shade800,
                                            foregroundColor: Colors.white,
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
                  ),
          ),
        ],
      ),
    );
  }
}
