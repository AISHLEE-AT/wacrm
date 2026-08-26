/**
 * Telegram Quiz Bot helpers — ESM module for Next.js API routes.
 *
 * Mirrors the core helpers from scripts/telegram_daily_quiz_bot.js but lives
 * inside the Next.js app boundary so Turbopack can resolve it.
 */

import { createClient } from "@supabase/supabase-js";

// ─── Curated fallback questions ───
const CURATED_FALLBACK_QUESTIONS = [
  {
    question_uid: "TNPSC-POL-01-001",
    subject: "Indian Polity",
    topic: "Fundamental Rights",
    exam_category: "TNPSC",
    question_text:
      'Which Article of the Indian Constitution is known as the "Heart and Soul of the Constitution" by Dr. B.R. Ambedkar?',
    question_text_ta:
      'டாக்டர் பி.ஆர். அம்பேத்கரால் இந்திய அரசியலமைப்பின் "இதயம் மற்றும் ஆன்மா" என்று அழைக்கப்பட்ட சட்டப்பிரிவு எது?',
    options: {
      A: "Article 14 (Right to Equality)",
      B: "Article 19 (Right to Freedom)",
      C: "Article 21 (Right to Life)",
      D: "Article 32 (Constitutional Remedies)",
    },
    correct_option: "D",
    explanation:
      "Article 32 gives the right to move the Supreme Court for enforcement of Fundamental Rights.",
  },
  {
    question_uid: "TNPSC-HIS-01-002",
    subject: "Tamil Nadu History",
    topic: "Sangam Age & Dynasties",
    exam_category: "TNPSC",
    question_text:
      "Which Chola king built the famous Brihadisvara Temple at Thanjavur?",
    question_text_ta:
      "தஞ்சாவூர் பிரகதீஸ்வரர் (பெரிய) கோயிலைக் கட்டிய சோழ மன்னர் யார்?",
    options: {
      A: "Rajendra Chola I",
      B: "Rajaraja Chola I",
      C: "Karikala Chola",
      D: "Kulottunga Chola I",
    },
    correct_option: "B",
    explanation:
      "Rajaraja Chola I built the magnificent Brihadisvara Temple (Peruvudaiyar Kovil) in 1010 CE.",
  },
  {
    question_uid: "SCI-PHY-01-003",
    subject: "General Science",
    topic: "Optics & Light",
    exam_category: "ALL",
    question_text:
      "What is the phenomenon responsible for the twinkling of stars in the night sky?",
    question_text_ta:
      "இரவு வானில் நட்சத்திரங்கள் மின்னுவதற்கு காரணமான நிகழ்வு எது?",
    options: {
      A: "Atmospheric Refraction",
      B: "Total Internal Reflection",
      C: "Diffraction of Light",
      D: "Scattering of Light",
    },
    correct_option: "A",
    explanation:
      "Twinkling of stars is due to atmospheric refraction of starlight passing through layers of varying densities.",
  },
  {
    question_uid: "TNPSC-GEO-01-004",
    subject: "Geography",
    topic: "Rivers of India",
    exam_category: "TNPSC",
    question_text:
      'Which river is famously called the "Dakshin Ganga" (Ganges of the South)?',
    question_text_ta:
      '"தென் கங்கை" அல்லது "தட்சிண கங்கா" என்று அழைக்கப்படும் நதி எது?',
    options: {
      A: "Godavari",
      B: "Cauvery",
      C: "Krishna",
      D: "Mahanadi",
    },
    correct_option: "A",
    explanation:
      "River Godavari is known as Dakshin Ganga because of its large size and extent in Peninsular India.",
  },
  {
    question_uid: "SCI-BIO-01-005",
    subject: "Biology",
    topic: "Human Physiology",
    exam_category: "NEET_JEE",
    question_text:
      'Which organelle is considered the "Powerhouse of the Cell"?',
    question_text_ta:
      'செல்லின் "ஆற்றல் மையம்" (Powerhouse) என்று அழைக்கப்படும் நுண்ணுறுப்பு எது?',
    options: {
      A: "Ribosome",
      B: "Golgi Apparatus",
      C: "Mitochondria",
      D: "Endoplasmic Reticulum",
    },
    correct_option: "C",
    explanation:
      "Mitochondria generate most of the chemical energy needed to power the biochemical reactions through ATP production.",
  },
  {
    question_uid: "TNPSC-INM-01-006",
    subject: "Indian National Movement",
    topic: "Freedom Struggle",
    exam_category: "TNPSC",
    question_text:
      "In which year did the historic Vedaranyam Salt March led by C. Rajagopalachari take place?",
    question_text_ta:
      "சி. ராஜகோபாலாச்சாரி தலைமையில் புகழ்பெற்ற வேதாரண்யம் உப்புச் சத்தியாகிரகம் எந்த ஆண்டு நடைபெற்றது?",
    options: {
      A: "1920",
      B: "1930",
      C: "1942",
      D: "1919",
    },
    correct_option: "B",
    explanation:
      "The Vedaranyam Salt March was organized in 1930 as part of the Salt Satyagraha movement.",
  },
];

