import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supro_flutter/core/offline_cache_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('OfflineCacheService stores and retrieves data correctly', () async {
    const key = 'test_mandi_prices';
    final sampleData = {'paddy': '₹2400/quintal', 'cotton': '₹7200/quintal'};

    await OfflineCacheService.set(key, sampleData, ttlSeconds: 3600);
    final retrieved = await OfflineCacheService.get(key);

    expect(retrieved, isNotNull);
    expect(retrieved['paddy'], '₹2400/quintal');
  });

  test('OfflineCacheService transparently falls back to cached data on network error', () async {
    const key = 'test_curriculum_day1';
    final sampleCurriculum = {'day': 1, 'theme': 'Motion & Force'};

    // Prime cache
    await OfflineCacheService.set(key, sampleCurriculum);

    // Call getOrFetch with failing fetcher
    final result = await OfflineCacheService.getOrFetch<Map<String, dynamic>>(
      cacheKey: key,
      fetcher: () async => throw Exception('Connection timeout or offline'),
    );

    expect(result, isNotNull);
    expect(result!['day'], 1);
    expect(result['theme'], 'Motion & Force');
  });
}
