import { GoogleGenerativeAI } from '@google/generative-ai';

export const geminiService = {
  _cachedModels: null,

  async getValidModels(apiKey) {
    if (this._cachedModels) return this._cachedModels;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (response.ok) {
        const data = await response.json();
        const valid = data.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));
        
        // Priority order (most stable/free-tier friendly first)
        const preferences = [
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-flash-latest',
          'gemini-1.5-flash'
        ];
        
        valid.sort((a, b) => {
          const idxA = preferences.indexOf(a);
          const idxB = preferences.indexOf(b);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
        
        this._cachedModels = valid.length > 0 ? valid : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
        return this._cachedModels;
      }
    } catch (e) {
      console.warn("Failed to fetch models dynamically", e);
    }
    // Fallback if network fails
    this._cachedModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
    return this._cachedModels;
  },

  async executeWithFallback(prompt, options = {}) {
    const userApiKey = options.userApiKey || null;
    const attachments = options.attachments || [];
    const apiKey = (userApiKey && userApiKey.trim() !== '') ? userApiKey : process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('No Gemini API Key found. Please add your key in the AI Settings.');
    }

    const modelsToTry = await this.getValidModels(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;

    // Loop through available models and try generating content.
    // If one hits a 429 (Quota Exceeded) or 404, it immediately tries the next one!
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          tools: [{ googleSearch: {} }], // Enable Google Search grounding for up-to-date info
          generationConfig: {
            maxOutputTokens: 8192,
            ...(options?.responseMimeType ? { responseMimeType: options.responseMimeType } : {})
          }
        });
        
        const parts = [prompt];
        if (attachments && attachments.length > 0) {
          attachments.forEach(att => {
            parts.push({
              inlineData: {
                data: att.data,
                mimeType: att.mimeType
              }
            });
          });
        }
        
        const result = await model.generateContent(parts);
        return await result.response;
      } catch (err) {
        console.warn(`Model ${modelName} failed. Retrying... Error: ${err.message}`);
        lastError = err;
      }
    }
    
    throw new Error(`All available AI models failed (Quota Exceeded or Unavailable). Last error: ${lastError?.message}`);
  },

  async askInformationHub(query, language, userApiKey = '') {
    const langInstructions = language === 'Tamil' ? 'Respond ONLY in Tamil language.' : 'Respond ONLY in English language.';
    
    const prompt = `
      You are an expert, highly accurate AI Assistant for THAMIZHAN, a Tamil Nadu Digital platform.
      Provide the best, most structured answer to the following query.
      ${langInstructions}
      Format your response beautifully with Markdown, using bullet points and clear headings.
      
      Query: ${query}
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey });
    return response.text();
  },

  async askESevaiAssistant(query, profile, language, userApiKey = '') {
    const langInstructions = language === 'Tamil' ? 'Respond ONLY in Tamil language.' : 'Respond ONLY in English language.';
    
    const prompt = `
      You are an expert "Virtual E-Sevai & Govt Schemes Assistant" for the Tamil Nadu Digital platform.
      Your goal is to help citizens navigate TN Government schemes and E-Sevai services.
      
      User Profile: ${profile}
      User Query: ${query}
      
      Instructions:
      1. Suggest the most relevant Tamil Nadu Government Schemes for this profile/query.
      2. If they are asking about a specific document (e.g. Patta, Community Certificate, Ration Card), list EXACTLY what documents they need to take to the E-Sevai center.
      3. Keep the tone helpful, clear, and official.
      4. ${langInstructions}
      5. Format using beautiful Markdown with clear headings and bullet points.
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey });
    return response.text();
  },

  async askAgriculturalExpert(query, language, userApiKey = '', attachments = []) {
    const langInstructions = language === 'Tamil' ? 'Respond ONLY in Tamil language.' : 'Respond ONLY in English language.';
    
    const prompt = `
      You are an expert Agricultural Advisor and Botanist specializing in farming, crop diseases, and modern agricultural practices (especially relevant to Indian/Tamil Nadu agriculture).
      Your goal is to help farmers diagnose crop issues, recommend fertilizers/pesticides (preferably organic if applicable), and provide weather/market advice.
      
      User Query: ${query}
      
      Instructions:
      1. If the user provides an image, analyze it closely for any signs of diseases, pests, or nutrient deficiencies.
      2. Provide actionable, practical advice that a rural farmer can implement.
      3. Keep the tone respectful and helpful.
      4. ${langInstructions}
      5. Format using beautiful Markdown with clear headings and bullet points.
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey, attachments });
    return response.text();
  },

  async generateQuiz(sourceText, language, classLevel, userApiKey = '') {
    const langInstructions = language === 'Tamil' ? 'Respond ONLY in Tamil language.' : 'Respond ONLY in English language.';
    
    const prompt = `
      You are an expert Educator AI for THAMIZHAN. 
      Generate a Multiple Choice Quiz (MCQ) based on the following content.
      Target Audience: ${classLevel} students/candidates.
      ${langInstructions}
      
      Requirements:
      1. Generate 5 highly relevant Multiple Choice Questions.
      2. Provide 4 options for each question (A, B, C, D).
      3. At the very end, provide the Answer Key.
      4. Ensure the difficulty matches the ${classLevel} level.
      5. Format using Markdown.

      Source Content:
      ${sourceText}
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey });
    return response.text();
  },

  async generateInteractiveQuiz(topicName, classLevel, language, count = 5, type = 'Multiple Choice', difficulty = 'Medium', context = '', userApiKey = '', attachments = []) {
    const langInstructions = language === 'Tamil' ? 'Translate all questions and options into Tamil.' : 'Keep all text in English.';
    
    let schemaDefinition = '';
    if (type === 'Multiple Choice') {
      schemaDefinition = `
        {
          "question": "What is...?",
          "type": "Multiple Choice",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Because..."
        }`;
    } else if (type === 'Fill in the Blanks' || type === 'One Line Answer') {
      schemaDefinition = `
        {
          "question": "The capital of India is ____.",
          "type": "${type}",
          "correctAnswer": "New Delhi",
          "explanation": "Because..."
        }`;
    } else if (type === 'Mixed') {
      schemaDefinition = `
        {
          "question": "Question text...",
          "type": "Multiple Choice | Fill in the Blanks | One Line Answer",
          "options": ["A", "B", "C", "D"], // ONLY include 'options' array if type is 'Multiple Choice'
          "correctAnswer": "Correct answer string",
          "explanation": "Because..."
        }`;
    }
    
    const contextPrompt = context ? `\n      Custom Instructions: ${context}\n` : '';

    const prompt = `
      You are an expert Educator.
      Generate a quiz for the topic: "${topicName}".
      Target Audience: ${classLevel} students/candidates.
      Difficulty Level: ${difficulty}
      Quiz Type: ${type}
      ${langInstructions}${contextPrompt}
      
      You must respond ONLY with a valid, parsable JSON array of objects. Do not include markdown formatting like \`\`\`json.
      
      Structure per item:
      [${schemaDefinition}
      ]
      
      Requirements:
      1. Generate EXACTLY ${count} highly relevant questions.
      2. No conversational text.
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey, attachments, responseMimeType: "application/json" });
    let text = response.text().trim();
    text = text.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      text = text.substring(startIdx, endIdx + 1);
    }
    
    return text; // Return stringified JSON for the text area
  },

  async generateTopicQuiz(courseTitle, topicName, subtopics, classLevel, language, count = 10, difficulty = 'Medium', customContext = '', userApiKey = '') {
    const subtopicsText = subtopics && subtopics.length > 0 ? ` Ensure full coverage of these subtopics: ${subtopics.join(', ')}.` : '';
    let context = `This quiz is specifically for the topic '${topicName}' which is part of the broader course '${courseTitle}'.${subtopicsText} The questions must directly test the student's knowledge on this specific topic within the context of the course in full coverage. Make sure the questions are highly relevant and match the requested ${difficulty} difficulty level.`;
    if (customContext) {
      context += `\n\nADDITIONAL INSTRUCTOR CONTEXT/REQUIREMENTS: ${customContext}`;
    }
    return this.generateInteractiveQuiz(topicName, classLevel, language, count, 'Multiple Choice', difficulty, context, userApiKey);
  },

  async generateNotes(sourceText, language, classLevel, userApiKey = '', attachments = []) {
    const langInstructions = language === 'Tamil' ? 'Respond ONLY in Tamil language.' : 'Respond ONLY in English language.';
    
    const prompt = `
      You are an expert Educator AI for THAMIZHAN.
      Create highly structured, easy-to-read Study Notes based on the following content.
      Target Audience: ${classLevel} students/candidates.
      ${langInstructions}
      
      Requirements:
      1. Use clear Headings, Subheadings, and Bullet points.
      2. Highlight key terms and important definitions in bold.
      3. Add a "Summary" section at the end.
      4. Ensure the depth matches the ${classLevel} level.
      5. Format using Markdown.

      Source Content:
      ${sourceText}
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey, attachments });
    return response.text();
  },

  async generateCourseSyllabus(topic, classLevel, language, userApiKey = '') {
    const langInstructions = language === 'Tamil' ? 'Translate all Module Titles and Topic Titles into Tamil.' : 'Keep all text in English.';
    
    const prompt = `
      You are an expert EdTech Curriculum Designer.
      Generate a complete, structured Syllabus for the following subject.
      Subject/Exam: ${topic}
      Target Audience: ${classLevel}
      ${langInstructions}
      
      You must respond ONLY with a valid, parsable JSON array of modules. Do not include markdown formatting like \`\`\`json.
      
      Structure:
      [
        {
          "module_title": "Module 1: Introduction",
          "topics": [
            { "title": "Topic 1.1", "content": null, "video_url": null, "pdf_url": null },
            { "title": "Topic 1.2", "content": null, "video_url": null, "pdf_url": null }
          ]
        },
        ...
      ]
      
      Make it highly comprehensive, containing at least 3 modules, with 2-4 topics per module.
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey, responseMimeType: "application/json" });
    let text = response.text().trim();
    // Clean markdown if the AI accidentally adds it
    text = text.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      text = text.substring(startIdx, endIdx + 1);
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini syllabus JSON:", text, e);
      // Attempt aggressive cleanup
      const cleaned = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      try {
        return JSON.parse(cleaned);
      } catch (e2) {
        throw new Error(`Failed to parse AI response. Try again. Error: ${e.message}`);
      }
    }
  },

  async generateMicroContent(courseTopic, microTopic, classLevel, language, userApiKey = '') {
    const langInstructions = language === 'Tamil' ? 'Respond ONLY in Tamil language.' : 'Respond ONLY in English language.';
    
    const prompt = `
      You are an expert Educator.
      Write highly detailed, structured, and easy-to-understand study material for a specific micro-topic.
      
      Broad Course: ${courseTopic}
      Specific Topic to Write About: ${microTopic}
      Target Audience: ${classLevel}
      ${langInstructions}
      
      Requirements:
      1. Write an in-depth lesson using Markdown. The content must be highly detailed and comprehensive, containing at least 1000 words.
      2. Use clear headings, subheadings, and bullet points.
      3. At the very top, add a section called "References & Further Learning" containing 3-5 highly relevant web links or YouTube search queries for students to learn more.
      4. Explain concepts clearly with examples relevant to the target audience.
      5. Add a "Key Takeaways" summary at the end.
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey });
    return response.text();
  },

  async generateCompleteTopicContent(courseTopic, microTopic, classLevel, language, quizCount, quizDifficulty, userApiKey = '') {
    const [content, quizResult] = await Promise.all([
      this.generateMicroContent(courseTopic, microTopic, classLevel, language, userApiKey),
      this.generateTopicQuiz(courseTopic, microTopic, classLevel, language, quizCount, userApiKey)
    ]);
    return { content, ai_quiz: quizResult };
  },

  async generateLetter(aim, toAddress, fromAddress, language, userApiKey = '') {
    const langInstructions = language === 'Tamil' ? 'Write the letter ONLY in Tamil language. Ensure formal and respectful Tamil tone.' : 'Write the letter ONLY in English language. Ensure formal and respectful tone.';
    
    const prompt = `
      You are an expert professional letter writer.
      Your task is to generate a beautifully crafted, formal, and flawless official letter in HTML format.
      
      Details:
      - Core Need / Aim of the Letter: ${aim}
      - To Address: ${toAddress}
      - From Address: ${fromAddress}
      
      Instructions:
      1. Write a complete, ready-to-print letter.
      2. The output MUST be raw HTML (no markdown code blocks like \`\`\`html). Do NOT wrap in markdown backticks.
      3. Use standard official letter formatting using inline CSS. STRICTLY follow this structure:
         <div style="text-align: right; margin-bottom: 20px;">
           <strong>From:</strong><br/>
           [Format the From Address here]<br/>
           Date: [Today's Date]
         </div>
         <div style="text-align: left; margin-bottom: 20px;">
           <strong>To,</strong><br/>
           [Format the To Address here]
         </div>
         <div style="text-align: center; margin-bottom: 20px; font-weight: bold; font-size: 1.1em;">
           Subject: [Write a concise subject here]
         </div>
         <div style="text-align: left; margin-bottom: 15px;">
           Respected Sir/Madam,
         </div>
         <div style="text-align: justify; line-height: 1.6; margin-bottom: 20px; text-indent: 40px;">
           [Write the beautifully crafted body of the letter here, split into proper paragraphs separated by <br><br> or <p> tags]
         </div>
         <div style="text-align: right; margin-top: 40px;">
           Yours faithfully,<br/><br/>
           <strong>[Name from 'From Address']</strong>
         </div>
      4. Do not include <html>, <head>, or <body> tags. Just the content wrapper <div>s.
      5. ${langInstructions}
    `;

    const response = await this.executeWithFallback(prompt, { userApiKey });
    let text = response.text().trim();
    text = text.replace(/^```html/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    return text;
  }
};


