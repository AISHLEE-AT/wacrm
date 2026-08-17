import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'admin_daily_news_tab.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  int _currentIndex = 0;
  final SupabaseClient _supabase = Supabase.instance.client;

  // Inbox & Data States
  List<dynamic> _recentMessages = [];
  List<dynamic> _pendingRides = [];
  List<dynamic> _driverPartners = [];
  bool _isLoading = true;

  final TextEditingController _broadcastMsgController = TextEditingController();
  String _broadcastAudience = 'all';

  @override
  void initState() {
    super.initState();
    _fetchAdminData();
  }

  @override
  void dispose() {
    _broadcastMsgController.dispose();
    super.dispose();
  }

  Future<void> _fetchAdminData() async {
    setState(() => _isLoading = true);
    try {
      // 1. Fetch recent rides
      final rides = await _supabase
          .from('rides')
          .select('*')
          .order('created_at', ascending: false)
          .limit(20);

      // 2. Fetch drivers
      final drivers = await _supabase
          .from('drivers')
          .select('*')
          .order('created_at', ascending: false)
          .limit(20);

      if (mounted) {
        setState(() {
          _pendingRides = rides as List<dynamic>;
          _driverPartners = drivers as List<dynamic>;
          _recentMessages = [
            {
              'phone': '919344532738',
              'name': 'Deepan (Customer)',
              'lastMessage': 'Need an auto from Thanjavur Junction to Medical College',
              'time': '2 mins ago',
              'unread': true,
              'category': 'RideO',
            },
            {
              'phone': '919123596988',
              'name': 'RAJA-D (Partner)',
              'lastMessage': 'Online and available near Naradapattu with Swift Dzire',
              'time': '10 mins ago',
              'unread': false,
              'category': 'DriveO',
            },
            {
              'phone': '919486335870',
              'name': 'Admin-RAJA (Admin)',
              'lastMessage': 'Dispatch confirmed for RENTO-4819 Harvester booking',
              'time': '25 mins ago',
              'unread': false,
              'category': 'RentO',
            },
          ];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _replyViaWhatsApp(String phone, String text) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=${Uri.encodeComponent(text)}');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open WhatsApp.')));
      }
    }
  }

  void _sendBroadcast() async {
    final text = _broadcastMsgController.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter broadcast message text.')));
      return;
    }

    final broadcastText = '📢 *SuprO Announcement* 📢\n\n$text\n\n- SuprO Admin Team';
    _replyViaWhatsApp('916381029380', broadcastText);
    _broadcastMsgController.clear();
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Broadcast dispatched to WhatsApp CRM queue!')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.shieldCheck, color: Color(0xFFEF4444), size: 18),
            ),
            const SizedBox(width: 10),
            const Text('Native Admin CRM', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
          ],
        ),
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _fetchAdminData,
            icon: const Icon(LucideIcons.refreshCw, color: Color(0xFF94A3B8), size: 20),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFF1E293B)),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFEF4444)))
          : _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF0D1526),
        selectedItemColor: const Color(0xFFEF4444),
        unselectedItemColor: const Color(0xFF64748B),
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        items: const [
          BottomNavigationBarItem(icon: Icon(LucideIcons.messageSquare), label: 'WA Inbox'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.car), label: 'Live Rides'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.users), label: 'Drivers'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.megaphone), label: 'Broadcast'),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return _buildInboxTab();
      case 1:
        return _buildLiveRidesTab();
      case 2:
        return _buildDriversTab();
      case 3:
        return _buildBroadcastTab();
      default:
        return Container();
    }
  }

  Widget _buildInboxTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _recentMessages.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final msg = _recentMessages[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: msg['unread'] ? const Color(0xFFEF4444) : const Color(0xFF1E293B)),
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
                          color: const Color(0x2610B981),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(LucideIcons.messageCircle, color: Color(0xFF10B981), size: 18),
                      ),
                      const SizedBox(width: 10),
                      Text(msg['name'], style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(msg['category'], style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(msg['lastMessage'], style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(msg['time'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                  ElevatedButton.icon(
                    onPressed: () => _replyViaWhatsApp(msg['phone'], 'Hello ${msg['name']}, how can SuprO help you today?'),
                    icon: const Icon(LucideIcons.reply, size: 14),
                    label: const Text('Reply on WhatsApp'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLiveRidesTab() {
    if (_pendingRides.isEmpty) {
      return const Center(child: Text('No active rides at the moment.', style: TextStyle(color: Colors.white)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _pendingRides.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final ride = _pendingRides[index];
        final status = ride['status'] ?? 'pending';
        final isPending = status == 'pending';
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isPending ? const Color(0xFFF59E0B) : const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('🚕 Ride #${(ride['id'] as String).substring(0, 8)}', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isPending ? const Color(0x26F59E0B) : const Color(0x2610B981),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      status.toString().toUpperCase(),
                      style: TextStyle(color: isPending ? const Color(0xFFF59E0B) : const Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text('Passenger: ${ride['passenger_name'] ?? 'Rider'} (${ride['passenger_phone'] ?? 'N/A'})', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
              Text('Vehicle: ${ride['vehicle_category'] ?? 'Cab'} • Fare: ₹${ride['fare'] ?? 0} • OTP: ${ride['otp'] ?? '----'}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDriversTab() {
    if (_driverPartners.isEmpty) {
      return const Center(child: Text('No registered drivers found.', style: TextStyle(color: Colors.white)));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _driverPartners.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final d = _driverPartners[index];
        final isOnline = d['status'] == 'online';
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isOnline ? const Color(0x2610B981) : const Color(0x2664748B),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(LucideIcons.car, color: isOnline ? const Color(0xFF10B981) : const Color(0xFF64748B), size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d['name'] ?? 'Driver Partner', style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text('Phone: ${d['phone'] ?? d['mobile_number'] ?? 'N/A'}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    const SizedBox(height: 2),
                    Text('${d['vehicle_model'] ?? 'Vehicle'} (${d['vehicle_type'] ?? 'All'})', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isOnline ? const Color(0x2610B981) : const Color(0x2664748B),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isOnline ? 'ONLINE' : 'OFFLINE',
                  style: TextStyle(color: isOnline ? const Color(0xFF10B981) : const Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBroadcastTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFEF4444).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFEF4444)),
          ),
          child: const Row(
            children: [
              Icon(LucideIcons.megaphone, color: Color(0xFFEF4444), size: 24),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'WhatsApp CRM Broadcast Dispatcher\nInstant targeted messages to verified customer base.',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text('Select Target Audience', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          children: [
            ChoiceChip(
              label: const Text('All Registered Users'),
              selected: _broadcastAudience == 'all',
              onSelected: (val) => setState(() => _broadcastAudience = 'all'),
              selectedColor: const Color(0xFFEF4444),
              backgroundColor: const Color(0xFF1E293B),
              labelStyle: TextStyle(color: _broadcastAudience == 'all' ? Colors.white : const Color(0xFF94A3B8)),
            ),
            ChoiceChip(
              label: const Text('Drivers & Operators'),
              selected: _broadcastAudience == 'drivers',
              onSelected: (val) => setState(() => _broadcastAudience = 'drivers'),
              selectedColor: const Color(0xFFEF4444),
              backgroundColor: const Color(0xFF1E293B),
              labelStyle: TextStyle(color: _broadcastAudience == 'drivers' ? Colors.white : const Color(0xFF94A3B8)),
            ),
            ChoiceChip(
              label: const Text('Farmers & RentO'),
              selected: _broadcastAudience == 'farmers',
              onSelected: (val) => setState(() => _broadcastAudience = 'farmers'),
              selectedColor: const Color(0xFFEF4444),
              backgroundColor: const Color(0xFF1E293B),
              labelStyle: TextStyle(color: _broadcastAudience == 'farmers' ? Colors.white : const Color(0xFF94A3B8)),
            ),
          ],
        ),
        const SizedBox(height: 20),
        const Text('Broadcast Message Text', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        TextField(
          controller: _broadcastMsgController,
          maxLines: 5,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Enter announcement or festival offer message to broadcast...',
            hintStyle: const TextStyle(color: Color(0xFF64748B)),
            filled: true,
            fillColor: const Color(0xFF111827),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF1E293B))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF1E293B))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFEF4444))),
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _sendBroadcast,
            icon: const Icon(LucideIcons.send, size: 16),
            label: const Text('Send Broadcast via WhatsApp CRM'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ],
    );
  }
}
