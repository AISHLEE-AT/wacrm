import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fago_app/features/drivo/screens/drivo_dashboard.dart';

void main() {
  testWidgets('DrivODashboard renders and handles search', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: DrivODashboard(),
        ),
      ),
    );

    // Verify initial components
    expect(find.text('DrivO'), findsOneWidget);
    expect(find.text('Send a Package'), findsOneWidget);

    // Enter data
    await tester.enterText(find.byType(TextField).at(0), '123 Main St');
    await tester.enterText(find.byType(TextField).at(1), '456 Delivery Ave');

    // Tap Get Estimate
    await tester.tap(find.text('Get Estimate'));
    await tester.pump();

    // Verify loading indicator is shown
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for the simulated network delay
    await tester.pump(const Duration(seconds: 3));

    // Verify the estimate card is shown
    expect(find.text('Delivery Estimate'), findsOneWidget);
    
    // We expect an ETA string (e.g. ETA: 25 min)
    expect(find.textContaining('ETA:'), findsOneWidget);
  });
}
