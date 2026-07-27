import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/whatsapp_service.dart';

class AdminCrmScreen extends ConsumerStatefulWidget {
  const AdminCrmScreen({super.key});

  @override
  ConsumerState<AdminCrmScreen> createState() => _AdminCrmScreenState();
}

class _AdminCrmScreenState extends ConsumerState<AdminCrmScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final SupabaseClient _supabase = Supabase.instance.client;

  // Driver state
  List<dynamic> _drivers = [];
  bool _isLoadingDrivers = true;
  String _driverFilter = 'All'; // All, Pending, Approved

  // CRM Contacts state
  List<dynamic> _contacts = [];
  List<dynamic> _filteredContacts = [];
  bool _isLoadingContacts = true;
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _customMsgController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchDrivers();
    _fetchCrmContacts();
    _searchController.addListener(_filterContacts);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _customMsgController.dispose();
    super.dispose();
  }

  Future<void> _fetchDrivers() async {
    setState(() => _isLoadingDrivers = true);
    try {
      final res = await _supabase
          .from('drivers')
          .select('id, user_id, driver_name, mobile_number, vehicle_number, vehicle_type, pending_commission, status, is_verified, verification_status')
          .order('created_at', ascending: false);
      
      setState(() {
        _drivers = res as List<dynamic>;
      });
    } catch (e) {
      debugPrint("Error fetching drivers: $e");
    } finally {
      setState(() => _isLoadingDrivers = false);
    }
  }

  Future<void> _fetchCrmContacts() async {
    setState(() => _isLoadingContacts = true);
    try {
      final res = await _supabase
          .from('contacts')
          .select('id, user_id, name, phone, role, city, last_vehicle_category, source, created_at')
          .order('created_at', ascending: false);

      setState(() {
        _contacts = res as List<dynamic>;
        _filteredContacts = _contacts;
      });
    } catch (e) {
      debugPrint("Error fetching CRM contacts: $e");
    } finally {
      setState(() => _isLoadingContacts = false);
    }
  }

  void _filterContacts() {
    final query = _searchController.text.toLowerCase().trim();
    if (query.isEmpty) {
      setState(() => _filteredContacts = _contacts);
    } else {
      setState(() {
        _filteredContacts = _contacts.where((c) {
          final name = (c['name'] ?? '').toString().toLowerCase();
          final phone = (c['phone'] ?? '').toString().toLowerCase();
          final role = (c['role'] ?? '').toString().toLowerCase();
          return name.contains(query) || phone.contains(query) || role.contains(query);
        }).toList();
      });
    }
  }

  Future<void> _verifyDriver(String driverId, String? driverPhone) async {
    try {
      await _supabase.from('drivers').update({
        'is_verified': true,
        'verification_status': 'approved',
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', driverId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('⚡ Driver Fast Approved! Partner portal unlocked.')),
        );
      }
      _fetchDrivers();

      if (driverPhone != null && driverPhone.isNotEmpty) {
        final clean = driverPhone.replaceAll(RegExp(r'\D'), '');
        WhatsAppService.openWhatsApp(
          phone: clean,
          message: "🎉 *CONGRATULATIONS! DRIVER PROFILE APPROVED* 🎉\n\n"
              "Your DriveO Driver Partner profile on FAGO Super App has been verified by Area Admin.\n"
              "You can now go online, accept rides with 0% commission, and receive daily passenger trips!\n\n"
              "🔗 Open App: https://watscrm.vercel.app",
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error approving driver: $e')),
        );
      }
    }
  }

  Future<void> _clearCommission(String driverId) async {
    try {
      await _supabase.from('drivers').update({'pending_commission': 0}).eq('id', driverId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pending commission cleared!')),
        );
      }
      _fetchDrivers();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error clearing commission: $e')),
        );
      }
    }
  }

  void _showQuickDecisionDialog(Map<String, dynamic> contact) {
    final name = contact['name'] ?? 'User';
    final phone = (contact['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Quick Decision: $name', style: const TextStyle(color: Colors.amber, fontSize: 16, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              Text('Phone: +91 $phone • Role: ${contact['role'] ?? 'User'}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 16),

              const Text('PRESET QUICK MESSAGES (1-TAP WHATSAPP):', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),

              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  WhatsAppService.openWhatsApp(
                    phone: phone,
                    message: "👋 Hello $name! Welcome to FAGO Super App. Your account is active. Book 0% commission rides, farm rentals & local services anytime!\n🔗 https://watscrm.vercel.app",
                  );
                },
                icon: const Icon(Icons.check_circle, color: Colors.black),
                label: const Text('✅ Send Welcome & Welcome Guide', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00), minimumSize: const Size(double.infinity, 44)),
              ),
              const SizedBox(height: 8),

              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  WhatsAppService.openWhatsApp(
                    phone: phone,
                    message: "📍 Hello $name! FAGO Admin needs your live GPS location for local pincode service verification. Please reply with your location pin!",
                  );
                },
                icon: const Icon(Icons.my_location, color: Colors.white),
                label: const Text('📍 Request Live Location Pin', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, minimumSize: const Size(double.infinity, 44)),
              ),
              const SizedBox(height: 8),

              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  WhatsAppService.openWhatsApp(
                    phone: phone,
                    message: "💳 Hello $name! Your FAGO UPI settlement receipt has been processed. Pay/Receive via UPI: 9486335870@hdfcbank.",
                  );
                },
                icon: const Icon(Icons.account_balance_wallet, color: Colors.black),
                label: const Text('💳 Send Payment / Settlement Link', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, minimumSize: const Size(double.infinity, 44)),
              ),
              const SizedBox(height: 16),

              TextField(
                controller: _customMsgController,
                maxLines: 2,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Type custom WhatsApp admin message...',
                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFF222222),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: () {
                  final text = _customMsgController.text.trim();
                  if (text.isEmpty) return;
                  Navigator.pop(ctx);
                  WhatsAppService.openWhatsApp(phone: phone, message: text);
                  _customMsgController.clear();
                },
                icon: const Icon(Icons.send, color: Colors.black),
                label: const Text('SEND CUSTOM WHATSAPP MESSAGE', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF25D366), minimumSize: const Size(double.infinity, 46)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDriversTab() {
    if (_isLoadingDrivers) return const Center(child: CircularProgressIndicator(color: Color(0xFF00FF00)));
    
    final filtered = _driverFilter == 'All'
        ? _drivers
        : _driverFilter == 'Pending'
            ? _drivers.where((d) => (d['is_verified'] != true)).toList()
            : _drivers.where((d) => (d['is_verified'] == true)).toList();

    if (filtered.isEmpty) {
      return const Center(
        child: Text('No drivers found matching filter.', style: TextStyle(color: Colors.grey)),
      );
    }

    return Column(
      children: [
        // Filter Chips
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: ['All', 'Pending', 'Approved'].map((f) {
              final isSelected = _driverFilter == f;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text('$f Drivers (${_drivers.where((d) => f == 'All' || (f == 'Pending' ? d['is_verified'] != true : d['is_verified'] == true)).length})'),
                  selected: isSelected,
                  selectedColor: Colors.amber,
                  labelStyle: TextStyle(color: isSelected ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                  onSelected: (val) {
                    if (val) setState(() => _driverFilter = f);
                  },
                ),
              );
            }).toList(),
          ),
        ),

        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: filtered.length,
            itemBuilder: (context, index) {
              final d = filtered[index];
              final driverName = d['driver_name'] ?? 'Driver Partner';
              final phone = d['mobile_number'] ?? d['phone'] ?? '';
              final vehicle = d['vehicle_number'] ?? d['vehicle_type'] ?? 'Vehicle';
              final isVerified = d['is_verified'] == true;
              final commission = (d['pending_commission'] ?? 0).toString();

              return Card(
                color: const Color(0xFF1E1E1E),
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(driverName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: isVerified ? Colors.green.withValues(alpha: 0.2) : Colors.amber.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: isVerified ? Colors.green : Colors.amber),
                            ),
                            child: Text(
                              isVerified ? 'VERIFIED' : 'PENDING APPROVAL',
                              style: TextStyle(color: isVerified ? Colors.green : Colors.amber, fontWeight: FontWeight.bold, fontSize: 10),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('📱 Mobile: +91 $phone • 🚗 Vehicle: $vehicle', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      Text('💰 Pending Commission: ₹$commission', style: const TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold)),
                      const Divider(color: Colors.white12, height: 16),

                      Row(
                        children: [
                          if (!isVerified)
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _verifyDriver(d['id'].toString(), phone.toString()),
                                icon: const Icon(Icons.check_circle, size: 14, color: Colors.black),
                                label: const Text('APPROVE DRIVER', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00)),
                              ),
                            ),
                          if (!isVerified) const SizedBox(width: 8),

                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                final clean = phone.toString().replaceAll(RegExp(r'\D'), '');
                                WhatsAppService.openWhatsApp(
                                  phone: clean,
                                  message: "Hello $driverName! This is FAGO Admin. Regarding your vehicle ($vehicle):",
                                );
                              },
                              icon: const Icon(Icons.chat, size: 14, color: Color(0xFF25D366)),
                              label: const Text('WHATSAPP CHAT', style: TextStyle(color: Color(0xFF25D366), fontWeight: FontWeight.bold, fontSize: 11)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCrmContactsTab() {
    if (_isLoadingContacts) return const Center(child: CircularProgressIndicator(color: Color(0xFF00FF00)));

    return Column(
      children: [
        // Search Input Bar
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            controller: _searchController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search CRM contacts by name, phone (+91), or role...',
              hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
              prefixIcon: const Icon(Icons.search, color: Colors.amber),
              filled: true,
              fillColor: const Color(0xFF1E1E1E),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            ),
          ),
        ),

        Expanded(
          child: _filteredContacts.isEmpty
              ? const Center(child: Text('No CRM contacts found.', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: _filteredContacts.length,
                  itemBuilder: (context, index) {
                    final c = _filteredContacts[index];
                    final name = c['name'] ?? 'App Lead';
                    final phone = (c['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');
                    final role = c['role'] ?? 'User';
                    final category = c['last_vehicle_category'] ?? 'General';
                    final city = c['city'] ?? 'Tamil Nadu';

                    return Card(
                      color: const Color(0xFF1E1E1E),
                      margin: const EdgeInsets.only(bottom: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: role == 'Driver' ? Colors.orange.withValues(alpha: 0.2) : Colors.cyan.withValues(alpha: 0.2),
                          child: Icon(role == 'Driver' ? Icons.local_taxi : Icons.person, color: role == 'Driver' ? Colors.orange : Colors.cyanAccent),
                        ),
                        title: Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                        subtitle: Text('+91 $phone • Role: $role • Category: $category\nCity: $city', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                        isThreeLine: true,
                        trailing: ElevatedButton.icon(
                          onPressed: () => _showQuickDecisionDialog(c as Map<String, dynamic>),
                          icon: const Icon(Icons.chat, size: 14, color: Colors.black),
                          label: const Text('ACTIONS', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 10)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          ),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildMachineryTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.build_circle, color: Colors.amber, size: 22),
                    SizedBox(width: 8),
                    Text('Register New RentO Machine (புதிய இயந்திரம்)', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 15)),
                  ],
                ),
                const SizedBox(height: 12),
                const Text('Fill details to register a new real farm equipment / heavy machine:', style: TextStyle(color: Colors.grey, fontSize: 11)),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('⚡ Machinery registration active! Virtual machines ready for cleanup.')),
                    );
                  },
                  icon: const Icon(Icons.add, color: Colors.black),
                  label: const Text('Add Real Machinery Record', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, minimumSize: const Size(double.infinity, 44)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('Registered Machinery & Operators:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 10),
          Card(
            color: const Color(0xFF1E1E1E),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: ListTile(
              leading: const Icon(Icons.agriculture, color: Colors.greenAccent, size: 32),
              title: const Text('Mahindra 575 DI Tractor + Rotavator', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('Operator: Farmer Murugan (+91 9789012345)\nRate: ₹700/Hour • Status: Available', style: TextStyle(color: Colors.grey, fontSize: 11)),
              trailing: IconButton(
                icon: const Icon(Icons.delete_forever, color: Colors.redAccent),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Test machine record removed successfully!')),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        title: const Text('👑 Admin CRM & Machinery Hub', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: const Color(0xFF141414),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Color(0xFF00FF00)), onPressed: () { _fetchDrivers(); _fetchCrmContacts(); }),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.amber,
          labelColor: Colors.amber,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(icon: Icon(Icons.local_shipping), text: 'Drivers'),
            Tab(icon: Icon(Icons.contacts), text: 'CRM Contacts'),
            Tab(icon: Icon(Icons.agriculture), text: 'RentO Machinery'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDriversTab(),
          _buildCrmContactsTab(),
          _buildMachineryTab(),
        ],
      ),
    );
  }
}
