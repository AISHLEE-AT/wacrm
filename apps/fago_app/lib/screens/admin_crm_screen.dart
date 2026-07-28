import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/whatsapp_service.dart';
import 'web_module_screen.dart';

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
    final List<Map<String, dynamic>> combined = [];

    // Helper to add unique contact by phone
    void addUniqueContact(Map<String, dynamic> c) {
      final phone = (c['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');
      final phone10 = phone.length >= 10 ? phone.substring(phone.length - 10) : phone;      if (phone10.isNotEmpty && !combined.any((existing) => (existing['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '').endsWith(phone10))) {
        combined.add({
          'id': c['id'] ?? 'contact_${combined.length}',
          'user_id': c['user_id'] ?? c['id'],
          'name': c['name'] ?? 'App User',
          'phone': phone10,
          'role': c['role'] ?? 'User',
          'city': c['city'] ?? c['address'] ?? 'Tamil Nadu',
          'last_vehicle_category': c['last_vehicle_category'] ?? c['main_category'] ?? 'General',
          'source': c['source'] ?? 'Database',
          'created_at': c['created_at'] ?? DateTime.now().toIso8601String(),
        });
      }
    }

    // 1. Fetch from profiles
    try {
      final List<dynamic> profileRes = await _supabase
          .from('profiles')
          .select('id, full_name, phone, whatsapp, role, main_category, address, created_at')
          .order('created_at', ascending: false);

      for (var p in profileRes) {
        final phone = (p['whatsapp'] ?? p['phone'] ?? '').toString().replaceAll(RegExp(r'\D'), '');
        final phone10 = phone.length >= 10 ? phone.substring(phone.length - 10) : phone;
        final pName = (p['full_name'] != null && p['full_name'].toString().isNotEmpty && p['full_name'] != 'User' && p['full_name'] != 'FAGO User')
            ? p['full_name'].toString()
            : 'Registered User ${phone10.substring(phone10.length > 4 ? phone10.length - 4 : 0)}';

        addUniqueContact({
          'id': p['id'],
          'user_id': p['id'],
          'name': pName,
          'phone': phone10,
          'role': p['role'] ?? 'User',
          'city': p['address'] ?? 'Tamil Nadu',
          'last_vehicle_category': p['main_category'] ?? 'General',
          'source': 'User Profile',
          'created_at': p['created_at'],
        });
      }
    } catch (e) {
      debugPrint("Error fetching profiles for CRM: $e");
    }

    // 2. Fetch from drivers
    try {
      final List<dynamic> driverRes = await _supabase
          .from('drivers')
          .select('id, name, driver_name, mobile_number, whatsapp_number, vehicle_type, created_at')
          .order('created_at', ascending: false);

      for (var d in driverRes) {
        final name = d['name'] ?? d['driver_name'] ?? 'DriveO Driver';
        final phone = (d['whatsapp_number'] ?? d['mobile_number'] ?? '').toString();
        addUniqueContact({
          'id': d['id'],
          'user_id': d['id'],
          'name': name,
          'phone': phone,
          'role': 'Driver',
          'city': 'Tamil Nadu (DriveO)',
          'last_vehicle_category': d['vehicle_type'] ?? 'Cab/Auto',
          'source': 'DriveO Partner',
          'created_at': d['created_at'],
        });
      }
    } catch (e) {
      debugPrint("Error fetching drivers for CRM: $e");
    }

    // 3. Fetch from contacts table if present
    try {
      final List<dynamic> contactRes = await _supabase
          .from('contacts')
          .select('id, user_id, name, phone, role, city, last_vehicle_category, source, created_at')
          .order('created_at', ascending: false);

      for (var c in contactRes) {
        addUniqueContact(Map<String, dynamic>.from(c));
      }
    } catch (e) {
      debugPrint("Error fetching contacts table: $e");
    }

    // 4. Default System Leads if database is empty
    if (combined.isEmpty) {
      final defaultContacts = [
        {
          'id': 'def_1',
          'name': 'FAGO Area Admin Manager',
          'phone': '9486335870',
          'role': 'Admin',
          'city': 'Vellore / Tirupattur, TN',
          'last_vehicle_category': 'Area Command Center',
          'source': 'FAGO System Lead',
        },
        {
          'id': 'def_2',
          'name': 'DriveO Partner Driver Support',
          'phone': '9486335870',
          'role': 'Driver Support',
          'city': 'Coimbatore / Erode, TN',
          'last_vehicle_category': 'Taxi & Auto',
          'source': 'DriveO Lead',
        },
        {
          'id': 'def_3',
          'name': 'RentO Agri Machinery Desk',
          'phone': '9486335870',
          'role': 'Merchant',
          'city': 'Salem / Namakkal, TN',
          'last_vehicle_category': 'Tractor & Harvester',
          'source': 'RentO Lead',
        },
        {
          'id': 'def_4',
          'name': 'DealO Hyperlocal Merchant Desk',
          'phone': '9486335870',
          'role': 'Seller',
          'city': 'Madurai / Trichy, TN',
          'last_vehicle_category': 'Marketplace',
          'source': 'DealO Lead',
        },
      ];

      for (var dc in defaultContacts) {
        addUniqueContact(dc);
      }
    }

    setState(() {
      _contacts = combined;
      _filteredContacts = _contacts;
      _isLoadingContacts = false;
    });
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

  void _showAddDriverDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final vehicleCtrl = TextEditingController();
    final upiCtrl = TextEditingController();
    String vehicleType = 'Sedan / Cab';
    bool isSaving = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.person_add, color: Color(0xFF00FF00)),
              SizedBox(width: 8),
              Text('Add DriveO Driver (Admin)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Driver Full Name *',
                    labelStyle: TextStyle(color: Colors.grey),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00FF00))),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Mobile / WhatsApp Number *',
                    labelStyle: TextStyle(color: Colors.grey),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00FF00))),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: vehicleCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Vehicle Number & Model (e.g. TN 37 AB 1234)',
                    labelStyle: TextStyle(color: Colors.grey),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00FF00))),
                  ),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: vehicleType,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Vehicle Type',
                    labelStyle: TextStyle(color: Colors.grey),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'Sedan / Cab', child: Text('Sedan / Cab')),
                    DropdownMenuItem(value: 'Auto Rickshaw', child: Text('Auto Rickshaw')),
                    DropdownMenuItem(value: 'Bike Taxi', child: Text('Bike Taxi')),
                    DropdownMenuItem(value: 'SUV / Premium', child: Text('SUV / Premium')),
                    DropdownMenuItem(value: 'Agri Vehicle / Goods', child: Text('Agri Vehicle / Goods')),
                  ],
                  onChanged: (val) {
                    if (val != null) setDialogState(() => vehicleType = val);
                  },
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: upiCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Driver UPI ID (Optional)',
                    labelStyle: TextStyle(color: Colors.grey),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00FF00))),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00), foregroundColor: Colors.black),
              onPressed: isSaving
                  ? null
                  : () async {
                      final name = nameCtrl.text.trim();
                      final phone = phoneCtrl.text.trim().replaceAll(RegExp(r'\D'), '');
                      if (name.isEmpty || phone.length < 10) {
                        ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Enter valid name & 10-digit mobile')));
                        return;
                      }

                      setDialogState(() => isSaving = true);
                      try {
                        final phone10 = phone.substring(phone.length - 10);
                        await _supabase.from('drivers').insert({
                          'driver_name': name,
                          'name': name,
                          'mobile_number': phone10,
                          'whatsapp_number': phone10,
                          'vehicle_number': vehicleCtrl.text.trim().isNotEmpty ? vehicleCtrl.text.trim() : 'TN Partner',
                          'vehicle_type': vehicleType,
                          'upi_id': upiCtrl.text.trim(),
                          'is_verified': true,
                          'verification_status': 'approved',
                          'status': 'offline',
                          'pending_commission': 0,
                          'wallet_balance': 0,
                          'created_at': DateTime.now().toIso8601String(),
                        });

                        if (ctx.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('✅ Driver $name added & verified!'), backgroundColor: Colors.green.shade800),
                          );
                        }
                        _fetchDrivers();
                      } catch (e) {
                        setDialogState(() => isSaving = false);
                        if (ctx.mounted) {
                          ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Failed to add driver: $e')));
                        }
                      }
                    },
              child: isSaving
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Text('Add & Verify Driver', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _removeDriver(String driverId, String driverName) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.redAccent),
            SizedBox(width: 8),
            Text('Remove Driver', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text('Are you sure you want to remove driver "$driverName" from DriveO partners?', style: const TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remove Driver', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _supabase.from('drivers').delete().eq('id', driverId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('🗑️ Driver "$driverName" removed.'), backgroundColor: Colors.red.shade900),
          );
        }
        _fetchDrivers();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error removing driver: $e')));
        }
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
        // Admin Add Driver Button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              onPressed: _showAddDriverDialog,
              icon: const Icon(Icons.person_add, color: Colors.black),
              label: const Text('➕ ADD NEW DRIVER PARTNER (ADMIN)', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00FF00),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ),

        // Filter Chips (Scrollable to prevent overflow)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
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
        ),

        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            itemCount: filtered.length,
            itemBuilder: (context, index) {
              final d = filtered[index];
              final driverName = d['driver_name'] ?? d['name'] ?? 'Driver Partner';
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
                          Expanded(
                            child: Text(
                              driverName,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                            ),
                          ),
                          const SizedBox(width: 8),
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
                                label: const Text('APPROVE', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF00)),
                              ),
                            ),
                          if (!isVerified) const SizedBox(width: 6),

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
                              label: const Text('WHATSAPP', style: TextStyle(color: Color(0xFF25D366), fontWeight: FontWeight.bold, fontSize: 11)),
                            ),
                          ),
                          const SizedBox(width: 6),

                          // Admin Remove Driver Button
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                            tooltip: 'Remove Driver',
                            onPressed: () => _removeDriver(d['id'].toString(), driverName),
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

  Widget _buildModuleManagementHubTab() {
    final modules = [
      {'title': '🚕 RideO Rider', 'desc': 'Book 0% commission local cabs & autos', 'color': Colors.cyanAccent, 'icon': Icons.local_taxi, 'route': '/rideo'},
      {'title': '🚗 DriveO Driver', 'desc': 'Driver approvals, earnings & 0% commission logs', 'color': Colors.orangeAccent, 'icon': Icons.directions_car, 'tabIndex': 0},
      {'title': '📲 WhatsApp CRM', 'desc': 'WhatsApp broadcast messages & lead status', 'color': Colors.greenAccent, 'icon': Icons.chat, 'tabIndex': 1},
      {'title': '🚜 RentO Machinery', 'desc': 'Tractor, harvester & agri equipment listings', 'color': Colors.amber, 'icon': Icons.agriculture, 'route': '/rento'},
      {'title': '🛍️ Mandi Prices', 'desc': 'Live vegetable, grain & mandi market rates', 'color': const Color(0xFF00FF88), 'icon': Icons.storefront, 'route': '/mandi'},
      {'title': '🎓 TeachO LMS', 'desc': 'LMS exams, study material & tutor verifications', 'color': Colors.cyanAccent, 'icon': Icons.school, 'route': '/teacho'},
      {'title': '📝 TestO Exams', 'desc': 'Mock tests & competitive exam preparation', 'color': Colors.lightBlueAccent, 'icon': Icons.assignment, 'route': '/testo'},
      {'title': '🛕 TourO Pilgrimage', 'desc': 'Devotional tour packages, cab packages & guides', 'color': Colors.deepPurpleAccent, 'icon': Icons.temple_hindu, 'route': '/touro'},
      {'title': '🤖 Gemini AI Assistant', 'desc': 'AI multi-lingual assistant for farmers & users', 'color': Colors.pinkAccent, 'icon': Icons.psychology, 'route': '/gemini'},
      {'title': '💰 MoneyO Financiers', 'desc': 'Local financier verification & micro-loans', 'color': Colors.limeAccent, 'icon': Icons.account_balance, 'webPath': '/moneyo'},
      {'title': '📋 TaskO Services', 'desc': 'Local handyman, electrician & plumber tasks', 'color': Colors.tealAccent, 'icon': Icons.task, 'webPath': '/tasko'},
      {'title': '🔧 ToolsO Utilities', 'desc': 'Agri calculators, crop diagnostic tools', 'color': Colors.amberAccent, 'icon': Icons.handyman, 'webPath': '/toolso'},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1E293B), Color(0xFF0F172A)]),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
            ),
            child: Row(
              children: const [
                Icon(Icons.stars, color: Colors.amber, size: 28),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('👑 FAGO Unified Admin Control Center', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16)),
                      SizedBox(height: 2),
                      Text('Manage all FAGO native modules & WhatsApp CRM across Flutter & Android Native apps', style: TextStyle(color: Colors.white70, fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('All Active Native FAGO Modules (Tap to Test):', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.25,
            ),
            itemCount: modules.length,
            itemBuilder: (ctx, idx) {
              final m = modules[idx];
              final Color col = m['color'] as Color;
              return InkWell(
                onTap: () {
                  if (m['tabIndex'] != null) {
                    _tabController.animateTo(m['tabIndex'] as int);
                  } else if (m['route'] != null) {
                    context.push(m['route'].toString());
                  } else if (m['webPath'] != null) {
                    WebModuleScreen.launchInBrowser(path: m['webPath'].toString());
                  }
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: col.withValues(alpha: 0.4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(m['icon'] as IconData, color: col, size: 22),
                          const SizedBox(width: 6),
                          Expanded(child: Text(m['title'].toString(), style: TextStyle(color: col, fontWeight: FontWeight.bold, fontSize: 12))),
                        ],
                      ),
                      Text(m['desc'].toString(), style: const TextStyle(color: Colors.grey, fontSize: 10), maxLines: 2, overflow: TextOverflow.ellipsis),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: col.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('Launch Native', style: TextStyle(color: col, fontSize: 9, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 2),
                            Icon(Icons.arrow_forward_ios, color: col, size: 9),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
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
        title: const Text('👑 Admin CRM & Super App Hub', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 16)),
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
            Tab(icon: Icon(Icons.chat), text: 'WhatsApp CRM'),
            Tab(icon: Icon(Icons.dashboard_customize), text: 'All Modules'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDriversTab(),
          _buildCrmContactsTab(),
          _buildModuleManagementHubTab(),
        ],
      ),
    );
  }
}
