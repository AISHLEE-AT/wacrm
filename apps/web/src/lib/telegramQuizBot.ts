/**
 * 🤖 Next.js Server-Side Telegram Daily Quiz Engine
 * 
 * Fetches 10 curated MCQs and posts them to Telegram as native Quiz Polls.
 */

import https from 'https';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7653223353:AAGeFlegMrxK0fN_O1vDiI_XI-4BW5mXJFc';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1002413529391';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gmahjdzqitbomtmdzlfp.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const CURATED_FALLBACK_QUESTIONS = [
  {
    question_uid: 'TNPSC-POL-01-001',
    subject: 'Indian Polity',
    topic: 'Fundamental Rights',
    exam_category: 'TNPSC',
    question_text: 'Which Article of the Indian Constitution is known as the "Heart and Soul of the Constitution" by Dr. B.R. Ambedkar?',
    question_text_ta: 'டாக்டர் பி.ஆர். அம்பேத்கரால் இந்திய அரசியலமைப்பின் "இதயம் மற்றும் ஆன்மா" என்று அழைக்கப்பட்ட சட்டப்பிரிவு எது?',
    options: {
      A: 'Article 14 (Right to Equality)',
      B: 'Article 19 (Right to Freedom)',
      C: 'Article 21 (Right to Life)',
      D: 'Article 32 (Constitutional Remedies)',
    },
    options_ta: {
      A: 'சட்டப்பிரிவு 14 (சமத்துவ உரிமை)',
      B: 'சட்டப்பிரிவு 19 (சுதந்திர உரிமை)',
      C: 'சட்டப்பிரிவு 21 (வாழ்வுரிமை)',
      D: 'சட்டப்பிரிவு 32 (அரசியலமைப்பு தீர்வு)',
    },
    correct_option: 'D',
    explanation: 'Article 32 gives the right to move the Supreme Court for enforcement of Fundamental Rights.',
  },
  {
    question_uid: 'TNPSC-HIS-01-002',
    subject: 'Tamil Nadu History',
    topic: 'Sangam Age & Dynasties',
    exam_category: 'TNPSC',
    question_text: 'Which Chola king built the famous Brihadisvara Temple at Thanjavur?',
    question_text_ta: 'தஞ்சாவூர் பிரகதீஸ்வரர் (பெரிய) கோயிலைக் கட்டிய சோழ மன்னர் யார்?',
    options: {
      A: 'Rajendra Chola I',
      B: 'Rajaraja Chola I',
      C: 'Karikala Chola',
      D: 'Kulottunga Chola I',
    },
    options_ta: {
      A: 'முதலாம் இராஜேந்திர சோழன்',
      B: 'முதலாம் இராஜராஜ சோழன்',
      C: 'கரிகால சோழன்',
      D: 'முதலாம் குலோத்துங்க சோழன்',
    },
    correct_option: 'B',
    explanation: 'Rajaraja Chola I built the magnificent Brihadisvara Temple (Peruvudaiyar Kovil) in 1010 CE.',
  },
  {
    question_uid: 'SCI-PHY-01-003',
    subject: 'General Science',
    topic: 'Optics & Light',
    exam_category: 'ALL',
    question_text: 'What is the phenomenon responsible for the twinkling of stars in the night sky?',
    question_text_ta: 'இரவு வானில் நட்சத்திரங்கள் மின்னுவதற்கு காரணமான நிகழ்வு எது?',
    options: {
      A: 'Atmospheric Refraction',
      B: 'Total Internal Reflection',
      C: 'Diffraction of Light',
      D: 'Scattering of Light',
    },
    options_ta: {
      A: 'வளிமண்டல ஒளிவிலகல்',
      B: 'முழு அக எதிரொளிப்பு',
      C: 'ஒளி விளிம்பு விளைவு',
      D: 'ஒளிச்சிதறல்',
    },
    correct_option: 'A',
    explanation: 'Twinkling of stars is due to atmospheric refraction of starlight passing through layers of varying densities.',
  },
  {
    question_uid: 'TNPSC-GEO-01-004',
    subject: 'Geography',
    topic: 'Rivers of India',
    exam_category: 'TNPSC',
    question_text: 'Which river is famously called the "Dakshin Ganga" (Ganges of the South)?',
    question_text_ta: '"தென் கங்கை" அல்லது "தட்சிண கங்கா" என்று அழைக்கப்படும் நதி எது?',
    options: {
      A: 'Godavari',
      B: 'Cauvery',
      C: 'Krishna',
      D: 'Mahanadi',
    },
    options_ta: {
      A: 'கோதாவரி',
      B: 'காவிரி',
      C: 'கிருஷ்ணா',
      D: 'மகாநதி',
    },
    correct_option: 'A',
    explanation: 'River Godavari is known as Dakshin Ganga because of its large size and extent in Peninsular India.',
  },
  {
    question_uid: 'SCI-BIO-01-005',
    subject: 'Biology',
    topic: 'Human Physiology',
    exam_category: 'NEET_JEE',
    question_text: 'Which organelle is considered the "Powerhouse of the Cell"?',
    question_text_ta: 'செல்லின் "ஆற்றல் மையம்" (Powerhouse) என்று அழைக்கப்படும் நுண்ணுறுப்பு எது?',
    options: {
      A: 'Ribosome',
      B: 'Golgi Apparatus',
      C: 'Mitochondria',
      D: 'Endoplasmic Reticulum',
    },
    options_ta: {
      A: 'ரிபோசோம்',
      B: 'கோல்கி உறுப்பு',
      C: 'மைட்டோகாண்ட்ரியா',
      D: 'எண்டோபிளாச வலைப்பின்னல்',
    },
    correct_option: 'C',
    explanation: 'Mitochondria generate most of the chemical energy needed to power the biochemical reactions through ATP production.',
  },
  {
    question_uid: 'TNPSC-INM-01-006',
    subject: 'Indian National Movement',
    topic: 'Freedom Struggle',
    exam_category: 'TNPSC',
    question_text: 'In which year did the historic Vedaranyam Salt March led by C. Rajagopalachari take place?',
    question_text_ta: 'சி. ராஜகோபாலாச்சாரி தலைமையில் புகழ்பெற்ற வேதாரண்யம் உப்புச் சத்தியாகிரகம் எந்த ஆண்டு நடைபெற்றது?',
    options: {
      A: '1920',
      B: '1930',
      C: '1942',
      D: '1919',
    },
    options_ta: {
      A: '1920',
      B: '1930',
      C: '1942',
      D: '1919',
    },
    correct_option: 'B',
    explanation: 'Rajaji organized the Vedaranyam Salt March from Tiruchirappalli to Vedaranyam in April 1930.',
  },
  {
    question_uid: 'GEN-APT-01-007',
    subject: 'Aptitude & Mental Ability',
    topic: 'Number Series',
    exam_category: 'ALL',
    question_text: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    question_text_ta: 'தொடரின் அடுத்த எண்ணைக் கண்டறிக: 2, 6, 12, 20, 30, ?',
    options: {
      A: '40',
      B: '42',
      C: '44',
      D: '46',
    },
    options_ta: {
      A: '40',
      B: '42',
      C: '44',
      D: '46',
    },
    correct_option: 'B',
    explanation: 'Pattern is n^2 + n (or +4, +6, +8, +10, +12). 30 + 12 = 42 (or 6^2 + 6 = 42).',
  },
  {
    question_uid: 'TNPSC-ECO-01-008',
    subject: 'Indian Economy',
    topic: 'Planning & NITI Aayog',
    exam_category: 'TNPSC',
    question_text: 'When was NITI Aayog established replacing the Planning Commission of India?',
    question_text_ta: 'இந்திய திட்டக்குழுவிற்குப் பதிலாக நிதி ஆயோக் (NITI Aayog) எப்போது தொடங்கப்பட்டது?',
    options: {
      A: '1st January 2014',
      B: '1st January 2015',
      C: '15th August 2014',
      D: '1st April 2015',
    },
    options_ta: {
      A: '1 ஜனவரி 2014',
      B: '1 ஜனவரி 2015',
      C: '15 ஆகஸ்ட் 2014',
      D: '1 ஏப்ரல் 2015',
    },
    correct_option: 'B',
    explanation: 'NITI Aayog (National Institution for Transforming India) was established on January 1, 2015.',
  },
  {
    question_uid: 'SCI-CHE-01-009',
    subject: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    exam_category: 'ALL',
    question_text: 'What is the chemical name of common baking soda?',
    question_text_ta: 'சமையல் சோடாவின் வேதியியல் பெயர் என்ன?',
    options: {
      A: 'Sodium Carbonate',
      B: 'Sodium Bicarbonate',
      C: 'Calcium Hydroxide',
      D: 'Sodium Hydroxide',
    },
    options_ta: {
      A: 'சோடியம் கார்பனேட்',
      B: 'சோடியம் பைகார்பனேட்',
      C: 'கால்சியம் ஹைட்ராக்சைடு',
      D: 'சோடியம் ஹைட்ராக்சைடு',
    },
    correct_option: 'B',
    explanation: 'Baking soda is Sodium Bicarbonate (NaHCO3), while Washing Soda is Sodium Carbonate (Na2CO3).',
  },
  {
    question_uid: 'TNPSC-TAM-01-010',
    subject: 'Tamil Literature',
    topic: 'Thirukkural',
    exam_category: 'TNPSC',
    question_text: 'How many chapters (Athikarams) and total couplets are in Thirukkural?',
    question_text_ta: 'திருக்குறளில் உள்ள அதிகாரங்கள் மற்றும் மொத்த குறட்பாக்கள் எத்தனை?',
    options: {
      A: '133 Chapters, 1330 Couplets',
      B: '120 Chapters, 1200 Couplets',
      C: '100 Chapters, 1000 Couplets',
      D: '150 Chapters, 1500 Couplets',
    },
    options_ta: {
      A: '133 அதிகாரங்கள், 1330 குறள்கள்',
      B: '120 அதிகாரங்கள், 1200 குறள்கள்',
      C: '100 அதிகாரங்கள், 1000 குறள்கள்',
      D: '150 அதிகாரங்கள், 1500 குறள்கள்',
    },
    correct_option: 'A',
    explanation: 'Thirukkural contains 133 Athikarams, each containing 10 couplets, making a total of 1330 couplets across 3 Paals.',
  },
];

