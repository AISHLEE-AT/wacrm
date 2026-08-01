import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'auth_provider.dart';
import '../services/device_auth_service.dart';
import '../services/whatsapp_service.dart';

class UserCategoryItem {
  final String key;
  final String label;
  const UserCategoryItem(this.key, this.label);
}

/// Revamped Flutter LoginScreen — 100% Feature & Aesthetic Parity with Aisho Native LoginScreen.kt.
/// Features:
///   - Glowing Thamizhan AISHO Brand Logo & Tagline (தமிழன் AISHO • வாழ்க • வளர்க • வெல்க • WhatsApp Verified)
///   - Green-bordered "Mobile WhatsApp Number" with +91 prefix and 10-digit counter (0/10)
///   - Green-bordered "Your Full Name (பெயர்)"
///   - Dropdown menu "Choose Your Primary Goal"
///   - Bright Green "Send WhatsApp OTP" Action Button with 60s cooldown timer
///   - "Open WhatsApp Chat to Get OTP" direct launcher
///   - Returning Device Welcome Back Card with instant 4-Digit Quick PIN & Biometric Unlock
///   - Live Supabase profile detection on typing 10 digits
///   - "Switch to SMS OTP Method" Link
class LoginScreen extends ConsumerStatefulWidget {
  final String? role;
  const LoginScreen({super.key, this.role});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();

  bool _isOTPSent = false;
  bool _isLoading = false;
  bool _useWhatsAppAuth = true; // Default to WhatsApp Login OTP
  bool _useOtpFallback = false; // Primary is Instant WhatsApp Deep Link
  String _selectedCategoryKey = 'Traveller';

  String _errorMsg = '';
  String _pinError = '';

  int _cooldownSeconds = 0;
  Timer? _cooldownTimer;

  // Inbound WhatsApp Verification Polling State
  bool _isPolling = false;
  Timer? _pollingTimer;
  String? _pollId;
  String? _deepLinkUrl;

  bool _isDeviceRegistered = false;
  String? _registeredPhone;
  String? _registeredName;

  bool _isCheckingProfile = false;
  bool _isSimAutofetched = false;

  final List<UserCategoryItem> _userCategories = const [
    UserCategoryItem('Traveller', '🧳 Traveller (RideO)'),
    UserCategoryItem('Farmer', '🚜 Farmer (RentO Agri)'),
    UserCategoryItem('Shopper', '🛍️ Shopper (Mandi)'),
    UserCategoryItem('Driver', '🚗 Driver (DriveO)'),
    UserCategoryItem('Student', '🎓 Student (TestO Exam)'),
    UserCategoryItem('Teacher', '👨‍🏫 Teacher (TeachO)'),
    UserCategoryItem('Financier', '💰 Financier (MoneyO)'),
    UserCategoryItem('JobSeeker', '💼 Job Seeker (WorkO)'),
    UserCategoryItem('Employer', '🏢 Employer (BizHub)'),
    UserCategoryItem('Tourist', '🛕 Tourist (TourO)'),
  ];

