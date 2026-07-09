// Shared TradeO category definitions used across the app
export const TRADEO_CATEGORIES = [
  { value: 'Food & Beverages', label: '🍛 Food & Beverages', keywords: ['biriyani', 'meals', 'catering', 'food', 'tiffin', 'snacks', 'sweets'] },
  { value: 'Home Services', label: '🔧 Home Services', keywords: ['plumbing', 'plumber', 'electrical', 'electrician', 'carpentry', 'carpenter', 'painting', 'painter'] },
  { value: 'Transportation', label: '🚗 Transportation', keywords: ['cab', 'auto', 'bike', 'transport', 'delivery', 'courier', 'moving'] },
  { value: 'Education', label: '📚 Education', keywords: ['tutor', 'tutoring', 'coaching', 'classes', 'teacher', 'training', 'teaching'] },
  { value: 'Healthcare', label: '🏥 Healthcare', keywords: ['doctor', 'nurse', 'physio', 'physiotherapy', 'pharmacy', 'medicine', 'health'] },
  { value: 'Beauty & Wellness', label: '💆 Beauty & Wellness', keywords: ['salon', 'beauty', 'haircut', 'spa', 'massage', 'grooming', 'makeup'] },
  { value: 'Cleaning', label: '🧹 Cleaning', keywords: ['cleaning', 'housekeeping', 'maid', 'sweep', 'laundry', 'washing'] },
  { value: 'Events', label: '🎉 Events', keywords: ['event', 'decoration', 'photography', 'photo', 'video', 'dj', 'music', 'band'] },
  { value: 'Retail & Shopping', label: '🛒 Retail & Shopping', keywords: ['shop', 'store', 'buy', 'grocery', 'vegetables', 'fruits', 'hardware'] },
  { value: 'Other', label: '⚙️ Other', keywords: [] },
]

export function detectCategory(keyword: string): string {
  const kw = keyword.toLowerCase()
  for (const cat of TRADEO_CATEGORIES) {
    if (cat.keywords.some(k => kw.includes(k) || k.includes(kw))) {
      return cat.value
    }
  }
  return 'Other'
}
