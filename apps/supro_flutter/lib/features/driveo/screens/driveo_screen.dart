import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../auth/providers/auth_provider.dart';

class DriveoScreen extends ConsumerStatefulWidget {
  const DriveoScreen({super.key});

  @override
  ConsumerState<DriveoScreen> createState() => _DriveoScreenState();
}

class _DriveoScreenState extends ConsumerState<DriveoScreen> {
  final SupabaseClient _supabase = Supabase.instance.client;
  
  bool _isLoading = true;
  Map<String, dynamic>? _driverRecord;

  // Form State
  final _formKey = GlobalKey<FormState>();
  String _operatorCategory = 'truck';
  final _regNumberController = TextEditingController();
  final _licenseController = TextEditingController();

  final List<Map<String, dynamic>> _categories = [
    {'id': 'bike', 'name': 'Bike / Scooty', 'icon': Icons.pedal_bike},
    {'id': 'auto', 'name': 'Auto Rickshaw', 'icon': Icons.electric_rickshaw},
    {'id': 'car', 'name': 'Car / Taxi / SUV', 'icon': Icons.directions_car},
    {'id': 'van', 'name': 'Van / Mini-Bus', 'icon': Icons.airport_shuttle},
    {'id': 'bus', 'name': 'Bus / Travels', 'icon': Icons.directions_bus},
    {'id': 'truck', 'name': 'Lorry / Truck', 'icon': Icons.local_shipping},
  ];

  @override
  void initState() {
    super.initState();
    _fetchDriverRecord();
  }

  Future<void> _fetchDriverRecord() async {
    setState(() => _isLoading = true);
    try {
      final user = _supabase.auth.currentUser;
      if (user != null) {
        final data = await _supabase
            .from('drivers')
            .select()
            .eq('user_id', user.id)
            .maybeSingle();
        
        if (mounted) {
          setState(() {
            _driverRecord = data;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching driver record: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _registerDriver() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return;

      final newRecord = {
        'user_id': user.id,
        'driver_name': ref.read(currentUserProvider)?.phone ?? 'Driver Partner',
        'vehicle_registration': _regNumberController.text.trim().toUpperCase(),
        'driving_license': _licenseController.text.trim().toUpperCase(),
        'operator_category': _operatorCategory,
        'is_verified': false, // Admin approval needed
      };

      await _supabase.from('drivers').upsert(newRecord);
      await _fetchDriverRecord();
    } catch (e) {
      debugPrint('Error registering driver: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registration Failed: $e')),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _fastApprove() async {
    setState(() => _isLoading = true);
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return;

      await _supabase.from('drivers').update({'is_verified': true}).eq('user_id', user.id);
      await _fetchDriverRecord();
    } catch (e) {
      debugPrint('Error fast approving driver: $e');
      setState(() => _isLoading = false);
    }
  }

  void _requestUpiSettlement() async {
    final user = ref.read(currentUserProvider);
    final phone = user?.phone ?? 'Unknown';
    final msg = "ðŸ’° *DRIVER ZERO-COMMISSION UPI PAYOUT REQUEST* ðŸ’°\n\n"
        "ðŸ‘¤ *Driver Partner*: $phone\n"
        "ðŸ’³ *Today's Earnings*: â‚¹1,250 (5 Trips Completed)\n"
        "ðŸ‘‰ *Please process instant 0% commission UPI settlement to my UPI ID!*";
    
    final url = Uri.parse('https://wa.me/916381029380?text=${Uri.encodeComponent(msg)}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  Widget _buildRegistrationForm() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(LucideIcons.shieldCheck, size: 64, color: Color(0xFF10b981)),
            const SizedBox(height: 16),
            const Text(
              'Driver Registration',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Register your vehicle to start receiving RideO trips.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF94a3b8)),
            ),
            const SizedBox(height: 32),
            DropdownButtonFormField<String>(
              value: _operatorCategory,
              decoration: InputDecoration(
                labelText: 'Vehicle Category',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: const Color(0xFF1E293B),
              ),
              dropdownColor: const Color(0xFF1E293B),
              items: _categories.map((cat) {
                return DropdownMenuItem<String>(
                  value: cat['id'],
                  child: Text(cat['name'], style: const TextStyle(color: Colors.white)),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _operatorCategory = val);
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _regNumberController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Vehicle Registration No.',
                hintText: 'TN 01 AB 1234',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: const Color(0xFF1E293B),
              ),
              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _licenseController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Driving License No.',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: const Color(0xFF1E293B),
              ),
              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _registerDriver,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10b981),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Submit for Verification', style: TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingApproval() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0x22F59E0B),
            ),
            child: const Icon(LucideIcons.clock, size: 64, color: Color(0xFFF59E0B)),
          ),
          const SizedBox(height: 24),
          const Text(
            'Registration Pending',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 16),
          Text(
            'Your driver partner profile (Vehicle Reg: ${_driverRecord?['vehicle_registration'] ?? 'Unknown'}) has been submitted and is undergoing document verification by Admin.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 14),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Next Verification Steps:', style: TextStyle(color: Color(0xFF10b981), fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                Text('1. Admin verifies your Driving License & Vehicle details.', style: TextStyle(color: Color(0xFF94a3b8), fontSize: 12)),
                SizedBox(height: 4),
                Text('2. Once verified, your active portal will automatically unlock.', style: TextStyle(color: Color(0xFF94a3b8), fontSize: 12)),
                SizedBox(height: 4),
                Text('3. You can then check in daily and accept trips!', style: TextStyle(color: Color(0xFF94a3b8), fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: _fastApprove,
            icon: const Icon(LucideIcons.zap, color: Colors.black),
            label: const Text('Fast Demo Verification', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10b981),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboard() {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0x3310b981),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(LucideIcons.truck, color: Color(0xFF10b981), size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('DriveO Portal', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    Text(
                      'Vehicle: ${_driverRecord?['vehicle_registration'] ?? 'N/A'}',
                      style: const TextStyle(color: Color(0xFF10b981), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Operator Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Operator Profile', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0x3310b981),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('VERIFIED', style: TextStyle(color: Color(0xFF10b981), fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildProfileRow(LucideIcons.user, 'Driver Name', _driverRecord?['driver_name'] ?? 'Unknown'),
                const SizedBox(height: 12),
                _buildProfileRow(LucideIcons.hash, 'License', _driverRecord?['driving_license'] ?? 'Unknown'),
              ],
            ),
          ),

          const SizedBox(height: 24),
          
          // Action Buttons
          ElevatedButton.icon(
            onPressed: _requestUpiSettlement,
            icon: const Icon(LucideIcons.zap, color: Color(0xFF10b981)),
            label: const Text('Instant UPI Settlement', style: TextStyle(color: Color(0xFF10b981), fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0x2210b981),
              side: const BorderSide(color: Color(0xFF10b981)),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF94a3b8)),
        const SizedBox(width: 8),
        Text('$label:', style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 14)),
        const SizedBox(width: 8),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0f1e),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0a0f1e),
        elevation: 0,
        title: const Text('DriveO', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF10b981)))
            : SingleChildScrollView(
                child: _driverRecord == null
                    ? _buildRegistrationForm()
                    : (_driverRecord?['is_verified'] == true
                        ? _buildDashboard()
                        : _buildPendingApproval()),
              ),
      ),
    );
  }
}
