import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class WhatsAppHelper extends StatelessWidget {
  final String phoneNumber = '916381029380';
  final String initialMessage;

  const WhatsAppHelper({Key? key, this.initialMessage = 'Hello, I need some help with the Fago app.'}) : super(key: key);

  Future<void> _launchWhatsApp() async {
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
      child: const Icon(Icons.support_agent, color: Colors.white),
      tooltip: 'Get Help on WhatsApp',
    );
  }
}
