export interface GoogleDriveAccount {
  isConnected: boolean;
  email?: string;
  folderId?: string;
  connectedAt?: string;
}

export const GoogleDriveService = {
  getAccountStatus: async (): Promise<GoogleDriveAccount> => {
    return { isConnected: false };
  },

  saveCredentials: async (creds: any): Promise<void> => {
    // Mock save
    console.log('Saved credentials', creds);
  },

  disconnect: async (phone?: string): Promise<void> => {
    console.log('Disconnected', phone);
  },

  uploadTaskVideo: async (
    file: any,
    metadata: any,
    onProgress?: (percent: number) => void
  ): Promise<{ webViewLink?: string }> => {
    // Mock upload
    if (onProgress) {
      for (let i = 10; i <= 100; i += 20) {
        onProgress(i);
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    return { webViewLink: 'https://drive.google.com/mock/view' };
  },

  saveGroupMeetingSubmissionToSupabase: async (submission: any): Promise<boolean> => {
    console.log('Saved to Supabase', submission);
    return true;
  }
};
