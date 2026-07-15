import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Connect to Supabase
  await Supabase.initialize(
    url: 'https://gmahjdzqitbomtmdzlfp.supabase.co',
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // Need to grab from .env later
  );

  // Initialize Firebase with fallback Web options to fix the Red Screen on Chrome
  try {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: 'AIzaSyB0UIfxvTHXmaiKCg2C5L1Vw8KCFwkVUKs',
        appId: '1:784954157473:web:113eff1c0d2017241303e0', // Mocked web ID based on Android ID
        messagingSenderId: '784954157473',
        projectId: 'fago-letstravo',
        storageBucket: 'fago-letstravo.firebasestorage.app',
      ),
    );
  } catch (e) {
    debugPrint("Firebase init error: $e");
  }

  runApp(const RiderApp());
}

class RiderApp extends StatelessWidget {
  const RiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rapido Clone - Rider',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.black),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}

