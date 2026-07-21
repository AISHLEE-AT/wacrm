import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fago_app/features/profile/screens/profile_dashboard.dart';

void main() {
  testWidgets('ProfileDashboard renders loading state without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: ProfileDashboard(),
        ),
      ),
    );
    
    // Initial state should be loading due to async provider
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