// ─── Telegram API helpers ───

async function makeTelegramRequest(
  method: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();
  if (!json.ok) {
    throw new Error(
      `Telegram API Error: ${json.description || "Unknown"} (code ${json.error_code})`
    );
  }
  return json.result;
}

export async function sendTextMessage(
  chatId: string,
  text: string,
  parseMode = "Markdown"
): Promise<unknown> {
  return makeTelegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: false,
  });
}

interface QuestionItem {
  subject?: string;
  question_text?: string;
  options?: Record<string, string>;
  correct_option: string;
  explanation?: string;
  [key: string]: unknown;
}

export async function sendQuizPoll(
  chatId: string,
  qItem: QuestionItem,
  questionIndex: number,
  totalQuestions: number
): Promise<unknown> {
  const optionKeys = ["A", "B", "C", "D"];
  const correctId = optionKeys.indexOf(
    qItem.correct_option.toUpperCase()
  );

  const questionHeader = `Q${questionIndex + 1}/${totalQuestions} • [${qItem.subject || "General"}]\n`;
  let fullQuestion = questionHeader + (qItem.question_text || "");
  if (fullQuestion.length > 295) {
    fullQuestion = fullQuestion.substring(0, 292) + "...";
  }

  const rawOptions = qItem.options || {};
  const pollOptions = optionKeys.map((key) => {
    let optText = `${key}. ${rawOptions[key] || "Option " + key}`;
    if (optText.length > 98) {
      optText = optText.substring(0, 95) + "...";
    }
    return optText;
  });

  let explanationText = qItem.explanation || "Correct answer verified!";
  if (explanationText.length > 195) {
    explanationText = explanationText.substring(0, 192) + "...";
  }

  return makeTelegramRequest("sendPoll", {
    chat_id: chatId,
    question: fullQuestion,
    options: pollOptions,
    type: "quiz",
    correct_option_id: correctId >= 0 ? correctId : 0,
    is_anonymous: false,
    explanation: explanationText,
  });
}

export async function fetchDaily10Questions(
  category = "ALL"
): Promise<QuestionItem[]> {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://gmahjdzqitbomtmdzlfp.supabase.co";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE";

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from("edu_question_bank").select("*").limit(10);
    if (category && category !== "ALL") {
      query = query.eq("exam_category", category);
    }

    const { data, error } = await query;
    if (error || !data || data.length < 5) {
      return CURATED_FALLBACK_QUESTIONS.slice(0, 10) as QuestionItem[];
    }

    return data.slice(0, 10) as QuestionItem[];
  } catch {
    return CURATED_FALLBACK_QUESTIONS.slice(0, 10) as QuestionItem[];
  }
}
