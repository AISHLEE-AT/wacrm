import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'auth_provider.dart';

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

  final TextEditingController _nameController = TextEditingController();
  String _selectedCategory = 'Traveller';

  @override
  void initState() {
    super.initState();
    _phoneController.addListener(_onPhoneChanged);
  }

  void _onPhoneChanged() async {
    final text = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    if (text.length == 10) {
      try {
        final res = await Supabase.instance.client
            .from('profiles')
            .select('full_name, main_category')
            .eq('phone', text)
            .maybeSingle();
        if (res != null) {
          final String? existingName = res['full_name'];
          final String? existingCat = res['main_category'];
          if (existingName != null && existingName.isNotEmpty && !existingName.startsWith('User ')) {
            if (_nameController.text.isEmpty || _nameController.text != existingName) {
              setState(() {
                _nameController.text = existingName;
              });
            }
          }
          if (existingCat != null && existingCat.isNotEmpty) {
            setState(() {
              _selectedCategory = existingCat;
            });
          }
        }
      } catch (_) {}
    }
  }

  @override
  void dispose() {
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
    {'key': 'Driver', 'label': '🚖 Driver (DriveO)', 'route': '/drivo', 'color': Colors.orangeAccent},
    {'key': 'Student', 'label': '🎓 Student (TestO Exam)', 'route': '/teacho', 'color': Colors.purpleAccent},
    {'key': 'Teacher', 'label': '👨‍🏫 Teacher (TeachO Tutor)', 'route': '/teacho', 'color': Colors.cyanAccent},
    {'key': 'Financier', 'label': '💰 Financier (LoanO)', 'route': '/mandi', 'color': Colors.blueAccent},
    {'key': 'JobSeeker', 'label': '💼 Job Seeker (WorkO)', 'route': '/teacho', 'color': Colors.limeAccent},
    {'key': 'Employer', 'label': '🏢 Employer (BizHub)', 'route': '/', 'color': Colors.indigoAccent},
    {'key': 'Tourist', 'label': '🛕 Tourist (TourO ஆன்மீகம்)', 'route': '/touro', 'color': Colors.deepOrangeAccent},
  ];

  void _sendOTP() async {
    if (_phoneController.text.length != 10 || !RegExp(r'^[6-9]\d{9}$').hasMatch(_phoneController.text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit Indian mobile number')),
      );
      return;
    }

    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your Full Name')),
      );
      return;
    }

    setState(() => _isLoading = true);
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
              content: Text(res['message'] ?? 'OTP sent via WhatsApp! Check your WhatsApp messages.'),
              backgroundColor: Colors.green.shade800,
            ),
          );
        }
      } catch (e) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('WhatsApp OTP Error: ${e.toString().replaceAll("Exception: ", "")}')),
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

    if (_useWhatsAppAuth) {
      try {
        await ref.read(authProvider.notifier).verifyWhatsAppOtp(
          rawPhone,
          otpCode,
          fullName: _nameController.text.trim(),
          userCategory: _selectedCategory,
        );
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
              const SizedBox(height: 40),
              // Glowing Thamizhan FAGO Brand Logo
              Center(
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.6), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.greenAccent.withValues(alpha: 0.4),
                        blurRadius: 30,
                        spreadRadius: 8,
                      ),
                      BoxShadow(
                        color: Colors.amber.withValues(alpha: 0.3),
                        blurRadius: 15,
                        spreadRadius: 3,
                      )
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(26),
                    child: Image.asset(
                      'assets/images/app_logo.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'தமிழன் • FAGO',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 34,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFFFFD700), // Golden Yellow
                  letterSpacing: 1.5,
                ),
              ),
              const Text(
                'Thamizhan Growth Engine • WhatsApp Verified',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.greenAccent,
                  letterSpacing: 1.1,
                  fontWeight: FontWeight.w600,
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

                // Phone Input Field
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.phone, color: Colors.greenAccent),
                    prefixText: '+91 ',
                    prefixStyle: const TextStyle(color: Colors.white, fontSize: 16),
                    labelText: 'Mobile WhatsApp Number',
                    labelStyle: const TextStyle(color: Colors.greenAccent),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.greenAccent.withValues(alpha: 0.5)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Colors.greenAccent, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // User Category Selector Grid
                const Text('Choose Your Primary Goal (வகைப்பாட்டைத் தேர்வு செய்க):', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _userCategories.map((cat) {
                    final isSelected = cat['key'] == _selectedCategory;
                    return ChoiceChip(
                      selected: isSelected,
                      label: Text(cat['label']),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.black : Colors.white,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        fontSize: 12,
                      ),
                      selectedColor: cat['color'] as Color,
                      backgroundColor: const Color(0xFF1E293B),
                      onSelected: (selected) {
                        if (selected) {
                          setState(() => _selectedCategory = cat['key']);
                        }
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _isLoading ? null : _sendOTP,
                  icon: const Icon(Icons.chat, color: Colors.black),
                  label: Text(
                    _useWhatsAppAuth ? 'Send WhatsApp OTP' : 'Send SMS OTP',
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
              ] else ...[
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
