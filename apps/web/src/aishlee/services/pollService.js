import Papa from 'papaparse';

const POLL_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRy5yhdJZT8zHA913hQiNjDNW85K3YXisxyCXZ0ApKKZjIeiuCcsc82T6dYkfVKcbxqru9HbcQq_v-l/pub?output=csv";

export const pollService = {
  fetchActivePoll: async () => {
    return new Promise((resolve, reject) => {
      Papa.parse(POLL_CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const today = new Date();
            // Reset time to 00:00:00 for accurate date comparison
            today.setHours(0, 0, 0, 0);

            // Find the poll where today is between start_date and end_date
            let activePoll = null;
            
            for (const row of results.data) {
              if (!row.poll_id || !row.start_date || !row.end_date) continue;
              
              const startDate = new Date(row.start_date);
              const endDate = new Date(row.end_date);
              endDate.setHours(23, 59, 59, 999); // End date should cover the whole day

              if (today >= startDate && today <= endDate) {
                activePoll = {
                  poll_id: row.poll_id,
                  question: row.question,
                  points_reward: parseInt(row.points_reward) || 5,
                  options: [
                    row.option_1,
                    row.option_2,
                    row.option_3,
                    row.option_4
                  ].filter(o => o && o.trim() !== '') // Remove empty options
                };
                break;
              }
            }

            // Fallback: If no active poll matches today's date, return the most recent one
            if (!activePoll && results.data.length > 0) {
              const row = results.data[results.data.length - 1]; // Last row
              if (row.poll_id) {
                activePoll = {
                  poll_id: row.poll_id,
                  question: row.question,
                  points_reward: parseInt(row.points_reward) || 5,
                  options: [
                    row.option_1,
                    row.option_2,
                    row.option_3,
                    row.option_4
                  ].filter(o => o && o.trim() !== '')
                };
              }
            }

            resolve(activePoll);
          } catch (error) {
            console.error("Error parsing poll CSV:", error);
            reject(error);
          }
        },
        error: (error) => {
          console.error("Failed to fetch poll CSV:", error);
          reject(error);
        }
      });
    });
  }
};
