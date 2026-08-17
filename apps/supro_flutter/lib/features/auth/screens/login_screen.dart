import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../providers/auth_provider.dart';
import '../../../shared/widgets/daily_deepam_video_player.dart';

enum AuthStep { phone, otp, pinFallback, setPin }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  AuthStep _step = AuthStep.phone;
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();
  final TextEditingController _newPinController = TextEditingController();
  final TextEditingController _confirmPinController = TextEditingController();

  // Registration data
  final TextEditingController _nameController = TextEditingController();
  String _category = 'Traveller';

  bool _isChecking = false;
  bool? _isExistingUser;
  bool _hasPin = false;
  String _fullName = '';
  bool _showPin = false;

  // Daily Deepam Video Player states
  bool _isDailyVideoRequired = false;
  String _dailyVideoId = 'xhYONNuUZuk';
  String _dailyVideoTitle = 'SuprO commercial ad #suprotrailer #suprotec #supro';
  bool _isDailyVideoFinished = false;

  final List<Map<String, String>> categories = [
    {'key': 'Admin', 'label': '👑 Admin (CRM & All Modules)'},
    {'key': 'Traveller', 'label': '🧳 Traveller (RideO)'},
    {'key': 'Farmer', 'label': '🚜 Farmer (RentO Agri)'},
    {'key': 'Shopper', 'label': '🛍️ Shopper (DealO)'},
    {'key': 'Driver', 'label': '🚖 Driver (DriveO)'},
    {'key': 'Student', 'label': '🎓 Student (TeachO)'},
    {'key': 'Teacher', 'label': '👨‍🏫 Teacher (TeachO)'},
    {'key': 'Financier', 'label': '💰 Financier (MoneyO)'},
    {'key': 'Tourist', 'label': '🛕 Tourist (TourO)'},
  ];

  @override
  void initState() {
    super.initState();
    _checkDailyVideo();
  }

  Future<void> _checkDailyVideo() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final today = DateTime.now().toIso8601String().split('T')[0];
      final savedDate = prefs.getString('supro_daily_video_date');

      if (savedDate != today) {
        setState(() {
          _isDailyVideoRequired = true;
          _isDailyVideoFinished = false;
        });
        _fetchLatestVideo();
      } else {
        setState(() {
          _isDailyVideoRequired = false;
          _isDailyVideoFinished = true;
        });
      }
    } catch (_) {
      setState(() {
        _isDailyVideoRequired = false;
        _isDailyVideoFinished = true;
      });
    }
  }

  Future<void> _fetchLatestVideo() async {
    try {
      final res = await http.get(
        Uri.parse('https://www.youtube.com/feeds/videos.xml?channel_id=UC0K47n1iAXa_aAKhGZzdhDQ'),
        headers: {'Accept': 'application/xml, text/xml, */*'},
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final xml = res.body;
        final idMatch = RegExp(r'<yt:videoId>([^<]+)</yt:videoId>').firstMatch(xml);
        final titleMatch = RegExp(r'<title>([^<]+)</title>').allMatches(xml);

        if (idMatch != null && idMatch.group(1) != null) {
          if (mounted) {
            setState(() {
              _dailyVideoId = idMatch.group(1)!;
              if (titleMatch.length > 1 && titleMatch.elementAt(1).group(1) != null) {
                _dailyVideoTitle = titleMatch.elementAt(1).group(1)!;
              }
            });
          }
        }
      }
    } catch (_) {}
  }

  Future<void> _handleDailyVideoEnded() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().split('T')[0];
    await prefs.setString('supro_daily_video_date', today);

    if (mounted) {
      setState(() {
        _isDailyVideoFinished = true;
        _isDailyVideoRequired = false;
      });
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _pinController.dispose();
    _newPinController.dispose();
    _confirmPinController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _onPhoneChange(String val) async {
    final clean = val.replaceAll(RegExp(r'\D'), '');
    if (clean.length == 10) {
      setState(() => _isChecking = true);
      try {
        final data = await ref.read(authControllerProvider.notifier).checkUser(clean);
        setState(() {
          _isExistingUser = data['exists'];
          if (_isExistingUser == true) {
            _fullName = data['name'] ?? data['full_name'] ?? '';
            _category = data['category'] ?? 'Traveller';
            _hasPin = data['has_pin'] ?? false;
            if (_hasPin) {
              _step = AuthStep.pinFallback;
            }
          }
        });
        if (_isExistingUser == true && data['gemini_api_key'] != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('gemini_api_key', data['gemini_api_key']);
        }
      } catch (e) {
        setState(() => _isExistingUser = false);
      } finally {
        setState(() => _isChecking = false);
      }
    } else {
      setState(() {
        _isExistingUser = null;
        _hasPin = false;
      });
    }
  }

  Future<void> _requestOtp() async {
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length != 10) return;

    setState(() => _step = AuthStep.otp);
    final msg = Uri.encodeComponent(
      '🔐 SuprO Login Verification\n\nMobile: $cleanPhone\nAction: Request OTP\n\nPlease send my 6-digit login OTP.',
    );
    final url = Uri.parse('https://wa.me/916381029380?text=$msg');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _verifyOtp() async {
    final cleanOtp = _otpController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanOtp.length != 6) return;

    try {
      final res = await ref.read(authControllerProvider.notifier).verifyOtp(
        phone: _phoneController.text.replaceAll(RegExp(r'\D'), ''),
        otp: cleanOtp,
        fullName: _isExistingUser == false ? _nameController.text.trim() : null,
        category: _isExistingUser == false ? _category : null,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_phone', _phoneController.text.replaceAll(RegExp(r'\D'), ''));
      await prefs.setString('last_whatsapp_sync_timestamp', DateTime.now().millisecondsSinceEpoch.toString());
      await prefs.setBool('onboarding_complete', true);

      if (res['needs_pin_setup'] == true || res['hasPin'] == false) {
        setState(() => _step = AuthStep.setPin);
      } else {
        if (mounted) context.go('/startup');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text(e.toString())),
        );
      }
    }
  }

  void _loginWithPin() async {
    final cleanPin = _pinController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanPin.length != 4) return;
    try {
      await ref.read(authControllerProvider.notifier).loginWithPin(
        phone: _phoneController.text.replaceAll(RegExp(r'\D'), ''),
        pin: cleanPin,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_phone', _phoneController.text.replaceAll(RegExp(r'\D'), ''));
      await prefs.setString('last_whatsapp_sync_timestamp', DateTime.now().millisecondsSinceEpoch.toString());
      await prefs.setBool('onboarding_complete', true);

      if (mounted) context.go('/startup');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text(e.toString())),
        );
      }
    }
  }

  void _setPin() async {
    final cleanNew = _newPinController.text.replaceAll(RegExp(r'\D'), '');
    final cleanConfirm = _confirmPinController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanNew.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(backgroundColor: Colors.redAccent, content: Text('PIN must be 4 digits')),
      );
      return;
    }
    if (cleanNew != cleanConfirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(backgroundColor: Colors.redAccent, content: Text('PINs do not match')),
      );
      return;
    }

    try {
      await ref.read(authControllerProvider.notifier).setPin(
        phone: _phoneController.text.replaceAll(RegExp(r'\D'), ''),
        pin: cleanNew,
        confirmPin: cleanConfirm,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_phone', _phoneController.text.replaceAll(RegExp(r'\D'), ''));
      await prefs.setString('last_whatsapp_sync_timestamp', DateTime.now().millisecondsSinceEpoch.toString());
      await prefs.setBool('onboarding_complete', true);

      if (mounted) context.go('/startup');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text(e.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1526),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: const Color(0x3310B981), width: 1.2),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x1A10B981),
                      blurRadius: 24,
                      offset: Offset(0, 8),
                    )
                  ],
                ),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _buildCurrentStep(isLoading),
                ),
              ),

              // Daily Deepam Video Player Broadcast
              if (_isDailyVideoRequired)
                DailyDeepamVideoPlayer(
                  videoId: _dailyVideoId,
                  videoTitle: _dailyVideoTitle,
                  onVideoEnded: _handleDailyVideoEnded,
                )
              else
                Padding(
                  padding: const EdgeInsets.only(top: 24.0),
                  child: Column(
                    children: [
                      const Text(
                        '✦ SUPRO DEEPAM ENGINE ✦',
                        style: TextStyle(
                          color: Color(0xFFFBBF24),
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Authentication verified by SuprO Engine',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.5),
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'வாழ்க • வளர்க • வெல்க 🌿',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Stack(
          alignment: Alignment.topRight,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFF0A0F1E),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: const Color(0xFF10B981).withValues(alpha: 0.6),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withValues(alpha: 0.4),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.asset(
                  'assets/logo.png',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Icon(LucideIcons.sparkles, color: Color(0xFF10B981), size: 36),
                  ),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Color(0xFFFBBF24),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFFFBBF24),
                    blurRadius: 8,
                    spreadRadius: 1,
                  )
                ],
              ),
              child: const Icon(LucideIcons.sparkles, color: Colors.black, size: 10),
            ),
          ],
        ),
        const SizedBox(height: 14),
        const Text(
          'SuprO',
          style: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w900,
            color: Color(0xFF34D399),
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 2),
        const Text(
          '✦ FOR LOCAL NEEDS ✦',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            color: Color(0xFFFBBF24),
            letterSpacing: 2.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _step == AuthStep.setPin
              ? '🔐 Set Your 4-Digit Secret PIN'
              : '🔒 Secure Auth via WhatsApp',
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withValues(alpha: 0.6),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrentStep(bool isLoading) {
    switch (_step) {
      case AuthStep.phone:
        return _buildPhoneStep(isLoading);
      case AuthStep.otp:
        return _buildOtpStep(isLoading);
      case AuthStep.pinFallback:
        return _buildPinStep(isLoading);
      case AuthStep.setPin:
        return _buildSetPinStep(isLoading);
    }
  }

  Widget _buildPhoneStep(bool isLoading) {
    final clean = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    final isVideoLocked = _isDailyVideoRequired && !_isDailyVideoFinished;

    return Column(
      key: const ValueKey('phone_step'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'MOBILE NUMBER',
          style: TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          maxLength: 10,
          onChanged: _onPhoneChange,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
          decoration: InputDecoration(
            counterText: '',
            prefixIcon: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 14),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.smartphone, color: Color(0xFF10B981), size: 18),
                  SizedBox(width: 8),
                  Text(
                    '+91',
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  SizedBox(width: 8),
                  VerticalDivider(color: Color(0x3310B981), thickness: 1, width: 1),
                ],
              ),
            ),
            hintText: '10-digit mobile number',
            hintStyle: const TextStyle(color: Color(0xFF475569)),
            filled: true,
            fillColor: const Color(0xFF111C35),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFF10B981), width: 1.5),
            ),
          ),
        ),

        // New User Form
        if (clean.length == 10 && _isExistingUser == false && !_isChecking) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
            ),
            child: const Row(
              children: [
                Icon(LucideIcons.userCheck, color: Color(0xFF60A5FA), size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CREATE NEW ACCOUNT',
                        style: TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        "Looks like you're new! Let's set up your profile.",
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'FULL NAME',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _nameController,
            onChanged: (val) => setState(() {}),
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Your Full Name',
              hintStyle: const TextStyle(color: Color(0xFF475569)),
              filled: true,
              fillColor: const Color(0xFF111C35),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'PRIMARY ROLE',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF111C35),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _category,
                dropdownColor: const Color(0xFF111C35),
                isExpanded: true,
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                items: categories.map((c) {
                  return DropdownMenuItem<String>(
                    value: c['key'],
                    child: Text(c['label']!),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _category = val);
                },
              ),
            ),
          ),
        ],

        // Welcome Back Banner
        if (clean.length == 10 && _isExistingUser == true && !_isChecking) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.userCheck, color: Color(0xFF10B981), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'WELCOME BACK',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _fullName.isNotEmpty ? _fullName : 'Verified User',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Text(
                        categories.firstWhere(
                          (c) => c['key'] == _category,
                          orElse: () => {'label': _category},
                        )['label']!,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],

        if (clean.length == 10 && _isChecking) ...[
          const SizedBox(height: 12),
          const Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981)),
                ),
                SizedBox(width: 8),
                Text(
                  'Checking profile...',
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 12),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 18),

        // Send OTP Button
        ElevatedButton.icon(
          onPressed: (clean.length != 10 ||
                  (_isExistingUser == false && _nameController.text.trim().isEmpty) ||
                  _isChecking ||
                  isVideoLocked ||
                  isLoading)
              ? null
              : _requestOtp,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF10B981),
            disabledBackgroundColor: const Color(0xFF1E293B),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          icon: isVideoLocked
              ? const Icon(LucideIcons.sparkles, color: Color(0xFFFBBF24), size: 18)
              : const Icon(LucideIcons.messageCircle, size: 18),
          label: Text(
            isVideoLocked
                ? '▶ Watching Daily Message...'
                : 'Send OTP via WhatsApp',
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
          ),
        ),

        const SizedBox(height: 10),

        // Fallback PIN Button
        OutlinedButton.icon(
          onPressed: (clean.length != 10 || isVideoLocked || isLoading)
              ? null
              : () => setState(() => _step = AuthStep.pinFallback),
          style: OutlinedButton.styleFrom(
            foregroundColor: const Color(0xFF10B981),
            side: BorderSide(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
            padding: const EdgeInsets.symmetric(vertical: 13),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          icon: const Icon(LucideIcons.keyRound, size: 16),
          label: Text(
            isVideoLocked
                ? 'Complete daily message to login'
                : 'Use Fallback PIN Instead',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpStep(bool isLoading) {
    final cleanOtp = _otpController.text.replaceAll(RegExp(r'\D'), '');

    return Column(
      key: const ValueKey('otp_step'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          '6-DIGIT WHATSAPP OTP',
          style: TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          onChanged: (val) {
            setState(() {});
            final digits = val.replaceAll(RegExp(r'\D'), '');
            if (digits.length == 6) {
              _verifyOtp();
            }
          },
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
            letterSpacing: 6,
          ),
          decoration: InputDecoration(
            counterText: '',
            prefixIcon: const Icon(LucideIcons.lock, color: Color(0xFF10B981), size: 18),
            hintText: '••••••',
            hintStyle: const TextStyle(color: Color(0xFF475569)),
            filled: true,
            fillColor: const Color(0xFF111C35),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFF10B981)),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          "We opened WhatsApp for you. Hit send and we'll immediately reply with your OTP.",
          style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: (isLoading || cleanOtp.length != 6) ? null : _verifyOtp,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF10B981),
            disabledBackgroundColor: const Color(0xFF1E293B),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: isLoading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text(
                  'Verify OTP & Continue',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
        ),
        TextButton(
          onPressed: () => setState(() => _step = AuthStep.phone),
          child: const Text('← Go back', style: TextStyle(color: Color(0xFF94A3B8))),
        ),
      ],
    );
  }

  Widget _buildPinStep(bool isLoading) {
    final cleanPin = _pinController.text.replaceAll(RegExp(r'\D'), '');

    return Column(
      key: const ValueKey('pin_step'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          '4-DIGIT SECURE PIN',
          style: TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _pinController,
          keyboardType: TextInputType.number,
          maxLength: 4,
          obscureText: !_showPin,
          textAlign: TextAlign.center,
          onChanged: (val) {
            setState(() {});
            final digits = val.replaceAll(RegExp(r'\D'), '');
            if (digits.length == 4) {
              _loginWithPin();
            }
          },
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
            letterSpacing: 6,
          ),
          decoration: InputDecoration(
            counterText: '',
            prefixIcon: const Icon(LucideIcons.lock, color: Color(0xFFFBBF24), size: 18),
            suffixIcon: IconButton(
              icon: Icon(
                _showPin ? LucideIcons.eyeOff : LucideIcons.eye,
                color: const Color(0xFF94A3B8),
                size: 18,
              ),
              onPressed: () => setState(() => _showPin = !_showPin),
            ),
            hintText: '••••',
            hintStyle: const TextStyle(color: Color(0xFF475569)),
            filled: true,
            fillColor: const Color(0xFF111C35),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: Color(0xFFFBBF24)),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Use your PIN set during registration. If forgotten, login via WhatsApp OTP.',
          style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: (isLoading || cleanPin.length != 4) ? null : _loginWithPin,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFBBF24),
            disabledBackgroundColor: const Color(0xFF1E293B),
            foregroundColor: Colors.black,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: isLoading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                )
              : const Text(
                  'Sign In with PIN',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
        ),
        TextButton(
          onPressed: () => setState(() => _step = AuthStep.phone),
          child: const Text('← Go back', style: TextStyle(color: Color(0xFF94A3B8))),
        ),
      ],
    );
  }

  Widget _buildSetPinStep(bool isLoading) {
    final cleanNew = _newPinController.text.replaceAll(RegExp(r'\D'), '');
    final cleanConfirm = _confirmPinController.text.replaceAll(RegExp(r'\D'), '');

    return Column(
      key: const ValueKey('set_pin_step'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFFBBF24).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.3)),
          ),
          child: const Column(
            children: [
              Text(
                '🔐 One Last Step!',
                style: TextStyle(
                  color: Color(0xFFFBBF24),
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Set a 4-digit PIN for quick future logins when WhatsApp OTP is unavailable.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 11),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        const Text(
          'NEW 4-DIGIT PIN',
          style: TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _newPinController,
          keyboardType: TextInputType.number,
          maxLength: 4,
          obscureText: true,
          textAlign: TextAlign.center,
          onChanged: (val) => setState(() {}),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            letterSpacing: 4,
          ),
          decoration: InputDecoration(
            counterText: '',
            prefixIcon: const Icon(LucideIcons.keyRound, color: Color(0xFFFBBF24), size: 18),
            filled: true,
            fillColor: const Color(0xFF111C35),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'CONFIRM PIN',
          style: TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _confirmPinController,
          keyboardType: TextInputType.number,
          maxLength: 4,
          obscureText: true,
          textAlign: TextAlign.center,
          onChanged: (val) => setState(() {}),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            letterSpacing: 4,
          ),
          decoration: InputDecoration(
            counterText: '',
            prefixIcon: const Icon(LucideIcons.keyRound, color: Color(0xFFFBBF24), size: 18),
            filled: true,
            fillColor: const Color(0xFF111C35),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: (isLoading || cleanNew.length != 4 || cleanConfirm.length != 4) ? null : _setPin,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFBBF24),
            disabledBackgroundColor: const Color(0xFF1E293B),
            foregroundColor: Colors.black,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text(
            'Save PIN & Enter App',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
          ),
        ),
      ],
    );
  }
}
