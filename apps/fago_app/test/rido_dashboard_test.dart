import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fago_app/features/rido/screens/rido_dashboard.dart';

void main() {
  testWidgets('RidODashboard renders and handles search', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: RidODashboard(),
        ),
      ),
    );

    // Verify initial components
    expect(find.text('RidO'), findsOneWidget);
    expect(find.text('Where to?'), findsOneWidget);

    // Enter data
    await tester.enterText(find.byType(TextField).at(0), '123 Main St');
    await tester.enterText(find.byType(TextField).at(1), '456 Dropoff Ave');

    // Tap Find a Ride
    await tester.tap(find.text('Find a Ride'));
    await tester.pump();

    // Verify loading indicator is shown
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for the simulated network delay
    await tester.pump(const Duration(seconds: 3));

    // Verify the estimate card is shown
    expect(find.text('Fare Estimate'), findsOneWidget);
    
    // We expect an ETA string (e.g. ETA: 25 min)
    expect(find.textContaining('ETA:'), findsOneWidget);
  });
}
