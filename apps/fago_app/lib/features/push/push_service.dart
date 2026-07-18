import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Top-level function for background messages
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("Handling a background message: ${message.messageId}");
}

class PushService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static final SupabaseClient _supabase = Supabase.instance.client;

  static Future<void> init() async {
    // Request permission (mostly for iOS, Android 13+)
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted permission');
      
      // Setup background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message whilst in the foreground!');
        debugPrint('Message data: ${message.data}');

        if (message.notification != null) {
          debugPrint('Message also contained a notification: ${message.notification}');
          // In a real app, you might show a local notification (flutter_local_notifications) here
        }
      });

      // Update token in DB
      await _updateToken();

      // Listen for token refreshes
      _messaging.onTokenRefresh.listen((newToken) {
        _saveTokenToDb(newToken);
      });
    }
  }

  static Future<void> _updateToken() async {
    try {
      String? token = await _messaging.getToken();
      if (token != null) {
        await _saveTokenToDb(token);
      }
    } catch (e) {
      debugPrint("Error fetching FCM token: $e");
    }
  }

  static Future<void> _saveTokenToDb(String token) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    try {
      // We don't know immediately if they are a driver or rider. 
      // We try updating both tables gracefully.
      
      // Try updating driver record
      await _supabase
          .from('drivers')
          .update({'fcm_token': token})
          .eq('user_id', user.id)
          .catchError((_) => null); // Ignore error if not a driver

      // Try upserting user record
      await _supabase
          .from('users')
          .upsert({'id': user.id, 'fcm_token': token})
          .catchError((_) => null); // Ignore error if not a user

      debugPrint("FCM token saved successfully");
    } catch (e) {
      debugPrint("Failed to save FCM token: $e");
    }
  }
}
