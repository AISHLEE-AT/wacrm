import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';
import 'home_screen.dart'; 

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final AuthService _authService = AuthService();
  
  bool _isOTPSent = false;
  bool _isLoading = false;
  String _verificationId = '';

  void _sendOTP() async {
    if (_phoneController.text.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit number')),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    // In production, we should format this to +91 (India) or user's country code dynamically
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
      
      if (userCredential.user != null) {
        // Successfully logged in! We will navigate to Home screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login Successful! 🚀')),
        );
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
      }
    } on FirebaseAuthException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invalid OTP: ${e.message}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              Text(
                _isOTPSent ? 'Verify your number' : 'Enter your number',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _isOTPSent
                    ? 'Enter the 6-digit code sent to +91 ${_phoneController.text}'
                    : 'We will send a 6-digit OTP to verify your account.',
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 40),
              if (!_isOTPSent) ...[
                // Phone Number Input
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    style: const TextStyle(fontSize: 18, letterSpacing: 2),
                    decoration: const InputDecoration(
                      prefixIcon: Padding(
                        padding: EdgeInsets.all(15.0),
                        child: Text('+91', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
                      border: InputBorder.none,
                      counterText: '',
                      hintText: '98765 43210',
                    ),
                  ),
                ),
              ] else ...[
                // OTP Input
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      counterText: '',
                      hintText: '------',
                    ),
                  ),
                ),
              ],
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : (_isOTPSent ? _verifyOTP : _sendOTP),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          _isOTPSent ? 'Verify OTP' : 'Continue',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
