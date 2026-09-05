import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../core/env.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class ModuleSelectorScreen extends StatefulWidget {
  const ModuleSelectorScreen({super.key});

  @override
  State<ModuleSelectorScreen> createState() => _ModuleSelectorScreenState();
}

class _ModuleSelectorScreenState extends State<ModuleSelectorScreen> {
  String? _selectedModule;
  bool _isLoading = false;

  final List<Map<String, dynamic>> _modules = [
    {'name': 'RideO', 'path': '/ride', 'icon': LucideIcons.car},
    {'name': 'DriveO', 'path': '/driveo', 'icon': LucideIcons.navigation},
    {'name': 'DealO', 'path': '/dealo', 'icon': LucideIcons.handshake},
    {'name': 'TeachO', 'path': '/teacho', 'icon': LucideIcons.graduationCap},
    {'name': 'RentO', 'path': '/rento', 'icon': LucideIcons.home},
    {'name': 'AgrO', 'path': '/agro', 'icon': LucideIcons.tractor},
    {'name': 'TourO', 'path': '/touro', 'icon': LucideIcons.map},
    {'name': 'TestO', 'path': '/testo', 'icon': LucideIcons.clipboardCheck},
    {'name': 'TvO', 'path': '/tvo', 'icon': LucideIcons.tv},
    {'name': 'MoneyO', 'path': '/moneyo', 'icon': LucideIcons.wallet},
    {'name': 'GameO', 'path': '/gameo', 'icon': LucideIcons.gamepad2},
    {'name': 'Gaming Hub', 'path': '/gaming_hub', 'icon': LucideIcons.monitorPlay},
  ];

  Future<void> _completeOnboarding() async {
    if (_selectedModule == null) return;
    
    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('selected_module', _selectedModule!);
      await prefs.setBool('onboarding_complete', true);

      final phone = prefs.getString('user_phone');
      if (phone != null && phone.isNotEmpty) {
        await http.post(
          Uri.parse('${AppEnv.apiUrl}/api/profile/update'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'phone': phone,
            'default_module': _selectedModule,
            'selected_module': _selectedModule,
            'onboarding_complete': true,
          }),
        ).timeout(const Duration(seconds: 4)).catchError((_) => http.Response('', 500));
      }

      if (mounted) {
        context.go(_selectedModule!);
      }
    } catch (e) {
      if (mounted) {
        context.go(_selectedModule ?? '/home');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Choose Your Module',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Select the main service you want to use. You can always switch later from the home screen.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                ),
                itemCount: _modules.length,
                itemBuilder: (context, index) {
                  final module = _modules[index];
                  final isSelected = _selectedModule == module['path'];
                  
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedModule = module['path'] as String;
                      });
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1E293B),
                          width: 2,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            module['icon'] as IconData,
                            size: 40,
                            color: isSelected ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            module['name'] as String,
                            style: TextStyle(
                              color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _selectedModule == null || _isLoading ? null : _completeOnboarding,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    disabledBackgroundColor: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          'Get Started',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: _selectedModule == null ? const Color(0xFF94A3B8) : Colors.white,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
