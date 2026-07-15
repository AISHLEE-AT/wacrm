import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  
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
    String phoneNumber = '+91${_phoneController.text.trim()}';

    await ref.read(authProvider.notifier).verifyPhoneNumber(
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
      await ref.read(authProvider.notifier).verifyOTP(
        verificationId: _verificationId,
        smsCode: _otpController.text.trim(),
      );
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid OTP. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),
              // Glowing Nature Logo Placeholder
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.greenAccent.withOpacity(0.3),
                      blurRadius: 40,
                      spreadRadius: 10,
                    ),
                    BoxShadow(
                      color: Colors.amber.withOpacity(0.2),
                      blurRadius: 20,
                      spreadRadius: 5,
                    )
                  ],
                ),
                child: const Icon(
                  Icons.eco,
                  size: 100,
                  color: Color(0xFF00FF00), // Vibrant Green
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'FAGO',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFFFFD700), // Golden Yellow
                  letterSpacing: 2,
                ),
              ),
              const Text(
                'AishleeTech',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 60),
              if (!_isOTPSent) ...[
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.phone, color: Colors.greenAccent),
                    prefixText: '+91 ',
                    prefixStyle: const TextStyle(color: Colors.white, fontSize: 16),
                    labelText: 'Mobile Number',
                    labelStyle: const TextStyle(color: Colors.greenAccent),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.greenAccent.withOpacity(0.5)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Colors.greenAccent, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _sendOTP,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00FF00), // Green
                    foregroundColor: Colors.black, // Dark text
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 10,
                    shadowColor: Colors.greenAccent.withOpacity(0.5),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Text(
                          'Continue',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                ),
              ] else ...[
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 24, letterSpacing: 8),
                  maxLength: 6,
                  decoration: InputDecoration(
                    labelText: 'Enter 6-digit OTP',
                    labelStyle: const TextStyle(color: Colors.amber),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.amber.withOpacity(0.5)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Colors.amber, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOTP,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFD700), // Gold
                    foregroundColor: Colors.black, // Dark text
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 10,
                    shadowColor: Colors.amber.withOpacity(0.5),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : const Text(
                          'Verify & Login',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _isOTPSent = false;
                      _otpController.clear();
                    });
                  },
                  child: const Text('Change Number', style: TextStyle(color: Colors.greenAccent)),
                )
              ],
            ],
          ),
        ),
      ),
    );
  }
}
