import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../services/whatsapp_service.dart';
import '../../promo/screens/whatsapp_status_promo_screen.dart';

class AreaAdminHubScreen extends StatefulWidget {
  const AreaAdminHubScreen({super.key});

  @override
  State<AreaAdminHubScreen> createState() => _AreaAdminHubScreenState();
}

class _AreaAdminHubScreenState extends State<AreaAdminHubScreen> {
  final String _managerPhone = '+91 94863 35870';
  String _selectedPincode = '641001';
  List<Map<String, dynamic>> _localUsers = [];
  bool _isLoading = true;

  final List<String> _assignedPincodes = ['641001', '606703', '638001', '625001'];

  @override
  void initState() {
    super.initState();
    _loadPincodeUsers();
  }

  Future<void> _loadPincodeUsers() async {
    setState(() => _isLoading = true);
    try {
      final response = await Supabase.instance.client
          .from('profiles')
          .select('id, full_name, whatsapp, phone, role, address')
          .limit(200);

      final List<Map<String, dynamic>> loaded = [];
      for (var item in response as List) {
        loaded.add(Map<String, dynamic>.from(item));
      }

      setState(() {
        _localUsers = loaded;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint("Error loading pincode users: $e");
      setState(() => _isLoading = false);
    }
  }

  void _sendWhatsAppGroupInvite(String userPhone) {
    WhatsAppService.openWhatsApp(
      phone: userPhone,
      message: "👋 Hello! I am your official FAGO Area Admin Manager ($_managerPhone) for Pincode $_selectedPincode.\n\n"
          "Join our official FAGO Pincode WhatsApp Community Group for daily local ride requests, Mandi prices, agri rentals, and DealO offers:\n"
          "👉 https://chat.whatsapp.com/FagoCommunity$_selectedPincode\n\n"
          "Feel free to reply if you need any assistance on field!",
    );
  }

  void _sendBroadcastMessage() async {
    final text = Uri.encodeComponent(
      "☀️ *FAGO AREA ADMIN PINCODE BROADCAST ($_selectedPincode)* ☀️\n\n"
      "Good morning local drivers, merchants, farmers & riders!\n"
      "Your Area Admin Manager ($_managerPhone) is active in $_selectedPincode today.\n\n"
      "🚀 *Active Local Services Today:*\n"
      "• 🚖 RideO / DriveO Local Trips (0% Commission)\n"
      "• 🚜 RentO Tractor & Agri Rentals\n"
      "• 🌾 Mandi Daily Crop Market Prices\n"
      "• 🏷️ DealO 5km Hyperlocal Marketplace Deals\n\n"
      "Need field support or document verification? Reply here directly!"
    );
    final url = Uri.parse("https://wa.me/?text=$text");
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        title: const Text('🏢 Area Admin Pincode Hub', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF141414),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00FF00)),
            onPressed: _loadPincodeUsers,
            tooltip: 'Refresh Local Users',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF00)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Territory Banner Card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.amber.withValues(alpha: 0.4), width: 1.5),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: const [
                                Icon(Icons.stars, color: Colors.amber, size: 24),
                                SizedBox(width: 8),
                                Text(
                                  "Pincode Territory Manager",
                                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.amber.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.amber),
                              ),
                              child: Text(
                                "ADMIN: $_managerPhone",
                                style: const TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          "Responsibility: Managing 100 to 200 local drivers, merchants, farmers & riders. Conducting daily field visits & physical document inspections.",
                          style: TextStyle(color: Colors.grey, fontSize: 12, height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            const Text("Select Active Pincode: ", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            const SizedBox(width: 8),
                            DropdownButton<String>(
                              value: _selectedPincode,
                              dropdownColor: const Color(0xFF1E293B),
                              style: const TextStyle(color: Color(0xFF00FF00), fontWeight: FontWeight.bold),
                              items: _assignedPincodes.map((pin) {
                                return DropdownMenuItem(value: pin, child: Text("📮 Pincode $pin"));
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _selectedPincode = val);
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Zero-Cost Device WhatsApp Notice
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.check_circle_outline, color: Color(0xFF00FF00), size: 18),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '⚡ 100% FREE WhatsApp Broadcasts! Uses device WhatsApp directly via deep-link (Zero Meta API charges).',
                            style: TextStyle(color: Color(0xFF00FF00), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Area Admin Earnings & Performance Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF141414),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: const [
                            Text("📊 Pincode Leaderboard & Earnings", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                            Text("Pincode Goal: 100-200 Users", style: TextStyle(color: Colors.grey, fontSize: 11)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Column(
                              children: [
                                Text("${_localUsers.length}", style: const TextStyle(color: Color(0xFF00FF00), fontSize: 20, fontWeight: FontWeight.bold)),
                                const Text("Pincode Users", style: TextStyle(color: Colors.grey, fontSize: 11)),
                              ],
                            ),
                            Container(width: 1, height: 30, color: Colors.white12),
                            Column(
                              children: const [
                                Text("₹2,100", style: TextStyle(color: Colors.amber, fontSize: 20, fontWeight: FontWeight.bold)),
                                Text("Field Admin Bonus", style: TextStyle(color: Colors.grey, fontSize: 11)),
                              ],
                            ),
                            Container(width: 1, height: 30, color: Colors.white12),
                            Column(
                              children: const [
                                Text("42 / 50", style: TextStyle(color: Colors.cyanAccent, fontSize: 20, fontWeight: FontWeight.bold)),
                                Text("Verified Drivers", style: TextStyle(color: Colors.grey, fontSize: 11)),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // WhatsApp Group Broadcast Toolbar
                  ElevatedButton.icon(
                    onPressed: _sendBroadcastMessage,
                    icon: const Icon(Icons.record_voice_over, color: Colors.black),
                    label: Text("📢 Device Broadcast to Pincode $_selectedPincode Users (₹0 Cost)", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00FF00),
                      foregroundColor: Colors.black,
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 6,
                    ),
                  ),

                  const SizedBox(height: 10),

                  // 📸 Tamil WhatsApp Status Viral Promotion Hub
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const WhatsappStatusPromoScreen()),
                      );
                    },
                    icon: const Icon(Icons.amp_stories, color: Colors.white),
                    label: const Text("📸 Share Tamil Promo on WhatsApp Status", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 6,
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Dual QR Generator (WhatsApp Group Join & App Referral Download)
                  OutlinedButton.icon(
                    onPressed: () {
                      int qrTab = 0; // 0: WhatsApp Group, 1: App Referral QR
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: const Color(0xFF141414),
                        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
                        builder: (_) => StatefulBuilder(
                          builder: (modalContext, setModalState) {
                            final String groupUrl = "https://chat.whatsapp.com/FagoCommunity$_selectedPincode";
                            final String referralUrl = "https://watscrm.vercel.app?ref=ADMIN9486335870&pincode=$_selectedPincode";
                            final String activeUrl = qrTab == 0 ? groupUrl : referralUrl;

                            return Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      ChoiceChip(
                                        label: const Text("💬 WhatsApp Group QR"),
                                        selected: qrTab == 0,
                                        selectedColor: const Color(0xFF00FF00),
                                        onSelected: (val) => setModalState(() => qrTab = 0),
                                      ),
                                      const SizedBox(width: 10),
                                      ChoiceChip(
                                        label: const Text("🎁 App Referral QR"),
                                        selected: qrTab == 1,
                                        selectedColor: Colors.amber,
                                        onSelected: (val) => setModalState(() => qrTab = 1),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    qrTab == 0
                                        ? "📲 Scan to Join Pincode $_selectedPincode WhatsApp Group"
                                        : "🎁 Scan to Download FAGO App & Register (Ref Code)",
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 14),
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                                    child: Image.network(
                                      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${Uri.encodeComponent(activeUrl)}",
                                      width: 180,
                                      height: 180,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  SelectableText(
                                    activeUrl,
                                    style: TextStyle(color: qrTab == 0 ? const Color(0xFF00FF00) : Colors.amber, fontSize: 11, fontWeight: FontWeight.bold),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    qrTab == 0
                                        ? "100% Free WhatsApp community group link for Pincode $_selectedPincode"
                                        : "Share this referral QR code to enroll new local users under your Area Admin account!",
                                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      );
                    },
                    icon: const Icon(Icons.qr_code_2, color: Colors.cyanAccent),
                    label: Text("📲 Pincode $_selectedPincode Dual QR (WhatsApp Group & App Referral)", style: const TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      side: const BorderSide(color: Colors.cyanAccent),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),

                  const SizedBox(height: 24),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "👥 Managed Users in $_selectedPincode (${_localUsers.length})",
                        style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const Text(
                        "Target: 100-200 / Pincode",
                        style: TextStyle(color: Colors.grey, fontSize: 11),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // User List Cards
                  _localUsers.isEmpty
                      ? const Center(child: Padding(padding: EdgeInsets.all(24), child: Text("No users found in this pincode directory.", style: TextStyle(color: Colors.grey))))
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _localUsers.length,
                          itemBuilder: (context, index) {
                            final u = _localUsers[index];
                            final name = u['full_name'] ?? 'Local Member';
                            final phone = u['whatsapp'] ?? u['phone'] ?? 'Verified User';
                            final role = u['role'] ?? 'User';

                            return Card(
                              margin: const EdgeInsets.only(bottom: 10),
                              color: const Color(0xFF141414),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Colors.white12)),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: role.toLowerCase() == 'driver' ? Colors.orange.withValues(alpha: 0.2) : const Color(0xFF00FF00).withValues(alpha: 0.2),
                                  child: Text(
                                    name[0].toUpperCase(),
                                    style: TextStyle(color: role.toLowerCase() == 'driver' ? Colors.orange : const Color(0xFF00FF00), fontWeight: FontWeight.bold),
                                  ),
                                ),
                                title: Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                                subtitle: Text("📱 $phone • Role: ${role.toUpperCase()}", style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                trailing: IconButton(
                                  icon: const Icon(Icons.message, color: Color(0xFF25D366)),
                                  tooltip: 'Send WhatsApp Guide / Group Invite',
                                  onPressed: () => _sendWhatsAppGroupInvite(phone.toString().replaceAll(RegExp(r'\D'), '')),
                                ),
                              ),
                            );
                          },
                        ),
                ],
              ),
            ),
    );
  }
}
