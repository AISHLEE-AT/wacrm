import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../auth/auth_provider.dart';

class AdminHomeScreen extends ConsumerStatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  ConsumerState<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends ConsumerState<AdminHomeScreen> {
  final SupabaseClient _supabase = Supabase.instance.client;
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
      final res = await _supabase.from('drivers').select('id, user_id, pending_commission, status, is_blocked, vehicle_type, is_verified');
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

  Future<void> _verifyDriver(String driverId) async {
    try {
      await _supabase.from('drivers').update({'is_verified': true}).eq('id', driverId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Driver verified!')),
      );
      _fetchDrivers();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error verifying driver: $e')),
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
        final isVerified = driver['is_verified'] ?? false;
        return Card(
          color: const Color(0xFF1A1A1A),
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.amber.withValues(alpha: 0.2),
              child: const Icon(Icons.local_taxi, color: Colors.amber),
            ),
            title: Text('Driver ID: ${driver['id'].toString().substring(0, 8)}...', style: const TextStyle(color: Colors.white)),
            subtitle: Text('Vehicle: ${driver['vehicle_type']} | Status: ${driver['status']}\nPending Commission: ₹$commission\nVerified: ${isVerified ? 'Yes' : 'No'}', style: const TextStyle(color: Colors.white70)),
            isThreeLine: true,
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!isVerified)
                  ElevatedButton(
                    onPressed: () => _verifyDriver(driver['id']),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
                    child: const Text('Verify'),
                  ),
                const SizedBox(width: 8),
                double.tryParse(commission) != null && double.parse(commission) > 0
                    ? ElevatedButton(
                        onPressed: () => _clearCommission(driver['id']),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.black),
                        child: const Text('Clear'),
                      )
                    : const Icon(Icons.check_circle, color: Colors.greenAccent),
              ],
            )
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('FAGO Admin Dashboard', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.greenAccent),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.greenAccent), onPressed: _fetchDrivers),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent),
            onPressed: () => ref.read(authProvider.notifier).signOut(),
          )
        ],
      ),
      body: _buildDriversTab(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.push('/driver/register');
        },
        backgroundColor: Colors.amber,
        icon: const Icon(Icons.add, color: Colors.black),
        label: const Text('Add Driver', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
