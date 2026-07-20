/* eslint-disable no-useless-escape */
import Papa from 'papaparse';

// The public CSV URL provided by the user
export const MEDIA_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDWjyg55EeGc34ru3hJmpGSBq6Rk3gk2vf0b_L6o1Fq27KZ-6pOCQTGdXQyBftef0aXUZlg3BdtOBU/pub?output=csv';

const extractVideoID = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const googleSheetsService = {
  async fetchMedia() {
    try {
      return new Promise((resolve, reject) => {
        Papa.parse(MEDIA_SHEET_URL, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data.map(item => {
              const videoId = extractVideoID(item['YouTube Link']);
              return {
                id: videoId || Math.random().toString(36).substr(2, 9),
                title: item['Title'] || 'Untitled',
                url: item['YouTube Link'] || '',
                videoId: videoId,
                category: item['Category'] || 'General',
                description: item['Description'] || '',
                thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
              };
            }).filter(item => item.videoId); // Only keep valid youtube links
            
            resolve(data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error("Failed to fetch Google Sheet data:", error);
      throw error;
    }
  }
};
