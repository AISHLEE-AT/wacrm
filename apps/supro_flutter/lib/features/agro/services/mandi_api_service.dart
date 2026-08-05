import 'dart:convert';
import 'package:http/http.dart' as http;

class MandiItem {
  final String state;
  final String district;
  final String market;
  final String commodity;
  final String variety;
  final String arrivalDate;
  final double minPrice;
  final double maxPrice;
  final double modalPrice;

  MandiItem({
    required this.state,
    required this.district,
    required this.market,
    required this.commodity,
    required this.variety,
    required this.arrivalDate,
    required this.minPrice,
    required this.maxPrice,
    required this.modalPrice,
  });

  factory MandiItem.fromJson(Map<String, dynamic> json) {
    return MandiItem(
      state: json['state'] ?? '',
      district: json['district'] ?? '',
      market: json['market'] ?? '',
      commodity: json['commodity'] ?? '',
      variety: json['variety'] ?? '',
      arrivalDate: json['arrival_date'] ?? '',
      minPrice: double.tryParse(json['min_price'] ?? '0') ?? 0.0,
      maxPrice: double.tryParse(json['max_price'] ?? '0') ?? 0.0,
      modalPrice: double.tryParse(json['modal_price'] ?? '0') ?? 0.0,
    );
  }
}

class MandiApiService {
  // Replace with the user's data.gov.in API Key
  static const String _apiKey = '579b464db66ec23bdd0000010e0f365c1ff840af51b6b8944d54f72b'; 
  static const String _baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

  static Future<List<MandiItem>> fetchMandiPrices() async {
    if (_apiKey.isEmpty) {
      // Return mock data for Tamil Nadu if API key is not configured yet
      return [
        MandiItem(state: 'Tamil Nadu', district: 'Coimbatore', market: 'Coimbatore', commodity: 'Tomato', variety: 'Local', arrivalDate: 'Today', minPrice: 2000, maxPrice: 2500, modalPrice: 2200),
        MandiItem(state: 'Tamil Nadu', district: 'Erode', market: 'Erode', commodity: 'Turmeric', variety: 'Finger', arrivalDate: 'Today', minPrice: 7000, maxPrice: 7500, modalPrice: 7250),
        MandiItem(state: 'Tamil Nadu', district: 'Madurai', market: 'Madurai', commodity: 'Onion', variety: 'Small', arrivalDate: 'Today', minPrice: 4000, maxPrice: 4800, modalPrice: 4500),
        MandiItem(state: 'Tamil Nadu', district: 'Salem', market: 'Salem', commodity: 'Mango', variety: 'Malgova', arrivalDate: 'Today', minPrice: 5000, maxPrice: 6000, modalPrice: 5500),
        MandiItem(state: 'Tamil Nadu', district: 'Dindigul', market: 'Dindigul', commodity: 'Banana', variety: 'Poovan', arrivalDate: 'Today', minPrice: 1500, maxPrice: 2000, modalPrice: 1800),
      ];
    }

    try {
      final url = Uri.parse('$_baseUrl?api-key=$_apiKey&format=json&filters[state]=Tamil Nadu&limit=100');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List records = data['records'] ?? [];
        return records.map((r) => MandiItem.fromJson(r)).toList();
      } else {
        throw Exception('Failed to load mandi data');
      }
    } catch (e) {
      print('Mandi API Error: $e');
      return [];
    }
  }
}