  @override
  void initState() {
    super.initState();
    _checkDeviceSignature();
    _phoneController.addListener(_onPhoneChanged);
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    _pollingTimer?.cancel();
    _phoneController.removeListener(_onPhoneChanged);
    _phoneController.dispose();
    _nameController.dispose();
    _otpController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  // ── WhatsApp Inbound Deep Link & Polling Logic ────────────────────────────
  Future<void> _startWhatsAppInboundAuth() async {
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length < 10) {
      setState(() => _errorMsg = 'Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (_nameController.text.trim().isEmpty) {
      setState(() => _errorMsg = 'Please enter your Full Name (பெயர்)');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = '';
    });

    try {
      final response = await ref.read(authProvider.notifier).initWhatsAppSession(
        phone: cleanPhone,
        fullName: _nameController.text.trim(),
        category: _selectedCategoryKey,
      );

      final deepLink = response['deep_link_url']?.toString();
      final pollId = response['poll_id']?.toString();

      if (deepLink != null && pollId != null) {
        _deepLinkUrl = deepLink;
        _pollId = pollId;
        _isPolling = true;
        _isLoading = false;

        final uri = Uri.parse(deepLink);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }

        _startPollingLoop(pollId);
      } else {
        throw Exception('Invalid response from server');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMsg = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  void _startPollingLoop(String pollId) {
    _pollingTimer?.cancel();
    int elapsedSeconds = 0;
    _pollingTimer = Timer.periodic(const Duration(seconds: 2), (timer) async {
      elapsedSeconds += 2;
      if (elapsedSeconds > 120) {
        timer.cancel();
        if (mounted) {
          setState(() {
            _isPolling = false;
            _errorMsg = 'WhatsApp verification timed out. Tap to retry or use OTP fallback.';
          });
        }
        return;
      }

      try {
        final res = await ref.read(authProvider.notifier).pollWhatsAppSession(pollId);
        if (res['status'] == 'verified') {
          timer.cancel();
          if (mounted) {
            setState(() {
              _isPolling = false;
              _isLoading = false;
            });
            context.go('/');
          }
        }
      } catch (e) {
        debugPrint('Polling error: $e');
      }
    });
  }

  void _stopPolling() {
    _pollingTimer?.cancel();
    setState(() {
      _isPolling = false;
    });
  }

  /// Initial device registration check on cold launch
  Future<void> _checkDeviceSignature() async {
    final regPhone = await DeviceAuthService.getRegisteredPhone();
    final regName = await DeviceAuthService.getRegisteredName();
    final isLocked = await DeviceAuthService.isProfileLocked();

    if (regPhone != null && regPhone.isNotEmpty && isLocked) {
      setState(() {
        _registeredPhone = regPhone;
        _registeredName = regName;
        _phoneController.text = regPhone;
        if (regName != null && regName.isNotEmpty) {
          _nameController.text = regName;
        }
        _isDeviceRegistered = true;
      });
    }
  }

  /// Live Supabase auto-detect when 10 digits are typed
  void _onPhoneChanged() async {
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length >= 10) {
      final tenDigit = cleanPhone.substring(cleanPhone.length - 10);
      if (!_isCheckingProfile) {
        setState(() => _isCheckingProfile = true);
        final profileMap = await ref.read(authProvider.notifier).fetchProfileByPhone(tenDigit);
        final regPhone = await DeviceAuthService.getRegisteredPhone();
        final isLocked = await DeviceAuthService.isProfileLocked();
        final isLocalReg = isLocked &&
            regPhone != null &&
            regPhone.isNotEmpty &&
            (regPhone == tenDigit || regPhone.endsWith(tenDigit));

        if (mounted) {
          if (profileMap != null || isLocalReg) {
            final dbName = profileMap?['full_name']?.toString();
            final dbEmail = profileMap?['email']?.toString();
            final dbCat = profileMap?['main_category']?.toString();

            if (dbName != null && dbName.trim().isNotEmpty && !RegExp(r'^\d+$').hasMatch(dbName)) {
              _nameController.text = dbName.trim();
            } else if (dbEmail != null && dbEmail.contains('@')) {
              _nameController.text = dbEmail.split('@').first;
            }

            if (dbCat != null && dbCat.isNotEmpty) {
              final foundKey = _userCategories.any((cat) => cat.key == dbCat) ? dbCat : 'Traveller';
              _selectedCategoryKey = foundKey;
            }

            setState(() {
              _registeredPhone = tenDigit;
              _isDeviceRegistered = true;
              _isCheckingProfile = false;
            });
          } else {
            setState(() {
              _isDeviceRegistered = false;
              _isCheckingProfile = false;
            });
          }
        }
      }
    } else {
      if (_isDeviceRegistered || _isCheckingProfile) {
        setState(() {
          _isDeviceRegistered = false;
          _isCheckingProfile = false;
        });
      }
    }
  }

  void _startCooldownTimer() {
    _cooldownTimer?.cancel();
    setState(() => _cooldownSeconds = 60);
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_cooldownSeconds <= 1) {
        timer.cancel();
        if (mounted) setState(() => _cooldownSeconds = 0);
      } else {
        if (mounted) setState(() => _cooldownSeconds--);
      }
    });
  }

  Future<void> _sendOTP() async {
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length < 10) {
      setState(() => _errorMsg = 'Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (_nameController.text.trim().isEmpty) {
      setState(() => _errorMsg = 'Please enter your Full Name (பெயர்)');
      return;
    }

    if (_cooldownSeconds > 0) {
      setState(() => _errorMsg = 'Please wait ${_cooldownSeconds}s before requesting a new OTP.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = '';
    });

    if (_useWhatsAppAuth) {
      try {
        await ref.read(authProvider.notifier).sendWhatsAppOtp(cleanPhone);
        _startCooldownTimer();
        setState(() {
          _isLoading = false;
          _isOTPSent = true;
          _errorMsg = '✅ OTP requested! Check your WhatsApp messages or tap Open WhatsApp.';
        });
      } catch (e) {
        setState(() {
          _isLoading = false;
          _errorMsg = e.toString().replaceAll('Exception: ', '');
        });
      }
    } else {
      try {
        await ref.read(authProvider.notifier).verifyPhoneNumber(
          phoneNumber: '+91$cleanPhone',
          codeSent: (verificationId, resendToken) {
            _startCooldownTimer();
            setState(() {
              _isLoading = false;
              _isOTPSent = true;
              _errorMsg = '✅ SMS OTP sent to +91 $cleanPhone';
            });
          },
          verificationFailed: (e) {
            setState(() {
              _isLoading = false;
              _errorMsg = 'SMS Verification Failed: ${e.message}';
            });
          },
        );
      } catch (e) {
        setState(() {
          _isLoading = false;
          _errorMsg = e.toString();
        });
      }
    }
  }

  Future<void> _verifyOTP() async {
    final otpCode = _otpController.text.trim();
    if (otpCode.length != 6) {
      setState(() => _errorMsg = 'Enter 6-digit OTP code');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = '';
    });

    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'\D'), '');

    if (_useWhatsAppAuth) {
      try {
        await ref.read(authProvider.notifier).verifyWhatsAppOtp(
          cleanPhone,
          otpCode,
          fullName: _nameController.text.trim(),
          userCategory: _selectedCategoryKey,
        );
        if (mounted) {
          setState(() => _isLoading = false);
          context.go('/');
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMsg = e.toString().replaceAll('Exception: ', '');
          });
        }
      }
    } else {
      try {
        await ref.read(authProvider.notifier).verifyOTP(
          verificationId: '',
          smsCode: otpCode,
        );
        if (mounted) {
          setState(() => _isLoading = false);
          context.go('/');
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMsg = 'Invalid SMS OTP code. Please try again.';
          });
        }
      }
    }
  }

  /// Instant Biometric Authentication
  Future<void> _unlockWithBiometrics(String targetPhone) async {
    setState(() {
      _isLoading = true;
      _pinError = '';
    });
    try {
      final success = await DeviceAuthService.authenticateWithBiometricsOrDevicePin(
        reason: 'FAGO Device Security Unlock — Verify fingerprint or PIN for +91 $targetPhone',
      );
      if (success) {
        await ref.read(authProvider.notifier).verifyDeviceAndAutoLogin(targetPhone);
        if (mounted) {
          setState(() => _isLoading = false);
          context.go('/');
        }
      } else {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _pinError = 'Biometric authentication cancelled';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _pinError = e.toString();
        });
      }
    }
  }

  /// Instant Quick 4-Digit PIN Authentication
  Future<void> _verifyQuickPin(String targetPhone, String cleanPin) async {
    final isValid = await DeviceAuthService.verifyCustomFagoPin(cleanPin, currentPhone: targetPhone);
    if (isValid) {
      setState(() {
        _isLoading = true;
        _pinError = '';
      });
      try {
        await ref.read(authProvider.notifier).verifyDeviceAndAutoLogin(targetPhone, inputPin: cleanPin);
        if (mounted) {
          setState(() => _isLoading = false);
          context.go('/');
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _pinError = e.toString().replaceAll('Exception: ', '');
          });
        }
      }
    } else {
      setState(() => _pinError = 'Incorrect 4-Digit PIN');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen for auth state changes — auto navigate away from LoginScreen when role resolves
    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.role != UserRole.guest && !next.isLoading) {
        if (mounted) {
          setState(() => _isLoading = false);
          context.go('/');
        }
      }
    });

    final selectedLabel = _userCategories.firstWhere(
      (cat) => cat.key == _selectedCategoryKey,
      orElse: () => _userCategories.first,
    ).label;

    final cleanCurrentPhone = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    final tenDigitPhone = cleanCurrentPhone.length >= 10
        ? cleanCurrentPhone.substring(cleanCurrentPhone.length - 10)
        : (_registeredPhone ?? cleanCurrentPhone);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 16),

              // ── 1. Glowing Thamizhan FAGO Brand Logo ──────────────────────────
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: const Color(0xFF00FF00), width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF00FF00).withValues(alpha: 0.3),
                      blurRadius: 30,
                      spreadRadius: 6,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(32),
                  child: Image.asset(
                    'assets/images/app_logo.png',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 64,
                      color: Color(0xFF00FF00),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 14),

              // ── 2. Branding Text Header ─────────────────────────────────────────
              const Text(
                'தமிழன்',
                style: TextStyle(
                  color: Color(0xFF00FF00),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
              const Text(
                'AISHO',
                style: TextStyle(
                  color: Color(0xFFFFD700),
                  fontSize: 44,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                ),
              ),
              const Text(
                'தமிழன் AISHO • வாழ்க • வளர்க • வெல்க • WhatsApp Verified',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Color(0xFF00FF00),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),

              const SizedBox(height: 24),

              // ── 3. Returning Device Security Card (Welcome Back Card) ─────────
              if (_isDeviceRegistered && tenDigitPhone.isNotEmpty) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF00FF00), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00FF00).withValues(alpha: 0.15),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.shield_rounded, color: Color(0xFF00FF00), size: 28),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Welcome back, ${_nameController.text.isNotEmpty ? _nameController.text : (_registeredName ?? "User")}! 👋',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  'Cell: +91 $tenDigitPhone • Profile Verified 🔒',
                                  style: const TextStyle(
                                    color: Color(0xFF00FF00),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Category Pill Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00FF00).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF00FF00).withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          selectedLabel,
                          style: const TextStyle(
                            color: Color(0xFF00FF00),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),

                      const SizedBox(height: 14),

                      // In-Card 4-Digit Quick PIN Input
                      TextField(
                        controller: _pinController,
                        keyboardType: TextInputType.number,
                        obscureText: true,
                        maxLength: 4,
                        style: const TextStyle(color: Colors.white, fontSize: 18, letterSpacing: 8),
                        textAlign: TextAlign.center,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(4),
                        ],
                        decoration: InputDecoration(
                          labelText: 'Enter 4-Digit Quick PIN',
                          labelStyle: const TextStyle(color: Color(0xFF00FF00), fontSize: 12),
                          counterText: '',
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: const Color(0xFF00FF00).withValues(alpha: 0.6)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: Color(0xFF00FF00), width: 2),
                          ),
                        ),
                        onChanged: (val) {
                          setState(() => _pinError = '');
                          if (val.length == 4) {
                            _verifyQuickPin(tenDigitPhone, val);
                          }
                        },
                      ),

                      if (_pinError.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          _pinError,
                          style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],

                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : () => _unlockWithBiometrics(tenDigitPhone),
                              icon: const Icon(Icons.fingerprint, color: Colors.black, size: 18),
                              label: const Text(
                                '👆 BIOMETRIC UNLOCK',
                                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                                maxLines: 1,
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00FF00),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : _startWhatsAppInboundAuth,
                              icon: const Icon(Icons.flash_on_rounded, color: Colors.black, size: 18),
                              label: const Text(
                                '⚡ WHATSAPP LOGIN',
                                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                                maxLines: 1,
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00FF00),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _isLoading ? null : () {
                                setState(() => _useOtpFallback = true);
                                _sendOTP();
                              },
                              icon: const Icon(Icons.chat_bubble_rounded, color: Colors.black, size: 18),
                              label: const Text(
                                '💬 WHATSAPP OTP',
                                style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10),
                                maxLines: 1,
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF25D366),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 8),

                      TextButton(
                        onPressed: () {
                          setState(() {
                            _isDeviceRegistered = false;
                            _registeredPhone = null;
                            _phoneController.clear();
                            _nameController.clear();
                          });
                        },
                        child: Text(
                          'Not ${_nameController.text.isNotEmpty ? _nameController.text : "this user"}? Switch user / Register',
                          style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // ── 4. Fallback Error Banner ─────────────────────────────────────
              if (_errorMsg.isNotEmpty) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFEF4444)),
                  ),
                  child: Text(
                    _errorMsg,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // ── 5. Inbound WhatsApp Polling Card ─────────────────────────────
              if (_isPolling) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF25D366), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF25D366).withValues(alpha: 0.2),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const SizedBox(
                        width: 48,
                        height: 48,
                        child: CircularProgressIndicator(
                          color: Color(0xFF25D366),
                          strokeWidth: 3.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        '⏳ Waiting for WhatsApp Verification...',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'WhatsApp deep link opened. Send the pre-filled message in WhatsApp and you will be logged in automatically!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 18),
                      SizedBox(
                        width: double.infinity,
                        height: 44,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            if (_deepLinkUrl != null) {
                              final uri = Uri.parse(_deepLinkUrl!);
                              await launchUrl(uri, mode: LaunchMode.externalApplication);
                            }
                          },
                          icon: const Icon(Icons.chat_rounded, color: Colors.black),
                          label: const Text(
                            'Re-open WhatsApp Chat',
                            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextButton(
                        onPressed: () {
                          _stopPolling();
                          setState(() => _useOtpFallback = true);
                        },
                        child: const Text(
                          'Cancel & Use OTP Fallback',
                          style: TextStyle(color: Color(0xFF00F0FF), fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ] else if (!_isOTPSent) ...[
                // ── 6. Mobile WhatsApp Number Input Field (Green Bordered) ─────
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    prefixIcon: Icon(
                      _isSimAutofetched ? Icons.sim_card_rounded : Icons.phone_rounded,
                      color: const Color(0xFF00FF00),
                    ),
                    prefixText: '+91 ',
                    prefixStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    labelText: _isSimAutofetched
                        ? '⚡ WhatsApp Cell Number (Autofetched SIM)'
                        : 'Mobile WhatsApp Number',
                    labelStyle: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: const Color(0xFF00FF00).withValues(alpha: 0.6)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF00FF00), width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 4),

                // Status info row below phone input
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        _isCheckingProfile
                            ? '⏳ Checking registered profile...'
                            : _isDeviceRegistered
                                ? '✓ Profile Loaded: ${_nameController.text.isNotEmpty ? _nameController.text : "Registered User"}'
                                : _isSimAutofetched
                                    ? '✓ Auto-detected SIM number'
                                    : '',
                        style: TextStyle(
                          color: _isCheckingProfile ? const Color(0xFFFFD700) : const Color(0xFF00FF00),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      '${_phoneController.text.length}/10',
                      style: const TextStyle(color: Color(0xFF00FF00), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // ── 7. Full Name Input Field (Green Bordered) ───────────────────
                TextField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.person_rounded, color: Color(0xFF00F0FF)),
                    labelText: 'Your Full Name (பெயர்)',
                    labelStyle: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: const Color(0xFF00FF00).withValues(alpha: 0.6)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF00FF00), width: 2),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // ── 8. Primary Goal Category Dropdown Selector ─────────────────
                DropdownButtonFormField<String>(
                  initialValue: _selectedCategoryKey,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.category_rounded, color: Color(0xFFFFD700)),
                    labelText: 'Choose Your Primary Goal',
                    labelStyle: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: const Color(0xFF00FF00).withValues(alpha: 0.6)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF00FF00), width: 2),
                    ),
                  ),
                  items: _userCategories.map((cat) {
                    return DropdownMenuItem<String>(
                      value: cat.key,
                      child: Text(cat.label, style: const TextStyle(color: Colors.white)),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _selectedCategoryKey = val);
                    }
                  },
                ),

                const SizedBox(height: 24),

                // ── 9. Primary Action Button: WhatsApp Instant Deep Link vs OTP Fallback ──
                if (!_useOtpFallback) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _startWhatsAppInboundAuth,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.black,
                        elevation: 10,
                        shadowColor: const Color(0xFF25D366).withValues(alpha: 0.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                            )
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.flash_on_rounded, color: Colors.black, size: 22),
                                SizedBox(width: 8),
                                Text(
                                  '⚡ Verify Instant via WhatsApp (1-Tap)',
                                  style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                              ],
                            ),
                    ),
                  ),
                ] else ...[
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _sendOTP,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00FF00),
                        foregroundColor: Colors.black,
                        elevation: 10,
                        shadowColor: const Color(0xFF00FF00).withValues(alpha: 0.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _useWhatsAppAuth ? Icons.chat_bubble_rounded : Icons.sms_rounded,
                                  color: Colors.black,
                                  size: 20,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  _cooldownSeconds > 0
                                      ? 'Resend OTP in ${_cooldownSeconds}s'
                                      : _useWhatsAppAuth ? 'Send WhatsApp OTP Code' : 'Send SMS OTP Code',
                                  style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                              ],
                            ),
                    ),
                  ),
                ],
              ] else ...[
                // ── 10. OTP Verification Mode ──────────────────────────────────
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 24, letterSpacing: 8),
                  maxLength: 6,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.sms_rounded, color: Color(0xFF00FF00)),
                    labelText: _useWhatsAppAuth ? '6-Digit WhatsApp OTP' : '6-Digit SMS OTP',
                    labelStyle: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: const Color(0xFF00FF00).withValues(alpha: 0.6)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF00FF00), width: 2),
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Open WhatsApp Chat Direct Button
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      final clean = _phoneController.text.replaceAll(RegExp(r'\D'), '');
                      await WhatsAppService.openWhatsApp(
                        phone: '916381029380',
                        message: 'Hi FAGO! Send my login OTP for +91 $clean',
                      );
                    },
                    icon: const Icon(Icons.chat_rounded, color: Colors.black),
                    label: const Text(
                      'Open WhatsApp Chat to Get OTP',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOTP,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00FF00),
                      foregroundColor: Colors.black,
                      elevation: 10,
                      shadowColor: const Color(0xFF00FF00).withValues(alpha: 0.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                          )
                        : const Text(
                            'Verify OTP & Enter FAGO',
                            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                  ),
                ),
              ],

              const SizedBox(height: 16),

              // Switch auth method link
              TextButton(
                onPressed: () {
                  setState(() {
                    _useOtpFallback = !_useOtpFallback;
                    _isOTPSent = false;
                    _otpController.clear();
                    _errorMsg = '';
                  });
                },
                child: Text(
                  _useOtpFallback ? '⚡ Switch to Instant WhatsApp Verification' : '🔑 Switch to 6-Digit OTP Fallback Method',
                  style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
