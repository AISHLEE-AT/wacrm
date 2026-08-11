import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:permission_handler/permission_handler.dart';

class PermissionsScreen extends StatefulWidget {
  const PermissionsScreen({super.key});

  @override
  State<PermissionsScreen> createState() => _PermissionsScreenState();
}

class _PermissionsScreenState extends State<PermissionsScreen> {
  bool _cameraGranted = false;
  bool _locationGranted = false;
  bool _microphoneGranted = false;
  bool _notificationGranted = false;

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    final camera = await Permission.camera.status;
    final location = await Permission.location.status;
    final microphone = await Permission.microphone.status;
    final notification = await Permission.notification.status;

    setState(() {
      _cameraGranted = camera.isGranted;
      _locationGranted = location.isGranted;
      _microphoneGranted = microphone.isGranted;
      _notificationGranted = notification.isGranted;
    });
  }

  bool get _allGranted =>
      _cameraGranted && _locationGranted && _microphoneGranted && _notificationGranted;

  Future<void> _requestPermission(Permission permission, Function(bool) onResult) async {
    final status = await permission.request();
    setState(() {
      onResult(status.isGranted);
    });
    
    if (status.isPermanentlyDenied) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Permission permanently denied. Please enable in settings.'),
            action: SnackBarAction(
              label: 'Settings',
              onPressed: () => openAppSettings(),
            ),
          ),
        );
      }
    }
  }

  Widget _buildPermissionCard({
    required IconData icon,
    required String title,
    required String description,
    required bool isGranted,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isGranted ? const Color(0xFF10B981) : const Color(0xFF1E293B),
          width: 2,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isGranted ? const Color(0xFF10B981).withOpacity(0.1) : const Color(0xFF1E293B),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: isGranted ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
          ),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Text(
            description,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 14,
            ),
          ),
        ),
        trailing: isGranted
            ? const Icon(LucideIcons.checkCircle2, color: Color(0xFF10B981))
            : TextButton(
                onPressed: onTap,
                style: TextButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981).withOpacity(0.1),
                  foregroundColor: const Color(0xFF10B981),
                ),
                child: const Text('Allow'),
              ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'App Permissions',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'SuprO needs these permissions to provide you with the best experience across all modules.',
                      style: TextStyle(
                        fontSize: 16,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    _buildPermissionCard(
                      icon: LucideIcons.camera,
                      title: 'Camera',
                      description: 'Required for scanning QR codes and updating profile pictures.',
                      isGranted: _cameraGranted,
                      onTap: () => _requestPermission(Permission.camera, (granted) => _cameraGranted = granted),
                    ),
                    
                    _buildPermissionCard(
                      icon: LucideIcons.mapPin,
                      title: 'Location',
                      description: 'Required for DriveO, RideO, and location-based services.',
                      isGranted: _locationGranted,
                      onTap: () => _requestPermission(Permission.location, (granted) => _locationGranted = granted),
                    ),
                    
                    _buildPermissionCard(
                      icon: LucideIcons.mic,
                      title: 'Microphone',
                      description: 'Required for voice notes and communications within the app.',
                      isGranted: _microphoneGranted,
                      onTap: () => _requestPermission(Permission.microphone, (granted) => _microphoneGranted = granted),
                    ),
                    
                    _buildPermissionCard(
                      icon: LucideIcons.bell,
                      title: 'Notifications',
                      description: 'Stay updated with important alerts and messages.',
                      isGranted: _notificationGranted,
                      onTap: () => _requestPermission(Permission.notification, (granted) => _notificationGranted = granted),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _allGranted ? () => context.go('/onboarding/profile') : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    disabledBackgroundColor: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _allGranted ? Colors.white : const Color(0xFF94A3B8),
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
