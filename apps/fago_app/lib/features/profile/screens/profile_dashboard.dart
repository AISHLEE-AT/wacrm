import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../providers/profile_provider.dart';
import '../models/profile_model.dart';
import '../models/transaction_model.dart';

class ProfileDashboard extends ConsumerStatefulWidget {
  const ProfileDashboard({Key? key}) : super(key: key);

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

  Widget _buildProfileTab(ProfileModel profile) {
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
          Text(profile.role, style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 16)),
          const SizedBox(height: 32),
          _buildInfoRow(Icons.phone, 'WhatsApp', profile.whatsapp ?? 'Not provided'),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.location_on, 'Address', profile.address ?? 'Not provided'),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.account_balance_wallet, 'UPI ID', profile.upiId ?? 'Not set', isEditable: true, profile: profile),
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
                await ref.read(profileServiceProvider).updateProfile(profile.id, {'upi_id': controller.text.trim()});
                ref.invalidate(currentProfileProvider);
                if (mounted) Navigator.pop(context);
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
                  Icon(Icons.verified, color: const Color(0xFF00F0FF)),
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
              Text(profile.fullName.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              const SizedBox(height: 8),
              Text(profile.role.toUpperCase(), style: const TextStyle(color: Colors.grey, fontSize: 14, letterSpacing: 2)),
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
          )).toList(),
          const SizedBox(height: 24),
          _buildSectionTitle('Education'),
          ...profile.education.map((edu) => ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.school, color: Color(0xFF00F0FF)),
            title: Text(edu['degree'] ?? 'Degree', style: const TextStyle(color: Colors.white)),
            subtitle: Text(edu['institution'] ?? 'Institution', style: const TextStyle(color: Colors.grey)),
          )).toList(),
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
