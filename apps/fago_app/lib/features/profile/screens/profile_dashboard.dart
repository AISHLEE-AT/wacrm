import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/profile_provider.dart';
import '../models/profile_model.dart';
import '../../../screens/web_module_screen.dart';
import '../../promo/screens/whatsapp_status_promo_screen.dart';

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

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Slate 900
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B), // Slate 800
        title: const Text('My Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Color(0xFF00F0FF)),
            tooltip: 'Open Aishlee-Web Profile Pass',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const WebModuleScreen(title: 'Profile - Aishlee Web Pass', modulePath: 'profile'),
                ),
              );
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
          if (profile == null) {
            return const Center(child: Text('Profile not found', style: TextStyle(color: Colors.white)));
          }
          return TabBarView(
            controller: _tabController,
            children: [
              _buildProfileTab(profile),
              _buildDigitalIdTab(profile),
              _buildResumeTab(profile),
              _buildHistoryTab(),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF00F0FF))),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
      ),
    );
  }

  String _cleanPhone(String? raw) {
    final sbUser = Supabase.instance.client.auth.currentUser;
    List<String> candidates = [
      raw ?? '',
      sbUser?.phone ?? '',
      sbUser?.email ?? '',
      sbUser?.userMetadata?['phone']?.toString() ?? '',
      sbUser?.userMetadata?['whatsapp']?.toString() ?? '',
    ];

    String extractedDigits = '';
    for (var candidate in candidates) {
      if (candidate.isEmpty) continue;
      String clean = candidate;
      if (clean.contains('@')) {
        clean = clean.split('@')[0];
      }
      clean = clean.replaceAll(RegExp(r'\D'), '');
      if (clean.startsWith('91') && clean.length == 12) {
        clean = clean.substring(2);
      }
      if (clean.length == 10 && !clean.startsWith('63423')) {
        extractedDigits = clean;
        break;
      }
    }

    if (extractedDigits.length == 10) {
      return '+91 ${extractedDigits.substring(0, 5)} ${extractedDigits.substring(5)}';
    }

    return extractedDigits.isNotEmpty ? '+91 $extractedDigits' : '+91 Verified User';
  }

  Widget _buildProfileTab(ProfileModel profile) {
    final cleanWhatsapp = _cleanPhone(profile.whatsapp);
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: const Color(0xFF334155),
            backgroundImage: profile.avatarUrl != null ? NetworkImage(profile.avatarUrl!) : null,
            child: profile.avatarUrl == null ? const Icon(Icons.person, size: 50, color: Colors.white) : null,
          ),
          const SizedBox(height: 16),
          Text(profile.fullName, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: profile.role.toLowerCase() == 'admin'
                  ? Colors.amber.withValues(alpha: 0.2)
                  : profile.role.toLowerCase() == 'driver'
                      ? Colors.orange.withValues(alpha: 0.2)
                      : const Color(0xFF00F0FF).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: profile.role.toLowerCase() == 'admin'
                    ? Colors.amber
                    : profile.role.toLowerCase() == 'driver'
                        ? Colors.orange
                        : const Color(0xFF00F0FF),
              ),
            ),
            child: Text(
              profile.role.toUpperCase(),
              style: TextStyle(
                color: profile.role.toLowerCase() == 'admin'
                    ? Colors.amber
                    : profile.role.toLowerCase() == 'driver'
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
          _buildInfoRow(Icons.location_on, 'Address', profile.address ?? 'Tamil Nadu, India'),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.account_balance_wallet, 'UPI ID', profile.upiId ?? 'wacrm@upi', isEditable: true, profile: profile),
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
          OutlinedButton.icon(
            onPressed: () async {
              final rawPhone = cleanWhatsapp.replaceAll(RegExp(r'\D'), '');
              final url = Uri.parse("https://thamizhan.vercel.app?phone=$rawPhone&name=${Uri.encodeComponent(profile.fullName)}");
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.language, color: Colors.cyanAccent),
            label: const Text('Open Aishlee Web (தமிழன் Portal)', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 14)),
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
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          final uri = Uri.parse("upi://pay?pa=9486335870@hdfcbank&pn=Aishlee%20Technology&tn=FAGO%20Good%20Cause%20Contribution&cu=INR");
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(uri);
                          } else {
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Open GPay / PhonePe / Paytm & pay to 9486335870@hdfcbank')),
                            );
                          }
                        },
                        icon: const Icon(Icons.flash_on, color: Colors.white, size: 18),
                        label: const Text('Contribute via UPI (₹10 / ₹100+)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFF43F5E),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String title, String value, {bool isEditable = false, ProfileModel? profile}) {
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
          if (isEditable)
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.grey, size: 20),
              onPressed: () => _editUpiId(profile!),
            ),
        ],
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

  Widget _buildDigitalIdTab(ProfileModel profile) {
    final String qrData = profile.digitalIdHash ?? 'fago-id-${profile.id}';
    final cleanWhatsapp = _cleanPhone(profile.whatsapp);
    
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
                  const Text('Aishlee ID', style: TextStyle(color: Color(0xFF00F0FF), fontWeight: FontWeight.bold, fontSize: 18)),
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
                  color: profile.role.toLowerCase() == 'admin' ? Colors.amber : (profile.role.toLowerCase() == 'driver' ? Colors.orange : Colors.blue),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  profile.role.toUpperCase(),
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
