import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
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
  
  // Registration data
  final TextEditingController _nameController = TextEditingController();
  String _category = 'Traveller';
  
  bool _isChecking = false;
  bool? _isExistingUser;
  bool _hasPin = false;
  String _fullName = '';

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  final List<Map<String, String>> categories = [
    {'key': 'Admin', 'label': '👑 Admin (CRM)'},
    {'key': 'Traveller', 'label': '🧳 Traveller'},
    {'key': 'Farmer', 'label': '🚜 Farmer'},
    {'key': 'Shopper', 'label': '🛍️ Shopper'},
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    _pinController.dispose();
    _newPinController.dispose();
    _confirmPinController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _onPhoneChange(String val) async {
    if (val.length == 10) {
      setState(() => _isChecking = true);
      try {
        final data = await ref.read(authControllerProvider.notifier).checkUser(val);
        setState(() {
          _isExistingUser = data['exists'];
          if (_isExistingUser == true) {
            _fullName = data['name'] ?? '';
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
    if (_phoneController.text.length != 10) return;
    setState(() => _step = AuthStep.otp);
    final url = Uri.parse('https://wa.me/916381029380?text=Requesting%20OTP%20for%20Login');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _verifyOtp() async {
    if (_otpController.text.length != 6) return;
    
    try {
      final res = await ref.read(authControllerProvider.notifier).verifyOtp(
        phone: _phoneController.text,
        otp: _otpController.text,
        fullName: _isExistingUser == false ? _nameController.text : null,
        category: _isExistingUser == false ? _category : null,
      );
      
      if (res['needs_pin_setup'] == true) {
        setState(() => _step = AuthStep.setPin);
      } else {
        if (mounted) context.go('/dashboard');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(backgroundColor: Colors.redAccent, content: Text(e.toString())));
    }
  }

  void _loginWithPin() async {
    if (_pinController.text.length != 4) return;
    try {
      await ref.read(authControllerProvider.notifier).loginWithPin(
        phone: _phoneController.text,
        pin: _pinController.text,
      );
      if (mounted) context.go('/dashboard');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(backgroundColor: Colors.redAccent, content: Text(e.toString())));
    }
  }

  void _setPin() async {
    if (_newPinController.text.length != 4 || _newPinController.text != _confirmPinController.text) return;
    try {
      await ref.read(authControllerProvider.notifier).setPin(
        phone: _phoneController.text,
        pin: _newPinController.text,
        confirmPin: _confirmPinController.text,
      );
      if (mounted) context.go('/dashboard');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(backgroundColor: Colors.redAccent, content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: SafeArea(
        child: KeyboardAvoidingView(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                const SizedBox(height: 48),
                Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: const Color(0x3334D399), width: 1.5),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x1A34D399),
                        blurRadius: 30,
                        offset: Offset(0, 8),
                      )
                    ],
                  ),
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: _buildCurrentStep(isLoading),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStep(bool isLoading) {
    switch (_step) {
      case AuthStep.phone: return _buildPhoneStep(isLoading);
      case AuthStep.otp: return _buildOtpStep(isLoading);
      case AuthStep.pinFallback: return _buildPinStep(isLoading);
      case AuthStep.setPin: return _buildSetPinStep(isLoading);
    }
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            ScaleTransition(
              scale: _pulseAnimation,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0x1AF59E0B),
                ),
              ),
            ),
            ScaleTransition(
              scale: _pulseAnimation,
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0x33F59E0B),
                ),
              ),
            ),
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: const Color(0x99F59E0B), width: 2),
                color: const Color(0xFF1E293B),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x80F59E0B),
                    blurRadius: 20,
                  )
                ],
              ),
              child: const Icon(LucideIcons.flame, size: 44, color: Color(0xFFF59E0B)),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Text(
          'SuprO',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 36,
            fontWeight: FontWeight.w900,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          '✦ FOR LOCAL NEEDS ✦',
          style: TextStyle(
            color: Color(0xFFF59E0B),
            fontSize: 11,
            letterSpacing: 4,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildWelcomeBack() {
    if (_isExistingUser != true) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 28),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0x1A10B981),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x3310B981)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0x3310B981),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(LucideIcons.userCheck, color: Color(0xFF10B981), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('WELCOME BACK', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                const SizedBox(height: 4),
                Text(_fullName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                Text(_category, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, fontWeight: FontWeight.w500)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildInputLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Color(0xFF94A3B8),
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 1,
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint, {Widget? prefixIcon}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF475569)),
      filled: true,
      fillColor: const Color(0xFF0F172A),
      prefixIcon: prefixIcon,
      counterText: '',
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFF1E293B), width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Color(0xFF34D399), width: 2),
      ),
    );
  }

  Widget _buildPrimaryButton(String text, IconData icon, VoidCallback? onPressed, bool isLoading) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
        disabledBackgroundColor: const Color(0xFF1E293B),
        disabledForegroundColor: const Color(0xFF64748B),
        padding: const EdgeInsets.symmetric(vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 0,
      ),
      child: isLoading
          ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 22),
                const SizedBox(width: 12),
                Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              ],
            ),
    );
  }

  Widget _buildPhoneStep(bool isLoading) {
    return Column(
      key: const ValueKey('phone'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_isExistingUser == true) _buildWelcomeBack(),
        _buildInputLabel('MOBILE NUMBER'),
        const SizedBox(height: 12),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          maxLength: 10,
          onChanged: _onPhoneChange,
          style: const TextStyle(fontSize: 20, letterSpacing: 2, color: Colors.white, fontWeight: FontWeight.w600),
          decoration: _buildInputDecoration('10-digit number', prefixIcon: const Icon(LucideIcons.smartphone, color: Color(0xFF34D399))),
        ),
        if (_isChecking) const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Center(child: CircularProgressIndicator(color: Color(0xFF34D399)))),
        
        if (_isExistingUser == false) ...[
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0x1A3B82F6),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0x333B82F6)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0x333B82F6),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(LucideIcons.userPlus, color: Color(0xFF60A5FA), size: 20),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('CREATE NEW ACCOUNT', style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                      SizedBox(height: 4),
                      Text("Looks like you're new! Let's set up your profile.", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                    ],
                  ),
                )
              ],
            ),
          ),
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
            value: _category,
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
          decoration: _buildInputDecoration('••••••'),
        ),
        const SizedBox(height: 32),
        _buildPrimaryButton('Verify OTP & Continue', LucideIcons.shieldCheck, isLoading ? null : _verifyOtp, isLoading),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => setState(() => _step = AuthStep.phone), 
          child: const Center(child: Text('← Go back', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16, fontWeight: FontWeight.bold)))
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
          decoration: _buildInputDecoration('••••'),
        ),
        const SizedBox(height: 32),
        _buildPrimaryButton('Sign In with PIN', LucideIcons.unlock, isLoading ? null : _loginWithPin, isLoading),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => setState(() => _step = AuthStep.phone), 
          child: const Center(child: Text('← Go back', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16, fontWeight: FontWeight.bold)))
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
          decoration: _buildInputDecoration('••••'),
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
          decoration: _buildInputDecoration('••••'),
        ),
        const SizedBox(height: 32),
        _buildPrimaryButton('Save PIN & Continue', LucideIcons.save, isLoading ? null : _setPin, isLoading),
      ],
    );
  }
}

class KeyboardAvoidingView extends StatelessWidget {
  final Widget child;
  const KeyboardAvoidingView({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: IntrinsicHeight(child: child),
          ),
        );
      },
    );
  }
}
