import 'package:flutter_test/flutter_test.dart';
import 'package:fago_app/auth/auth_provider.dart';

void main() {
  group('AuthState Tests', () {
    test('Initial AuthState should have isLoading true and role guest', () {
      final state = AuthState();
      expect(state.isLoading, true);
      expect(state.role, UserRole.guest);
      expect(state.firebaseUser, null);
      expect(state.supabaseUser, null);
    });

    test('CopyWith updates properties correctly', () {
      final state = AuthState();
      final newState = state.copyWith(
        isLoading: false,
        role: UserRole.user,
      );

      expect(newState.isLoading, false);
      expect(newState.role, UserRole.user);
    });
  });
}
