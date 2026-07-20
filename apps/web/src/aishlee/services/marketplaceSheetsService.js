import Papa from 'papaparse';

// The public CSV URL provided by the user
export const MARKETPLACE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTBNJC-falGsxt3H4vzsprtxElcQLZgKbOC-8pyJ7N4KXzFvWykNNwu6yISM3ssP25JWn9eI3dfapPA/pub?gid=0&single=true&output=csv';

export const marketplaceSheetsService = {
  async fetchListings() {
    try {
      return new Promise((resolve, reject) => {
        Papa.parse(MARKETPLACE_SHEET_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            const data = results.data.map((item, index) => {
              // Ensure we have an image
              let imageUrl = item['Image URL'];
              if (!imageUrl || !imageUrl.startsWith('http')) {
                imageUrl = 'https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=600&auto=format&fit=crop'; // Default placeholder
              }

              return {
                id: `listing_${String(item['Title'] || `row-${index}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
                category: item['Category'] || 'General',
                title: item['Title'] || 'Untitled',
                price: parseFloat(item['Price']) || 0,
                unit: item['Unit'] || '',
                imageUrl: imageUrl,
                description: item['Description'] || '',
                origin: item['Origin/Location'] || 'Local',
                listingType: item['Listing Type'] || 'Brokerage',
                pincode: item['Pincode'] || '',
                whatsappNumber: item['WhatsAppNumber'] || ''
              };
            });
            
            resolve(data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error("Failed to fetch Marketplace data:", error);
      throw error;
    }
  }
};
