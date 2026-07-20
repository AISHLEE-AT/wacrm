const API_URL = process.env.NEXT_PUBLIC_CUSTOM_AI_API_URL || 'https://aishlee.vercel.app';

export const customAiService = {
  async executeCustomChat(prompt, system_prompt, model = 'meta-llama/Llama-3.1-8B-Instruct') {
    try {
      const response = await fetch(`${API_URL}/custom-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          system_prompt,
          model
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data.reply;
    } catch (e) {
      console.error("Custom AI Service Error:", e);
      throw new Error(`Custom AI Request Failed: ${e.message}`);
    }
  },

  async generateInteractiveQuiz(topicName, classLevel, language, count = 5, type = 'Multiple Choice', difficulty = 'Medium', context = '', model = 'meta-llama/Llama-3.1-8B-Instruct') {
    const langInstructions = language === 'Tamil' ? 'Translate all questions and options into Tamil.' : 'Keep all text in English.';
    
    let schemaDefinition = `
        {
          "question": "What is...?",
          "type": "Multiple Choice",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Because..."
        }`;

    const contextPrompt = context ? `\nCustom Instructions: ${context}\n` : '';

    const systemPrompt = `You are an expert Educator AI for THAMIZHAN. Your ONLY goal is to output a valid JSON array matching the exact requested schema. Do NOT include markdown code blocks, do NOT include conversational text, just the raw JSON array.`;

    const prompt = `
Generate a quiz for the topic: "${topicName}".
Target Audience: ${classLevel} students/candidates.
Difficulty Level: ${difficulty}
Quiz Type: ${type}
${langInstructions}${contextPrompt}

Structure per item:
[${schemaDefinition}
]

Requirements:
1. Generate EXACTLY ${count} highly relevant questions.
2. No conversational text. Output ONLY the JSON array.
    `;

    const text = await this.executeCustomChat(prompt, systemPrompt, model);
    return this.extractJSON(text);
  },

  async generateTopicQuiz(courseTitle, topicName, subtopics, classLevel, language, count = 10, difficulty = 'Medium', customContext = '', model = 'meta-llama/Llama-3.1-8B-Instruct') {
    const subtopicsText = subtopics && subtopics.length > 0 ? ` Ensure full coverage of these subtopics: ${subtopics.join(', ')}.` : '';
    let context = `This quiz is specifically for the topic '${topicName}' which is part of the broader course '${courseTitle}'.${subtopicsText} The questions must directly test the student's knowledge on this specific topic within the context of the course in full coverage. Make sure the questions are highly relevant and match the requested ${difficulty} difficulty level.`;
    
    if (customContext) {
      context += `\n\nADDITIONAL INSTRUCTOR CONTEXT/REQUIREMENTS: ${customContext}`;
    }
    
    return this.generateInteractiveQuiz(topicName, classLevel, language, count, 'Multiple Choice', difficulty, context, model);
  },

  extractJSON(text) {
    let cleanedText = text.trim();
    // Clean markdown if the AI accidentally adds it
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    
    // Find the first '[' and last ']' to extract just the array
    const startIdx = cleanedText.indexOf('[');
    const endIdx = cleanedText.lastIndexOf(']');
    
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleanedText = cleanedText.substring(startIdx, endIdx + 1);
    } else {
      // Fallback: If it generated objects without an array wrapper, try to wrap them
      const objStart = cleanedText.indexOf('{');
      const objEnd = cleanedText.lastIndexOf('}');
      if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
        cleanedText = "[" + cleanedText.substring(objStart, objEnd + 1) + "]";
      }
    }
    
    // Fix trailing commas which trip up JSON.parse
    cleanedText = cleanedText.replace(/,\s*\]/g, ']');
    cleanedText = cleanedText.replace(/,\s*\}/g, '}');

    // Try parsing as-is first
    try {
      JSON.parse(cleanedText);
      return cleanedText;
    } catch (e) {
      // Continue with repair
    }

    // Repair pass 1: Fix unescaped control characters inside strings
    cleanedText = cleanedText.replace(/[\x00-\x1F\x7F]/g, (match) => {
      if (match === '\n' || match === '\r' || match === '\t') return match === '\t' ? '\\t' : '\\n';
      return '';
    });

    // Repair pass 2: Fix unescaped newlines inside JSON string values
    // Replace actual newlines that are inside strings with \\n
    cleanedText = cleanedText.replace(/"([^"]*)"/g, (match) => {
      return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    });

    try {
      JSON.parse(cleanedText);
      return cleanedText;
    } catch (e) {
      // Continue with more aggressive repair
    }

    // Repair pass 3: Fix unescaped double quotes inside string values
    // Strategy: Walk through character by character and escape problematic quotes
    try {
      let repaired = '';
      let inString = false;
      let prevChar = '';
      
      for (let i = 0; i < cleanedText.length; i++) {
        const ch = cleanedText[i];
        
        if (ch === '"' && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            repaired += ch;
          } else {
            // Look ahead to see if this quote ends the string value
            // A valid end-quote is followed by: , } ] : or whitespace then one of those
            const remaining = cleanedText.substring(i + 1).trimStart();
            const nextMeaningful = remaining[0];
            if (nextMeaningful === ',' || nextMeaningful === '}' || nextMeaningful === ']' || nextMeaningful === ':' || nextMeaningful === undefined) {
              inString = false;
              repaired += ch;
            } else {
              // This is an unescaped quote inside a string — escape it
              repaired += '\\"';
            }
          }
        } else {
          repaired += ch;
        }
        prevChar = ch;
      }
      cleanedText = repaired;
    } catch (e) {
      // If repair walk fails, continue with what we have
    }

    // Retry trailing comma cleanup after repairs
    cleanedText = cleanedText.replace(/,\s*\]/g, ']');
    cleanedText = cleanedText.replace(/,\s*\}/g, '}');

    try {
      JSON.parse(cleanedText);
      return cleanedText;
    } catch (e) {
      // Continue with truncation repair
    }

    // Repair pass 4: Handle truncated JSON (model ran out of tokens)
    // Count open/close brackets and braces to see if we need to close them
    try {
      let braceCount = 0;
      let bracketCount = 0;
      let inStr = false;
      let prev = '';
      
      for (let i = 0; i < cleanedText.length; i++) {
        const c = cleanedText[i];
        if (c === '"' && prev !== '\\') inStr = !inStr;
        if (!inStr) {
          if (c === '{') braceCount++;
          if (c === '}') braceCount--;
          if (c === '[') bracketCount++;
          if (c === ']') bracketCount--;
        }
        prev = c;
      }
      
      if (braceCount > 0 || bracketCount > 0) {
        // Truncated — try to find the last complete object and close the array
        const lastCompleteObj = cleanedText.lastIndexOf('}');
        if (lastCompleteObj > 0) {
          cleanedText = cleanedText.substring(0, lastCompleteObj + 1);
          // Remove any trailing comma
          cleanedText = cleanedText.replace(/,\s*$/, '');
          // Close remaining brackets
          for (let i = 0; i < bracketCount; i++) cleanedText += ']';
          // Recount braces after truncation
          let newBraceCount = 0;
          let newInStr = false;
          let newPrev = '';
          for (let i = 0; i < cleanedText.length; i++) {
            const c = cleanedText[i];
            if (c === '"' && newPrev !== '\\') newInStr = !newInStr;
            if (!newInStr) {
              if (c === '{') newBraceCount++;
              if (c === '}') newBraceCount--;
            }
            newPrev = c;
          }
          for (let i = 0; i < newBraceCount; i++) {
            // Insert before the last ']'
            const lastBracket = cleanedText.lastIndexOf(']');
            cleanedText = cleanedText.substring(0, lastBracket) + '}' + cleanedText.substring(lastBracket);
          }
        }
      }
    } catch (e) {
      // Ignore repair errors
    }

    cleanedText = cleanedText.replace(/,\s*\]/g, ']');
    cleanedText = cleanedText.replace(/,\s*\}/g, '}');

    return cleanedText;
  }
};
