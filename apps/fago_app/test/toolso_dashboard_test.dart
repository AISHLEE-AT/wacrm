import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fago_app/features/toolso/screens/toolso_dashboard.dart';

void main() {
  testWidgets('ToolsODashboard renders and handles AI chat', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: ToolsODashboard(),
        ),
      ),
    );

    // Verify initial components
    expect(find.text('Aishlee Tools'), findsOneWidget);
    expect(find.text('Crop Disease Analysis'), findsOneWidget);

    // Enter a query
    await tester.enterText(find.byType(TextField), 'How to fix tomato blight?');

    // Tap Generate
    await tester.tap(find.text('Generate'));
    await tester.pump();

    // Verify loading indicator is shown (the button changes text to "Thinking...")
    expect(find.text('Thinking...'), findsOneWidget);

    // Wait for the simulated AI delay
    await tester.pump(const Duration(seconds: 4));

    // Verify the AI result is displayed
    expect(find.text('Generated Result'), findsOneWidget);
  });
}
