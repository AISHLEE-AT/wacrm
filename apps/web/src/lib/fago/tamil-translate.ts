// Tamil to English keyword translation map
// Used by FAGO voice search to translate Tamil speech → English search terms

export const TAMIL_TO_ENGLISH: Record<string, string> = {
  // Food & Beverages
  'பிரியாணி': 'Biriyani',
  'சாப்பாடு': 'Meals',
  'சோறு': 'Rice Meals',
  'தோசை': 'Dosa',
  'இட்லி': 'Idli',
  'சாம்பார்': 'Sambar',
  'கறி': 'Curry',
  'கோழி': 'Chicken',
  'மட்டன்': 'Mutton',
  'மீன்': 'Fish',
  'காய்கறி': 'Vegetables',
  'பழம்': 'Fruits',
  'பால்': 'Milk',
  'தேநீர்': 'Tea',
  'காபி': 'Coffee',
  'கேக்': 'Cake',
  'இனிப்பு': 'Sweets',
  'தின்பண்டம்': 'Snacks',
  'உணவு': 'Food',
  'கேட்டரிங்': 'Catering',
  'டிபன்': 'Tiffin',

  // Home Services
  'குழாய்': 'Plumbing',
  'நீர் குழாய்': 'Plumber',
  'மின்சாரம்': 'Electrical',
  'மின்னோட்டம்': 'Electrician',
  'மின்': 'Electrical',
  'மரவேலை': 'Carpentry',
  'சுவர் வண்ணம்': 'Painting',
  'வண்ணம்': 'Painting',
  'தச்சர்': 'Carpenter',
  'பழுது': 'Repair',
  'பழுதுபார்க்க': 'Repair',
  'ஏசி': 'AC Repair',
  'குளிர்சாதனம்': 'AC Service',
  'மாட்டு வண்டி': 'Moving',
  'இடம் மாற்றம்': 'Shifting',

  // Transportation
  'ஆட்டோ': 'Auto',
  'டாக்சி': 'Taxi',
  'கேப்': 'Cab',
  'வண்டி': 'Vehicle',
  'பைக்': 'Bike',
  'டெலிவரி': 'Delivery',
  'கொரியர்': 'Courier',
  'சரக்கு': 'Cargo',

  // Education
  'படிப்பு': 'Tutoring',
  'ஆசிரியர்': 'Teacher',
  'கோச்சிங்': 'Coaching',
  'கல்வி': 'Education',
  'டியூஷன்': 'Tuition',
  'வகுப்பு': 'Classes',

  // Healthcare
  'மருத்துவர்': 'Doctor',
  'மருத்துவம்': 'Healthcare',
  'மருந்து': 'Medicine',
  'மருந்தகம்': 'Pharmacy',
  'நர்ஸ்': 'Nurse',
  'பிசியோதெரபி': 'Physiotherapy',
  'ஆரோக்கியம்': 'Health',

  // Beauty & Wellness
  'சலூன்': 'Salon',
  'முடி': 'Haircut',
  'முடி வெட்டுதல்': 'Haircut',
  'அழகு நிலையம்': 'Beauty Parlour',
  'மசாஜ்': 'Massage',
  'மேக்கப்': 'Makeup',
  'ஸ்பா': 'Spa',

  // Cleaning
  'சுத்தம்': 'Cleaning',
  'துப்புரவு': 'Cleaning',
  'வீடு சுத்தம்': 'House Cleaning',
  'துவைக்க': 'Laundry',
  'இஸ்திரி': 'Ironing',
  'வீட்டு வேலை': 'Housekeeping',

  // Events
  'விழா': 'Event',
  'கல்யாணம்': 'Wedding',
  'பட்டாசு': 'Fireworks',
  'புகைப்படம்': 'Photography',
  'அலங்காரம்': 'Decoration',
  'டிஜே': 'DJ',
  'இசை': 'Music',
  'வீடியோ': 'Videography',

  // Retail
  'கடை': 'Shop',
  'மளிகை': 'Grocery',
  'நிறுவனம்': 'Store',
  'ஹார்டுவேர்': 'Hardware',
}

// Translate a Tamil text to the best English keyword
export function translateTamilToEnglish(text: string): string {
  const trimmed = text.trim()

  // Direct match
  if (TAMIL_TO_ENGLISH[trimmed]) {
    return TAMIL_TO_ENGLISH[trimmed]
  }

  // Partial match — find any Tamil word in the spoken text
  for (const [tamil, english] of Object.entries(TAMIL_TO_ENGLISH)) {
    if (trimmed.includes(tamil)) {
      return english
    }
  }

  // Fallback — return original (might already be English/Tanglish)
  return trimmed
}

// Check if a string contains Tamil characters (Unicode range: U+0B80–U+0BFF)
export function isTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text)
}
