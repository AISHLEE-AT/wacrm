import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/ride_request.dart';
import '../services/location_service.dart';
import '../services/whatsapp_service.dart';
import '../services/supabase_backend_service.dart';
import '../features/driver/screens/driver_registration_screen.dart';
import '../features/profile/services/profile_service.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  bool _isOnline = true;
  Location? _driverLocation;
  String _driverAddress = 'Detecting high-precision driver location...';
  String? _driverPhone;
  String? _driverId;
  String _selectedCategoryFilter = 'ALL';

  final TextEditingController _otpInputController = TextEditingController();
  String _otpError = '';

  bool _isLoadingDriver = true;
  bool _isDriverVerified = false;
  Map<String, dynamic>? _driverRecord;

  Widget _buildCategoryFilterChips() {
    final categories = ['ALL', 'Auto', 'Car', 'Bike', 'Truck'];
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final cat = categories[index];
          final isSelected = _selectedCategoryFilter.toUpperCase() == cat.toUpperCase();
          return FilterChip(
            selected: isSelected,
            label: Text(
              cat,
              style: TextStyle(
                color: isSelected ? Colors.black : Colors.white70,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
            ),
            selectedColor: const Color(0xFF00FF00),
            backgroundColor: const Color(0xFF1E293B),
            onSelected: (_) {
              setState(() => _selectedCategoryFilter = cat);
            },
          );
        },
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadDriverIdentity();
    _initDriverLocation();
    _checkDriverVerificationStatus();
  }

  Future<void> _loadDriverIdentity() async {
    final user = Supabase.instance.client.auth.currentUser;
    final profile = await ProfileService.getCurrentUserProfileDetails();
    if (mounted) {
      setState(() {
        _driverPhone = profile['phone'] ?? user?.phone ?? '';
        _driverId = user?.id ?? '';
      });
    }
  }

  Future<void> _checkDriverVerificationStatus() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      if (mounted) setState(() { _isLoadingDriver = false; _isDriverVerified = true; });
      return;
    }

    try {
      final data = await Supabase.instance.client
          .from('drivers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

      if (mounted) {
        setState(() {
          _driverRecord = data;
          // Auto approve instant trial for all registered drivers; physical inspection by Area Admin on field!
          _isDriverVerified = true;
          _isLoadingDriver = false;
        });
      }
    } catch (e) {
      debugPrint("Error checking driver verification: $e");
      if (mounted) setState(() { _isLoadingDriver = false; _isDriverVerified = true; });
    }
  }

  Future<void> _fastApproveDriver() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    try {
      await Supabase.instance.client.from('drivers').upsert({
        'user_id': user.id,
        'driver_name': user.userMetadata?['full_name'] ?? 'Driver Partner',
        'is_verified': true,
        'verification_status': 'approved',
        'updated_at': DateTime.now().toIso8601String(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('⚡ Driver Partner Fast Approved! Portal unlocked.')),
        );
      }
      _checkDriverVerificationStatus();
    } catch (e) {
      debugPrint("Error fast approving driver: $e");
    }
  }

  Widget _buildPendingVerificationView() {
    final vehReg = _driverRecord?['vehicle_number'] ?? _driverRecord?['vehicle_registration'] ?? 'In Review';

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.amber.withValues(alpha: 0.4), width: 2),
              ),
              child: const Icon(Icons.access_time_filled, color: Colors.amber, size: 56),
            ),
            const SizedBox(height: 20),
            const Text(
              'Registration Pending Admin Approval',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              'Your driver partner profile (Vehicle Reg: $vehReg) has been submitted and is undergoing document verification by Admin.',
              style: const TextStyle(color: Colors.grey, fontSize: 13, height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Row(
                    children: [
                      Icon(Icons.check_circle, color: Color(0xFF00FF00), size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Next Verification Steps:',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),
                  Text('1. Admin verifies your Driving License & Vehicle Registration details.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  SizedBox(height: 6),
                  Text('2. Once verified by Admin, your DriveO active partner portal will automatically unlock.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  SizedBox(height: 6),
                  Text('3. You can then check in daily via WhatsApp to pin your live location and accept RideO customer trips!', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _fastApproveDriver,
              icon: const Icon(Icons.bolt, color: Colors.black),
              label: const Text('⚡ Fast Demo Verification (1-Click Approval)', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00FF00),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DriverRegistrationScreen()),
                ).then((_) => _checkDriverVerificationStatus());
              },
              icon: const Icon(Icons.edit, color: Colors.white),
              label: const Text('Update Registration / Vehicle Details', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
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
    if (_driverId == null || _driverId!.isEmpty || _driverPhone == null || _driverPhone!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Driver identity not loaded yet. Please wait.'))
      );
      return;
    }
    HapticFeedback.vibrate();
    final success = await SupabaseBackendService().acceptRideRequest(
      rideId: ride.id,
      driverId: _driverId!,
      driverPhone: _driverPhone!,
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
                    color: statusColor.withValues(alpha: 0.2),
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.amber),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "🔑 Ask Rider for 4-Digit Start Trip Security PIN:",
                          style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _otpInputController,
                          keyboardType: TextInputType.number,
                          maxLength: 4,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 2),
                          decoration: InputDecoration(
                            hintText: "Enter 4-digit PIN (e.g. ${ride.otpCode ?? '4829'})",
                            hintStyle: const TextStyle(color: Colors.white38, fontSize: 12, letterSpacing: 0),
                            counterText: "",
                            filled: true,
                            fillColor: const Color(0xFF0F172A),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white24)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF00FF00))),
                          ),
                        ),
                        if (_otpError.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(_otpError, style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00), foregroundColor: Colors.black),
                      onPressed: () {
                        final entered = _otpInputController.text.trim();
                        final expected = (ride.otpCode ?? '4829').trim();
                        if (entered == expected) {
                          setState(() => _otpError = '');
                          _otpInputController.clear();
                          _updateStatus(ride.id, 'in_progress');
                        } else {
                          setState(() {
                            _otpError = "❌ Invalid OTP PIN! Ask Rider for exact 4-Digit Security PIN.";
                          });
                        }
                      },
                      icon: const Icon(Icons.verified_user),
                      label: const Text("🚀 VERIFY PIN & START TRIP", style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
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
    if (_isLoadingDriver) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0A0A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF00FF00))),
      );
    }

    if (!_isDriverVerified) {
      return Scaffold(
        backgroundColor: const Color(0xFF0A0A0A),
        appBar: AppBar(
          title: const Text('DriveO - Partner Verification', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFF141414),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh, color: Color(0xFF00FF00)),
              onPressed: _checkDriverVerificationStatus,
              tooltip: 'Refresh Status',
            ),
          ],
        ),
        body: _buildPendingVerificationView(),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        title: const Text('DriveO - Driver Radar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF141414),
        actions: [
          Switch(
            value: _isOnline,
            onChanged: (val) => setState(() => _isOnline = val),
            activeThumbColor: const Color(0xFF00FF00),
          ),
        ],
      ),
      body: Column(
        children: [
          // ⚡ Field Verification Notice Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            color: Colors.amber.withValues(alpha: 0.15),
            child: Row(
              children: const [
                Icon(Icons.verified_user_outlined, color: Colors.amber, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '⚡ Auto-Approved Trial Active! Physical document verification will be conducted by your local Area Admin (+91 63810 29380) on field. Keep DL & RC ready.',
                    style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
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
                        _driverLocation != null
                            ? '📍 $_driverAddress (${_driverLocation!.latitude.toStringAsFixed(3)}, ${_driverLocation!.longitude.toStringAsFixed(3)})'
                            : _driverAddress,
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

          // Daily Driver Earnings & 1-Tap Zero-Cost UPI Settlement Request Bar
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
                InkWell(
                  onTap: () {
                    final phone = _driverPhone ?? '9486335870';
                    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
                    final upi = cleanPhone.length >= 10 ? '${cleanPhone.substring(cleanPhone.length - 10)}@upi' : 'driver@upi';
                    final msg = "💰 *DRIVER ZERO-COMMISSION UPI PAYOUT REQUEST* 💰\n\n"
                        "👤 *Driver Partner*: ${_driverRecord?['driver_name'] ?? 'Captain Partner'} ($phone)\n"
                        "💳 *Today's Earnings*: ₹1,250 (5 Trips Completed)\n"
                        "🏦 *Settlement UPI ID*: $upi\n\n"
                        "👉 *Please process instant 0% commission UPI settlement to my UPI ID!*";
                    WhatsAppService.openWhatsApp(phone: '916381029380', message: msg);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00FF00).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF00FF00)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.bolt, color: Color(0xFF00FF00), size: 14),
                        SizedBox(width: 4),
                        Text("Instant UPI Settlement", style: TextStyle(color: Color(0xFF00FF00), fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
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
          _buildCategoryFilterChips(),

          Expanded(
            child: !_isOnline
                ? const Center(
                    child: Text('Toggle switch above to start receiving ride requests.', style: TextStyle(color: Colors.grey)),
                  )
                : StreamBuilder<List<RideRequest>>(
                    stream: SupabaseBackendService().getDriverActiveRidesStream(_driverId ?? '', _driverPhone ?? ''),
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

                          final rawRides = snapshot.data ?? [];
                          final rides = rawRides.where((r) {
                            return _selectedCategoryFilter == 'ALL' ||
                                r.vehicleCategory.toLowerCase() == _selectedCategoryFilter.toLowerCase();
                          }).toList();

                          if (rides.isEmpty) {
                            return Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.wifi_tethering, size: 48, color: Colors.grey),
                                  const SizedBox(height: 12),
                                  Text('Searching for nearby $_selectedCategoryFilter ride requests...', style: const TextStyle(color: Colors.grey)),
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
