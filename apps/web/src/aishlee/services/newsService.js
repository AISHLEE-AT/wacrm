import Papa from 'papaparse';

const NEWS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2wtUPuioXqLGUU9wt0Sh8wWskxiDfLdurU7mGWZZZhwfI8ftAe6hi8U8q9JwzXU5Utgxb3HUOkyVU/pub?output=csv";

export const newsService = {
  fetchDailyNews: async () => {
    return new Promise((resolve, reject) => {
      Papa.parse(NEWS_CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            // Group news into tn, india, world
            const newsGroups = {
              tn: [],
              india: [],
              world: []
            };
            
            for (const row of results.data) {
              if (!row.Category || !row.Headline) continue;
              
              const catKey = row.Category.toLowerCase(); // 'tn', 'india', 'world'
              
              const newsItem = {
                headline: row.Headline,
                source: row.Source,
                date: row.Date,
                url: row.URL
              };
              
              if (newsGroups[catKey]) {
                newsGroups[catKey].push(newsItem);
              }
            }
            resolve(newsGroups);
          } catch (error) {
            console.error("Error parsing news CSV:", error);
            reject(error);
          }
        },
        error: (error) => {
          console.error("Failed to fetch news CSV:", error);
          reject(error);
        }
      });
    });
  }
};
