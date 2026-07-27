import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  /// Single-Tap Permission Request Modal for Location, Camera, Audio (Microphone), and Notifications.
  static Future<bool> requestAllPermissions(BuildContext context) async {
    bool granted = false;
    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: const [
            Icon(Icons.shield_outlined, color: Color(0xFF00FF00), size: 28),
            SizedBox(width: 10),
            Text(
              'App Permissions Required',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'To ensure full functionality of FAGO Super App (RideO Maps, Gemini AI Voice Assistant, & DealO Photo Uploads), please allow initial permissions.',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            SizedBox(height: 16),
            _PermissionInfoRow(icon: Icons.location_on, color: Colors.greenAccent, title: 'Live GPS Location', subtitle: 'Auto-load pickup & nearby driver radar'),
            SizedBox(height: 10),
            _PermissionInfoRow(icon: Icons.camera_alt, color: Colors.cyanAccent, title: 'Camera & Storage', subtitle: 'Inspection photos for DealO & RentO'),
            SizedBox(height: 10),
            _PermissionInfoRow(icon: Icons.mic, color: Colors.amberAccent, title: 'Microphone / Audio', subtitle: 'Tamil Voice commands & AI Assistant'),
            SizedBox(height: 10),
            _PermissionInfoRow(icon: Icons.notifications, color: Colors.purpleAccent, title: 'Notifications', subtitle: 'Real-time ride updates & WhatsApp alerts'),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00FF00),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                final statuses = await [
                  Permission.location,
                  Permission.camera,
                  Permission.microphone,
                  Permission.notification,
                ].request();
                granted = statuses.values.any((status) => status.isGranted);
              },
              child: const Text('OK • GRANT ALL PERMISSIONS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ),
          ),
        ],
      ),
    );
    return granted;
  }
}

class _PermissionInfoRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;

  const _PermissionInfoRow({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
              Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11)),
            ],
          ),
        ),
      ],
    );
  }
}
