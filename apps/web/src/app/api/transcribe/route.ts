import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!openai) {
      console.warn("OPENAI_API_KEY is not set. Returning mock transcription.");
      // For demonstration, return a mock transcription if no API key is provided
      return NextResponse.json({ text: "Plumber in my area" });
    }

    // Convert the incoming File to a buffer then pass to OpenAI
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // We need to create a File-like object that OpenAI understands
    const audioFile = new File([buffer], 'audio.m4a', { type: 'audio/m4a' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
