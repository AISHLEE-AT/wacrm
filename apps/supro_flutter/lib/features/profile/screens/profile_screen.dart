import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import '../../../core/env.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  static const _secureStorage = FlutterSecureStorage();

  // Field editing states
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _upiController = TextEditingController();
  final TextEditingController _apiKeyController = TextEditingController();

  bool _editingName = false;
  bool _editingLocation = false;
  bool _editingUpi = false;
  bool _editingGemini = false;

  bool _isSavingName = false;
  bool _isSavingLocation = false;
  bool _isSavingUpi = false;
  bool _isSavingGemini = false;

  String _nameState = 'User';
  String _locationState = 'Tamil Nadu, India';
  String _upiState = '';
  String _geminiState = '';
  String _categoryState = 'Traveller';
  bool _isLoading = true;

  // Category Configuration matching Webapp
  final List<Map<String, dynamic>> _userCategories = [
    {
      'key': 'Driver',
      'label': 'Driver Partner',
      'badge': '🚖 DriveO',
      'desc': 'Accept rides & auto fleet management',
      'path': '/driveo',
      'color': const Color(0xFF3B82F6),
    },
    {
      'key': 'Partner',
      'label': 'Delivery / Partner',
      'badge': '🤝 DealO',
      'desc': 'Local business, logistics & products',
      'path': '/dealo',
      'color': const Color(0xFFF97316),
    },
    {
      'key': 'Farmer',
      'label': 'Farmer / Agri Expert',
      'badge': '🌾 AgrO',
      'desc': 'Tamil Nadu Agri TV, daily tasks & AI crop doctor',
      'path': '/agro',
      'color': const Color(0xFF10B981),
    },
    {
      'key': 'Student',
      'label': 'Student / Candidate',
      'badge': '🎓 TutO Super LMS',
      'desc': 'Mock exams, courses & study material',
      'path': '/teacho',
      'color': const Color(0xFFA855F7),
    },
    {
      'key': 'Teacher',
      'label': 'Teacher / Tutor',
      'badge': '👨‍🏫 TutO',
      'desc': 'Publish masterclasses & tests',
      'path': '/teacho',
      'color': const Color(0xFF6366F1),
    },
    {
      'key': 'Traveller',
      'label': 'Traveller / Passenger',
      'badge': '🧳 RideO & TourO',
      'desc': 'Book taxis & pilgrimage trips',
      'path': '/ride',
      'color': const Color(0xFF14B8A6),
    },
    {
      'key': 'Shopper',
      'label': 'Merchant / Shopper',
      'badge': '🛍️ DealO',
      'desc': 'Hyperlocal marketplace deals',
      'path': '/dealo',
      'color': const Color(0xFFF59E0B),
    },
    {
      'key': 'Financier',
      'label': 'Financier / Lender',
      'badge': '💰 MoneyO',
      'desc': 'Micro loans & finance manager',
      'path': '/moneyo',
      'color': const Color(0xFF06B6D4),
    },
    {
      'key': 'Admin',
      'label': 'Admin / Master',
      'badge': '👑 Admin CRM',
      'desc': 'Ecosystem & fleet control',
      'path': '/admin',
      'color': const Color(0xFFF43F5E),
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProfile();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _locationController.dispose();
    _upiController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      final user = ref.read(currentUserProvider);
      final phone = user?.phone ?? '';

      // Secure storage Gemini key
      final savedSecKey = await _secureStorage.read(key: 'gemini_api_key') ??
          await _secureStorage.read(key: 'gemini-api-key');
      if (savedSecKey != null && savedSecKey.isNotEmpty) {
        _geminiState = savedSecKey;
        _apiKeyController.text = savedSecKey;
      }

      if (phone.isNotEmpty) {
        final clean10 = phone.replaceAll(RegExp(r'\D'), '').sliceLast10();
        final res = await http.get(Uri.parse('${AppEnv.apiUrl}/api/auth/check?phone=$clean10')).timeout(const Duration(seconds: 6));
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          if (data is Map && data['exists'] == true) {
            _nameState = data['name'] ?? data['full_name'] ?? 'User';
            _nameController.text = _nameState;
            _locationState = data['location'] ?? 'Tamil Nadu, India';
            _locationController.text = _locationState;
            _upiState = data['upi_id'] ?? '';
            _upiController.text = _upiState;
            _categoryState = data['category'] ?? user?.category ?? 'Traveller';

            final srvKey = (data['gemini_api_key'] ?? '').toString().trim();
            if (srvKey.isNotEmpty) {
              _geminiState = srvKey;
              _apiKeyController.text = srvKey;
            }

            // Sync session
            ref.read(whatsAppSessionProvider.notifier).updateFromApiData(Map<String, dynamic>.from(data));
          }
        }
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveField(String field, String value, Function(bool) setSaving, Function(bool) setEditing, Function(String) updateLocal) async {
    setSaving(true);
    try {
      final user = ref.read(currentUserProvider);
      final phone = user?.phone ?? '';
      final cleanVal = value.trim();

      final res = await http.post(
        Uri.parse('${AppEnv.apiUrl}/api/profile/update'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': phone,
          field: cleanVal,
        }),
      ).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        updateLocal(cleanVal);
        setEditing(false);
        if (field == 'gemini_api_key') {
          await _secureStorage.write(key: 'gemini_api_key', value: cleanVal);
        }
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF10B981),
              content: Text('$field updated successfully!'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.redAccent, content: Text('Failed to update: $e')),
        );
      }
    } finally {
      if (mounted) setSaving(false);
    }
  }

  void _showCategoryPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0D1526),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.75,
          maxChildSize: 0.9,
          minChildSize: 0.5,
          expand: false,
          builder: (_, controller) {
            return Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(color: const Color(0xFF334155), borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Select Ecosystem Category',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Switching role dynamically guides your home dashboard and active module.',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.builder(
                      controller: controller,
                      itemCount: _userCategories.length,
                      itemBuilder: (context, idx) {
                        final cat = _userCategories[idx];
                        final isSelected = cat['key'].toString().toLowerCase() == _categoryState.toLowerCase();

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? (cat['color'] as Color).withValues(alpha: 0.15) : const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? (cat['color'] as Color) : const Color(0xFF1E293B),
                              width: isSelected ? 1.5 : 1.0,
                            ),
                          ),
                          child: ListTile(
                            onTap: () async {
                              Navigator.pop(context);
                              final newCat = cat['key'] as String;
                              setState(() => _categoryState = newCat);
                              await ref.read(ociAuthStateProvider.notifier).updateCategory(newCat);
                              await _saveField(
                                'main_category',
                                newCat,
                                (_) {},
                                (_) {},
                                (v) => setState(() => _categoryState = v),
                              );
                              final targetPath = cat['path'] as String;
                              final prefs = await SharedPreferences.getInstance();
                              await prefs.setString('selected_module', targetPath);
                              if (mounted) context.go(targetPath);
                            },
                            title: Row(
                              children: [
                                Text(
                                  cat['badge'],
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  cat['label'],
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ],
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                cat['desc'],
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                              ),
                            ),
                            trailing: isSelected
                                ? const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981), size: 20)
                                : const Icon(LucideIcons.chevronRight, color: Color(0xFF64748B), size: 18),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _sendDriverAdminVerification() async {
    final name = _nameState;
    final text = 'Hello Admin! I have registered as a DriveO Driver Partner (Name: $name). Please verify my driver account.';
    final url = Uri.parse('https://api.whatsapp.com/send?phone=${AppEnv.adminPhone}&text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
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
    final rawPhone = user?.phone ?? '6381029380';
    final displayPhone = _formatPhone(rawPhone);
    final sessionState = ref.watch(whatsAppSessionProvider);
    final isAdmin = ['Admin', 'admin'].contains(user?.role) ||
        rawPhone.contains('6381029380') ||
        _categoryState.toLowerCase() == 'admin';

    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0F1E),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF10B981))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1526),
        elevation: 0,
        title: const Text('Profile & Settings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.logOut, color: Color(0xFFEF4444), size: 18),
            tooltip: 'Sign Out',
            onPressed: () async {
              await ref.read(authControllerProvider.notifier).signOut();
              if (mounted) context.go('/login');
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF10B981),
          labelColor: const Color(0xFF10B981),
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: const [
            Tab(icon: Icon(LucideIcons.user, size: 16), text: 'Account'),
            Tab(icon: Icon(LucideIcons.qrCode, size: 16), text: 'Digital ID'),
            Tab(icon: Icon(LucideIcons.shield, size: 16), text: 'CRM & Admin'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAccountTab(displayPhone, rawPhone, sessionState, isAdmin),
          _buildDigitalIdTab(displayPhone, rawPhone),
          _buildCrmSettingsTab(sessionState, isAdmin),
        ],
      ),
    );
  }

  Widget _buildAccountTab(String displayPhone, String rawPhone, WhatsAppSessionState sessionState, bool isAdmin) {
    final catInfo = _userCategories.firstWhere(
      (c) => c['key'].toString().toLowerCase() == _categoryState.toLowerCase(),
      orElse: () => _userCategories[5],
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile Header Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0D1526),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              children: [
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    color: (catInfo['color'] as Color).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: (catInfo['color'] as Color), width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      _nameState.isNotEmpty ? _nameState[0].toUpperCase() : 'U',
                      style: TextStyle(
                        color: catInfo['color'] as Color,
                        fontWeight: FontWeight.w900,
                        fontSize: 28,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
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
                                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                decoration: InputDecoration(
                                  isDense: true,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  filled: true,
                                  fillColor: const Color(0xFF0F172A),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              ),
                              onPressed: _isSavingName
                                  ? null
                                  : () => _saveField('full_name', _nameController.text, (s) => setState(() => _isSavingName = s), (s) => setState(() => _editingName = s), (v) => setState(() => _nameState = v)),
                              child: const Text('Save', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        )
                      else
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                _nameState,
                                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(LucideIcons.pencil, color: Color(0xFF94A3B8), size: 14),
                              onPressed: () => setState(() => _editingName = true),
                            ),
                          ],
                        ),
                      Text(displayPhone, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                      const SizedBox(height: 6),
                      GestureDetector(
                        onTap: _showCategoryPicker,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: (catInfo['color'] as Color).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: (catInfo['color'] as Color).withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(catInfo['badge'], style: const TextStyle(fontSize: 12)),
                              const SizedBox(width: 4),
                              Text(
                                catInfo['label'],
                                style: TextStyle(color: catInfo['color'] as Color, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                              const SizedBox(width: 4),
                              Icon(LucideIcons.arrowRightLeft, color: catInfo['color'] as Color, size: 10),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Driver Verification Banner (if Driver)
          if (_categoryState.toLowerCase() == 'driver')
            Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.truck, color: Color(0xFF60A5FA), size: 18),
                      SizedBox(width: 8),
                      Text(
                        'DriveO Partner Account Verification',
                        style: TextStyle(color: Color(0xFF60A5FA), fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'To accept 0-commission rides across Tamil Nadu, send your vehicle RC and driving license to admin for instant approval.',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.3),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _sendDriverAdminVerification,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(LucideIcons.messageCircle, color: Colors.white, size: 16),
                      label: const Text('Verify Account via WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ),

          // 24-Hour WhatsApp Session Card
          _buildLiveWhatsAppCard(sessionState, rawPhone),

          const SizedBox(height: 20),

          // Details List Card
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF0D1526),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              children: [
                _buildFieldRow(
                  icon: LucideIcons.mapPin,
                  title: 'Location',
                  value: _locationState,
                  isEditing: _editingLocation,
                  controller: _locationController,
                  isSaving: _isSavingLocation,
                  onEdit: () => setState(() => _editingLocation = true),
                  onCancel: () => setState(() => _editingLocation = false),
                  onSave: () => _saveField('location', _locationController.text, (s) => setState(() => _isSavingLocation = s), (s) => setState(() => _editingLocation = s), (v) => setState(() => _locationState = v)),
                ),
                const Divider(color: Color(0xFF1E293B), height: 1),
                _buildFieldRow(
                  icon: LucideIcons.creditCard,
                  title: 'UPI ID (Instant Settlements)',
                  value: _upiState.isNotEmpty ? _upiState : 'Not added yet',
                  isEditing: _editingUpi,
                  controller: _upiController,
                  isSaving: _isSavingUpi,
                  onEdit: () => setState(() => _editingUpi = true),
                  onCancel: () => setState(() => _editingUpi = false),
                  onSave: () => _saveField('upi_id', _upiController.text, (s) => setState(() => _isSavingUpi = s), (s) => setState(() => _editingUpi = s), (v) => setState(() => _upiState = v)),
                ),
                const Divider(color: Color(0xFF1E293B), height: 1),
                _buildFieldRow(
                  icon: LucideIcons.sparkles,
                  title: 'Gemini AI Studio Key',
                  value: _geminiState.isNotEmpty ? '••••••••••••••••••••••••••••••••' : 'Add custom API key',
                  isEditing: _editingGemini,
                  controller: _apiKeyController,
                  isSaving: _isSavingGemini,
                  isPassword: true,
                  onEdit: () => setState(() => _editingGemini = true),
                  onCancel: () => setState(() => _editingGemini = false),
                  onSave: () => _saveField('gemini_api_key', _apiKeyController.text, (s) => setState(() => _isSavingGemini = s), (s) => setState(() => _editingGemini = s), (v) => setState(() => _geminiState = v)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildLiveWhatsAppCard(WhatsAppSessionState sessionState, String rawPhone) {
    final active = sessionState.isSessionActive;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1526),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: active ? const Color(0xFF10B981).withValues(alpha: 0.3) : const Color(0xFFF59E0B).withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(LucideIcons.messageSquare, color: Color(0xFF10B981), size: 18),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('WHATSAPP 24H LIVE WINDOW', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                      Text('Meta Cloud API & Alerts', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: active ? const Color(0xFF10B981).withValues(alpha: 0.15) : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: active ? const Color(0xFF10B981) : const Color(0xFFF59E0B)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(radius: 3, backgroundColor: active ? const Color(0xFF10B981) : const Color(0xFFF59E0B)),
                    const SizedBox(width: 4),
                    Text(
                      active ? 'ACTIVE' : 'EXPIRED',
                      style: TextStyle(
                        color: active ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              const Icon(LucideIcons.clock, color: Color(0xFF10B981), size: 14),
              const SizedBox(width: 8),
              Text(
                active ? 'Time remaining: ${sessionState.formattedRemaining}' : 'Window expired - WhatsApp Sync required',
                style: TextStyle(
                  color: active ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: sessionState.progressFraction,
              backgroundColor: const Color(0xFF1E293B),
              valueColor: AlwaysStoppedAnimation<Color>(active ? const Color(0xFF10B981) : const Color(0xFFF59E0B)),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                padding: const EdgeInsets.symmetric(vertical: 11),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                final clean = rawPhone.replaceAll(RegExp(r'\D'), '');
                final msg = Uri.encodeComponent('SuprO 24h Daily Sync for +91$clean 🔔');
                final url = Uri.parse('https://wa.me/${AppEnv.wabaPhone}?text=$msg');
                if (await canLaunchUrl(url)) {
                  await launchUrl(url, mode: LaunchMode.externalApplication);
                  await ref.read(whatsAppSessionProvider.notifier).renewSessionLocal24Hours();
                }
              },
              icon: const Icon(LucideIcons.refreshCw, color: Colors.black, size: 14),
              label: const Text('24h Daily Keep-Alive Sync', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFieldRow({
    required IconData icon,
    required String title,
    required String value,
    required bool isEditing,
    required TextEditingController controller,
    required bool isSaving,
    required VoidCallback onEdit,
    required VoidCallback onCancel,
    required VoidCallback onSave,
    bool isPassword = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF10B981), size: 16),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          if (isEditing)
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    obscureText: isPassword,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: isSaving ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981))) : const Icon(LucideIcons.check, color: Color(0xFF10B981), size: 18),
                  onPressed: isSaving ? null : onSave,
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, color: Color(0xFFEF4444), size: 18),
                  onPressed: onCancel,
                ),
              ],
            )
          else
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                ),
                GestureDetector(
                  onTap: () {
                    controller.text = value == 'Not added yet' || value == 'Add custom API key' ? '' : value;
                    onEdit();
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: Text('Edit', style: TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildDigitalIdTab(String displayPhone, String rawPhone) {
    final upiId = _upiState.isNotEmpty ? _upiState : '${rawPhone.replaceAll(RegExp(r'\D'), '')}@upi';
    final qrData = 'upi://pay?pa=$upiId&pn=${Uri.encodeComponent(_nameState)}';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        children: [
          // Holographic Digital ID Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(LucideIcons.sparkles, color: Color(0xFF10B981), size: 20),
                        SizedBox(width: 8),
                        Text('SuprO VERIFIED ID', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 1.2)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _categoryState.toUpperCase(),
                        style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 10),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // QR Container
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: QrImageView(
                    data: qrData,
                    version: QrVersions.auto,
                    size: 160.0,
                  ),
                ),
                const SizedBox(height: 20),
                Text(_nameState, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 4),
                Text(displayPhone, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0F1E),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('UPI: $upiId', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: upiId));
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('UPI ID copied to clipboard!')));
                        },
                        child: const Icon(LucideIcons.copy, color: Color(0xFF10B981), size: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCrmSettingsTab(WhatsAppSessionState sessionState, bool isAdmin) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Workspace & CRM Controls', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          const Text('Manage WhatsApp Cloud API connectivity, security credentials and admin tools.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          const SizedBox(height: 20),

          // WhatsApp Meta Cloud Status Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0D1526),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(LucideIcons.plugZap, color: Color(0xFF10B981), size: 18),
                    SizedBox(width: 10),
                    Text('WhatsApp Business Cloud API', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                const SizedBox(height: 12),
                const Text('WABA Number: +91 63810 29380', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                const Text('Webhook URL: https://mysupro.duckdns.org/api/webhook/whatsapp', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          CircleAvatar(radius: 3, backgroundColor: Color(0xFF10B981)),
                          SizedBox(width: 5),
                          Text('Meta Cloud API Live', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 10)),
                        ],
                      ),
                    ),
                    const Spacer(),
                    TextButton.icon(
                      onPressed: () => context.push('/inbox'),
                      icon: const Icon(LucideIcons.messageSquare, size: 14, color: Color(0xFF10B981)),
                      label: const Text('Open CRM Inbox', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          if (isAdmin)
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => context.push('/admin'),
              icon: const Icon(LucideIcons.shield, color: Colors.black, size: 18),
              label: const Center(child: Text('Open Master Admin Portal', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13))),
            ),
        ],
      ),
    );
  }
}

extension StringSlice on String {
  String sliceLast10() {
    if (length <= 10) return this;
    return substring(length - 10);
  }
}
