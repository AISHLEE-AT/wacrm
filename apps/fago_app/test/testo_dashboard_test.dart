import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fago_app/features/testo/screens/testo_dashboard.dart';

void main() {
  testWidgets('TestODashboard renders loading state without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: TestODashboard(),
        ),
      ),
    );
    
    // The screen should render the loading indicator immediately
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
