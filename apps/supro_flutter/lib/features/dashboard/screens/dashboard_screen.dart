import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter/services.dart';
import '../../auth/providers/auth_provider.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final TextEditingController _apiKeyController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _upiController = TextEditingController();
  static const _secureStorage = FlutterSecureStorage();
  
  bool _isSavingGemini = false;
  bool _isSavingLocation = false;
  bool _isSavingUpi = false;
  bool _isSavingName = false;

  bool _editingGemini = false;
  bool _editingLocation = false;
  bool _editingUpi = false;
  bool _editingName = false;

  String _geminiState = '';
  String _locationState = 'Tamil Nadu, India';
  String _upiState = '';
  String _nameState = 'User';
  
  bool _isLoadingProfile = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final user = ref.read(currentUserProvider);
      final phone = user?.phone;

      // Load local key first
      final savedSecKey = await _secureStorage.read(key: 'gemini-api-key') ??
          await _secureStorage.read(key: 'gemini_api_key');
      if (savedSecKey != null && savedSecKey.isNotEmpty) {
        setState(() {
          _geminiState = savedSecKey;
          _apiKeyController.text = savedSecKey;
        });
      }

      if (phone != null) {
        // Fetch full profile via the check endpoint
        final res = await http.get(Uri.parse('https://watscrm.vercel.app/api/auth/check?phone=$phone'));
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          if (data['exists'] == true) {
            final serverKey = (data['gemini_api_key'] ?? '').toString().trim();
            setState(() {
              if (serverKey.isNotEmpty) {
                _geminiState = serverKey;
                _apiKeyController.text = serverKey;
              }
              
              _nameState = data['name'] ?? data['full_name'] ?? 'User';
              _nameController.text = _nameState;
              
              _locationState = data['location'] ?? 'Tamil Nadu, India';
              _locationController.text = _locationState;

              _upiState = data['upi_id'] ?? '';
              _upiController.text = _upiState;
            });
            final prefs = await SharedPreferences.getInstance();
            if (_geminiState.isNotEmpty) {
              await prefs.setString('gemini_api_key', _geminiState);
              await _secureStorage.write(key: 'gemini-api-key', value: _geminiState);
              await _secureStorage.write(key: 'gemini_api_key', value: _geminiState);
            }
            if (_nameState.isNotEmpty) {
              await prefs.setString('user_name', _nameState);
            }
            if (_locationState.isNotEmpty) {
              await prefs.setString('user_location', _locationState);
            }
            if (_upiState.isNotEmpty) {
              await prefs.setString('user_upi', _upiState);
            }
          }
        }
      }
    } catch (e) {
      debugPrint('Failed to fetch profile: $e');
    } finally {
      if (mounted) setState(() => _isLoadingProfile = false);
    }
  }

  Future<void> _updateProfileField(String field, String value, Function(bool) setSaving, Function(bool) setEditing, Function(String) setLocalState) async {
    setSaving(true);
    try {
      final user = ref.read(currentUserProvider);
      final phone = user?.phone;
      if (phone != null) {
        final cleanVal = value.trim();
        final res = await http.post(
          Uri.parse('https://watscrm.vercel.app/api/profile/update'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'phone': phone,
            field: cleanVal,
          }),
        );
        if (res.statusCode == 200) {
          setLocalState(cleanVal);
          setEditing(false);
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Updated successfully!')));
          if (field == 'gemini_api_key') {
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('gemini_api_key', cleanVal);
            await _secureStorage.write(key: 'gemini-api-key', value: cleanVal);
            await _secureStorage.write(key: 'gemini_api_key', value: cleanVal);

            try {
              final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
              final tenDigit = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
              await Supabase.instance.client
                  .from('profiles')
                  .update({'gemini_api_key': cleanVal})
                  .or('phone.ilike.%$tenDigit%,whatsapp.ilike.%$tenDigit%');
            } catch (_) {}
          }
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update: $e')));
    } finally {
      if (mounted) setSaving(false);
    }
  }

  void _handleLogout() async {
    await ref.read(authControllerProvider.notifier).signOut();
  }

  String _formatPhone(String raw) {
    String clean = raw.replaceAll(RegExp(r'\D'), '');
    if (clean.startsWith('91') && clean.length == 12) clean = clean.substring(2);
    if (clean.length == 10) return '+91 ${clean.substring(0, 5)} ${clean.substring(5)}';
    return raw;
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final rawPhone = user?.phone ?? 'Unknown';
    final displayPhone = _formatPhone(rawPhone);
    final role = user?.userMetadata?['role'] ?? 'User';
    final isAdmin = ['Admin', 'admin'].contains(role) || rawPhone.contains('6381029380') || rawPhone.contains('9486335870');

    if (_isLoadingProfile) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0F1E),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              const Text(
                'Profile & Settings',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Manage your personal account, digital identity, and workspace configuration.',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF94a3b8),
                ),
              ),
              const SizedBox(height: 32),
              
              // Profile Identity Section
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF1E293B), width: 2),
                    ),
                    child: const Icon(LucideIcons.circleUserRound, color: Color(0xFF10B981), size: 40),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_editingName)
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _nameController,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                  decoration: InputDecoration(
                                    isDense: true,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    fillColor: const Color(0xFF0F172A),
                                    filled: true,
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: _isSavingName ? null : () => _updateProfileField('full_name', _nameController.text, (s) => setState(() => _isSavingName = s), (s) => setState(() => _editingName = s), (v) => _nameState = v),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(8)),
                                  child: _isSavingName ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(LucideIcons.x, color: Colors.white54, size: 16),
                                onPressed: () => setState(() => _editingName = false),
                              )
                            ],
                          )
                        else
                          Row(
                            children: [
                              Text(
                                _nameState,
                                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 12),
                              GestureDetector(
                                onTap: () {
                                  _nameController.text = _nameState;
                                  setState(() => _editingName = true);
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1E293B),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFF334155)),
                                  ),
                                  child: const Row(
                                    children: [
                                      Text('✏️ Edit Name', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        const SizedBox(height: 6),
                        Text(
                          isAdmin ? 'ADMIN / OWNER' : 'USER',
                          style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Info Cards
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Column(
                  children: [
                    _buildInfoRow(
                      icon: LucideIcons.smartphone,
                      title: 'WhatsApp Phone',
                      content: displayPhone,
                    ),
                    const Divider(color: Color(0xFF1E293B), height: 1),
                    _buildEditableRow(
                      icon: LucideIcons.mapPin,
                      title: 'Location',
                      value: _locationState,
                      isEditing: _editingLocation,
                      controller: _locationController,
                      isSaving: _isSavingLocation,
                      onEdit: () {
                        _locationController.text = _locationState;
                        setState(() => _editingLocation = true);
                      },
                      onCancel: () => setState(() => _editingLocation = false),
                      onSave: () => _updateProfileField('location', _locationController.text, (s) => setState(() => _isSavingLocation = s), (s) => setState(() => _editingLocation = s), (v) => _locationState = v),
                    ),
                    const Divider(color: Color(0xFF1E293B), height: 1),
                    _buildEditableRow(
                      icon: LucideIcons.creditCard,
                      title: 'UPI ID (For Driver/Ride Settlements)',
                      value: _upiState.isEmpty ? 'Not provided' : _upiState,
                      isEditing: _editingUpi,
                      controller: _upiController,
                      isSaving: _isSavingUpi,
                      onEdit: () {
                        _upiController.text = _upiState;
                        setState(() => _editingUpi = true);
                      },
                      onCancel: () => setState(() => _editingUpi = false),
                      onSave: () => _updateProfileField('upi_id', _upiController.text, (s) => setState(() => _isSavingUpi = s), (s) => setState(() => _editingUpi = s), (v) => _upiState = v),
                    ),
                    const Divider(color: Color(0xFF1E293B), height: 1),
                    _buildEditableRow(
                      icon: LucideIcons.sparkles,
                      title: 'GEMINI API KEY (AI FEATURES)',
                      value: _geminiState.isEmpty ? 'Not provided' : '••••••••••••••••••••••••••••••••••••••••',
                      isEditing: _editingGemini,
                      controller: _apiKeyController,
                      isSaving: _isSavingGemini,
                      isPassword: true,
                      extraAction: _editingGemini ? null : GestureDetector(
                        onTap: () async {
                          final url = Uri.parse('https://aistudio.google.com/app/apikey');
                          if (await canLaunchUrl(url)) {
                            await launchUrl(url, mode: LaunchMode.externalApplication);
                          }
                        },
                        child: const Padding(
                          padding: EdgeInsets.only(right: 12),
                          child: Text('Get API Key', style: TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ),
                      onEdit: () {
                        _apiKeyController.text = _geminiState;
                        setState(() => _editingGemini = true);
                      },
                      onCancel: () => setState(() => _editingGemini = false),
                      onSave: () => _updateProfileField('gemini_api_key', _apiKeyController.text, (s) => setState(() => _isSavingGemini = s), (s) => setState(() => _editingGemini = s), (v) => _geminiState = v),
                    ),
                    const Divider(color: Color(0xFF1E293B), height: 1),
                    
                    // QR Code Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0F172A),
                        borderRadius: BorderRadius.only(bottomLeft: Radius.circular(20), bottomRight: Radius.circular(20)),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(LucideIcons.qrCode, color: Color(0xFF34D399), size: 16),
                                  SizedBox(width: 8),
                                  Text('Merchant & Driver QR', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF34D399).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF34D399).withValues(alpha: 0.2)),
                                ),
                                child: const Text('Verified P2P Pay', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Direct 0-commission instant payment QR code generated from your verified UPI ID: ${_upiState.isNotEmpty ? _upiState : "${rawPhone.replaceAll(RegExp(r'\D'), '')}@upi"}',
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 10)],
                                ),
                                child: QrImageView(
                                  data: 'upi://pay?pa=${_upiState.isNotEmpty ? _upiState : "${rawPhone.replaceAll(RegExp(r'\D'), '')}@upi"}&pn=${_nameState.replaceAll(' ', '%20')}',
                                  version: QrVersions.auto,
                                  size: 100.0,
                                ),
                              ),
                              const SizedBox(width: 16),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('📲 Instant Scan & Pay', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                    SizedBox(height: 8),
                                    Text('Customers can scan this QR code using PhonePe, Google Pay, or Paytm for direct 0% commission payment.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                                  ],
                                ),
                              )
                            ],
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // DriveO Partner Status
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(LucideIcons.truck, color: Color(0xFF10B981), size: 16),
                        SizedBox(width: 8),
                        Text('DRIVEO PARTNER REGISTRATION STATUS', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(child: Text('You are not registered as a DriveO vehicle operator yet.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12))),
                        const SizedBox(width: 16),
                        ElevatedButton(
                          onPressed: () {
                            context.push('/driveo');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF059669),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                          child: const Text('Enroll as Driver Partner', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    )
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Support FAGO Cause
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFFF43F5E).withValues(alpha: 0.1), const Color(0xFFA855F7).withValues(alpha: 0.1), const Color(0xFF06B6D4).withValues(alpha: 0.1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF43F5E).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.3)),
                          ),
                          child: const Icon(LucideIcons.heart, color: Color(0xFFFB7185), size: 24),
                        ),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text('Support FAGO Good Cause', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              SizedBox(height: 4),
                              Text('Empowering Farmers, Drivers, Tutors & Local Buyers with 0% Commission', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                            ],
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'FAGO is a community-first ecosystem designed to serve Tamil Nadu and India with zero middleman fees. Contribute ₹10, ₹50, ₹100 or more to directly support platform upkeep & local community development.',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.5),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0F1E).withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF1E293B).withValues(alpha: 0.8)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFBBF24).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.2)),
                                ),
                                child: const Text('Official UPI ID', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                              const SizedBox(width: 12),
                              const Text('9486335870@hdfcbank', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1)),
                            ],
                          ),
                          GestureDetector(
                            onTap: () {
                              Clipboard.setData(const ClipboardData(text: '9486335870@hdfcbank'));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('UPI ID copied to clipboard!')));
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Row(
                                children: [
                                  Icon(LucideIcons.copy, color: Colors.white, size: 14),
                                  SizedBox(width: 6),
                                  Text('Copy', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          final url = Uri.parse('upi://pay?pa=9486335870@hdfcbank&pn=Aishlee%20Technology&tn=FAGO%20Good%20Cause%20Contribution&cu=INR');
                          if (await canLaunchUrl(url)) {
                            await launchUrl(url, mode: LaunchMode.externalApplication);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ).copyWith(
                          backgroundColor: WidgetStateProperty.resolveWith(
                            (states) => null,
                          ),
                        ),
                        child: Ink(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFFE11D48), Color(0xFF7E22CE)]),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Container(
                            alignment: Alignment.center,
                            constraints: const BoxConstraints(minHeight: 50),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.heart, color: Colors.white, size: 16),
                                SizedBox(width: 8),
                                Text('Contribute via UPI (₹10 / ₹100+)', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    )
                  ],
                ),
              ),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    backgroundColor: const Color(0xFFef4444).withValues(alpha: 0.1),
                    side: BorderSide(color: const Color(0xFFef4444).withValues(alpha: 0.3)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _handleLogout,
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(LucideIcons.logOut, color: Color(0xFFef4444), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Sign Out',
                        style: TextStyle(color: Color(0xFFef4444), fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 60),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow({required IconData icon, required String title, required String content}) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF10B981), size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5).copyWith(height: 1)),
                const SizedBox(height: 4),
                Text(content, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildEditableRow({
    required IconData icon,
    required String title,
    required String value,
    required bool isEditing,
    required TextEditingController controller,
    required bool isSaving,
    required VoidCallback onEdit,
    required VoidCallback onCancel,
    required VoidCallback onSave,
    Widget? extraAction,
    bool isPassword = false,
  }) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF10B981), size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5).copyWith(height: 1)),
                const SizedBox(height: 6),
                if (isEditing)
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: controller,
                          obscureText: isPassword,
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          decoration: InputDecoration(
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            fillColor: const Color(0xFF0F172A),
                            filled: true,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: isSaving ? null : onSave,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(8)),
                          child: isSaving ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.x, color: Colors.white54, size: 16),
                        onPressed: onCancel,
                      )
                    ],
                  )
                else
                  Text(value, style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500, fontFamily: isPassword ? 'monospace' : null)),
              ],
            ),
          ),
          if (!isEditing) ...[
            ?extraAction,
            GestureDetector(
              onTap: onEdit,
              child: const Text('Edit', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 12)),
            )
          ]
        ],
      ),
    );
  }
}
