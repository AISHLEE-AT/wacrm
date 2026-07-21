import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';

class DrivODashboard extends ConsumerStatefulWidget {
  const DrivODashboard({super.key});

  @override
  ConsumerState<DrivODashboard> createState() => _DrivODashboardState();
}

class _DrivODashboardState extends ConsumerState<DrivODashboard> {
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  String _packageType = 'Documents';
  bool _searching = false;
  Map<String, dynamic>? _estimate;

  final Map<String, int> _packageBase = {
    'Documents': 25,
    'Small Package': 45,
    'Medium Package': 80,
    'Large Item': 180,
  };

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
      _showToast('Please enter both pickup and delivery locations.', isError: true);
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
        final base = _packageBase[_packageType] ?? 50;
        final cost = base + Random().nextInt(30) + 10;
        final eta = '${Random().nextInt(30) + 25} min';
        _estimate = {'cost': cost, 'eta': eta};
      });
      _showToast('Delivery drivers found in your area!');
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
            const Icon(Icons.local_shipping, color: Color(0xFF00F0FF), size: 28),
            const SizedBox(width: 12),
            const Text('DrivO', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24)),
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
            const Text('Fast and secure local delivery network for your packages.', style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 24),
            
            // Send Package Card
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
                      Icon(Icons.inventory_2, color: Colors.white),
                      SizedBox(width: 8),
                      Text('Send a Package', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildTextField(_pickupController, 'Pickup Location', Icons.my_location, const Color(0xFF00F0FF)),
                  const SizedBox(height: 16),
                  _buildTextField(_dropoffController, 'Delivery Location', Icons.location_on, Colors.redAccent),
                  const SizedBox(height: 16),
                  _buildDropdown(),
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
                        : const Text('Get Estimate', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  
                  if (_estimate != null) ...[
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEAB308).withValues(alpha: 0.1),
                        border: Border.all(color: const Color(0xFFEAB308).withValues(alpha: 0.3)),
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
                                  Icon(Icons.currency_rupee, color: Color(0xFFEAB308), size: 20),
                                  Text('Delivery Estimate', style: TextStyle(color: Color(0xFFEAB308), fontWeight: FontWeight.bold, fontSize: 16)),
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
                          Text('₹${_estimate!['cost']}', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('$_packageType • Final cost depends on actual distance.', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      ),
                    ),
                  ]
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Why Choose DrivO
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
                  const Text('Why choose DrivO?', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  _buildFeatureRow(Icons.security, const Color(0xFF10B981), 'Secure Transport', 'Your packages are handled with care and tracked in real-time until they reach their destination.'),
                  const SizedBox(height: 20),
                  _buildFeatureRow(Icons.access_time_filled, const Color(0xFF3B82F6), 'Same-Day Delivery', 'Need it there fast? Our network of drivers guarantees quick same-day delivery within the city.'),
                  const SizedBox(height: 20),
                  _buildFeatureRow(Icons.two_wheeler, const Color(0xFFA855F7), 'Flexible Fleet', 'From bikes to trucks — our fleet adapts to your package size for the most cost-effective delivery.'),
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

  Widget _buildDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _packageType,
          isExpanded: true,
          dropdownColor: const Color(0xFF1E293B),
          icon: const Icon(Icons.arrow_drop_down, color: Colors.grey),
          style: const TextStyle(color: Colors.white, fontSize: 16),
          items: _packageBase.keys.map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
          onChanged: (newValue) {
            if (newValue != null) {
              setState(() => _packageType = newValue);
            }
          },
        ),
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
