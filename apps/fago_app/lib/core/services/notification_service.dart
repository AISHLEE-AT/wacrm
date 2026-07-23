import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("FAGO Background Notification Received: ${message.messageId}");
}

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  static Future<void> initialize() async {
    try {
      // 1. Request notification permissions
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint("User granted push notification permission");

        // Set background handler
        FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

        // 2. Fetch FCM Token and save to Supabase Profile
        String? token = await _messaging.getToken();
        if (token != null) {
          debugPrint("FCM Device Token: $token");
          await _saveTokenToProfile(token);
        }

        // Token refresh listener
        _messaging.onTokenRefresh.listen((newToken) {
          _saveTokenToProfile(newToken);
        });

        // 3. Foreground Message Listener
        FirebaseMessaging.onMessage.listen((RemoteMessage message) {
          debugPrint("Foreground Push Notification: ${message.notification?.title} - ${message.notification?.body}");
        });

        // 4. Notification Opened App Listener
        FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
          debugPrint("Push Notification Clicked: ${message.data}");
        });
      }
    } catch (e) {
      debugPrint("Notification initialization error: $e");
    }
  }

  static Future<void> _saveTokenToProfile(String token) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user != null) {
      try {
        await Supabase.instance.client.from('profiles').upsert({
          'id': user.id,
          'fcm_token': token,
          'updated_at': DateTime.now().toIso8601String(),
        });
        debugPrint("Saved FCM token to Supabase profile");
      } catch (e) {
        debugPrint("Error saving FCM token: $e");
      }
    }
  }
}
