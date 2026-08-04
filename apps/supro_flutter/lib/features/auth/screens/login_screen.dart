import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';

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

  final List<Map<String, String>> categories = [
    {'key': 'Admin', 'label': '👑 Admin (CRM)'},
    {'key': 'Traveller', 'label': '🧳 Traveller'},
    {'key': 'Farmer', 'label': '🚜 Farmer'},
    {'key': 'Shopper', 'label': '🛍️ Shopper'},
  ];

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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      body: SafeArea(
        child: KeyboardAvoidingView(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                _buildHeader(),
                const SizedBox(height: 40),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Theme.of(context).primaryColor.withOpacity(0.2)),
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(context).primaryColor.withOpacity(0.15),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
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
        Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.amber.withOpacity(0.6), width: 2),
            color: Theme.of(context).colorScheme.surface,
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).primaryColor.withOpacity(0.5),
                blurRadius: 20,
              )
            ],
          ),
          child: const Icon(LucideIcons.flame, size: 40, color: Colors.amber),
        ),
        const SizedBox(height: 16),
        Text(
          'SuprO',
          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
            color: Theme.of(context).primaryColor,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '✦ FOR LOCAL NEEDS ✦',
          style: TextStyle(
            color: Colors.amber,
            fontSize: 10,
            letterSpacing: 3,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildWelcomeBack() {
    if (_isExistingUser != true) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).primaryColor.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Theme.of(context).primaryColor.withOpacity(0.2),
            child: Icon(LucideIcons.userCheck, color: Theme.of(context).primaryColor),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('WELCOME BACK', style: TextStyle(color: Theme.of(context).primaryColor, fontSize: 10, fontWeight: FontWeight.bold)),
                Text(_fullName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(_category, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildPhoneStep(bool isLoading) {
    return Column(
      key: const ValueKey('phone'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('MOBILE NUMBER', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6), fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          maxLength: 10,
          onChanged: _onPhoneChange,
          style: const TextStyle(fontSize: 18, letterSpacing: 2),
          decoration: const InputDecoration(counterText: '', prefixIcon: Icon(LucideIcons.smartphone, color: Colors.greenAccent), hintText: '10-digit number'),
        ),
        if (_isChecking) const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Center(child: CircularProgressIndicator())),
        
        if (_isExistingUser == false) ...[
          const SizedBox(height: 16),
          TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name')),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _category,
            decoration: const InputDecoration(labelText: 'Role'),
            items: categories.map((c) => DropdownMenuItem(value: c['key'], child: Text(c['label']!))).toList(),
            onChanged: (v) => setState(() => _category = v!),
          ),
        ],

        if (_isExistingUser == true) ...[
          const SizedBox(height: 16),
          _buildWelcomeBack(),
        ],

        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _phoneController.text.length == 10 && !_isChecking ? _requestOtp : null,
          child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(LucideIcons.messageCircle, size: 20), SizedBox(width: 8), Text('Send OTP via WhatsApp')]),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: _phoneController.text.length == 10 ? () => setState(() => _step = AuthStep.pinFallback) : null,
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            side: BorderSide(color: Theme.of(context).primaryColor.withOpacity(0.3)),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: Text('Use Fallback PIN Instead', style: TextStyle(color: Theme.of(context).primaryColor, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildOtpStep(bool isLoading) {
    return Column(
      key: const ValueKey('otp'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('6-DIGIT WHATSAPP OTP', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6), fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
          decoration: const InputDecoration(counterText: '', hintText: '••••••'),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading ? null : _verifyOtp,
          child: isLoading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(LucideIcons.shieldCheck, size: 20), SizedBox(width: 8), Text('Verify OTP & Continue')]),
        ),
        TextButton(onPressed: () => setState(() => _step = AuthStep.phone), child: const Center(child: Text('← Go back')))
      ],
    );
  }

  Widget _buildPinStep(bool isLoading) {
    return Column(
      key: const ValueKey('pinFallback'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_isExistingUser == true) _buildWelcomeBack(),
        Text('4-DIGIT SECURE PIN', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6), fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        TextField(
          controller: _pinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
          decoration: const InputDecoration(counterText: '', hintText: '••••'),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading ? null : _loginWithPin,
          child: isLoading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(LucideIcons.shieldCheck, size: 20), SizedBox(width: 8), Text('Sign In with PIN')]),
        ),
        TextButton(onPressed: () => setState(() => _step = AuthStep.phone), child: const Center(child: Text('← Go back')))
      ],
    );
  }

  Widget _buildSetPinStep(bool isLoading) {
    return Column(
      key: const ValueKey('setPin'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('SET 4-DIGIT SECURE PIN', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6), fontSize: 12, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        TextField(
          controller: _newPinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
          decoration: const InputDecoration(counterText: '', hintText: '••••'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmPinController,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
          decoration: const InputDecoration(counterText: '', hintText: 'Confirm PIN'),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading ? null : _setPin,
          child: isLoading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(LucideIcons.shieldCheck, size: 20), SizedBox(width: 8), Text('Save PIN & Continue')]),
        ),
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
