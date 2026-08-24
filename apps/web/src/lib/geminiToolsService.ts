export interface ToolResponse {
  text: string;
  error?: string;
  source?: 'direct' | 'cloud_proxy';
}

export const GEMINI_MODELS = {
  FLASH_25: 'gemini-2.5-flash',
  FLASH_LITE: 'gemini-2.5-flash-lite',
  FLASH_31: 'gemini-3.1-flash-lite',
  PRO_25: 'gemini-2.5-pro',
};

const DEFAULT_MODEL = 'gemini-2.5-flash';

export const geminiToolsService = {
  async executePrompt(
    prompt: string,
    apiKey?: string,
    language: string = 'Tamil',
    attachments: any[] = [],
    modelName: string = DEFAULT_MODEL
  ): Promise<ToolResponse> {
    let effectiveKey = (apiKey || '').trim();
    if (!effectiveKey && typeof window !== 'undefined') {
      try {
        effectiveKey = (localStorage.getItem('gemini-api-key') || '').trim();
      } catch (e) {}
    }

    const langInstructions =
      language === 'Tamil'
        ? 'Respond primarily in natural, clear, professional TAMIL language (தமிழ்). Include key English technical terms where helpful.'
        : 'Respond clearly and professionally in ENGLISH language.';

    const fullPrompt = `${prompt}\n\nLanguage Instruction:\n${langInstructions}`;

    if (effectiveKey && effectiveKey.length > 0) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${effectiveKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { text, source: 'direct' };
          }
        }
      } catch (e) {
        console.warn('Direct web Gemini API call failed:', e);
      }
    }

    return {
      text: '',
      error: 'Please configure your Gemini API Key in Profile or Settings to enable dynamic AI generation.',
      source: 'direct',
    };
  },
};
