import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/supabase_backend_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DriverRegistrationScreen extends ConsumerStatefulWidget {
  const DriverRegistrationScreen({super.key});

  @override
  ConsumerState<DriverRegistrationScreen> createState() => _DriverRegistrationScreenState();
}

class _DriverRegistrationScreenState extends ConsumerState<DriverRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _vehicleController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _licenseController = TextEditingController();
  final TextEditingController _insuranceController = TextEditingController();
  final TextEditingController _upiController = TextEditingController();

  bool _isLoading = false;
  String _selectedVehicleType = 'bike'; // Default to bike matching Next.js

  Future<void> _submitRegistration() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final phoneNum = FirebaseAuth.instance.currentUser?.phoneNumber ?? Supabase.instance.client.auth.currentUser?.phone ?? '+919876543211';
      final success = await SupabaseBackendService().registerDriverProfile(
        fullName: _nameController.text.trim(),
        phone: phoneNum,
        licenseNumber: _licenseController.text.trim(),
        rcNumber: _vehicleController.text.trim().toUpperCase(),
        vehicleCategory: _selectedVehicleType,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Driver Registration Submitted! Awaiting Admin Verification.'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Registration failed: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212), // Match dark mode
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 24),
              ),
              const SizedBox(height: 24),
              
              const Text(
                'Become a DrivO',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900, // font-black equivalent
                  color: Color(0xFFF97316), // text-orange-500
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Partner with us & earn on your own schedule with zero hassle.',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withValues(alpha: 0.6), // text-muted-foreground
                ),
              ),
              const SizedBox(height: 20),

              // 0% Commission Hero Badge
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.green.shade900.withValues(alpha: 0.8), const Color(0xFF047857).withValues(alpha: 0.6)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.greenAccent, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.greenAccent.withValues(alpha: 0.2),
                      blurRadius: 16,
                      spreadRadius: 2,
                    )
                  ],
                ),
                child: const Row(
                  children: [
                    Icon(Icons.verified, color: Colors.greenAccent, size: 36),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('0% Commission Platform', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 16)),
                          SizedBox(height: 2),
                          Text('Keep 100% of your ride fares. Direct WhatsApp passenger connectivity!', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Info Cards
              _buildInfoCard(
                icon: Icons.directions_car,
                iconColor: const Color(0xFFF97316),
                bgColor: const Color(0x33431407), // bg-orange-950/30
                borderColor: const Color(0x807C2D12), // border-orange-900/50
                title: 'Flexible Hours',
                subtitle: 'Drive when you want, earn what you need.',
              ),
              const SizedBox(height: 16),
              _buildInfoCard(
                icon: Icons.account_balance_wallet,
                iconColor: const Color(0xFF10B981), // emerald-500
                bgColor: const Color(0x33064E3B), // emerald-950/30
                borderColor: const Color(0x80065F46), // emerald-900/50
                title: 'Instant Payouts',
                subtitle: 'Get paid directly to your digital wallet.',
              ),
              const SizedBox(height: 32),

              // Registration Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E), // bg-card
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: const Color(0xFF333333)), // border-border
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.12),
                      blurRadius: 30,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Register your vehicle',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      const Text(
                        'VEHICLE TYPE',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white54,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildVehicleButton('bike', Icons.two_wheeler),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildVehicleButton('car', Icons.directions_car),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      const Text(
                        'FULL NAME',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(_nameController, 'e.g. John Doe', false),
                      const SizedBox(height: 24),

                      const Text(
                        'REGISTRATION NUMBER',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white54,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(_vehicleController, 'e.g. TN-01-AB-1234', true),
                      const SizedBox(height: 24),

                      const Text(
                        'DRIVING LICENSE NUMBER',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(_licenseController, 'e.g. TN0120230000000', true),
                      const SizedBox(height: 24),

                      const Text(
                        'INSURANCE POLICY NUMBER',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(_insuranceController, 'Policy Number', false),
                      const SizedBox(height: 24),

                      const Text(
                        'UPI ID (FOR PAYOUTS)',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white54, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(_upiController, 'e.g. number@upi', false),
                      const SizedBox(height: 32),

                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submitRegistration,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF97316), // bg-orange-500
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 8,
                            shadowColor: const Color(0xFFF97316).withValues(alpha: 0.4),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                                )
                              : const Text(
                                  'Start Driving Today',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required Color borderColor,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 36),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, bool isUpper) {
    return TextFormField(
      controller: controller,
      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      textCapitalization: isUpper ? TextCapitalization.characters : TextCapitalization.none,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontWeight: FontWeight.w500),
        filled: true,
        fillColor: const Color(0xFF171717),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF333333), width: 2)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF333333), width: 2)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFF97316), width: 2)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      ),
      validator: (value) => value == null || value.isEmpty ? 'Required' : null,
    );
  }

  Widget _buildVehicleButton(String type, IconData icon) {
    final isSelected = _selectedVehicleType == type;
    return GestureDetector(
      onTap: () => setState(() => _selectedVehicleType = type),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0x4D431407) : Colors.transparent, // bg-orange-950/30 vs transparent
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFFF97316) : const Color(0xFF333333),
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFFF97316) : Colors.white54,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              type.toUpperCase(),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? const Color(0xFFF97316) : Colors.white54,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _vehicleController.dispose();
    _nameController.dispose();
    _licenseController.dispose();
    _insuranceController.dispose();
    _upiController.dispose();
    super.dispose();
  }
}
