import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/role_selection_screen.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  debugPrint("Handling a background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  try {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: 'AIzaSyB0UIfxvTHXmaiKCg2C5L1Vw8KCFwkVUKs',
        appId: '1:784954157473:web:113eff1c0d2017241303e0', 
        messagingSenderId: '784954157473',
        projectId: 'fago-letstravo',
        storageBucket: 'fago-letstravo.firebasestorage.app',
      ),
    );
    
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    // Request FCM permissions
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Get initial FCM token
    final fcmToken = await messaging.getToken();
    debugPrint('FCM Token: $fcmToken');

    // Listen for FCM token refresh
    messaging.onTokenRefresh.listen((newToken) {
      debugPrint('FCM Token refreshed: $newToken');
      // Token will be stored after login when we know the driver/user ID
    });

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Foreground message: ${message.notification?.title}');
    });
  } catch (e) {
    debugPrint("Firebase init error: $e");
  }
  
  try {
    await Supabase.initialize(
      url: 'https://gmahjdzqitbomtmdzlfp.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE',
    );
  } catch (e) {
    debugPrint("Supabase init error: $e");
  }

  runApp(const SuperApp());
}

class SuperApp extends StatelessWidget {
  const SuperApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WatsCRM - Ride Hailing',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF8C00),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const RoleSelectionScreen(),
    );
  }
}
