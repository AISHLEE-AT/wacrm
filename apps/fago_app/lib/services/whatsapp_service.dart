import 'package:url_launcher/url_launcher.dart';

class WhatsAppService {
  /// Opens WhatsApp natively on mobile with pre-filled message
  static Future<bool> openWhatsApp({
    required String phone,
    required String message,
  }) async {
    // Clean phone number (strip spaces, +, hyphens)
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    final encodedMessage = Uri.encodeComponent(message);

    // Primary: Mobile App Deep-Link Intent
    final nativeAppUri = Uri.parse('whatsapp://send?phone=$cleanPhone&text=$encodedMessage');
    
    // Fallback: wa.me HTTPS Link
    final webUri = Uri.parse('https://wa.me/$cleanPhone?text=$encodedMessage');

    try {
      if (await canLaunchUrl(nativeAppUri)) {
        return await launchUrl(nativeAppUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(webUri)) {
        return await launchUrl(webUri, mode: LaunchMode.externalApplication);
      } else {
        return false;
      }
    } catch (e) {
      print('Error launching WhatsApp: $e');
      return false;
    }
  }

  /// Launch Native Google Maps App for Turn-by-Turn Navigation ($0 API Cost)
  static Future<bool> openGoogleMapsApp({
    required double destinationLat,
    required double destinationLng,
    double? originLat,
    double? originLng,
  }) async {
    // Turn-by-turn navigation intent
    final googleNavUri = Uri.parse('google.navigation:q=$destinationLat,$destinationLng&mode=d');
    
    // Web / App fallback URL
    final mapsWebUri = originLat != null && originLng != null
        ? Uri.parse('https://www.google.com/maps/dir/?api=1&origin=$originLat,$originLng&destination=$destinationLat,$destinationLng&travelmode=driving')
        : Uri.parse('https://www.google.com/maps/search/?api=1&query=$destinationLat,$destinationLng');

    try {
      if (await canLaunchUrl(googleNavUri)) {
        return await launchUrl(googleNavUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(mapsWebUri)) {
        return await launchUrl(mapsWebUri, mode: LaunchMode.externalApplication);
      } else {
        return false;
      }
    } catch (e) {
      print('Error launching Google Maps: $e');
      return false;
    }
  }
}
