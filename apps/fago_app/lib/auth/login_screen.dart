import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:local_auth/local_auth.dart';
import 'package:go_router/go_router.dart';
import 'auth_provider.dart';
import '../services/whatsapp_service.dart';
import '../services/device_auth_service.dart';
import '../features/onboarding/device_service.dart';

class LoginScreen extends ConsumerStatefulWidget {
  final String? role;
  const LoginScreen({super.key, this.role});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  
  bool _isOTPSent = false;
  bool _isLoading = false;
  bool _useWhatsAppAuth = true; // Default to WhatsApp Login OTP
  String _verificationId = '';
  bool _isReturningUser = false;
  // _deviceRegistered is set ONLY from device storage and is never cleared by
  // the DB lookup in _onPhoneChanged — this prevents the race condition where
  // an async DB call resets the biometric login card before it renders.
  bool _deviceRegistered = false;
  
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  void _startCooldown() {
    _cooldownTimer?.cancel();
    setState(() => _resendCooldown = 60);
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_resendCooldown > 1) {
        setState(() => _resendCooldown--);
      } else {
        setState(() => _resendCooldown = 0);
        timer.cancel();
      }
    });
  }

  final TextEditingController _nameController = TextEditingController();
  String _selectedCategory = 'Traveller';
  final LocalAuthentication _localAuth = LocalAuthentication();

  Future<void> _authenticateWithDeviceBiometrics() async {
    try {
      final bool canAuthenticateWithBiometrics = await _localAuth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();

      if (!canAuthenticate) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Device Lock / Biometrics not setup on this phone')),
          );
        }
        return;
      }

      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: 'Unlock FAGO Super App using Fingerprint, Face ID, or Device PIN/Pattern',
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
        ),
      );

      if (didAuthenticate && mounted) {
        setState(() => _isLoading = true);
        final registeredPhone = await DeviceAuthService.getRegisteredPhone();
        final rawTyped = _phoneController.text.trim().replaceAll(RegExp(r'\D'), '');

        String targetPhone = '';
        if (rawTyped.length >= 7) {
          targetPhone = rawTyped;
        } else if (registeredPhone != null && registeredPhone.replaceAll(RegExp(r'\D'), '').length >= 7) {
          targetPhone = registeredPhone.replaceAll(RegExp(r'\D'), '');
        }

        final cleanLen = targetPhone.replaceAll(RegExp(r'\D'), '').length;
        if (cleanLen >= 7) {
          try {
            final resolvedRole = await ref.read(authProvider.notifier).verifyDevicePinAndAutoLogin(targetPhone);
            if (mounted) {
              if (resolvedRole == UserRole.admin) {
                context.go('/admin');
              } else if (resolvedRole == UserRole.driver) {
                context.go('/drivo');
              } else {
                context.go('/rideo');
              }
            }
          } catch (e) {
            setState(() => _isLoading = false);
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Instant Login Error: $e')),
              );
            }
          }
        } else {
          setState(() => _isLoading = false);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Please enter your 10-digit mobile number first.')),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Device Auth Info: $e')),
        );
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _phoneController.addListener(_onPhoneChanged);
    _checkAndAutoFillRegisteredDevice();
  }

  bool _isAutofetchedSim = false;
  bool _isCheckingProfile = false;
  String? _lastCheckedPhone;

  Future<void> _checkAndAutoFillRegisteredDevice() async {
    final registeredPhone = await DeviceAuthService.getRegisteredPhone();
    final registeredName = await DeviceAuthService.getRegisteredName();
    final isLocked = await DeviceAuthService.isProfileLocked();

    if (registeredPhone != null && registeredPhone.isNotEmpty && isLocked && mounted) {
      final clean = registeredPhone.replaceAll(RegExp(r'\D'), '');
      final tenDigit = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
      setState(() {
        _phoneController.text = tenDigit;
        if (registeredName != null && registeredName.isNotEmpty) {
          _nameController.text = registeredName;
        }
        _isReturningUser = true;
        _deviceRegistered = true;
      });
      _lookupProfileInDb(tenDigit);
      return;
    }

    // Auto-fill SIM Card Number extracted at setup permissions level
    final extractedSim = await DeviceService.getExtractedSimPhone();

    if (mounted && extractedSim != null && extractedSim.isNotEmpty) {
      final clean = extractedSim.replaceAll(RegExp(r'\D'), '');
      final tenDigit = clean.length >= 10 ? clean.substring(clean.length - 10) : clean;
      setState(() {
        if (_phoneController.text.isEmpty) {
          _phoneController.text = tenDigit;
          _isAutofetchedSim = true;
        }
      });
      _lookupProfileInDb(tenDigit);
    }
  }

  void _onPhoneChanged() {
    final cleanDigits = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    final tenDigit = cleanDigits.length >= 10 ? cleanDigits.substring(cleanDigits.length - 10) : cleanDigits;

    if (tenDigit.length == 10) {
      if (_lastCheckedPhone != tenDigit) {
        _lookupProfileInDb(tenDigit);
      }
    } else {
      _lastCheckedPhone = null;
      if (mounted && _isReturningUser) {
        setState(() {
          _isReturningUser = false;
        });
      }
    }
  }

  Future<void> _lookupProfileInDb(String tenDigit) async {
    if (tenDigit.length != 10) return;
    _lastCheckedPhone = tenDigit;

    if (mounted) {
      setState(() => _isCheckingProfile = true);
    }

    try {
      final resList = await Supabase.instance.client
          .from('profiles')
          .select('full_name, main_category, role, phone, whatsapp')
          .or('phone.eq.$tenDigit,phone.eq.91$tenDigit,phone.eq.+\$91$tenDigit,whatsapp.eq.$tenDigit,whatsapp.eq.91$tenDigit,email.eq.$tenDigit@whatsapp.wacrm.local');

      Map<String, dynamic>? res = resList.isNotEmpty ? Map<String, dynamic>.from(resList.first) : null;

      if (res == null) {
        try {
          final driverList = await Supabase.instance.client
              .from('drivers')
              .select('driver_name, mobile_number')
              .or('mobile_number.eq.$tenDigit,mobile_number.eq.91$tenDigit,whatsapp_number.eq.$tenDigit');
          if (driverList.isNotEmpty) {
            res = {
              'full_name': driverList.first['driver_name'],
              'main_category': 'Driver',
              'role': 'driver',
            };
          }
        } catch (_) {}
      }

      if (mounted) {
        final registeredPhone = await DeviceAuthService.getRegisteredPhone();
        final cleanRegistered = registeredPhone?.replaceAll(RegExp(r'\D'), '') ?? '';
        final isRegisteredLocally = cleanRegistered.isNotEmpty &&
            (cleanRegistered == tenDigit || cleanRegistered.endsWith(tenDigit));

        if (res != null || isRegisteredLocally) {
          final String existingName = res != null ? ((res['full_name'] as String?) ?? '') : '';
          final String? existingCat = res != null ? (res['main_category'] as String?) : null;
          final String? role = res != null ? (res['role'] as String?) : null;

          setState(() {
            if (existingName.isNotEmpty) {
              _nameController.text = existingName;
            }
            if (existingCat != null && existingCat.isNotEmpty) {
              _selectedCategory = existingCat;
            } else if (role == 'driver') {
              _selectedCategory = 'Driver';
            }
            _isReturningUser = true;
            _isCheckingProfile = false;
          });
        } else {
          setState(() {
            _isReturningUser = false;
            _isCheckingProfile = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Profile lookup error: $e');
      if (mounted) {
        setState(() => _isCheckingProfile = false);
      }
    }
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    _phoneController.removeListener(_onPhoneChanged);
    _phoneController.dispose();
    _otpController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  final List<Map<String, dynamic>> _userCategories = [
    {'key': 'Traveller', 'label': '🧳 Traveller (RideO)', 'route': '/rideo', 'color': Colors.amber},
    {'key': 'Farmer', 'label': '🚜 Farmer (RentO Agri)', 'route': '/rento', 'color': Colors.greenAccent},
    {'key': 'Shopper', 'label': '🛍️ Shopper (ShopO / Mandi)', 'route': '/mandi', 'color': Colors.pinkAccent},
    {'key': 'Driver', 'label': '𚟖 Driver (DriveO)', 'route': '/drivo', 'color': Colors.orangeAccent},
    {'key': 'Student', 'label': '🎓 Student (TestO Exam)', 'route': '/teacho', 'color': Colors.purpleAccent},
    {'key': 'Teacher', 'label': '👨‍🏫 Teacher (TeachO Tutor)', 'route': '/teacho', 'color': Colors.cyanAccent},
    {'key': 'Financier', 'label': '💰 Financier (LoanO)', 'route': '/mandi', 'color': Colors.blueAccent},
    {'key': 'JobSeeker', 'label': '💼 Job Seeker (WorkO)', 'route': '/teacho', 'color': Colors.limeAccent},
    {'key': 'Employer', 'label': '🏢 Employer (BizHub)', 'route': '/', 'color': Colors.indigoAccent},
    {'key': 'Tourist', 'label': '𛈕 Tourist (TourO ஆன்மீகம்)', 'route': '/touro', 'color': Colors.deepOrangeAccent},
  ];

  void _sendOTP() async {
    if (_resendCooldown > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please wait ${_resendCooldown}s before requesting a new OTP.')),
      );
      return;
    }

    if (_phoneController.text.length != 10 || !RegExp(r'^[6-9]\d{9}$').hasMatch(_phoneController.text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit Indian mobile number')),
      );
      return;
    }

    if (!_isReturningUser && _nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your Full Name')),
      );
      return;
    }

    setState(() => _isLoading = true);
    _startCooldown();
    String rawPhone = _phoneController.text.trim();
    String phoneNumber = '+91$rawPhone';

    if (_useWhatsAppAuth) {
      try {
        final res = await ref.read(authProvider.notifier).sendWhatsAppOtp(rawPhone);
        setState(() {
          _isLoading = false;
          _isOTPSent = true;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res['message'] ?? 'OTP requested! Check your WhatsApp messages or tap Open WhatsApp.'),
              backgroundColor: Colors.green.shade800,
              duration: const Duration(seconds: 4),
            ),
          );
        }
      } catch (e) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('WhatsApp OTP Note: ${e.toString().replaceAll("Exception: ", "")}')),
          );
        }
      }
    } else {
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
  }

  void _verifyOTP() async {
    if (_otpController.text.length != 6) return;

    setState(() => _isLoading = true);
    String rawPhone = _phoneController.text.trim();
    String otpCode = _otpController.text.trim();

    void routePostLogin() {
      final role = ref.read(authProvider).role;
      if (!_deviceRegistered) {
        context.go('/pin-setup', extra: {
          'phone': rawPhone,
          'name': _nameController.text.trim(),
        });
        return;
      }
      if (role == UserRole.admin) {
        context.go('/admin');
      } else if (role == UserRole.driver) {
        context.go('/drivo');
      } else {
        context.go('/rideo');
      }
    }

    if (_useWhatsAppAuth) {
      try {
        await ref.read(authProvider.notifier).verifyWhatsAppOtp(
          rawPhone,
          otpCode,
          fullName: _nameController.text.trim(),
          userCategory: _selectedCategory,
        );
        if (mounted) {
          routePostLogin();
        }
      } catch (e) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString().replaceAll("Exception: ", ""))),
          );
        }
      }
    } else {
      try {
        await ref.read(authProvider.notifier).verifyOTP(
          verificationId: _verificationId,
          smsCode: otpCode,
        );
        if (mounted) {
          routePostLogin();
        }
      } catch (e) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Invalid OTP. Please try again.')),
          );
        }
      }
    }
  }

  Future<void> _onPinEntered(String pin) async {
    if (pin.length != 4) return;
    final cleanDigits = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    final tenDigit = cleanDigits.length >= 10 ? cleanDigits.substring(cleanDigits.length - 10) : cleanDigits;

    final isValid = await DeviceAuthService.verifyCustomFagoPin(pin, currentPhone: tenDigit);
    if (!mounted) return;
    if (isValid) {
      setState(() => _isLoading = true);
      final registeredPhone = await DeviceAuthService.getRegisteredPhone();

      String phone = '';
      if (tenDigit.length >= 7) {
        phone = tenDigit;
      } else if (registeredPhone != null && registeredPhone.replaceAll(RegExp(r'\D'), '').length >= 7) {
        phone = registeredPhone.replaceAll(RegExp(r'\D'), '');
      }

      if (phone.length < 7) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enter your 10-digit mobile number first.')),
          );
        }
        return;
      }

      final resolvedRole = await ref.read(authProvider.notifier).verifyDevicePinAndAutoLogin(phone);
      if (!mounted) return;
      if (resolvedRole == UserRole.admin) {
        context.go('/admin');
      } else if (resolvedRole == UserRole.driver) {
        context.go('/drivo');
      } else {
        context.go('/rideo');
      }
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid 4-digit FAGO PIN. Try device fingerprint or PIN unlock.'),
          backgroundColor: Colors.orange,
        ),
      );
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
              const SizedBox(height: 30),
              // Glowing Thamizhan FAGO Brand Logo
              Center(
                child: Container(
                  width: 145,
                  height: 145,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.6), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.greenAccent.withValues(alpha: 0.35),
                        blurRadius: 35,
                        spreadRadius: 6,
                      ),
                      BoxShadow(
                        color: Colors.amber.withValues(alpha: 0.25),
                        blurRadius: 20,
                        spreadRadius: 2,
                      )
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: Image.asset(
                      'assets/images/app_logo.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'தமிழன்',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.greenAccent,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                'FAGO',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFFFFD700), // Golden Yellow
                  letterSpacing: 3,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'வாழ்க • வளர்க • வெல்க • WhatsApp Verified',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.greenAccent,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              Consumer(
                builder: (context, ref, child) {
                  final errorMessage = ref.watch(authProvider).errorMessage;
                  if (errorMessage != null) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withValues(alpha: 0.1),
                        border: Border.all(color: Colors.redAccent),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Backend Sync Failed:\n$errorMessage',
                        style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
              if (!_isOTPSent) ...[
                // Phone Input Field (First Input Box - Autofetched Cell / WhatsApp Number)
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                  decoration: InputDecoration(
                    prefixIcon: Icon(
                      _isAutofetchedSim ? Icons.sim_card_rounded : Icons.phone,
                      color: _isAutofetchedSim ? const Color(0xFF00FF00) : Colors.greenAccent,
                    ),
                    prefixText: '+91 ',
                    prefixStyle: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    labelText: _isAutofetchedSim ? '⚡ WhatsApp Cell Number (Autofetched SIM)' : 'Mobile WhatsApp Number',
                    labelStyle: TextStyle(
                      color: _isAutofetchedSim ? const Color(0xFF00FF00) : Colors.greenAccent,
                      fontWeight: FontWeight.bold,
                    ),
                    helperText: _isCheckingProfile
                        ? '⏳ Checking registered FAGO profile...'
                        : (_isReturningUser
                            ? '✓ Registered Profile Loaded for +91 ${_phoneController.text}'
                            : (_isAutofetchedSim ? '✓ Auto-detected SIM card number from your device' : null)),
                    helperStyle: TextStyle(
                      color: _isReturningUser || _isAutofetchedSim ? const Color(0xFF00FF00) : Colors.amberAccent,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: _isAutofetchedSim ? const Color(0xFF00FF00) : Colors.greenAccent.withValues(alpha: 0.5),
                        width: _isAutofetchedSim ? 2 : 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF00FF00), width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                if (_isReturningUser) ...[
                  // 🛡️ BHIM / IRCTC Style Dedicated Device Lock Card
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFF00FF00).withValues(alpha: 0.6),
                        width: 1.8,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.greenAccent.withValues(alpha: 0.25),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.greenAccent.withValues(alpha: 0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.shield_outlined, color: Color(0xFF00FF00), size: 24),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Welcome back, ${_nameController.text}! 🙏',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 17,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Cell: +91 ${_phoneController.text} • Device Verified 🔒',
                                    style: const TextStyle(
                                      color: Colors.greenAccent,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        // 1. Primary BHIM / IRCTC Instant Device Lock Button
                        ElevatedButton.icon(
                          onPressed: _authenticateWithDeviceBiometrics,
                          icon: const Icon(Icons.fingerprint, color: Colors.black, size: 22),
                          label: const Text(
                            '🔐 UNLOCK VIA FINGERPRINT / DEVICE PIN',
                            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00FF00),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 8,
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Center(
                          child: Text(
                            '— OR ENTER 4-DIGIT FAGO PIN —',
                            style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                          ),
                        ),
                        const SizedBox(height: 10),
                        // 2. Custom 4-digit PIN input
                        TextField(
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          obscureText: true,
                          maxLength: 4,
                          style: const TextStyle(color: Colors.white, fontSize: 22, letterSpacing: 10),
                          decoration: InputDecoration(
                            hintText: '••••',
                            hintStyle: const TextStyle(color: Colors.white24, fontSize: 22, letterSpacing: 10),
                            counterText: '',
                            labelText: '4-Digit Quick FAGO PIN',
                            labelStyle: const TextStyle(color: Colors.cyanAccent, fontSize: 12),
                            isDense: true,
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.cyanAccent.withValues(alpha: 0.5)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Colors.cyanAccent, width: 2),
                            ),
                          ),
                          onChanged: _onPinEntered,
                        ),
                        const SizedBox(height: 10),
                        TextButton.icon(
                          onPressed: () {
                            DeviceAuthService.clearDeviceSignature();
                            setState(() {
                              _isReturningUser = false;
                              _phoneController.clear();
                              _nameController.clear();
                            });
                          },
                          icon: const Icon(Icons.swap_horiz, size: 14, color: Colors.white60),
                          label: const Text(
                            'Switch Account / Re-verify WhatsApp OTP',
                            style: TextStyle(color: Colors.white60, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  // Full Name Input Field
                  TextField(
                    controller: _nameController,
                    textCapitalization: TextCapitalization.words,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.person, color: Colors.cyanAccent),
                      labelText: 'Your Full Name (பெயர்)',
                      labelStyle: const TextStyle(color: Colors.cyanAccent),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.cyanAccent.withValues(alpha: 0.5)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Colors.cyanAccent, width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // User Category Selector Dropdown
                  DropdownButtonFormField<String>(
                    initialValue: _userCategories.any((cat) => cat['key'] == _selectedCategory)
                        ? _selectedCategory
                        : _userCategories.first['key'] as String,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.category, color: Colors.cyanAccent),
                      labelText: 'Choose Your Primary Goal',
                      labelStyle: const TextStyle(color: Colors.cyanAccent),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.cyanAccent.withValues(alpha: 0.5)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Colors.cyanAccent, width: 2),
                      ),
                    ),
                    items: _userCategories.map((cat) {
                      return DropdownMenuItem<String>(
                        value: cat['key'] as String,
                        child: Text(
                          cat['label'] as String,
                          style: const TextStyle(color: Colors.white),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedCategory = val;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 14),

                  ElevatedButton.icon(
                    onPressed: (_isLoading || _resendCooldown > 0) ? null : _sendOTP,
                    icon: const Icon(Icons.chat, color: Colors.black),
                    label: Text(
                      _resendCooldown > 0
                          ? 'Resend OTP in ${_resendCooldown}s'
                          : (_useWhatsAppAuth ? 'Send WhatsApp OTP' : 'Send SMS OTP'),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00FF00), // Green
                      foregroundColor: Colors.black, // Dark text
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 10,
                      shadowColor: Colors.greenAccent.withValues(alpha: 0.5),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      setState(() => _useWhatsAppAuth = !_useWhatsAppAuth);
                    },
                    child: Text(
                      _useWhatsAppAuth ? 'Switch to SMS OTP Method' : 'Switch to WhatsApp Login OTP Method',
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ),
                ],
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: _authenticateWithDeviceBiometrics,
                  icon: const Icon(Icons.fingerprint, color: Colors.greenAccent),
                  label: const Text(
                    'Unlock via Fingerprint / Pattern / PIN (Banking & BHIM UPI Mode)',
                    style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Colors.greenAccent.withValues(alpha: 0.6)),
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ] else ...[
                if (_useWhatsAppAuth) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF062D1B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF25D366), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF25D366).withValues(alpha: 0.2),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.mark_chat_read, color: Color(0xFF25D366), size: 28),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'WhatsApp OTP Connection Ready',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'If you haven\'t received your OTP message automatically, tap below to open WhatsApp & receive your OTP code directly:',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                        const SizedBox(height: 14),
                        ElevatedButton.icon(
                          onPressed: () {
                            final rawPhone = _phoneController.text.trim();
                            WhatsAppService.openWhatsApp(
                              phone: '916381029380',
                              message: '🔑 Hello FAGO! Please send my 6-digit Login OTP code for mobile number +91$rawPhone',
                            );
                          },
                          icon: const Icon(Icons.chat, color: Colors.black),
                          label: const Text(
                            '📱 Open WhatsApp to Get OTP',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 24, letterSpacing: 8),
                  maxLength: 6,
                  decoration: InputDecoration(
                    labelText: _useWhatsAppAuth ? 'Enter 6-digit WhatsApp OTP' : 'Enter 6-digit SMS OTP',
                    labelStyle: const TextStyle(color: Colors.amber),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.amber.withValues(alpha: 0.5)),
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
                    shadowColor: Colors.amber.withValues(alpha: 0.5),
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _isOTPSent = false;
                          _otpController.clear();
                        });
                      },
                      child: const Text('Change Number', style: TextStyle(color: Colors.greenAccent)),
                    ),
                    TextButton(
                      onPressed: (_isLoading || _resendCooldown > 0) ? null : _sendOTP,
                      child: Text(
                        _resendCooldown > 0 ? 'Resend in ${_resendCooldown}s' : 'Resend OTP',
                        style: TextStyle(
                          color: _resendCooldown > 0 ? Colors.white38 : Colors.amber,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                )
              ],
            ],
          ),
        ),
      ),
    );
  }
}
