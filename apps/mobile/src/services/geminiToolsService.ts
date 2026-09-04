// @ts-nocheck
import * as SecureStore from 'expo-secure-store';

export interface ToolResponse {
  text: string;
  error?: string;
  source?: 'direct' | 'cloud_proxy';
}

// Supported Google Gemini Models
export const GEMINI_MODELS = {
  FLASH_31: 'gemini-3.1-flash-lite',
  FLASH_31_PREVIEW: 'gemini-3.1-flash-lite-preview',
  FLASH_LATEST: 'gemini-flash-lite-latest',
  FLASH_25: 'gemini-2.5-flash',
  FLASH_LITE: 'gemini-2.5-flash-lite',
  PRO_25: 'gemini-2.5-pro',
};

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
];

const FALLBACK_KEYS = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const CLOUD_AI_API = `${ENV.CRM_URL}/api/ai`;

export const geminiToolsService = {
  /**
   * Main prompt execution engine with automatic Cloud Fallback
   */
  async executePrompt(
    prompt: string,
    apiKey?: string,
    language: string = 'Tamil',
    attachments: any[] = [],
    modelName: string = DEFAULT_MODEL
  ): Promise<ToolResponse> {
    let effectiveKey = (apiKey || '').trim();
    if (!effectiveKey) {
      try {
        effectiveKey = ((await SecureStore.getItemAsync('gemini-api-key')) || '').trim();
      } catch (e) {}
    }
    if (!effectiveKey) {
      effectiveKey = FALLBACK_KEYS[0];
    }

    const langInstructions =
      language === 'Tamil'
        ? 'Respond primarily in natural, clear, professional TAMIL language (தமிழ்). You may include key English technical terms in brackets where helpful.'
        : 'Respond clearly and professionally in ENGLISH language.';

    const fullPrompt = `${prompt}\n\nLanguage Instruction:\n${langInstructions}`;

    // 1. Try Direct Google Gemini REST API if an API key is provided
    if (effectiveKey && effectiveKey.length > 0) {
      try {
        const parts: any[] = [{ text: fullPrompt }];

        // Add attachments (images, PDFs, documents, audio)
        if (attachments && attachments.length > 0) {
          for (const att of attachments) {
            if (att.base64 && att.mimeType) {
              parts.push({
                inlineData: {
                  data: att.base64,
                  mimeType: att.mimeType,
                },
              });
            }
          }
        }

        const modelsToTry = modelName && !CANDIDATE_MODELS.includes(modelName)
          ? [modelName, ...CANDIDATE_MODELS]
          : CANDIDATE_MODELS;

        for (const candidate of modelsToTry) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${effectiveKey}`;
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 2048,
                },
              }),
            });

            const data = await response.json();

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
              const text = data.candidates[0].content.parts[0].text;
              return { text, source: 'direct' };
            }

            if (data.error?.code === 404 || data.error?.message?.includes('not found') || data.error?.message?.includes('no longer available')) {
              continue; // Try next candidate model
            }
          } catch (modelErr) {
            continue;
          }
        }
      } catch (directErr: any) {
        console.warn('Direct Gemini call exception:', directErr.message);
      }
    }

    // 2. Cloud AI Fallback via SuprO Server
    try {
      const cloudRes = await fetch(CLOUD_AI_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          type: 'general',
          apiKey: apiKey || undefined,
        }),
      });

      const cloudData = await cloudRes.json();
      if (cloudRes.ok && cloudData.result) {
        return { text: cloudData.result, source: 'cloud_proxy' };
      }

      if (cloudData.error) {
        return { text: '', error: cloudData.error };
      }
    } catch (cloudErr: any) {
      console.warn('Cloud AI proxy error:', cloudErr);
    }

    // 3. Fallback error if both failed
    if (!apiKey || apiKey.trim().length === 0) {
      return {
        text: '',
        error:
          'Please enter your free Google Gemini API key in the AI Hub Settings ⚙️ (get free key at https://aistudio.google.com/app/apikey) to unlock unlimited AI features.',
      };
    }

    return {
      text: '',
      error: 'Could not generate AI response. Please check your internet connection or Gemini API key.',
    };
  },

  /**
   * Test API Key validity
   */
  async testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey || apiKey.trim().length === 0) {
      return { success: false, message: 'Please enter an API Key.' };
    }
    for (const candidate of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with "OK" in 1 word.' }] }],
          }),
        });
        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return { success: true, message: `Gemini API Key is valid and active! 🎉 (${candidate})` };
        }
      } catch (e: any) {
        // Try next
      }
    }
    return { success: false, message: 'Invalid API Key or connection error.' };
  },

  // ─── 1. SUMMARIZE AI TOOLS ───

  async summarizeYouTube(urlOrText: string, apiKey: string, language: string) {
    const prompt = `You are an expert Content & Video Summarizer.
User Input: ${urlOrText}

Instructions:
1. If the input is a YouTube video link or title, identify the topic, key themes, and main discussion points.
2. Provide a structured, engaging summary:
   - 📌 **Main Topic & Context**
   - 🎯 **Key Highlights & Key Takeaways** (3-6 bullet points)
   - 💡 **Actionable Advice / Conclusion**
3. Use clean Markdown formatting.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async summarizeWebpage(urlOrText: string, apiKey: string, language: string) {
    const prompt = `You are an expert Article & Webpage Summarizer.
User Input / Webpage Content: ${urlOrText}

Instructions:
1. Extract the core arguments, facts, figures, and important information.
2. Format as:
   - 📰 **Executive Overview** (2 sentences)
   - 🔑 **Key Points & Highlights** (bulleted)
   - 📊 **Important Data / Dates (if any)**
   - 📝 **Conclusion**
3. Keep it crisp, readable, and highly informative.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async summarizeText(text: string, apiKey: string, language: string, attachments: any[] = []) {
    const prompt = `You are an expert Text Summarizer.
Text to Summarize:
${text}

Instructions:
1. Read the provided text or attached document thoroughly.
2. Provide:
   - 📋 **Summary Overview**
   - 🔍 **Core Takeaways (Bulleted)**
   - ⚡ **Key Quotes or Highlights**
3. Use bold text and clean Markdown for maximum readability.`;
    return this.executePrompt(prompt, apiKey, language, attachments);
  },

  // ─── 2. AGRI & RURAL TOOLS ───

  async analyzeCrop(issue: string, apiKey: string, language: string, attachments: any[] = []) {
    const prompt = `You are a Senior Agricultural Scientist and Crop Doctor (பயிர் மருத்துவர்) specializing in Tamil Nadu agriculture (Paddy/நெல், Sugarcane/கரும்பு, Cotton/பருத்தி, Banana/வாழை, Coconut/தென்னை, Groundnut/வேர்க்கடலை, Tomato/தக்காளி, Chillies/மிளகாய், Maize/மக்காச்சோளம்).

Farmer's Query / Description:
${issue}

Instructions:
1. If an image is attached, carefully analyze leaves, stems, roots, or fruits for pests, fungi, bacteria, viruses, or nutrient deficiencies (Nitrogen, Potassium, Zinc, Boron, etc.).
2. Structure the diagnostic report:
   - 🌾 **பயிர் / நோய் அடையாளம் (Identified Crop Issue / Disease)**
   - 🔍 **அறிகுறிகள் & காரணங்கள் (Symptoms & Causes)**
   - 🌿 **இயற்கை & நாட்டு மருந்து முறைகள் (Organic / Bio-control Solutions - Panchagavya, Neem oil, Trichoderma, etc.)**
   - 🧪 **பரிந்துரைக்கப்படும் மருந்துகள் & அளவு (Recommended Fungicides / Pesticides & Exact Dosage per acre/liter)**
   - 🛡️ **எதிர்கால தடுப்பு முறைகள் (Future Prevention Tips)**
3. Use respectful, encouraging language for rural farmers.`;
    return this.executePrompt(prompt, apiKey, language, attachments);
  },

  async farmingInsights(query: string, apiKey: string, language: string) {
    const prompt = `You are an expert Tamil Nadu Agri Advisor & Market Analyst.
Farmer's Query: ${query}

Instructions:
1. Provide actionable farming advice covering soil health, crop selection, drip irrigation, fertilizer schedule, weather preparation, or mandi selling strategies.
2. Include government subsidy guidance (TNAU, Uzhavan App, PM-KISAN, Crop Insurance) where applicable.
3. Structure with clear bullet points and simple practical tips.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  // ─── 3. GOVT & CITIZEN TOOLS ───

  async eSevaiChat(query: string, apiKey: string, language: string) {
    const prompt = `You are the official "Virtual E-Sevai & Govt Schemes Guide (இ-சேவை வழிகாட்டி)" for Tamil Nadu citizens.
Citizen's Query: ${query}

Instructions:
1. Provide comprehensive guidance for Tamil Nadu Government Services & Schemes:
   - E-Sevai Certificates: Community (ஜாதி சான்றிதழ்), Income (வருமான சான்றிதழ்), Nativity (இருப்பிட சான்றிதழ்), First Graduate (முதல் பட்டதாரி), Legal Heir (வாரிசு சான்றிதழ்), Destitute Widow, Encumbrance (வில்லங்க சான்று), Patta/Chitta transfer (பட்டா/சிட்டா மாறுதல்).
   - Flagship Schemes: Kalaignar Magalir Urimai Thogai (மகளிர் உரிமை தொகை ₹1000), Pudhumai Penn (புதுமைப் பெண்), Tamil Pudhalvan (தமிழ்ப் புதல்வன்), Chief Minister's Comprehensive Health Insurance (CMCHIS), Moovalur Ramamirtham Ammaiyar Scheme, Free bus pass, Farmer subsidies.
2. Structure the response:
   - 🏛️ **திட்டம் / சான்றிதழ் விவரம் (Scheme / Certificate Overview)**
   - 📄 **தேவையான ஆவணங்கள் (Mandatory Documents Required Checklist)**
   - 💻 **விண்ணப்பிக்கும் முறை (Step-by-step Application Guide: Online / E-Sevai Center)**
   - 💰 **அரசு கட்டணம் & கால அளவு (Govt Fee & Processing Time)**
   - 🌐 **அதிகாரப்பூர்வ இணையதளம் (Official Portal: tnesevai.tn.gov.in / tnreginet.gov.in)**`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async legalTranslator(text: string, apiKey: string, language: string) {
    const prompt = `You are a Legal Jargon Simplifier and Tamil-English Legal Translator.
Legal / Official Text to Simplify:
${text}

Instructions:
1. Simplify complex legal phrasing, government orders (G.O.), court notices, sale deeds (கிரய பத்திரம்), lease agreements, or police petitions into everyday plain language.
2. Structure:
   - ⚖️ **எளிய விளக்கம் (Plain Language Meaning)**
   - 📌 **முக்கிய நிபந்தனைகள் / உரிமைகள் (Key Conditions & Rights)**
   - ⚠️ **கவனிக்க வேண்டிய எச்சரிக்கைகள் (Important Warnings / Red Flags)**
   - 📝 **அடுத்த கட்ட நடவடிக்கை (Recommended Next Steps)**`;
    return this.executePrompt(prompt, apiKey, language);
  },

  // ─── 4. EDUCATION & QUIZ TOOLS ───

  async generateAndSaveQuiz(
    topic: string,
    numQuestions: number = 5,
    difficulty: string = 'Medium',
    apiKey: string,
    language: string = 'Tamil',
    attachments: any[] = []
  ): Promise<{ data: any; error?: string }> {
    const prompt = `You are an expert Examiner preparing a competitive test (TNPSC, Banking, SSC, School/College).
Create exactly ${numQuestions} multiple choice questions on the topic: "${topic}".
Difficulty level: ${difficulty}.
${language === 'Tamil' ? 'The questions, options, and explanations MUST be in TAMIL.' : 'The questions, options, and explanations MUST be in ENGLISH.'}

CRITICAL: You MUST respond ONLY with a raw, valid JSON array without any markdown fences, backticks, or extra conversational text.
The JSON array MUST follow this exact schema:
[
  {
    "question": "வினா இங்கே?",
    "options": ["விடை A", "விடை B", "விடை C", "விடை D"],
    "answer": "விடை A",
    "explanation": "விளக்கம் இங்கே..."
  }
]`;

    try {
      const response = await this.executePrompt(prompt, apiKey, language, attachments);
      if (response.error) return { data: null, error: response.error };

      let rawText = response.text.trim();
      // Strip markdown code blocks if returned
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/```/g, '').trim();
      }

      const jsonStart = rawText.indexOf('[');
      const jsonEnd = rawText.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        rawText = rawText.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Generated quiz array is empty.');
      }

      return { data: parsed };
    } catch (e: any) {
      return { data: null, error: 'Quiz parsing failed: ' + e.message };
    }
  },

  async makeNotes(text: string, apiKey: string, language: string, attachments: any[] = []) {
    const prompt = `You are an expert Academic Tutor and Revision Notes Creator.
Topic / Study Material:
${text}

Instructions:
1. Transform the input into structured, memorable revision notes.
2. Structure:
   - 📚 **Chapter / Concept Title**
   - 💡 **Core Concepts & Definitions**
   - 📌 **Key Points & Formulas / Dates to Remember**
   - ❓ **Top 3 Potential Exam Questions with Answers**
3. Use high-impact bold formatting and bullet points.`;
    return this.executePrompt(prompt, apiKey, language, attachments);
  },

  // ─── 5. WORK & CONTENT TOOLS ───

  async craftEmail(context: string, apiKey: string, language: string) {
    const prompt = `You are an expert Executive Email Writer.
Email Requirement / Context: ${context}

Instructions:
1. Write a professional, polite, and effective email with:
   - 📩 **Subject Line (விஷயம்)**: Punchy and clear
   - 👔 **Formal Greeting**
   - 📝 **Body Paragraphs**: Clear purpose, background, and call to action
   - 🤝 **Professional Sign-off**
2. Provide a secondary casual/friendly variation if appropriate.`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async socialMediaGen(topic: string, apiKey: string, language: string) {
    const prompt = `You are a Viral Social Media Marketing Specialist in Tamil Nadu.
Topic / Product: ${topic}

Instructions:
1. Create 2 high-converting social media posts (Instagram Reel / Facebook / LinkedIn / WhatsApp):
   - 🎯 **Catchy Hook Line** (உடனடி கவனம் ஈர்க்கும் தலைப்பு)
   - 📱 **Engaging Caption Body with Emojis**
   - 🏷️ **15 Trending Hashtags** (mix of Tamil & English: #TamilNadu, #Trending, etc.)
   - 💡 **Best Time to Post & Visual Idea**`;
    return this.executePrompt(prompt, apiKey, language);
  },

  async improveResume(text: string, apiKey: string, language: string) {
    const prompt = `You are a Senior Technical Recruiter and Career Coach.
Resume Bullet Points / Experience:
${text}

Instructions:
1. Rewrite the resume content using strong action verbs (Led, Architected, Spearheaded, Optimized, Delivered) and measurable metrics (%, ₹, time saved).
2. Format as:
   - ✨ **Polished Impact Bullets (ATS-Optimized)**
   - 🔑 **Recommended Keywords & Skills to Highlight**
   - 💡 **Summary Statement for Top of Resume**`;
    return this.executePrompt(prompt, apiKey, language);
  },

  // ─── 6. VIRAL & STATUSO TOOLS ───

  async statusQuoteGen(topic: string, mood: string = 'Inspirational', apiKey: string) {
    const prompt = `You are a creative writer specializing in highly viral WhatsApp status quotes in Tamil Nadu.
Topic: ${topic}
Mood: ${mood}

Instructions:
1. Generate exactly ONE powerful, memorable, punchy 1-2 line quote in Tamil (or Tanglish if cinema/mass style).
2. DO NOT include any hashtags, markdown, quotes, or conversational text.
3. Return ONLY the raw quote text.`;
    return this.executePrompt(prompt, apiKey, 'Tamil');
  },

  // ─── 7. VOICE ASSISTANT (KURAL AI) ───

  async processAudioInput(apiKey: string, base64Audio: string, mimeType: string, language: string) {
    const prompt = `You are "Kural AI (குரல் AI)", the voice assistant for the SuprO Tamil Nadu App.
Please listen to the user's spoken audio and answer their question clearly, concisely, and helpfully.`;
    return this.executePrompt(prompt, apiKey, language, [{ base64: base64Audio, mimeType }]);
  },
};
