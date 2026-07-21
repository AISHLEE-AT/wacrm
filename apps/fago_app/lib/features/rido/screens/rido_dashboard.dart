import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';

class RidODashboard extends ConsumerStatefulWidget {
  const RidODashboard({super.key});

  @override
  ConsumerState<RidODashboard> createState() => _RidODashboardState();
}

class _RidODashboardState extends ConsumerState<RidODashboard> {
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  bool _searching = false;
  Map<String, dynamic>? _estimate;

  @override
  void dispose() {
    _pickupController.dispose();
    _dropoffController.dispose();
    super.dispose();
  }

  void _showToast(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: isError ? Colors.redAccent : const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _handleSearch() {
    if (_pickupController.text.trim().isEmpty || _dropoffController.text.trim().isEmpty) {
      _showToast('Please enter both pickup and drop-off locations.', isError: true);
      return;
    }
    
    setState(() {
      _searching = true;
      _estimate = null;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _searching = false;
        final min = Random().nextInt(40) + 30;
        final max = min + (min * 0.3).floor();
        final eta = '${Random().nextInt(5) + 3} min';
        _estimate = {'min': min, 'max': max, 'eta': eta};
      });
      _showToast('Drivers found in your area! Connecting you shortly.');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.directions_car, color: Color(0xFF00F0FF), size: 28),
            const SizedBox(width: 12),
            const Text('RidO', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.grid_view_rounded, color: Colors.white70),
            onPressed: () => context.go('/'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Book quick and reliable local rides with verified drivers in your area.', style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 24),
            
            // Find a Ride Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.navigation, color: Colors.white),
                      SizedBox(width: 8),
                      Text('Where to?', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildTextField(_pickupController, 'Pickup Location', Icons.my_location, const Color(0xFF00F0FF)),
                  const SizedBox(height: 16),
                  _buildTextField(_dropoffController, 'Drop-off Location', Icons.location_on, Colors.redAccent),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _searching ? null : _handleSearch,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00F0FF),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _searching 
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 3))
                        : const Text('Find a Ride', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  
                  if (_estimate != null) ...[
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.1),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.currency_rupee, color: Color(0xFF10B981), size: 20),
                                  Text('Fare Estimate', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 16)),
                                ],
                              ),
                              Row(
                                children: [
                                  const Icon(Icons.access_time, color: Colors.grey, size: 14),
                                  const SizedBox(width: 4),
                                  Text('ETA: ${_estimate!['eta']}', style: const TextStyle(color: Colors.grey, fontSize: 14)),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('₹${_estimate!['min']} – ₹${_estimate!['max']}', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text('Final fare depends on route and traffic conditions.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      ),
                    ),
                  ]
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Why Choose RidO
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Why choose RidO?', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  _buildFeatureRow(Icons.verified_user, const Color(0xFF10B981), 'Verified Local Drivers', 'All our drivers undergo strict background checks to ensure your safety and comfort.'),
                  const SizedBox(height: 20),
                  _buildFeatureRow(Icons.timer, const Color(0xFF3B82F6), 'Quick Pickups', 'Our smart routing ensures you get picked up in minutes, no matter where you are.'),
                  const SizedBox(height: 20),
                  _buildFeatureRow(Icons.star, const Color(0xFFF59E0B), 'Rate & Review', 'Help the community by rating your rides. Top-rated drivers earn priority assignments.'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, IconData icon, Color iconColor) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey),
        prefixIcon: Icon(icon, color: iconColor),
        filled: true,
        fillColor: const Color(0xFF0F172A),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildFeatureRow(IconData icon, Color color, String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(desc, style: const TextStyle(color: Colors.grey, height: 1.4)),
            ],
          ),
        ),
      ],
    );
  }
}
