import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/supabase_service.dart';
import 'home_screen.dart';

class DriverRegistrationScreen extends StatefulWidget {
  const DriverRegistrationScreen({super.key});

  @override
  State<DriverRegistrationScreen> createState() =>
      _DriverRegistrationScreenState();
}

class _DriverRegistrationScreenState extends State<DriverRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _whatsappController = TextEditingController();
  final TextEditingController _dlController = TextEditingController();
  final TextEditingController _vehicleController = TextEditingController();
  final TextEditingController _insuranceController = TextEditingController();
  final TextEditingController _upiController = TextEditingController();

  bool _isLoading = false;
  String _selectedVehicleType = 'car';

  final List<Map<String, dynamic>> _vehicleTypes = [
    {'value': 'bike', 'label': 'Bike', 'icon': Icons.two_wheeler},
    {'value': 'car', 'label': 'Car', 'icon': Icons.directions_car},
    {'value': 'cargo', 'label': 'Cargo', 'icon': Icons.local_shipping},
  ];

  Future<void> _submitRegistration() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final result = await SupabaseService().registerDriver(
        name: _nameController.text.trim(),
        whatsappNumber: _whatsappController.text.trim(),
        drivingLicense: _dlController.text.trim(),
        vehicleRegistration: _vehicleController.text.trim(),
        insuranceDetails: _insuranceController.text.trim(),
        upiId: _upiController.text.trim(),
        vehicleType: _selectedVehicleType,
      );

      if (result != null && mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            icon: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle,
                  color: Colors.orange, size: 48),
            ),
            title: const Text('Registration Under Review'),
            content: const Text(
              'Your documents have been submitted successfully. '
              'Once the Admin approves, you can start accepting rides!',
              textAlign: TextAlign.center,
            ),
            actions: [
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const HomeScreen()),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text('Go to Dashboard',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
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
      backgroundColor: const Color(0xFFF8F9FA),
      body: Column(
        children: [
          // Orange gradient header
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 16,
              bottom: 32,
              left: 24,
              right: 24,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFFF8C00), Color(0xFFFFA040)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Back button
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Icon(Icons.arrow_back_ios,
                      color: Colors.white, size: 22),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Become a DrivO',
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Complete your profile to start earning',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),

          // Form
          Expanded(
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Vehicle type selector
                    const Text(
                      'Vehicle Type',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF333333)),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: _vehicleTypes.map((vt) {
                        final isSelected =
                            _selectedVehicleType == vt['value'];
                        return Expanded(
                          child: Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 4),
                            child: GestureDetector(
                              onTap: () => setState(
                                  () => _selectedVehicleType = vt['value']),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(
                                    vertical: 16),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFFFF8C00)
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFFFF8C00)
                                        : const Color(0xFFE0E0E0),
                                    width: 2,
                                  ),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: const Color(0xFFFF8C00)
                                                .withOpacity(0.3),
                                            blurRadius: 8,
                                            offset: const Offset(0, 3),
                                          )
                                        ]
                                      : [],
                                ),
                                child: Column(
                                  children: [
                                    Icon(
                                      vt['icon'] as IconData,
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.grey[600],
                                      size: 28,
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      vt['label'] as String,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        color: isSelected
                                            ? Colors.white
                                            : Colors.grey[700],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 28),

                    // Form fields
                    _buildTextField(
                        _nameController, 'Full Name', Icons.person_outline),
                    _buildTextField(_whatsappController, 'WhatsApp Number',
                        Icons.phone_android,
                        isNumber: true),
                    _buildTextField(_dlController, 'Driving License Number',
                        Icons.badge_outlined),
                    _buildTextField(
                        _vehicleController,
                        'Vehicle Registration Number',
                        Icons.directions_car_outlined),
                    _buildTextField(_insuranceController,
                        'Insurance Policy Number', Icons.security_outlined),
                    _buildTextField(_upiController, 'UPI ID (For payouts)',
                        Icons.account_balance_wallet_outlined),

                    const SizedBox(height: 12),

                    // Firebase UID info chip
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.verified_user,
                              color: Color(0xFFFF8C00), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Linked to: ${FirebaseAuth.instance.currentUser?.phoneNumber ?? "Unknown"}',
                              style: const TextStyle(
                                  fontSize: 13, color: Color(0xFF666666)),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Submit button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submitRegistration,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: Colors.grey[400],
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 2,
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : const Text(
                                'Submit Documents',
                                style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool isNumber = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18.0),
      child: TextFormField(
        controller: controller,
        keyboardType: isNumber ? TextInputType.phone : TextInputType.text,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Color(0xFF888888)),
          prefixIcon: Icon(icon, color: const Color(0xFFFF8C00)),
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide:
                const BorderSide(color: Color(0xFFFF8C00), width: 2),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
        validator: (value) =>
            value == null || value.isEmpty ? 'This field is required' : null,
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _whatsappController.dispose();
    _dlController.dispose();
    _vehicleController.dispose();
    _insuranceController.dispose();
    _upiController.dispose();
    super.dispose();
  }
}
