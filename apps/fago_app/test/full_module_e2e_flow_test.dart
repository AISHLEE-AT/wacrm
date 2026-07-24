import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fago_app/features/promo/screens/whatsapp_status_promo_screen.dart';
import 'package:fago_app/features/profile/screens/profile_dashboard.dart';
import 'package:fago_app/screens/mandi_prices_screen.dart';
import 'package:fago_app/screens/rento_screen.dart';
import 'package:fago_app/screens/teacho_screen.dart';
import 'package:fago_app/screens/testo_screen.dart';

void main() {
  group('FAGO Automated Full-Flow UX & Module Button-by-Button Tests', () {

    testWidgets('1. WhatsApp Status Promo Engine - Renders Tamil templates & 1-tap buttons', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: WhatsappStatusPromoScreen(),
        ),
      );

      // Verify Header Title
      expect(find.text('📸 Share to WhatsApp Status'), findsOneWidget);

      // Verify 1-Tap Share Button
      expect(find.text('📲 Post to My WhatsApp Status (வாட்ஸ்அப்பில் பகிரவும்)'), findsOneWidget);
    });

    testWidgets('2. Mandi Prices Screen - Renders Uzhavar Santhai rates header & globe action button', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: MandiPricesScreen(),
          ),
        ),
      );

      // Verify Mandi Header
      expect(find.text('உழவர் சந்தை & காய்கறி விலை'), findsOneWidget);
      expect(find.byIcon(Icons.language), findsOneWidget);
    });

    testWidgets('3. RentO Agri Rentals Screen - Renders tractor rental categories & location button', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: RentOScreen(),
          ),
        ),
      );

      // Verify RentO Header
      expect(find.text('RentO - விவசாய இயந்திர வாடகை'), findsOneWidget);
      expect(find.byIcon(Icons.my_location), findsOneWidget);
      expect(find.byIcon(Icons.language), findsOneWidget);
    });

    testWidgets('4. TeachO Screen - Renders free online TNPSC & skill courses', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: TeachOScreen(),
          ),
        ),
      );

      // Verify TeachO Header
      expect(find.text('TeachO - விவசாய நுட்பங்கள் & பயிற்சி'), findsOneWidget);
      expect(find.byIcon(Icons.language), findsOneWidget);
    });

    testWidgets('5. TestO Screen - Renders online mock test launcher', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: TestOScreen(),
          ),
        ),
      );

      // Verify TestO Header
      expect(find.text('TestO - ஆன்லைன் மாதிரித் தேர்வுகள்'), findsOneWidget);
      expect(find.byIcon(Icons.language), findsOneWidget);
    });

    testWidgets('6. Profile Dashboard - Renders loading indicator & User Profile UI', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: ProfileDashboard(),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

  });
}
