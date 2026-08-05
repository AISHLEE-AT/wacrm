export interface MandiItem {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

export class MandiApiService {
  private static readonly API_KEY = '579b464db66ec23bdd0000010e0f365c1ff840af51b6b8944d54f72b'; // User's API Key
  private static readonly BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

  static async fetchMandiPrices(): Promise<MandiItem[]> {
    if (!this.API_KEY) {
      // Fallback dummy data for Tamil Nadu
      return [
        { state: 'Tamil Nadu', district: 'Coimbatore', market: 'Coimbatore', commodity: 'Tomato', variety: 'Local', arrivalDate: 'Today', minPrice: 2000, maxPrice: 2500, modalPrice: 2200 },
        { state: 'Tamil Nadu', district: 'Erode', market: 'Erode', commodity: 'Turmeric', variety: 'Finger', arrivalDate: 'Today', minPrice: 7000, maxPrice: 7500, modalPrice: 7250 },
        { state: 'Tamil Nadu', district: 'Madurai', market: 'Madurai', commodity: 'Onion', variety: 'Small', arrivalDate: 'Today', minPrice: 4000, maxPrice: 4800, modalPrice: 4500 },
        { state: 'Tamil Nadu', district: 'Salem', market: 'Salem', commodity: 'Mango', variety: 'Malgova', arrivalDate: 'Today', minPrice: 5000, maxPrice: 6000, modalPrice: 5500 },
        { state: 'Tamil Nadu', district: 'Dindigul', market: 'Dindigul', commodity: 'Banana', variety: 'Poovan', arrivalDate: 'Today', minPrice: 1500, maxPrice: 2000, modalPrice: 1800 },
      ];
    }

    try {
      const url = `${this.BASE_URL}?api-key=${this.API_KEY}&format=json&filters[state]=Tamil Nadu&limit=100`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch mandi data');
      }
      
      const data = await response.json();
      const records = data.records || [];
      
      return records.map((r: any) => ({
        state: r.state || '',
        district: r.district || '',
        market: r.market || '',
        commodity: r.commodity || '',
        variety: r.variety || '',
        arrivalDate: r.arrival_date || '',
        minPrice: parseFloat(r.min_price || '0'),
        maxPrice: parseFloat(r.max_price || '0'),
        modalPrice: parseFloat(r.modal_price || '0'),
      }));
    } catch (error) {
      console.error('Mandi API Error:', error);
      return [];
    }
  }
}
