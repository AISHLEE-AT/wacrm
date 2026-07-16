import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/supabase_service.dart';
import '../../../../auth/auth_provider.dart';

class DriverRegistrationScreen extends ConsumerStatefulWidget {
  const DriverRegistrationScreen({super.key});

  @override
  ConsumerState<DriverRegistrationScreen> createState() => _DriverRegistrationScreenState();
}

class _DriverRegistrationScreenState extends ConsumerState<DriverRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _vehicleController = TextEditingController();

  bool _isLoading = false;
  String _selectedVehicleType = 'bike'; // Default to bike matching Next.js

  Future<void> _submitRegistration() async {
    if (!_formKey.currentState!.validate()) return;
    if (FirebaseAuth.instance.currentUser == null) return;

    setState(() => _isLoading = true);

    try {
      // Create driver with simplified flow matching Next.js auto-approve
      // Using existing SupabaseService method. Note: If the method signature
      // requires missing fields, we will pass empty strings for them to avoid breaking the signature.
      // Wait, let's just pass the required fields or empty strings if needed by existing method.
      final result = await SupabaseService().registerDriver(
        name: 'Unknown', // Not required in new flow
        whatsappNumber: FirebaseAuth.instance.currentUser?.phoneNumber ?? '', 
        drivingLicense: '', 
        vehicleRegistration: _vehicleController.text.trim().toUpperCase(),
        insuranceDetails: '', 
        upiId: '', 
        vehicleType: _selectedVehicleType,
      );

      if (result != null && mounted) {
        // Refresh auth state to recognize the user as a driver
        ref.invalidate(authProvider);
        // Route to driver app
        context.go('/driver');
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
                  color: Colors.white.withOpacity(0.6), // text-muted-foreground
                ),
              ),
              const SizedBox(height: 32),

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
                      color: Colors.black.withOpacity(0.12),
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
                        'REGISTRATION NUMBER',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white54,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _vehicleController,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        textCapitalization: TextCapitalization.characters,
                        decoration: InputDecoration(
                          hintText: 'e.g. TN-01-AB-1234',
                          hintStyle: TextStyle(
                            color: Colors.white.withOpacity(0.4),
                            fontWeight: FontWeight.w500,
                          ),
                          filled: true,
                          fillColor: const Color(0xFF171717), // bg-neutral-900
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF333333), width: 2),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFF333333), width: 2),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: Color(0xFFF97316), width: 2),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                        ),
                        validator: (value) => value == null || value.isEmpty ? 'Required' : null,
                      ),
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
                            shadowColor: const Color(0xFFF97316).withOpacity(0.4),
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
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
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
    super.dispose();
  }
}
