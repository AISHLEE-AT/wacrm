import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// FAGO Support WhatsApp Helper — floating button used across all screens.
/// Phone is the FAGO 24x7 support line (configurable via constructor).
class WhatsAppHelper extends StatelessWidget {
  /// Support phone number — defaults to FAGO support line.
  /// Pass a custom number to route to a specific support contact.
  final String phoneNumber;
  final String initialMessage;

  const WhatsAppHelper({
    super.key,
    this.phoneNumber = '916381029380', // FAGO 24x7 Support — NOT admin personal number
    this.initialMessage = 'Hello, I need some help with the Fago app.',
  });

  Future<void> _launchWhatsApp() async {
    if (phoneNumber.isEmpty) {
      debugPrint('WhatsAppHelper: No support phone configured');
      return;
    }
    final url = Uri.parse('https://wa.me/$phoneNumber?text=${Uri.encodeComponent(initialMessage)}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      debugPrint('Could not launch WhatsApp');
    }
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      heroTag: 'whatsapp_helper',
      backgroundColor: const Color(0xFF25D366), // WhatsApp Green
      onPressed: _launchWhatsApp,
      tooltip: 'Get Help on WhatsApp',
      child: const Icon(Icons.support_agent, color: Colors.white),
    );
  }
}