export function makeTelegramRequest(method: string, payload: any, tokenOverride?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const token = tokenOverride || TELEGRAM_BOT_TOKEN;
    if (!token) {
      return reject(new Error('TELEGRAM_BOT_TOKEN is not set'));
    }

    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.ok) {
            resolve(json.result);
          } else {
            reject(new Error(`Telegram API Error: ${json.description || 'Unknown error'}`));
          }
        } catch (err: any) {
          reject(new Error(`Failed to parse Telegram response: ${err.message}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

export async function sendTextMessage(chatId: string | number, text: string, parseMode = 'Markdown', tokenOverride?: string) {
  return makeTelegramRequest('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: parseMode,
    disable_web_page_preview: false,
  }, tokenOverride);
}

export async function sendQuizPoll(chatId: string | number, qItem: any, questionIndex: number, totalQuestions: number, tokenOverride?: string) {
  const optionKeys = ['A', 'B', 'C', 'D'];
  const correctId = optionKeys.indexOf(String(qItem.correct_option || 'A').toUpperCase());

  let questionHeader = `Q${questionIndex + 1}/${totalQuestions} • [${qItem.subject || 'General'}]\n`;
  let fullQuestion = questionHeader + (qItem.question_text || '');
  if (fullQuestion.length > 295) {
    fullQuestion = fullQuestion.substring(0, 292) + '...';
  }

  const rawOptions = qItem.options || {};
  const pollOptions = optionKeys.map((key) => {
    let optText = `${key}. ${rawOptions[key] || 'Option ' + key}`;
    if (optText.length > 98) {
      optText = optText.substring(0, 95) + '...';
    }
    return optText;
  });

  let explanationText = qItem.explanation || 'Correct answer verified!';
  if (explanationText.length > 195) {
    explanationText = explanationText.substring(0, 192) + '...';
  }

  const payload = {
    chat_id: chatId,
    question: fullQuestion,
    options: pollOptions,
    type: 'quiz',
    correct_option_id: correctId >= 0 ? correctId : 0,
    is_anonymous: false,
    explanation: explanationText,
  };

  return makeTelegramRequest('sendPoll', payload, tokenOverride);
}

export async function fetchDaily10Questions(category: string = 'ALL') {
  try {
    let query = supabase.from('edu_question_bank').select('*').limit(10);
    if (category && category !== 'ALL') {
      query = query.eq('exam_category', category);
    }
    const { data, error } = await query;
    if (error || !data || data.length < 5) {
      return CURATED_FALLBACK_QUESTIONS.slice(0, 10);
    }
    return data.slice(0, 10);
  } catch (err) {
    return CURATED_FALLBACK_QUESTIONS.slice(0, 10);
  }
}
