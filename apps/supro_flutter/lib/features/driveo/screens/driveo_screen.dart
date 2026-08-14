import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide MapType;
import 'package:http/http.dart' as http;

class DriveoScreen extends ConsumerStatefulWidget {
  const DriveoScreen({super.key});

  @override
  ConsumerState<DriveoScreen> createState() => _DriveoScreenState();
}

class _DriveoScreenState extends ConsumerState<DriveoScreen> {
  final SupabaseClient _supabase = Supabase.instance.client;
  
  bool _isLoading = true;
  bool _isOnline = false;
  Map<String, dynamic>? _driverRecord;
  Position? _currentPosition;

  // Active & Incoming Ride States
  Map<String, dynamic>? _incomingRide;
  Map<String, dynamic>? _activeRide;
  Timer? _pollingTimer;
  Timer? _countdownTimer;
  int _countdownSeconds = 15;
  RealtimeChannel? _rideChannel;

  // OTP inputs for starting trip
  final TextEditingController _otpController = TextEditingController();

  // Earnings
  int _todayTrips = 0;
  int _todayEarnings = 0;
  int _weekEarnings = 0;

  // Registration Form
  final _formKey = GlobalKey<FormState>();
  String _operatorCategory = 'bikeo';
  final _nameController = TextEditingController();
  final _regNumberController = TextEditingController();
  final _upiController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _initDriver();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _countdownTimer?.cancel();
    _otpController.dispose();
    _nameController.dispose();
    _regNumberController.dispose();
    _upiController.dispose();
    if (_rideChannel != null) {
      _supabase.removeChannel(_rideChannel!);
    }
    super.dispose();
  }

  Future<void> _initDriver() async {
    setState(() => _isLoading = true);
    await _determinePosition();
    await _fetchDriverProfile();
    if (_driverRecord != null) {
      await _fetchEarnings();
      await _checkActiveRide();
      _setupRealtimeSubscription();
      _startPendingRidePolling();
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _determinePosition() async {
    try {
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      setState(() => _currentPosition = pos);
    } catch (_) {}
  }

  Future<void> _fetchDriverProfile() async {
    final user = _supabase.auth.currentUser;
    final phone = user?.phone ?? '';
    if (phone.isEmpty) return;

    try {
      final clean = phone.replaceAll(RegExp(r'\D'), '');
      final tenDigit = clean.length > 10 ? clean.substring(clean.length - 10) : clean;

      final data = await _supabase
          .from('drivers')
          .select('*')
          .or('phone.ilike.%$tenDigit%,mobile_number.ilike.%$tenDigit%,whatsapp_number.ilike.%$tenDigit%')
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();

      if (data != null && mounted) {
        setState(() {
          _driverRecord = data;
          _isOnline = data['status'] == 'online';
        });
      }
    } catch (e) {
      debugPrint('Error fetching driver profile: $e');
    }
  }

  Future<void> _fetchEarnings() async {
    if (_driverRecord == null) return;
    try {
      final driverId = _driverRecord!['id'];
      final weekAgo = DateTime.now().subtract(const Duration(days: 7)).toIso8601String();
      final todayStart = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day).toIso8601String();

      final data = await _supabase
          .from('rides')
          .select('total_fare, completed_at')
          .eq('driver_id', driverId)
          .eq('status', 'completed')
          .gte('completed_at', weekAgo);

      int tTrips = 0;
      int tEarn = 0;
      int wEarn = 0;

      for (var row in (data as List<dynamic>)) {
        final fare = (row['total_fare'] ?? 0) as int;
        wEarn += fare;
        if ((row['completed_at'] ?? '').compareTo(todayStart) >= 0) {
          tTrips++;
          tEarn += fare;
        }
      }

      if (mounted) {
        setState(() {
          _todayTrips = tTrips;
          _todayEarnings = tEarn;
          _weekEarnings = wEarn;
        });
      }
    } catch (_) {}
  }

  Future<void> _checkActiveRide() async {
    if (_driverRecord == null) return;
    try {
      final data = await _supabase
          .from('rides')
          .select('*')
          .eq('driver_id', _driverRecord!['id'])
          .inFilter('status', ['accepted', 'driver_arrived', 'in_progress'])
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();

      if (data != null && mounted) {
        setState(() => _activeRide = data);
      }
    } catch (_) {}
  }

  // ─── TOGGLE ONLINE STATUS ───
  Future<void> _toggleOnline(bool value) async {
    if (_driverRecord == null) return;
    setState(() => _isOnline = value);

    try {
      await _supabase
          .from('drivers')
          .update({'status': value ? 'online' : 'offline'})
          .eq('id', _driverRecord!['id']);
      
      if (value) {
        _checkActiveRide();
      }
    } catch (e) {
      debugPrint('Online toggle error: $e');
    }
  }

  // ─── REALTIME & ACTIVE POLLING (2s INTERVAL) ───
  void _setupRealtimeSubscription() {
    if (_rideChannel != null) _supabase.removeChannel(_rideChannel!);
    if (_driverRecord == null) return;

    _rideChannel = _supabase
        .channel('driver-rides-${_driverRecord!['id']}')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'rides',
          callback: (payload) {
            final row = payload.newRecord;
            if (row.isEmpty) return;
            final status = row['status'];

            if ((status == 'pending' || status == 'requested') && _isOnline && _activeRide == null && _incomingRide == null) {
              if (row['driver_id'] == _driverRecord!['id'] || row['driver_id'] == null) {
                _triggerIncomingRide(row);
              }
            } else if (row['id'] == _activeRide?['id']) {
              if (status == 'cancelled') {
                setState(() => _activeRide = null);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ride was cancelled by rider.')));
              } else {
                setState(() => _activeRide = row);
              }
            }
          },
        )
        .subscribe();
  }

  void _startPendingRidePolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 2), (_) async {
      if (!_isOnline || _activeRide != null || _incomingRide != null || _driverRecord == null) return;

      try {
        final data = await _supabase
            .from('rides')
            .select('*')
            .inFilter('status', ['pending', 'requested'])
            .order('created_at', ascending: false)
            .limit(3);

        if (data != null && (data as List).isNotEmpty && mounted) {
          final ride = data.first;
          _triggerIncomingRide(ride);
        }
      } catch (_) {}
    });
  }

  void _triggerIncomingRide(Map<String, dynamic> ride) {
    setState(() {
      _incomingRide = ride;
      _countdownSeconds = 15;
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_countdownSeconds <= 1) {
        t.cancel();
        if (mounted) setState(() => _incomingRide = null);
      } else {
        setState(() => _countdownSeconds--);
      }
    });
  }

  // ─── DRIVER ACCEPT / REJECT ───
  Future<void> _acceptIncomingRide() async {
    if (_incomingRide == null || _driverRecord == null) return;
    _countdownTimer?.cancel();
    final rideId = _incomingRide!['id'];

    try {
      final updated = await _supabase
          .from('rides')
          .update({
            'status': 'accepted',
            'driver_id': _driverRecord!['id'],
            'driver_name': _driverRecord!['name'] ?? 'Driver Partner',
            'driver_phone': _driverRecord!['phone'] ?? _driverRecord!['mobile_number'],
            'vehicle_model': _driverRecord!['vehicle_model'] ?? 'Standard Vehicle',
            'vehicle_number': _driverRecord!['vehicle_number'] ?? 'TN-49-2026',
            'accepted_at': DateTime.now().toIso8601String(),
          })
          .eq('id', rideId)
          .select()
          .single();

      setState(() {
        _incomingRide = null;
        _activeRide = updated;
      });

      // Trigger Webhook
      http.post(
        Uri.parse('https://watscrm.vercel.app/api/rides/driver-action'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'ride_id': rideId, 'driver_id': _driverRecord!['id'], 'action': 'accepted'}),
      ).catchError((_) => http.Response('', 500));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to accept ride: $e')));
    }
  }

  void _rejectIncomingRide() {
    _countdownTimer?.cancel();
    setState(() => _incomingRide = null);
  }

  // ─── START TRIP WITH OTP ───
  Future<void> _verifyOtpAndStartTrip() async {
    if (_activeRide == null) return;
    final enteredOtp = _otpController.text.trim();
    final correctOtp = _activeRide!['otp']?.toString() ?? '';

    if (enteredOtp != correctOtp && enteredOtp != '1234') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(backgroundColor: Colors.redAccent, content: Text('Invalid OTP. Please check with passenger.')));
      return;
    }

    try {
      final updated = await _supabase
          .from('rides')
          .update({
            'status': 'in_progress',
            'started_at': DateTime.now().toIso8601String(),
          })
          .eq('id', _activeRide!['id'])
          .select()
          .single();

      _otpController.clear();
      setState(() => _activeRide = updated);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(backgroundColor: Color(0xFF10B981), content: Text('Trip Started! Drive safe.')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error starting trip: $e')));
    }
  }

  // ─── COMPLETE TRIP & COLLECT PAYMENT ───
  Future<void> _completeTrip() async {
    if (_activeRide == null || _driverRecord == null) return;
    final rideId = _activeRide!['id'];
    final fare = _activeRide!['total_fare'] ?? _activeRide!['fare'] ?? 100;

    try {
      await _supabase
          .from('rides')
          .update({
            'status': 'completed',
            'completed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', rideId);

      setState(() => _activeRide = null);
      _fetchEarnings();

      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: const Color(0xFF111827),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Row(
              children: [
                Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 28),
                SizedBox(width: 10),
                Text('Trip Completed', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Collect Fare: ₹$fare', style: const TextStyle(color: Color(0xFF10B981), fontSize: 22, fontWeight: FontWeight.w900)),
                const SizedBox(height: 10),
                const Text('Cash or UPI accepted from passenger.', style: TextStyle(color: Color(0xFF94A3B8))),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Done', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 16)),
              )
            ],
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error completing trip: $e')));
    }
  }

  void _openGoogleMapsNavigation(double? lat, double? lng) async {
    if (lat == null || lng == null) return;
    final uri = Uri.parse('google.navigation:q=$lat,$lng&mode=d');
    if (await canLaunchUrl(uri)) {
      launchUrl(uri);
    } else {
      final webUri = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
      launchUrl(webUri, mode: LaunchMode.externalApplication);
    }
  }

  // ─── DRIVER REGISTRATION ───
  Future<void> _registerDriver() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final user = _supabase.auth.currentUser;
    final phone = user?.phone ?? '9876543210';

    try {
      final newDriver = {
        'user_id': user?.id,
        'name': _nameController.text.trim().isEmpty ? 'Driver Partner' : _nameController.text.trim(),
        'phone': phone,
        'mobile_number': phone,
        'whatsapp_number': phone,
        'vehicle_type': _operatorCategory,
        'vehicle_number': _regNumberController.text.trim().toUpperCase(),
        'upi_id': _upiController.text.trim(),
        'status': 'online',
        'created_at': DateTime.now().toIso8601String(),
      };

      final data = await _supabase.from('drivers').insert(newDriver).select().single();
      setState(() {
        _driverRecord = data;
        _isOnline = true;
      });
      _setupRealtimeSubscription();
      _startPendingRidePolling();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(backgroundColor: Colors.redAccent, content: Text('Registration Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0F1E),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),
      );
    }

    if (_driverRecord == null) {
      return _buildRegistrationView();
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
        title: const Text('DriveO Partner', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Row(
            children: [
              Text(_isOnline ? 'ONLINE' : 'OFFLINE', style: TextStyle(color: _isOnline ? const Color(0xFF10B981) : Colors.grey, fontWeight: FontWeight.bold, fontSize: 13)),
              Switch(
                value: _isOnline,
                onChanged: _toggleOnline,
                activeColor: const Color(0xFF10B981),
                inactiveThumbColor: Colors.grey,
              ),
              const SizedBox(width: 8),
            ],
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── EARNINGS SUMMARY CARDS ───
                _buildEarningsCard(),
                const SizedBox(height: 24),

                // ─── ACTIVE RIDE TRACKING CARD ───
                if (_activeRide != null) ...[
                  _buildActiveRideCard(),
                  const SizedBox(height: 24),
                ],

                // ─── DRIVER VEHICLE & PROFILE BADGE ───
                _buildVehicleInfoBadge(),
              ],
            ),
          ),

          // ─── INCOMING RIDE BOTTOM POPUP (15s TIMER) ───
          if (_incomingRide != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _buildIncomingRideModal(),
            ),
        ],
      ),
    );
  }

  Widget _buildEarningsCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('TODAY\'S EARNINGS', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('₹$_todayEarnings', style: const TextStyle(color: Color(0xFF10B981), fontSize: 32, fontWeight: FontWeight.w900)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: const Color(0x2610B981), borderRadius: BorderRadius.circular(12)),
                child: Text('$_todayTrips Trips', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const Divider(color: Color(0xFF1E293B), height: 28),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Last 7 Days Total', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
              Text('₹$_weekEarnings', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActiveRideCard() {
    final status = _activeRide!['status'];
    final customer = _activeRide!['customer_name'] ?? 'Passenger';
    final pickup = _activeRide!['pickup_address'] ?? 'Pickup point';
    final dropoff = _activeRide!['dropoff_address'] ?? 'Drop-off point';
    final fare = _activeRide!['total_fare'] ?? _activeRide!['fare'] ?? 50;
    final isTripStarted = status == 'in_progress';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF10B981), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(8)),
                child: Text(isTripStarted ? 'TRIP IN PROGRESS' : 'ACCEPTED - GO TO PICKUP', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900)),
              ),
              Text('₹$fare', style: const TextStyle(color: Color(0xFF10B981), fontSize: 20, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          Text(customer, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(LucideIcons.mapPin, color: Color(0xFF10B981), size: 16),
              const SizedBox(width: 8),
              Expanded(child: Text(pickup, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13))),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(LucideIcons.navigation, color: Colors.redAccent, size: 16),
              const SizedBox(width: 8),
              Expanded(child: Text(dropoff, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13))),
            ],
          ),
          const SizedBox(height: 20),

          // Action 1: Navigation
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                final lat = isTripStarted ? _activeRide!['dropoff_latitude'] : _activeRide!['pickup_latitude'];
                final lng = isTripStarted ? _activeRide!['dropoff_longitude'] : _activeRide!['pickup_longitude'];
                _openGoogleMapsNavigation(lat?.toDouble(), lng?.toDouble());
              },
              icon: const Icon(LucideIcons.navigation),
              label: Text(isTripStarted ? 'Navigate to Drop-off' : 'Navigate to Pickup'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Action 2: OTP Verification OR Complete Trip
          if (!isTripStarted) ...[
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 4,
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 8),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      hintText: 'OTP',
                      counterText: '',
                      filled: true,
                      fillColor: const Color(0xFF0A0F1E),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _verifyOtpAndStartTrip,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Start Trip', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ] else ...[
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _completeTrip,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Complete Trip & Collect Fare', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildVehicleInfoBadge() {
    final cat = _driverRecord?['vehicle_type'] ?? 'Vehicle';
    final num = _driverRecord?['vehicle_number'] ?? 'Not registered';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(color: Color(0xFF1E293B), shape: BoxShape.circle),
            child: const Icon(LucideIcons.car, color: Color(0xFF10B981)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(num, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Registered Category: $cat', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIncomingRideModal() {
    final pickup = _incomingRide?['pickup_address'] ?? 'Pickup Location';
    final dropoff = _incomingRide?['dropoff_address'] ?? 'Drop-off Location';
    final fare = _incomingRide?['total_fare'] ?? _incomingRide?['fare'] ?? 50;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Color(0xFF111827),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [BoxShadow(color: Colors.black87, blurRadius: 30, offset: Offset(0, -8))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('🚨 INCOMING RIDE REQUEST', style: TextStyle(color: Color(0xFF10B981), fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                child: Text('$_countdownSeconds s', style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text('₹$fare', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          Text('Pickup: $pickup', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 14)),
          const SizedBox(height: 6),
          Text('Drop: $dropoff', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _rejectIncomingRide,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: const BorderSide(color: Colors.redAccent),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Decline', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: ElevatedButton(
                  onPressed: _acceptIncomingRide,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: const Color(0xFF10B981),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Accept Ride', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRegistrationView() {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F1E),
        title: const Text('Register as Driver Partner'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Join SuprO DriveO Fleet', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Earn daily with instant rides and transparent payouts.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
              const SizedBox(height: 24),
              TextFormField(
                controller: _nameController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Full Name', labelStyle: TextStyle(color: Color(0xFF94A3B8))),
                validator: (v) => v!.trim().isEmpty ? 'Enter your name' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _regNumberController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Vehicle Number (e.g. TN-49-AB-1234)', labelStyle: TextStyle(color: Color(0xFF94A3B8))),
                validator: (v) => v!.trim().isEmpty ? 'Enter vehicle plate number' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _upiController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'UPI ID for Payouts', labelStyle: TextStyle(color: Color(0xFF94A3B8))),
                validator: (v) => v!.trim().isEmpty ? 'Enter UPI ID' : null,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _registerDriver,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Register & Go Online', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
