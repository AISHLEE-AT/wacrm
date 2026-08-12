export interface ToolResponse {
  text: string;
  error?: string;
}

// Model Configuration - Easily switch between models
// You can upgrade to 'gemini-2.5-pro' for more complex reasoning tasks.
const GEMINI_MODEL = 'gemini-2.5-flash';

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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
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

  // 2. Education & Quizzes
  async createQuiz(topic: string, apiKey: string, language: string) {
    const prompt = `You are an expert Quiz Master. Create a multiple choice quiz about: ${topic}. Format it beautifully in Markdown. Provide 5 questions, options, and answers at the end.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async generateAndSaveQuiz(
    topic: string, 
    numQuestions: number, 
    difficulty: string,
    apiKey: string, 
    language: string, 
    attachments: any[] = []
  ): Promise<{ data: any, error?: string }> {
    if (!apiKey) return { data: null, error: 'API Key is missing.' };
    
    const prompt = `You are an expert Examiner preparing an IBPS-style online test.
Create exactly ${numQuestions} questions on the topic/source: "${topic}".
Difficulty level: ${difficulty}.
${language === 'Tamil' ? 'The questions, options, and explanations MUST be in Tamil.' : 'The questions, options, and explanations MUST be in English.'}

CRITICAL: You MUST respond ONLY with a raw, strictly valid JSON array. DO NOT wrap it in \`\`\`json or \`\`\` tags. DO NOT include any conversational text.
The JSON array MUST exactly follow this structure:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "answer": "Paris",
    "explanation": "Paris is the capital and most populous city of France."
  }
]`;

    try {
      const response = await this.executePrompt(prompt, apiKey, 'English', attachments);
      if (response.error) return { data: null, error: response.error };
      
      let rawText = response.text.trim();
      // Clean up markdown formatting if Gemini still adds it despite the prompt
      if (rawText.startsWith('\`\`\`json')) {
        rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      } else if (rawText.startsWith('\`\`\`')) {
        rawText = rawText.replace(/\`\`\`/g, '').trim();
      }
      
      const parsedData = JSON.parse(rawText);
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('Generated JSON is invalid or empty.');
      }
      
      return { data: parsedData };
    } catch (e: any) {
      return { data: null, error: 'Failed to generate a valid Quiz payload. ' + e.message };
    }
  },

  // 3. Agri & Rural
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
  },

  // 6. Viral & Social (StatusO / MemeO)
  async statusQuoteGen(topic: string, mood: string, apiKey: string) {
    const prompt = `You are a creative writer specializing in highly viral WhatsApp status quotes in Tamil Nadu.
Topic: ${topic}
Mood: ${mood}
Generate a very short, punchy, and highly shareable 1 or 2 line quote in Tamil (Tanglish or pure Tamil, whichever fits best). 
DO NOT include any hashtags, markdown, or extra conversational text. Return ONLY the quote text.`;
    return this.executePrompt(prompt, apiKey, 'Tamil'); // Force Tamil for TN viral feature
  },

  // 7. Voice Assistant (Kural AI)
  async processAudioInput(apiKey: string, base64Audio: string, mimeType: string, language: string) {
    if (!apiKey) return { text: '', error: 'API Key is missing.' };
    
    const prompt = `You are "Kural AI", a highly intelligent assistant for the SuprO App. 
Please listen to the attached audio and respond to the user's query or command.
${language === 'Tamil' ? 'Respond in clear, natural Tamil.' : 'Respond in clear English.'}
Keep your response concise and helpful.`;

    const parts = [
      { text: prompt },
      { inlineData: { data: base64Audio, mimeType: mimeType } }
    ];

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Failed to generate response.');
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text };
    } catch (err: any) {
      return { text: '', error: err.message || 'An error occurred processing the audio.' };
    }
  }
};
