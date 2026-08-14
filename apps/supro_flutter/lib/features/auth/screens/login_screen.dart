import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/auth_provider.dart';

enum AuthStep { phone, otp, pinFallback, setPin }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  AuthStep _step = AuthStep.phone;
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();
  final TextEditingController _newPinController = TextEditingController();
  final TextEditingController _confirmPinController = TextEditingController();
  
  final TextEditingController _nameController = TextEditingController();
  String _category = 'buyer';

  bool _isChecking = false;
  bool? _isExistingUser;
  String _existingName = '';

  final List<Map<String, String>> categories = [
    {'key': 'buyer', 'label': 'Shopper / General User'},
    {'key': 'driver', 'label': 'Driver / Transport Partner'},
    {'key': 'student', 'label': 'Student / Jobseeker'},
    {'key': 'farmer', 'label': 'Farmer / Agriculture'},
    {'key': 'owner', 'label': 'Business / Service Provider'},
  ];

  @override
  void initState() {
    super.initState();
    _phoneController.addListener(_onPhoneChanged);
  }

  @override
  void dispose() {
    _phoneController.removeListener(_onPhoneChanged);
    _phoneController.dispose();
    _otpController.dispose();
    _pinController.dispose();
    _newPinController.dispose();
    _confirmPinController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _onPhoneChanged() {
    final text = _phoneController.text.trim();
    if (text.length == 10) {
      _checkUserStatus(text);
    } else {
      if (_isExistingUser != null) {
        setState(() {
          _isExistingUser = null;
          _isChecking = false;
        });
      }
    }
  }

  Future<void> _checkUserStatus(String phone) async {
    setState(() => _isChecking = true);
    try {
      final authService = ref.read(authServiceProvider);
      final profile = await authService.getProfileByPhone(phone);
      if (!mounted) return;
      if (profile != null) {
        setState(() {
          _isExistingUser = true;
          _existingName = profile['full_name'] ?? '';
          _isChecking = false;
        });
      } else {
        setState(() {
          _isExistingUser = false;
          _isChecking = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isChecking = false);
    }
  }

  Future<void> _requestOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit mobile number')),
      );
      return;
    }

    final authNotifier = ref.read(authNotifierProvider.notifier);
    final success = await authNotifier.requestOtp(
      phone,
      isNewUser: _isExistingUser == false,
      name: _nameController.text.trim(),
      category: _category,
    );

    if (success && mounted) {
      setState(() => _step = AuthStep.otp);
    }
  }

  Future<void> _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a 6-digit OTP')),
      );
      return;
    }

    final authNotifier = ref.read(authNotifierProvider.notifier);
    final success = await authNotifier.verifyOtp(_phoneController.text.trim(), otp);

    if (success && mounted) {
      if (_isExistingUser == false) {
        setState(() => _step = AuthStep.setPin);
      } else {
        _handlePostAuth();
      }
    }
  }

  Future<void> _loginWithPin() async {
    final pin = _pinController.text.trim();
    if (pin.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a 4-digit PIN')),
      );
      return;
    }

    final authNotifier = ref.read(authNotifierProvider.notifier);
    final success = await authNotifier.loginWithPin(_phoneController.text.trim(), pin);

    if (success && mounted) {
      _handlePostAuth();
    }
  }

  Future<void> _setPin() async {
    final p1 = _newPinController.text.trim();
    final p2 = _confirmPinController.text.trim();

    if (p1.length != 4 || p2.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PIN must be 4 digits')),
      );
      return;
    }

    if (p1 != p2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PINs do not match')),
      );
      return;
    }

    final authNotifier = ref.read(authNotifierProvider.notifier);
    final success = await authNotifier.setPin(p1);

    if (success && mounted) {
      _handlePostAuth();
    }
  }

  void _handlePostAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingComplete = prefs.getBool('onboarding_complete') ?? false;

    if (mounted) {
      if (onboardingComplete) {
        context.go('/home');
      } else {
        context.go('/onboarding/biometric');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1D),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight - 40),
                child: IntrinsicHeight(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 20),
                      _buildHeader(),
                      const SizedBox(height: 36),
                      if (authState.hasError) ...[
                        _buildErrorMessage(authState.error.toString()),
                        const SizedBox(height: 20),
                      ],
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        child: _buildCurrentStep(isLoading),
                      ),
                      const Spacer(),
                      _buildFooter(),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF334155)),
            boxShadow: const [
              BoxShadow(color: Color(0x33000000), blurRadius: 16, offset: Offset(0, 8)),
            ],
          ),
          child: const Center(
            child: Icon(LucideIcons.sparkles, color: Color(0xFF34D399), size: 36),
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'SuprO Super App',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
        ),
        const SizedBox(height: 6),
        const Text(
          'Fast, direct, and zero-commission access.',
          style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8)),
        ),
      ],
    );
  }

  Widget _buildErrorMessage(String msg) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0x1AEF4444),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x33EF4444)),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.alertCircle, color: Color(0xFFEF4444), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(msg.replaceAll('Exception: ', ''), style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
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
    return Column(
      key: const ValueKey('phone'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_isExistingUser == true) _buildWelcomeBack(),
        _buildInputLabel('PHONE NUMBER'),
        const SizedBox(height: 8),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          maxLength: 10,
          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 2),
          decoration: _buildInputDecoration(
            '10-digit mobile number',
            prefixIcon: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text('+91 ', style: TextStyle(color: Color(0xFF34D399), fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
        ),
        if (_isChecking) const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Center(child: CircularProgressIndicator(color: Color(0xFF34D399)))),
        
        if (_isExistingUser == false) ...[
          const SizedBox(height: 20),
          _buildInputLabel('FULL NAME'),
          const SizedBox(height: 8),
          TextField(
            controller: _nameController, 
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
            decoration: _buildInputDecoration('Enter your name', prefixIcon: const Icon(LucideIcons.user, color: Color(0xFF94A3B8)))
          ),
          const SizedBox(height: 20),
          _buildInputLabel('ROLE'),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _category,
            dropdownColor: const Color(0xFF1E293B),
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
            decoration: _buildInputDecoration('Select role', prefixIcon: const Icon(LucideIcons.briefcase, color: Color(0xFF94A3B8))),
            items: categories.map((c) => DropdownMenuItem(value: c['key'], child: Text(c['label']!))).toList(),
            onChanged: (v) => setState(() => _category = v!),
          ),
        ],

        const SizedBox(height: 32),
        _buildPrimaryButton(
          'Send OTP via WhatsApp',
          LucideIcons.messageCircle,
          _phoneController.text.length == 10 && !_isChecking ? _requestOtp : null,
          false,
        ),
        const SizedBox(height: 16),
        if (_phoneController.text.length == 10 && _isExistingUser != false)
          OutlinedButton(
            onPressed: () => setState(() => _step = AuthStep.pinFallback),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 18),
              side: const BorderSide(color: Color(0xFF34D399), width: 1.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              backgroundColor: const Color(0x0D34D399),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(LucideIcons.key, color: Color(0xFF34D399), size: 20),
                SizedBox(width: 8),
                Text('Use Fallback PIN Instead', style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 15)),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildOtpStep(bool isLoading) {
    return Column(
      key: const ValueKey('otp'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInputLabel('6-DIGIT WHATSAPP OTP'),
        const SizedBox(height: 12),
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          style: const TextStyle(fontSize: 32, letterSpacing: 12, fontWeight: FontWeight.w900, color: Colors.white),
          textAlign: TextAlign.center,
          decoration: _buildInputDecoration('      '),
        ),
        const SizedBox(height: 32),
        _buildPrimaryButton('Verify OTP & Continue', LucideIcons.shieldCheck, isLoading ? null : _verifyOtp, isLoading),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => setState(() => _step = AuthStep.phone), 
          child: const Center(child: Text('Go back', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16, fontWeight: FontWeight.bold)))
        )
      ],
    );
  }

  Widget _buildPinStep(bool isLoading) {
    return Column(
      key: const ValueKey('pinFallback'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_isExistingUser == true) _buildWelcomeBack(),
        _buildInputLabel('4-DIGIT SECURE PIN'),
        const SizedBox(height: 12),
        TextField(
          controller: _pinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          style: const TextStyle(fontSize: 32, letterSpacing: 16, fontWeight: FontWeight.w900, color: Colors.white),
          textAlign: TextAlign.center,
          decoration: _buildInputDecoration('    '),
        ),
        const SizedBox(height: 32),
        _buildPrimaryButton('Sign In with PIN', LucideIcons.unlock, isLoading ? null : _loginWithPin, isLoading),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => setState(() => _step = AuthStep.phone), 
          child: const Center(child: Text('Go back', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16, fontWeight: FontWeight.bold)))
        )
      ],
    );
  }

  Widget _buildSetPinStep(bool isLoading) {
    return Column(
      key: const ValueKey('setPin'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInputLabel('SET 4-DIGIT SECURE PIN'),
        const SizedBox(height: 12),
        TextField(
          controller: _newPinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          style: const TextStyle(fontSize: 32, letterSpacing: 16, fontWeight: FontWeight.w900, color: Colors.white),
          textAlign: TextAlign.center,
          decoration: _buildInputDecoration('    '),
        ),
        const SizedBox(height: 20),
        _buildInputLabel('CONFIRM PIN'),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmPinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          style: const TextStyle(fontSize: 32, letterSpacing: 16, fontWeight: FontWeight.w900, color: Colors.white),
          textAlign: TextAlign.center,
          decoration: _buildInputDecoration('    '),
        ),
        const SizedBox(height: 32),
        _buildPrimaryButton('Save PIN & Continue', LucideIcons.save, isLoading ? null : _setPin, isLoading),
      ],
    );
  }

  Widget _buildWelcomeBack() {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0x1A10B981),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x3310B981)),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.checkCircle, color: Color(0xFF34D399), size: 20),
          const SizedBox(width: 12),
          Text('Welcome back, $_existingName!', style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildInputLabel(String label) {
    return Text(
      label,
      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.2),
    );
  }

  InputDecoration _buildInputDecoration(String hint, {Widget? prefixIcon}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF475569)),
      prefixIcon: prefixIcon,
      prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
      filled: true,
      fillColor: const Color(0xFF1E293B),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF334155))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF334155))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF34D399), width: 2)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      counterText: '',
    );
  }

  Widget _buildPrimaryButton(String text, IconData icon, VoidCallback? onPressed, bool isLoading) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 18),
        backgroundColor: const Color(0xFF34D399),
        disabledBackgroundColor: const Color(0xFF334155),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 0,
      ),
      child: isLoading
          ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5))
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: Colors.black, size: 20),
                const SizedBox(width: 8),
                Text(text, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
    );
  }

  Widget _buildFooter() {
    return const Column(
      children: [
        SizedBox(height: 24),
        Text(
          'SuprO Ecosystem • Unified Open Access',
          style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w500),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
