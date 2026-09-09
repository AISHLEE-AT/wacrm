import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../../core/env.dart';

class GroupOScreen extends ConsumerStatefulWidget {
  const GroupOScreen({super.key});

  @override
  ConsumerState<GroupOScreen> createState() => _GroupOScreenState();
}

class _GroupOScreenState extends ConsumerState<GroupOScreen> {
  bool _isLoading = true;
  List<dynamic> _groups = [];
  String _selectedCategory = 'ALL';
  String _searchQuery = '';

  final List<Map<String, String>> _categories = [
    {'id': 'ALL', 'label': 'All Groups', 'labelTa': 'அனைத்து குழுக்கள்'},
    {'id': 'WomenSHG', 'label': 'Women SHG', 'labelTa': 'மகளிர் சுயஉதவி'},
    {'id': 'FarmerFPO', 'label': 'Farmer FPO', 'labelTa': 'உழவர் உற்பத்தியாளர்'},
    {'id': 'SportsClub', 'label': 'Youth & Sports', 'labelTa': 'இளைஞர் மன்றம்'},
    {'id': 'BusinessGroup', 'label': 'Trade / Business', 'labelTa': 'வணிகக் குழு'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchGroups();
  }

  Future<void> _fetchGroups() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(
        Uri.parse('${AppEnv.apiUrl}/api/groupo/groups'),
      ).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is List) {
          setState(() {
            _groups = data;
            _isLoading = false;
          });
          return;
        }
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  Future<void> _fetchAndShowMembers(dynamic group) async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0f172a),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _GroupLedgerModal(group: group),
    );
  }

  void _openWhatsApp(String phone, String text) async {
    final clean = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('https://wa.me/$clean?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _openDialer(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Color _getCategoryColor(String cat) {
    switch (cat) {
      case 'WomenSHG':
        return const Color(0xFFec4899);
      case 'FarmerFPO':
        return const Color(0xFF10b981);
      case 'SportsClub':
        return const Color(0xFF3b82f6);
      case 'BusinessGroup':
        return const Color(0xFFf59e0b);
      default:
        return const Color(0xFF8b5cf6);
    }
  }

  IconData _getCategoryIcon(String cat) {
    switch (cat) {
      case 'WomenSHG':
        return LucideIcons.heartHandshake;
      case 'FarmerFPO':
        return LucideIcons.sprout;
      case 'SportsClub':
        return LucideIcons.trophy;
      case 'BusinessGroup':
        return LucideIcons.briefcase;
      default:
        return LucideIcons.users;
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _groups.where((g) {
      final matchesCat = _selectedCategory == 'ALL' || (g['category'] == _selectedCategory);
      final q = _searchQuery.toLowerCase();
      final name = (g['name'] ?? '').toString().toLowerCase();
      final village = (g['village'] ?? '').toString().toLowerCase();
      final district = (g['district'] ?? '').toString().toLowerCase();
      final matchesSearch = q.isEmpty || name.contains(q) || village.contains(q) || district.contains(q);
      return matchesCat && matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'GroupO • சமூகக் குழுக்கள்',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              'SHG & Collective Buying Hub',
              style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, color: Color(0xFF38BDF8), size: 20),
            onPressed: _fetchGroups,
          ),
          IconButton(
            icon: const Icon(LucideIcons.plusCircle, color: Color(0xFF10B981), size: 22),
            onPressed: () {
              _openWhatsApp(
                AppEnv.wabaPhone,
                'வணக்கம்! எனது கிராமத்தில் புதிய சுயஉதவிக் குழு / உழவர் குழுவை SuprO GroupO-வில் பதிவு செய்ய விரும்புகிறேன்.',
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchGroups,
        color: const Color(0xFF8B5CF6),
        child: CustomScrollView(
          slivers: [
            // Search & Category Filter
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  children: [
                    // Search field
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'Search group name, village, or district...',
                          hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                          prefixIcon: Icon(LucideIcons.search, color: Color(0xFF94A3B8), size: 18),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Filter Chips
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _categories.map((cat) {
                          final isSelected = _selectedCategory == cat['id'];
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text('${cat['label']} (${cat['labelTa']})'),
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              selected: isSelected,
                              selectedColor: const Color(0xFF8B5CF6),
                              backgroundColor: const Color(0xFF1E293B),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                                side: BorderSide(
                                  color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF334155),
                                ),
                              ),
                              onSelected: (_) => setState(() => _selectedCategory = cat['id']!),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Summary Metrics Banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1E1B4B), Color(0xFF311042)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF4C1D95).withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5CF6).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(LucideIcons.shieldCheck, color: Color(0xFFA78BFA), size: 28),
                          ),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Community Empowerment Hub',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  '100% Transparent ledger, direct bank integration & group buying discounts for members.',
                                  style: TextStyle(color: Color(0xFFC4B5FD), fontSize: 11, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Content List
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
                ),
              )
            else if (filtered.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(LucideIcons.users, size: 48, color: Colors.white.withOpacity(0.2)),
                      const SizedBox(height: 12),
                      const Text(
                        'No groups found',
                        style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Try adjusting your search filter or add your village group.',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final group = filtered[index];
                      final cat = group['category'] ?? 'WomenSHG';
                      final catColor = _getCategoryColor(cat);
                      final catIcon = _getCategoryIcon(cat);
                      final monthlySavings = group['monthly_savings_per_member'] ?? '500';
                      final totalSavings = group['total_savings_pool'] ?? '0';
                      final activeLoan = group['active_loan_pool'] ?? '0';
                      final village = group['village'] ?? '';
                      final district = group['district'] ?? '';
                      final leaderName = group['leader_name'] ?? 'Group Leader';
                      final leaderPhone = group['leader_phone'] ?? AppEnv.wabaPhone;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header banner with category
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: catColor.withOpacity(0.12),
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                              ),
                              child: Row(
                                children: [
                                  Icon(catIcon, color: catColor, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    group['category_label'] ?? cat,
                                    style: TextStyle(color: catColor, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                  const Spacer(),
                                  if (group['reg_code'] != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.black26,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        'Reg: ${group['reg_code']}',
                                        style: const TextStyle(color: Colors.white70, fontSize: 10),
                                      ),
                                    ),
                                ],
                              ),
                            ),

                            // Details
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    group['name'] ?? 'Unnamed Group',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (group['tagline'] != null && group['tagline'].toString().isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      group['tagline'],
                                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                                    ),
                                  ],
                                  const SizedBox(height: 10),

                                  Row(
                                    children: [
                                      const Icon(LucideIcons.mapPin, color: Color(0xFF38BDF8), size: 14),
                                      const SizedBox(width: 4),
                                      Text(
                                        '$village, $district',
                                        style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 12),
                                      ),
                                      const Spacer(),
                                      const Icon(LucideIcons.calendar, color: Color(0xFFA78BFA), size: 14),
                                      const SizedBox(width: 4),
                                      Text(
                                        group['meeting_schedule'] ?? 'Monthly Meeting',
                                        style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),

                                  // Financial stats row
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0xFF334155).withOpacity(0.5)),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                                      children: [
                                        _FinancialItem(
                                          label: 'Monthly Target',
                                          value: '₹$monthlySavings',
                                          color: const Color(0xFF38BDF8),
                                        ),
                                        Container(height: 24, width: 1, color: const Color(0xFF334155)),
                                        _FinancialItem(
                                          label: 'Savings Pool',
                                          value: '₹$totalSavings',
                                          color: const Color(0xFF10B981),
                                        ),
                                        Container(height: 24, width: 1, color: const Color(0xFF334155)),
                                        _FinancialItem(
                                          label: 'Active Loan',
                                          value: '₹$activeLoan',
                                          color: const Color(0xFFF59E0B),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 14),

                                  // Action Buttons
                                  Row(
                                    children: [
                                      Expanded(
                                        child: ElevatedButton.icon(
                                          onPressed: () => _fetchAndShowMembers(group),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF334155),
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(vertical: 10),
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                          ),
                                          icon: const Icon(LucideIcons.bookOpen, size: 15),
                                          label: const Text('View Ledger', style: TextStyle(fontSize: 12)),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      IconButton(
                                        onPressed: () => _openWhatsApp(
                                          leaderPhone,
                                          'வணக்கம்! நான் ${group['name']} குழுவில் இணைய விரும்புகிறேன்.',
                                        ),
                                        style: IconButton.styleFrom(
                                          backgroundColor: const Color(0xFF10B981).withOpacity(0.15),
                                          foregroundColor: const Color(0xFF10B981),
                                          padding: const EdgeInsets.all(10),
                                        ),
                                        icon: const Icon(LucideIcons.messageCircle, size: 18),
                                        tooltip: 'WhatsApp Group Leader',
                                      ),
                                      const SizedBox(width: 4),
                                      IconButton(
                                        onPressed: () => _openDialer(leaderPhone),
                                        style: IconButton.styleFrom(
                                          backgroundColor: const Color(0xFF3B82F6).withOpacity(0.15),
                                          foregroundColor: const Color(0xFF38BDF8),
                                          padding: const EdgeInsets.all(10),
                                        ),
                                        icon: const Icon(LucideIcons.phone, size: 18),
                                        tooltip: 'Call Leader ($leaderName)',
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    childCount: filtered.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _FinancialItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _FinancialItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
        ),
      ],
    );
  }
}

class _GroupLedgerModal extends StatefulWidget {
  final dynamic group;
  const _GroupLedgerModal({required this.group});

  @override
  State<_GroupLedgerModal> createState() => _GroupLedgerModalState();
}

class _GroupLedgerModalState extends State<_GroupLedgerModal> {
  bool _loading = true;
  List<dynamic> _members = [];

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  Future<void> _loadMembers() async {
    try {
      final res = await http.get(
        Uri.parse('${AppEnv.apiUrl}/api/groupo/groups/${widget.group['id']}/members'),
      ).timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is List) {
          setState(() {
            _members = data;
            _loading = false;
          });
          return;
        }
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.group['name'] ?? 'Group Ledger',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Member Ledger & Dues Summary • ${_members.length} Members',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(LucideIcons.x, color: Colors.white70),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const Divider(color: Color(0xFF334155), height: 24),
          if (_loading)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(color: Color(0xFF8B5CF6)),
              ),
            )
          else if (_members.isEmpty)
            const Expanded(
              child: Center(
                child: Text(
                  'No member records registered yet.',
                  style: TextStyle(color: Color(0xFF94A3B8)),
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                itemCount: _members.length,
                itemBuilder: (ctx, i) {
                  final m = _members[i];
                  final isPaid = m['current_month_paid'] == true;
                  final role = m['role'] ?? 'Member';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: isPaid ? const Color(0xFF065F46) : const Color(0xFF831843),
                          radius: 18,
                          child: Text(
                            (m['name'] ?? 'U')[0].toUpperCase(),
                            style: TextStyle(
                              color: isPaid ? const Color(0xFF34D399) : const Color(0xFFF472B6),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    m['name'] ?? 'Member',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF334155),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      role,
                                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 10),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Accumulated: ₹${m['total_savings_accumulated'] ?? 0} • Loan: ₹${m['active_loan_balance'] ?? 0}',
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isPaid ? const Color(0x3310B981) : const Color(0x33EF4444),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isPaid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                            ),
                          ),
                          child: Text(
                            isPaid ? 'PAID' : 'DUE',
                            style: TextStyle(
                              color: isPaid ? const Color(0xFF34D399) : const Color(0xFFF87171),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
