import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../auth/auth_provider.dart';

class AdminHomeScreen extends ConsumerStatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  ConsumerState<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends ConsumerState<AdminHomeScreen> {
  final SupabaseClient _supabase = Supabase.instance.client;
  int _currentIndex = 0;
  List<dynamic> _drivers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDrivers();
  }

  Future<void> _fetchDrivers() async {
    setState(() => _isLoading = true);
    try {
      final res = await _supabase.from('drivers').select('id, user_id, pending_commission, status, is_blocked, vehicle_type');
      setState(() {
        _drivers = res as List<dynamic>;
      });
    } catch (e) {
      debugPrint("Error fetching drivers: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _clearCommission(String driverId) async {
    try {
      await _supabase.from('drivers').update({'pending_commission': 0}).eq('id', driverId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Commission cleared!')),
      );
      _fetchDrivers();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error clearing commission: $e')),
      );
    }
  }

  Widget _buildDriversTab() {
    if (_isLoading) return const Center(child: CircularProgressIndicator(color: Colors.greenAccent));
    if (_drivers.isEmpty) return const Center(child: Text('No drivers found.', style: TextStyle(color: Colors.white70)));
    
    return ListView.builder(
      itemCount: _drivers.length,
      itemBuilder: (context, index) {
        final driver = _drivers[index];
        final commission = (driver['pending_commission'] ?? 0).toString();
        return Card(
          color: const Color(0xFF1A1A1A),
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.amber.withValues(alpha: 0.2),
              child: const Icon(Icons.local_taxi, color: Colors.amber),
            ),
            title: Text('Driver ID: ${driver['id'].toString().substring(0, 8)}...', style: const TextStyle(color: Colors.white)),
            subtitle: Text('Vehicle: ${driver['vehicle_type']} | Status: ${driver['status']}\nPending Commission: ₹$commission', style: const TextStyle(color: Colors.white70)),
            isThreeLine: true,
            trailing: double.tryParse(commission) != null && double.parse(commission) > 0
                ? ElevatedButton(
                    onPressed: () => _clearCommission(driver['id']),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.black),
                    child: const Text('Clear'),
                  )
                : const Icon(Icons.check_circle, color: Colors.greenAccent),
          ),
        );
      },
    );
  }

  Widget _buildCrmPlaceholder(String title, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 100, color: Colors.greenAccent.withValues(alpha: 0.5)),
          const SizedBox(height: 20),
          Text(
            title,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.amber),
          ),
          const SizedBox(height: 10),
          const Text(
            'Coming Soon',
            style: TextStyle(fontSize: 16, color: Colors.white54),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      _buildDriversTab(),
      _buildCrmPlaceholder('WhatsApp CRM Chats', Icons.chat),
      _buildCrmPlaceholder('Broadcasts', Icons.campaign),
      _buildCrmPlaceholder('Contacts', Icons.contacts),
    ];

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('FAGO Admin Dashboard', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.greenAccent),
        actions: [
          if (_currentIndex == 0)
            IconButton(icon: const Icon(Icons.refresh, color: Colors.greenAccent), onPressed: _fetchDrivers),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent),
            onPressed: () => ref.read(authProvider.notifier).signOut(),
          )
        ],
      ),
      body: tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.black,
        selectedItemColor: Colors.amber,
        unselectedItemColor: Colors.white54,
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.local_taxi), label: 'Drivers'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chats'),
          BottomNavigationBarItem(icon: Icon(Icons.campaign), label: 'Broadcasts'),
          BottomNavigationBarItem(icon: Icon(Icons.contacts), label: 'Contacts'),
        ],
      ),
    );
  }
}
