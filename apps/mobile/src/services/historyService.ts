import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  tool: string;
  query: string;
  result: string;
  timestamp: number;
  language: string;
}

const HISTORY_KEY = '@ai_tools_history';

export const historyService = {
  async saveItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const existing = await this.getHistory();
      const newItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      const updated = [newItem, ...existing];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving history item', e);
    }
  },

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading history', e);
      return [];
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Error clearing history', e);
    }
  },
  
  async deleteItem(id: string): Promise<void> {
    try {
      const existing = await this.getHistory();
      const updated = existing.filter(i => i.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting history item', e);
    }
  },

  // Helper to group by "This Week", "Last Week", "Older"
  getGroupedHistory(items: HistoryItem[]) {
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

    const groups = {
      'This Week': [] as HistoryItem[],
      'Last Week': [] as HistoryItem[],
      'Older': [] as HistoryItem[],
    };

    items.forEach(item => {
      const diff = now - item.timestamp;
      if (diff < ONE_WEEK) {
        groups['This Week'].push(item);
      } else if (diff < TWO_WEEKS) {
        groups['Last Week'].push(item);
      } else {
        groups['Older'].push(item);
      }
    });

    return [
      { title: 'This Week', data: groups['This Week'] },
      { title: 'Last Week', data: groups['Last Week'] },
      { title: 'Older', data: groups['Older'] }
    ].filter(g => g.data.length > 0);
  }
};
