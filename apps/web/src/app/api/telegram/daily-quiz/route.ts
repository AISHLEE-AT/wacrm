import { NextRequest, NextResponse } from 'next/server';
import {
  fetchDaily10Questions,
  sendQuizPoll,
  sendTextMessage,
} from '@/lib/telegramQuizBot';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleTelegramQuizTrigger(req);
}

export async function POST(req: NextRequest) {
  return handleTelegramQuizTrigger(req);
}

async function handleTelegramQuizTrigger(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret') || req.headers.get('x-cron-secret');
  const expectedSecret = process.env.CRON_SECRET || process.env.TELEGRAM_CRON_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  const category = searchParams.get('category') || 'ALL';
  const limitStr = searchParams.get('count') || '10';
  const count = Math.min(Math.max(parseInt(limitStr, 10) || 10, 1), 20);

  const botToken = process.env.TELEGRAM_BOT_TOKEN || '7653223353:AAGeFlegMrxK0fN_O1vDiI_XI-4BW5mXJFc';
  const chatId = process.env.TELEGRAM_CHAT_ID || '-1002413529391';

  try {
    const questions = await fetchDaily10Questions(category);
    const questionsToPost = questions.slice(0, count);

    // 1. Post Intro
    const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
    const introMsg =
      `☀️ *Good Morning Aspirants!* 🎯\n\n` +
      `🔥 *Today's Daily 10 Quiz Challenge is LIVE!* (${todayStr})\n` +
      `📚 Exam Category: *${category === 'ALL' ? 'General Studies & Science' : category}*\n` +
      `⚡ *${questionsToPost.length} High-Yield MCQs* with instant explanations.\n\n` +
      `👇 *Tap your answer below to test your accuracy!* 👇`;

    try {
      await sendTextMessage(chatId, introMsg, 'Markdown', botToken);
    } catch (e: any) {
      console.warn('Could not send intro message:', e?.message);
    }

    // 2. Post Questions
    let successCount = 0;
    for (let i = 0; i < questionsToPost.length; i++) {
      const q = questionsToPost[i];
      try {
        await sendQuizPoll(chatId, q, i, questionsToPost.length, botToken);
        successCount++;
        await new Promise((res) => setTimeout(res, 1800));
      } catch (err: any) {
        console.error(`Error sending poll ${i + 1}:`, err?.message);
      }
    }

    // 3. Post Outro
    if (successCount > 0) {
      const outroMsg =
        `🏆 *Daily Quiz Complete!* 🎉\n\n` +
        `📊 Check your detailed ranking, bookmarks & solutions in the *SuprO App*.\n` +
        `📲 Practice 2,00,000+ topic-wise MCQs with daily streak rewards!\n` +
        `👉 Great work everyone! See you tomorrow at 08:00 AM. 🚀`;

      try {
        await sendTextMessage(chatId, outroMsg, 'Markdown', botToken);
      } catch (e: any) {
        console.warn('Could not send outro message:', e?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully posted ${successCount} quiz polls to Telegram group`,
      totalQuestions: questionsToPost.length,
      successCount,
      category,
      chatId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to broadcast Telegram daily quiz',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
