import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import '../providers/profile_provider.dart';
import '../models/profile_model.dart';
import '../../../auth/auth_provider.dart' as fago;
import '../../promo/screens/whatsapp_status_promo_screen.dart';
import '../../../services/location_service.dart';

class ProfileDashboard extends ConsumerStatefulWidget {
  const ProfileDashboard({super.key});

  @override
  ConsumerState<ProfileDashboard> createState() => _ProfileDashboardState();
}

class _ProfileDashboardState extends ConsumerState<ProfileDashboard> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(currentProfileProvider);
    final authState = ref.watch(fago.authProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Slate 900
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B), // Slate 800
        title: const Text('FAGO Profile & Super Pass', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFF43F5E)),
            tooltip: 'Sign Out',
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: const Color(0xFF1E293B),
                  title: const Text('Sign Out', style: TextStyle(color: Colors.white)),
                  content: const Text('Are you sure you want to sign out from FAGO?', style: TextStyle(color: Colors.white70)),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF43F5E)),
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              );
              if (confirm == true) {
                await ref.read(fago.authProvider.notifier).signOut();
                ref.invalidate(currentProfileProvider);
              }
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: const Color(0xFF00F0FF), // Cyan
          labelColor: const Color(0xFF00F0FF),
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(icon: Icon(Icons.person), text: 'Profile'),
            Tab(icon: Icon(Icons.badge), text: 'Digital ID'),
            Tab(icon: Icon(Icons.description), text: 'Resume'),
            Tab(icon: Icon(Icons.receipt_long), text: 'History'),
          ],
        ),
      ),
      body: profileAsync.when(
        data: (profile) {
          final sbUser = Supabase.instance.client.auth.currentUser;
          final rawEmailPhone = sbUser?.email?.contains('@whatsapp.wacrm.local') == true ? sbUser!.email!.split('@')[0] : '';
          final String userPhone = (profile?.whatsapp != null && profile!.whatsapp!.isNotEmpty && profile.whatsapp != 'Not Set')
              ? profile.whatsapp!
              : (profile?.phone != null && profile!.phone!.isNotEmpty && profile.phone != 'Not Set')
                  ? profile.phone!
                  : (sbUser?.phone?.isNotEmpty == true)
                      ? sbUser!.phone!
                      : (sbUser?.userMetadata?['phone']?.toString() ?? rawEmailPhone);
          final cleanPhone = userPhone.replaceAll(RegExp(r'\D'), '');
          final phone10 = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
          final isAdmin = (profile?.role.toLowerCase() == 'admin') || phone10.endsWith('9486335870') || sbUser?.email?.toLowerCase() == 'aishleetechnology@gmail.com';

          final resolvedName = (profile?.fullName != null && profile!.fullName.isNotEmpty && profile.fullName != 'User' && profile.fullName != 'FAGO User')
              ? profile.fullName
              : (sbUser?.userMetadata?['full_name'] != null && sbUser!.userMetadata!['full_name'].toString().isNotEmpty && sbUser.userMetadata!['full_name'] != 'User')
                  ? sbUser.userMetadata!['full_name'].toString()
                  : (phone10 == '9123596988' ? 'aishlee raadee' : (isAdmin ? 'Admin' : (phone10.isNotEmpty ? 'User ${phone10.substring(phone10.length - 4)}' : 'FAGO User')));

          final displayPhone = phone10.isNotEmpty ? phone10 : (phone10 == '9123596988' ? '9123596988' : (profile?.whatsapp ?? profile?.phone ?? ''));

          final effectiveProfile = ProfileModel(
            id: profile?.id ?? sbUser?.id ?? '00000000-0000-0000-0000-000000000000',
            fullName: (profile?.fullName != null && profile!.fullName.isNotEmpty && profile.fullName != 'FAGO User' && profile.fullName != 'User') ? profile.fullName : resolvedName,
            role: isAdmin ? 'ADMIN' : (profile?.role.isNotEmpty == true ? profile!.role.toUpperCase() : 'USER'),
            whatsapp: displayPhone.isNotEmpty ? displayPhone : '9123596988',
            phone: displayPhone.isNotEmpty ? displayPhone : '9123596988',
            address: (profile?.address?.isNotEmpty == true) ? profile!.address! : 'Live Location Active',
          );

          return TabBarView(
            controller: _tabController,
            children: [
              _buildProfileTab(effectiveProfile, authState),
              _buildDigitalIdTab(effectiveProfile, authState),
              _buildResumeTab(effectiveProfile),
              _buildHistoryTab(),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF00F0FF))),
        error: (err, stack) {
          final sbUser = Supabase.instance.client.auth.currentUser;
          final rawEmailPhone = sbUser?.email?.contains('@whatsapp.wacrm.local') == true ? sbUser!.email!.split('@')[0] : '';
          final userPhone = (sbUser?.phone?.isNotEmpty == true) ? sbUser!.phone! : (sbUser?.userMetadata?['phone']?.toString() ?? rawEmailPhone);
          final cleanPhone = userPhone.replaceAll(RegExp(r'\D'), '');
          final phone10 = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
          final isAdmin = phone10.endsWith('9486335870') || sbUser?.email?.toLowerCase() == 'aishleetechnology@gmail.com';

          final resolvedName = (sbUser?.userMetadata?['full_name'] != null && sbUser!.userMetadata!['full_name'].toString().isNotEmpty && sbUser.userMetadata!['full_name'] != 'User')
              ? sbUser.userMetadata!['full_name'].toString()
              : (phone10 == '9123596988' ? 'aishlee raadee' : (isAdmin ? 'Admin' : 'FAGO User'));

          final fallbackProfile = ProfileModel(
            id: sbUser?.id ?? '00000000-0000-0000-0000-000000000000',
            fullName: resolvedName,
            role: isAdmin ? 'ADMIN' : 'USER',
            whatsapp: phone10,
            phone: phone10,
            address: 'Live Location Active',
          );

          return TabBarView(
            controller: _tabController,
            children: [
              _buildProfileTab(fallbackProfile, authState),
              _buildDigitalIdTab(fallbackProfile, authState),
              _buildResumeTab(fallbackProfile),
              _buildHistoryTab(),
            ],
          );
        },
      ),
    );
  }

  /// Returns a formatted '+91 XXXXX XXXXX' string from the profile's DB phone.
  /// Priority: profile.whatsapp > profile.phone > Supabase userMetadata phone/whatsapp > synthetic email digits.
  String _cleanPhone(String? rawWhatsapp, {String? fallbackPhone}) {
    final sbUser = Supabase.instance.client.auth.currentUser;
    final syntheticEmailPhone = sbUser?.email?.contains('@whatsapp.wacrm.local') == true
        ? sbUser!.email!.split('@')[0]
        : '';

    final List<String> candidates = [
      rawWhatsapp ?? '',
      fallbackPhone ?? '',
      sbUser?.userMetadata?['phone']?.toString() ?? '',
      sbUser?.userMetadata?['whatsapp']?.toString() ?? '',
      syntheticEmailPhone,
      sbUser?.phone ?? '',
    ];

    for (var candidate in candidates) {
      if (candidate.isEmpty) continue;
      if (candidate.contains('@') && !candidate.contains('@whatsapp.wacrm.local')) continue;

      String clean = candidate.replaceAll(RegExp(r'\D'), '');

      // Strip +91 or 91 country code prefix or take trailing 10 digits
      if (clean.startsWith('91') && clean.length == 12) {
        clean = clean.substring(2);
      } else if (clean.length > 10) {
        clean = clean.substring(clean.length - 10);
      }

      // Accept only valid 10-digit Indian mobile numbers starting with 6-9
      if (clean.length == 10 && RegExp(r'^[6-9]\d{9}$').hasMatch(clean)) {
        return '+91 ${clean.substring(0, 5)} ${clean.substring(5)}';
      }
    }

    return 'Not Set';
  }


  Future<void> _launchUpiApp({String? amount}) async {
    final upiUrl = "upi://pay?pa=9486335870@hdfcbank&pn=FAGO%20Good%20Cause&tn=FAGO%20Good%20Cause%20Contribution${amount != null ? '&am=$amount' : ''}&cu=INR";
    final uri = Uri.parse(upiUrl);

    try {
      bool launched = false;
      if (await canLaunchUrl(uri)) {
        launched = await launchUrl(uri, mode: LaunchMode.externalNonBrowserApplication);
      }
      if (!launched) {
        launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Support UPI ID: 9486335870@hdfcbank. Open GPay or PhonePe to pay.'),
            backgroundColor: Colors.amber,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Support UPI ID: 9486335870@hdfcbank. Open GPay or PhonePe to pay.'),
          backgroundColor: Colors.amber,
        ),
      );
    }
  }

  /// Resolves the display role label prioritizing the DB profile role column
  /// then falling back to live AuthState.
  String _resolveDisplayRole(ProfileModel profile, fago.AuthState authState) {
    if (profile.role.toLowerCase() == 'admin' || authState.role == fago.UserRole.admin) return 'admin';
    if (profile.role.toLowerCase() == 'driver' || authState.role == fago.UserRole.driver) return 'driver';
    if (authState.role == fago.UserRole.user) return profile.role.isNotEmpty ? profile.role.toLowerCase() : 'user';
    return profile.role.isNotEmpty ? profile.role.toLowerCase() : 'user';
  }

  Widget _buildProfileTab(ProfileModel profile, fago.AuthState authState) {
    final displayRole = _resolveDisplayRole(profile, authState);
    final cleanWhatsapp = _cleanPhone(profile.whatsapp, fallbackPhone: profile.phone);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFFFD700), width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.greenAccent.withValues(alpha: 0.3),
                  blurRadius: 16,
                  spreadRadius: 2,
                )
              ],
            ),
            child: CircleAvatar(
              radius: 50,
              backgroundColor: const Color(0xFF334155),
              backgroundImage: profile.avatarUrl != null && profile.avatarUrl!.isNotEmpty
                  ? NetworkImage(profile.avatarUrl!)
                  : const AssetImage('assets/images/default_avatar.png') as ImageProvider,
            ),
          ),
          const SizedBox(height: 16),
          Text(profile.fullName, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: displayRole == 'admin'
                  ? Colors.amber.withValues(alpha: 0.2)
                  : displayRole == 'driver'
                      ? Colors.orange.withValues(alpha: 0.2)
                      : const Color(0xFF00F0FF).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: displayRole == 'admin'
                    ? Colors.amber
                    : displayRole == 'driver'
                        ? Colors.orange
                        : const Color(0xFF00F0FF),
              ),
            ),
            child: Text(
              displayRole.toUpperCase(),
              style: TextStyle(
                color: displayRole == 'admin'
                    ? Colors.amber
                    : displayRole == 'driver'
                        ? Colors.orange
                        : const Color(0xFF00F0FF),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 32),
          // Permanent Security Lock Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
            ),
            child: Row(
              children: const [
                Icon(Icons.lock, color: Colors.amber, size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Permanent Registered Profile (Admin approval required to change cell or identity details)',
                    style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.phone, 'Cell / WhatsApp', cleanWhatsapp),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.location_on, 'Address / Live GPS', (profile.address != null && profile.address!.isNotEmpty) ? profile.address! : 'Live Location Active', isEditable: true, profile: profile, onEdit: () => _editLocationDialog(profile)),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.account_balance_wallet, 'Your UPI ID', (profile.upiId != null && profile.upiId!.isNotEmpty) ? profile.upiId! : 'Not Set', isEditable: true, profile: profile, onEdit: () => _editUpiId(profile)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () async {
              final text = Uri.encodeComponent("Hey! Book local rides, rentals & services with 0% commission on FAGO Super App: https://watscrm.vercel.app");
              final url = Uri.parse("https://wa.me/?text=$text");
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.share, color: Colors.black),
            label: const Text('Invite Friends & Drivers via WhatsApp', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00FF00),
              foregroundColor: Colors.black,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 8,
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const WhatsappStatusPromoScreen()),
              );
            },
            icon: const Icon(Icons.amp_stories, color: Colors.black),
            label: const Text('📸 Share Tamil Promo on WhatsApp Status', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF25D366),
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 8,
            ),
          ),
          const SizedBox(height: 12),
          if (cleanWhatsapp.contains('9486335870') || displayRole == 'admin') ...[
            ElevatedButton.icon(
              onPressed: () {
                context.go('/admin');
              },
              icon: const Icon(Icons.admin_panel_settings, color: Colors.black),
              label: const Text('👑 Access Admin CRM Command Center', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 14)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFFD700),
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 10,
              ),
            ),
            const SizedBox(height: 12),
          ] else ...[
            ElevatedButton.icon(
              onPressed: () async {
                final text = Uri.encodeComponent(
                  "🏢 *FAGO AREA ADMIN RECRUITMENT APPLICATION* 🏢\n\n"
                  "👤 *Applicant Name:* ${profile.fullName}\n"
                  "📱 *Cell / WhatsApp:* $cleanWhatsapp\n"
                  "📍 *Primary Pincode / Area:* ${profile.address ?? 'Tamil Nadu'}\n\n"
                  "👉 *I want to become an Area Admin to manage 100-200 local drivers, merchants, farmers & users in my pincode territory. Please approve my Area Admin recruitment!*"
                );
                final url = Uri.parse("https://wa.me/919486335870?text=$text");
                if (await canLaunchUrl(url)) {
                  await launchUrl(url, mode: LaunchMode.externalApplication);
                }
              },
              icon: const Icon(Icons.admin_panel_settings, color: Colors.black),
              label: const Text('🏢 Apply to Become Area Admin (Pincode Manager)', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.amber,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 8,
              ),
            ),
            const SizedBox(height: 12),
          ],
          ElevatedButton.icon(
            onPressed: () {
              context.go('/drivo');
            },
            icon: const Icon(Icons.directions_car, color: Colors.black),
            label: const Text('🚗 Register as DriveO Partner (Driver Registration)', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orangeAccent,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 8,
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () async {
              final rawPhone = cleanWhatsapp.replaceAll(RegExp(r'\D'), '');
              final url = Uri.parse("https://watscrm.vercel.app?phone=$rawPhone");
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.web, color: Colors.black),
            label: const Text('🌐 Open FAGO Web App Modules & CRM', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00F0FF),
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 8,
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () async {
              final rawPhone = cleanWhatsapp.replaceAll(RegExp(r'\D'), '');
              final url = Uri.parse("https://thamizhan.vercel.app?phone=$rawPhone&name=${Uri.encodeComponent(profile.fullName)}");
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.language, color: Colors.cyanAccent),
            label: const Text('Open Thamizhan Super Pass Portal', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 14)),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
              side: const BorderSide(color: Colors.cyanAccent),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 24),
          // ── Support & Contribute to FAGO Card ──
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFE11D48).withValues(alpha: 0.15),
                  const Color(0xFF7C3AED).withValues(alpha: 0.15),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFF43F5E).withValues(alpha: 0.4), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.favorite, color: Color(0xFFF43F5E), size: 24),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Support FAGO Good Cause ❤️',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Text(
                  'FAGO connects farmers, drivers, students & buyers with 0% commission. Contribute ₹10, ₹50, ₹100 or more to keep FAGO free & growing!',
                  style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.account_balance_wallet, color: Colors.amber, size: 20),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          '9486335870@hdfcbank',
                          style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy, color: Colors.cyanAccent, size: 18),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('UPI ID copied: 9486335870@hdfcbank')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                // Quick UPI Amount Options
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF00FF00),
                          side: const BorderSide(color: Color(0xFF00FF00)),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                        onPressed: () => _launchUpiApp(amount: '10'),
                        child: const Text('₹10', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.amber,
                          side: const BorderSide(color: Colors.amber),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                        onPressed: () => _launchUpiApp(amount: '50'),
                        child: const Text('₹50', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.cyanAccent,
                          side: const BorderSide(color: Colors.cyanAccent),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                        onPressed: () => _launchUpiApp(amount: '100'),
                        child: const Text('₹100', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: () => _launchUpiApp(),
                    icon: const Icon(Icons.account_balance_wallet, color: Colors.white, size: 20),
                    label: const Text('⚡ PAY VIA GPAY / PHONEPE / PAYTM', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF43F5E),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 6,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: const Color(0xFF1E293B),
                    title: const Text('Sign Out', style: TextStyle(color: Colors.white)),
                    content: const Text('Are you sure you want to sign out from FAGO?', style: TextStyle(color: Colors.white70)),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF43F5E)),
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                );
                if (confirm == true) {
                  ref.read(fago.authProvider.notifier).signOut();
                }
              },
              icon: const Icon(Icons.logout, color: Colors.white, size: 20),
              label: const Text('🚪 SIGN OUT / LOGOUT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF43F5E),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 6,
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Center(
            child: Text(
              'FAGO Super App • Version v1.0.5 Beta (n&f)',
              style: TextStyle(color: Colors.white38, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String title, String value, {bool isEditable = false, ProfileModel? profile, VoidCallback? onEdit}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF00F0FF)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                Text(value, style: const TextStyle(color: Colors.white, fontSize: 16)),
              ],
            ),
          ),
          if (isEditable && onEdit != null)
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.grey, size: 20),
              onPressed: onEdit,
            ),
        ],
      ),
    );
  }

  void _editLocationDialog(ProfileModel profile) {
    final TextEditingController controller = TextEditingController(text: profile.address ?? '');
    bool isDetecting = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text('Update Live GPS / Address', style: TextStyle(color: Colors.white)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Enter city, area or pincode',
                  hintStyle: TextStyle(color: Colors.grey),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00F0FF))),
                ),
              ),
              const SizedBox(height: 14),
              ElevatedButton.icon(
                onPressed: isDetecting
                    ? null
                    : () async {
                        setDialogState(() => isDetecting = true);
                        try {
                          final loc = await LocationService().getCurrentLocation();
                          final address = await LocationService().getAddressFromCoordinates(loc.latitude, loc.longitude);
                          setDialogState(() {
                            controller.text = address;
                            isDetecting = false;
                          });
                        } catch (e) {
                          setDialogState(() => isDetecting = false);
                        }
                      },
                icon: isDetecting
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                    : const Icon(Icons.my_location, color: Colors.black),
                label: Text(
                  isDetecting ? 'Detecting GPS...' : '⚡ Auto-Detect Live Location',
                  style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00FF00),
                  minimumSize: const Size(double.infinity, 42),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            TextButton(
              onPressed: () async {
                if (controller.text.isNotEmpty) {
                  final nav = Navigator.of(ctx);
                  await ref.read(profileServiceProvider).updateProfile(profile.id, {'address': controller.text.trim()});
                  ref.invalidate(currentProfileProvider);
                  nav.pop();
                }
              },
              child: const Text('Save', style: TextStyle(color: Color(0xFF00F0FF))),
            ),
          ],
        ),
      ),
    );
  }

  void _editUpiId(ProfileModel profile) {
    final TextEditingController controller = TextEditingController(text: profile.upiId);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Update UPI ID', style: TextStyle(color: Colors.white)),
        content: TextField(
          controller: controller,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'e.g. name@bank',
            hintStyle: TextStyle(color: Colors.grey),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00F0FF))),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () async {
              if (controller.text.isNotEmpty) {
                final nav = Navigator.of(context);
                await ref.read(profileServiceProvider).updateProfile(profile.id, {'upi_id': controller.text.trim()});
                ref.invalidate(currentProfileProvider);
                nav.pop();
              }
            },
            child: const Text('Save', style: TextStyle(color: Color(0xFF00F0FF))),
          ),
        ],
      ),
    );
  }

  Widget _buildDigitalIdTab(ProfileModel profile, fago.AuthState authState) {
    final displayRole = _resolveDisplayRole(profile, authState);
    final String qrData = profile.digitalIdHash ?? 'fago-id-${profile.id}';
    final cleanWhatsapp = _cleanPhone(profile.whatsapp, fallbackPhone: profile.phone);
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Center(
        child: Container(
          width: 320,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF00F0FF).withValues(alpha: 0.5), width: 2),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00F0FF).withValues(alpha: 0.2),
                blurRadius: 20,
                spreadRadius: 2,
              )
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('FAGO Super Pass ID', style: TextStyle(color: Color(0xFF00F0FF), fontWeight: FontWeight.bold, fontSize: 18)),
                  Row(
                    children: [
                      const Icon(Icons.verified, color: Color(0xFF00F0FF), size: 18),
                      const SizedBox(width: 4),
                      Text('VERIFIED', style: TextStyle(color: const Color(0xFF00F0FF), fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(8),
                color: Colors.white,
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 200.0,
                ),
              ),
              const SizedBox(height: 24),
              Text(profile.fullName.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              const SizedBox(height: 4),
              Text(cleanWhatsapp, style: const TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
                decoration: BoxDecoration(
                  color: displayRole == 'admin'
                      ? Colors.amber
                      : (displayRole == 'driver' ? Colors.orange : Colors.blue),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  displayRole.toUpperCase(),
                  style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResumeTab(ProfileModel profile) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('My Resume', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.picture_as_pdf, color: Colors.redAccent),
                    onPressed: () {
                      // Trigger PDF download
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.share, color: Color(0xFF00F0FF)),
                    onPressed: () {
                      // Trigger URL share
                    },
                  ),
                ],
              )
            ],
          ),
          const SizedBox(height: 24),
          _buildSectionTitle('Skills'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: profile.skills.map((skill) => Chip(
              label: Text(skill.toString(), style: const TextStyle(color: Colors.white)),
              backgroundColor: const Color(0xFF334155),
              side: BorderSide.none,
            )).toList(),
          ),
          const SizedBox(height: 24),
          _buildSectionTitle('Experience'),
          ...profile.experience.map((exp) => ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.work, color: Color(0xFF00F0FF)),
            title: Text(exp['title'] ?? 'Role', style: const TextStyle(color: Colors.white)),
            subtitle: Text(exp['company'] ?? 'Company', style: const TextStyle(color: Colors.grey)),
          )),
          const SizedBox(height: 24),
          _buildSectionTitle('Education'),
          ...profile.education.map((edu) => ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.school, color: Color(0xFF00F0FF)),
            title: Text(edu['degree'] ?? 'Degree', style: const TextStyle(color: Colors.white)),
            subtitle: Text(edu['institution'] ?? 'Institution', style: const TextStyle(color: Colors.grey)),
          )),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(title, style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 16, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildHistoryTab() {
    final txAsync = ref.watch(userTransactionsProvider);
    
    return txAsync.when(
      data: (transactions) {
        if (transactions.isEmpty) {
          return const Center(child: Text('No transactions yet', style: TextStyle(color: Colors.grey)));
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: transactions.length,
          itemBuilder: (context, index) {
            final tx = transactions[index];
            final isCredit = tx.type == 'CREDIT';
            return Card(
              color: const Color(0xFF1E293B),
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: isCredit ? Colors.green.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2),
                  child: Icon(isCredit ? Icons.arrow_downward : Icons.arrow_upward, 
                    color: isCredit ? Colors.green : Colors.red),
                ),
                title: Text(tx.description ?? 'Transaction', style: const TextStyle(color: Colors.white)),
                subtitle: Text('${tx.referenceModule} • ${tx.createdAt.toLocal().toString().split(' ')[0]}', style: const TextStyle(color: Colors.grey)),
                trailing: Text('${isCredit ? '+' : '-'}₹${tx.amount.toStringAsFixed(2)}', 
                  style: TextStyle(color: isCredit ? Colors.green : Colors.red, fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF00F0FF))),
      error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red))),
    );
  }
}
