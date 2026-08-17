import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, type, apiKey: clientApiKey, base64Audio } = await req.json();
    
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Please provide a Gemini API Key to use this feature.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    let systemPrompt = '';
    if (type === 'translate') {
      systemPrompt = 'You are an expert English to Tamil and Tamil to English translator. Translate the following text naturally and accurately:\n\n';
    } else if (type === 'whatsapp') {
      systemPrompt = 'You are a professional WhatsApp business auto-reply generator. Write a concise, polite, and helpful auto-reply for the following scenario/message:\n\n';
    } else if (type === 'summarize') {
      systemPrompt = 'You are an expert document summarizer. Extract the most important key points from the following text and present them as a bulleted list:\n\n';
    } else if (type === 'market_summary') {
      systemPrompt = 'You are an expert agriculture market analyst for Tamil Nadu. Analyze the following raw market data and write a concise, helpful daily summary for farmers and traders. Highlight major trends, high/low prices, or notable changes:\n\n';
    } else if (type === 'weekly_agro_news') {
      systemPrompt = 'You are an expert Indian Agriculture News Analyst. Based on the following raw government market data, generate a comprehensive "Weekly Agro News Relay". Focus heavily on Tamil Nadu related news and Indian level important updates. Format the output with clear headings, bullet points, and actionable insights for farmers.\n\n';
    } else if (type === 'status_quote') {
      systemPrompt = 'You are a viral Tamil quote generator. The user will provide a topic or keyword. Generate exactly ONE short, punchy, motivational or cinema-style quote in Tamil (with English transliteration if helpful) suitable for a WhatsApp status. Do not include any extra chat or explanations, just the quote.\n\n';
    } else {
      systemPrompt = 'You are Gemini AI, a helpful and knowledgeable assistant built into the SuprO Local Ecosystem platform. Answer the following query clearly and concisely:\n\n';
    }

    let result;
    if (base64Audio) {
      const audioPart = {
        inlineData: {
          data: base64Audio,
          mimeType: "audio/webm",
        },
      };
      // For audio, we might just pass the prompt directly without system prompt if prompt is empty, but we can pass both
      const contentParts: any[] = [audioPart];
      if (prompt) contentParts.push({ text: systemPrompt + prompt });
      else contentParts.push({ text: "Please respond to the audio in Tamil." });
      
      result = await model.generateContent(contentParts);
    } else {
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }
      const fullPrompt = systemPrompt + prompt;
      result = await model.generateContent(fullPrompt);
    }

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI response' }, { status: 500 });
  }
}
