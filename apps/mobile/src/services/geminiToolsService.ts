export interface ToolResponse {
  text: string;
  error?: string;
}

export const geminiToolsService = {
  async executePrompt(prompt: string, apiKey: string, language: string = 'Tamil', attachments: any[] = []): Promise<ToolResponse> {
    if (!apiKey) {
      return { text: '', error: 'API Key is missing. Please update it in Profile.' };
    }

    const langInstructions = language === 'Tamil' 
      ? 'Respond ONLY in Tamil language. Ensure the Tamil is natural and professional.' 
      : 'Respond ONLY in English language.';

    const fullPrompt = `${prompt}\n\nLanguage Rules:\n${langInstructions}`;

    const parts: any[] = [{ text: fullPrompt }];

    // Handle attachments (Images only for now via REST)
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.base64 && att.mimeType) {
          parts.push({
            inlineData: {
              data: att.base64,
              mimeType: att.mimeType
            }
          });
        }
      }
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate response.');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text };
    } catch (err: any) {
      return { text: '', error: err.message || 'An unknown error occurred.' };
    }
  },

  // 1. Summarize AI
  async summarizeYouTube(url: string, apiKey: string, language: string) {
    const prompt = `You are an expert Summarizer. Please summarize the YouTube video at this link: ${url}. Provide a concise bulleted summary of the main points.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async summarizeWebpage(url: string, apiKey: string, language: string) {
    const prompt = `You are an expert Summarizer. Please summarize the article or webpage at this link: ${url}. Provide the main ideas and takeaways in bullet points.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async summarizeText(text: string, apiKey: string, language: string) {
    const prompt = `You are an expert Summarizer. Please summarize the following text into key bullet points:\n\n${text}`;
    return this.executePrompt(prompt, apiKey, language);
  },

  // 2. Agri & Rural
  async analyzeCrop(issue: string, apiKey: string, language: string, attachments: any[] = []) {
    const prompt = `You are an expert Agricultural Advisor and Botanist specializing in farming, crop diseases, and modern agricultural practices. 
User Query: ${issue}
Instructions:
1. If an image is provided, analyze it closely for signs of diseases, pests, or nutrient deficiencies.
2. Provide actionable, practical advice that a rural farmer can implement.
3. Recommend organic solutions where possible.
4. Format using beautiful Markdown with clear headings and bullet points.`;
    return this.executePrompt(prompt, apiKey, language, attachments);
  },

  async farmingInsights(query: string, apiKey: string, language: string) {
    const prompt = `You are an expert Agricultural Advisor. Provide seasonal farming insights, fertilizer recommendations, or market advice based on this query: ${query}`;
    return this.executePrompt(prompt, apiKey, language);
  },

  // 3. Govt & Citizen
  async eSevaiChat(query: string, apiKey: string, language: string) {
    const prompt = `You are an expert "Virtual E-Sevai & Govt Schemes Assistant" for the Tamil Nadu Digital platform.
Your goal is to help citizens navigate TN Government schemes and E-Sevai services.
User Query: ${query}
Instructions:
1. Suggest relevant TN Government Schemes.
2. List EXACTLY what documents are needed if they ask about a specific certificate.
3. Keep the tone helpful, clear, and official.
4. Format using Markdown with clear headings.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async legalTranslator(text: string, apiKey: string, language: string) {
    const prompt = `You are a Legal Jargon Translator. Simplify the following complex official/legal text into plain, easy-to-understand language:\n\n${text}`;
    return this.executePrompt(prompt, apiKey, language);
  },

  // 4. Education & Study
  async createQuiz(topic: string, apiKey: string, language: string) {
    const prompt = `You are an expert Educator AI. Generate a 5-question Multiple Choice Quiz (MCQ) based on the following topic or text:
Topic/Text: ${topic}
Requirements:
1. Provide 4 options for each question (A, B, C, D).
2. At the very end, provide the Answer Key with brief explanations.
3. Format using Markdown.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async makeNotes(text: string, apiKey: string, language: string) {
    const prompt = `You are an expert Study Notes Maker. Convert the following text into highly structured, easy-to-review study notes using Markdown headings, bold text, and bullet points:\n\n${text}`;
    return this.executePrompt(prompt, apiKey, language);
  },

  // 5. Work & Content
  async craftEmail(context: string, apiKey: string, language: string) {
    const prompt = `You are an expert Email Writer. Draft a professional, polite, and effective email based on the following context/instructions:\n\n${context}`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async socialMediaGen(topic: string, apiKey: string, language: string) {
    const prompt = `You are a Social Media Marketing Expert. Generate a catchy caption, relevant hashtags, and posting advice for the following topic:\n\n${topic}`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async improveResume(text: string, apiKey: string, language: string) {
    const prompt = `You are an expert Career Coach and Resume Writer. Improve the following resume bullet points to make them sound more professional, impactful, and action-oriented:\n\n${text}`;
    return this.executePrompt(prompt, apiKey, language);
  }
};
