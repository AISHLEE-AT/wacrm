import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import '../services/supabase_service.dart';
import 'home_screen.dart';
import 'driver_registration_screen.dart';
import 'rider_home_screen.dart';
import 'admin_home_screen.dart';

class LoginScreen extends StatefulWidget {
  final String role;

  const LoginScreen({super.key, required this.role});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final AuthService _authService = AuthService();
  final SupabaseService _supabaseService = SupabaseService();

  bool _isOTPSent = false;
  bool _isLoading = false;
  String _verificationId = '';

  // Role-themed colors
  Color get _roleColor {
    switch (widget.role) {
      case 'driver':
        return const Color(0xFFFF8C00);
      case 'rider':
        return const Color(0xFF059669);
      case 'admin':
        return const Color(0xFF546E7A);
      default:
        return const Color(0xFF059669);
    }
  }

  Color get _roleColorLight {
    switch (widget.role) {
      case 'driver':
        return const Color(0xFFFFA040);
      case 'rider':
        return const Color(0xFF10B981);
      case 'admin':
        return const Color(0xFF78909C);
      default:
        return const Color(0xFF10B981);
    }
  }

  String get _roleTitle {
    switch (widget.role) {
      case 'driver':
        return 'DrivO';
      case 'rider':
        return 'TransO';
      case 'admin':
        return 'Admin';
      default:
        return 'Login';
    }
  }

  void _sendOTP() async {
    if (_phoneController.text.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit number')),
      );
      return;
    }

    setState(() => _isLoading = true);

    String phoneNumber = '+91${_phoneController.text.trim()}';

    await _authService.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      codeSent: (verificationId, resendToken) {
        setState(() {
          _isLoading = false;
          _isOTPSent = true;
          _verificationId = verificationId;
        });
      },
      verificationFailed: (e) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification Failed: ${e.message}')),
        );
      },
    );
  }

  void _verifyOTP() async {
    if (_otpController.text.length != 6) return;

    setState(() => _isLoading = true);

    try {
      UserCredential userCredential = await _authService.verifyOTP(
        verificationId: _verificationId,
        smsCode: _otpController.text.trim(),
      );

      if (userCredential.user != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${_roleTitle} Login Successful!'),
            backgroundColor: _roleColor,
          ),
        );

        // Navigation based on role
        if (widget.role == 'driver') {
          // Check if driver profile exists in Supabase
          final firebaseUser = FirebaseAuth.instance.currentUser;
          Map<String, dynamic>? driverData;

          if (firebaseUser != null) {
            driverData = await _supabaseService
                .getDriverByFirebaseUid(firebaseUser.uid);
          }

          if (mounted) {
            if (driverData != null) {
              // Driver exists → go to dashboard
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const HomeScreen()),
              );
            } else {
              // New driver → go to registration
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                    builder: (_) => const DriverRegistrationScreen()),
              );
            }
          }
        } else if (widget.role == 'rider') {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const RiderHomeScreen()),
          );
        } else if (widget.role == 'admin') {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const AdminHomeScreen()),
          );
        }
      }
    } on FirebaseAuthException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invalid OTP: ${e.message}')),
      );
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
          // Gradient header
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 16,
              bottom: 32,
              left: 24,
              right: 24,
            ),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [_roleColor, _roleColorLight],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Icon(Icons.arrow_back_ios,
                      color: Colors.white, size: 22),
                ),
                const SizedBox(height: 20),
                Text(
                  '$_roleTitle Login',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _isOTPSent
                      ? 'Enter the 6-digit code sent to +91 ${_phoneController.text}'
                      : 'We need your mobile number to authenticate.',
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.white.withOpacity(0.85),
                  ),
                ),
              ],
            ),
          ),

          // Form area
          Expanded(
            child: Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _isOTPSent ? 'Verify your number' : 'Enter mobile number',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A1A2E),
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (!_isOTPSent) ...[
                    // Phone Number Input
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _roleColor, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: _roleColor.withOpacity(0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        maxLength: 10,
                        style:
                            const TextStyle(fontSize: 18, letterSpacing: 2),
                        decoration: InputDecoration(
                          prefixIcon: Padding(
                            padding: const EdgeInsets.all(15.0),
                            child: Text('+91',
                                style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: _roleColor)),
                          ),
                          border: InputBorder.none,
                          counterText: '',
                          hintText: '98765 43210',
                          hintStyle: TextStyle(color: Colors.grey[400]),
                        ),
                      ),
                    ),
                  ] else ...[
                    // OTP Input
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _roleColor, width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: _roleColor.withOpacity(0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            fontSize: 28,
                            letterSpacing: 10,
                            fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          counterText: '',
                          hintText: '• • • • • •',
                          hintStyle: TextStyle(
                              color: Colors.grey[400], letterSpacing: 8),
                        ),
                      ),
                    ),
                  ],
                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed:
                          _isLoading ? null : (_isOTPSent ? _verifyOTP : _sendOTP),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _roleColor,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: _roleColor.withOpacity(0.5),
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
                          : Text(
                              _isOTPSent ? 'Verify OTP' : 'Continue',
                              style: const TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
