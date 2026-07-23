import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppLanguage { english, tamil }

class LanguageNotifier extends StateNotifier<AppLanguage> {
  LanguageNotifier() : super(AppLanguage.tamil); // Default to Tamil for local TN audience

  void toggleLanguage() {
    state = state == AppLanguage.english ? AppLanguage.tamil : AppLanguage.english;
  }

  void setLanguage(AppLanguage lang) {
    state = lang;
  }

  String translate(String key) {
    if (state == AppLanguage.english) {
      return _englishDictionary[key] ?? key;
    }
    return _tamilDictionary[key] ?? _englishDictionary[key] ?? key;
  }

  static final Map<String, String> _englishDictionary = {
    'app_title': 'FAGO Local TN Super-App',
    'rideo_title': 'RideO - Book Ride',
    'drivo_title': 'DriveO - Driver Radar',
    'rento_title': 'RentO - Agri Machine Rentals',
    'mandi_title': 'Uzhavar Sandhai & Mandi Prices',
    'touro_title': 'TourO - Temple & Hill Packages',
    'teacho_title': 'TeachO - Skill & Agri Academy',
    'profile_title': 'Digital ID & Profile',
    'book_now': 'BOOK NOW',
    'farmer_name': 'Farmer Name',
    'village_address': 'Village / Farm Address',
    'estimated_rent': 'Estimated Rent',
    'book_via_whatsapp': 'BOOK VIA WHATSAPP (1-CLICK)',
  };

  static final Map<String, String> _tamilDictionary = {
    'app_title': 'FAGO தமிழ்நாடு ஆப்',
    'rideo_title': 'RideO - வாகனம் பதிவு செய்',
    'drivo_title': 'DriveO - ஓட்டுநர் தளம்',
    'rento_title': 'RentO - விவசாய இயந்திர வாடகை',
    'mandi_title': 'உழவர் சந்தை & காய்கறி விலை',
    'touro_title': 'TourO - ஆன்மீக & சுற்றுலா பயணம்',
    'teacho_title': 'TeachO - விவசாய தொழில்நுட்பம் & பயிற்சி',
    'profile_title': 'சுயவிவரம் & டிஜிட்டல் சான்றிதழ்',
    'book_now': 'உடனே பதிவு செய்',
    'farmer_name': 'விவசாயி பெயர்',
    'village_address': 'கிராமம் / தோட்டம் முகவரி',
    'estimated_rent': 'மதிப்பிடப்பட்ட வாடகை',
    'book_via_whatsapp': 'வாட்ஸ்அப் மூலம் பதிவு செய்',
  };
}

final languageProvider = StateNotifierProvider<LanguageNotifier, AppLanguage>((ref) {
  return LanguageNotifier();
});
