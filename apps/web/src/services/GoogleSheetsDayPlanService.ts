
// Polyfill AsyncStorage for Web
const AsyncStorage = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }
};

import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

export interface DailySubjectTask {
  title: string;
  topic?: string;
  youtubeVideoId?: string;
  channelName?: string;
  summary?: string;
  contentNotes?: string;
  actionOrActivity?: string;
  durationMinutes?: number;
}

export interface GoogleSheetDayPlanItem {
  dayNumber: number;
  courseId: string; // e.g. 'school-std-10', 'school-std-12', 'jr-ias', 'all'
  board?: string; // 'TNSB', 'CBSE', 'ICSE_INTL', 'ALL'
  
  // 1. Official Rule & Guidance Video (ICLE Technology)
  officialGuidanceVideo: {
    title: string;
    youtubeVideoId: string;
    channelName: string;
    summary: string;
    durationMinutes: number;
  };

  // 2. Tamil Daily Task & Video
  tamilTask: DailySubjectTask;

  // 3. English Daily Task & Video
  englishTask: DailySubjectTask;

  // 4. Maths Daily Task & Video
  mathsTask: DailySubjectTask;

  // 5. Science Daily Task & Video (Physics/Chemistry/Biology)
  scienceTask: DailySubjectTask;

  // 6. Social Science Daily Task & Video (History/Geography/Civics/Economics)
  socialScienceTask: DailySubjectTask;

  // 7. Life Skill & Leadership Task
  lifeSkillTask: {
    title: string;
    description: string;
    actionPrompt?: string;
  };

  // 8. Daily Homework & Practice Task
  homeworkTask: {
    title: string;
    description: string;
    questions?: string[];
  };

  // 9. Physical Fitness, Exercise & Yoga Video
  exercisePhysicVideo: {
    title: string;
    youtubeVideoId: string;
    asanaOrWorkout: string;
    benefits?: string[];
    durationMinutes: number;
  };

  // 10. Daily Current Affairs & GK Video (Common to All Users)
  currentAffairsGkVideo: {
    title: string;
    youtubeVideoId: string;
    keyPoints?: string[];
    durationMinutes: number;
  };

  // 11. Daily MCQ Assessment Drill
  mcqTest?: {
    testTitle: string;
    questions: Array<{
      id: string;
      question: string;
      options: { A: string; B: string; C: string; D: string };
      correctOption: 'A' | 'B' | 'C' | 'D';
      explanation: string;
    }>;
  };
}

export interface GoogleSheetConfig {
  sheetUrl: string;
  sheetId: string;
  sheetName?: string;
  lastSyncedAt?: string;
  totalDaysParsed?: number;
  coursesFound?: string[];
  autoSyncEnabled?: boolean;
}

const STORAGE_KEYS = {
  CONFIG: 'tuto_google_sheet_config',
  DAY_PLANS: 'tuto_google_sheet_day_plans',
};

// Default ICLE Technology Official Guidance fallback video
export const DEFAULT_ICLE_GUIDANCE_VIDEO = {
  title: 'Official Rule & Daily Learning Guidance — ICLE Technology',
  youtubeVideoId: 'dQw4w9WgXcQ', // Default or replace with actual ICLE channel ID
  channelName: 'ICLE Technology Official',
  summary: 'Follow official daily instructions, complete all micro-tasks and submit video reflections for verified certification.',
  durationMinutes: 10,
};

// Extract YouTube ID from full URL, short URL or raw ID
export function extractYouTubeId(urlOrId?: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : trimmed;
}

// Extract Google Spreadsheet ID from any URL
export function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9-_]{25,60}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export const GoogleSheetsDayPlanService = {
  /**
   * Get saved Google Sheet config
   */
  async getSavedConfig(): Promise<GoogleSheetConfig | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Save Google Sheet config
   */
  async saveConfig(config: GoogleSheetConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('[GoogleSheetsDayPlanService] Error saving config:', e);
    }
  },

  /**
   * Get all cached day plans from local storage
   */
  async getCachedDayPlans(): Promise<Record<string, GoogleSheetDayPlanItem>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.DAY_PLANS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  /**
   * Get day plan for a specific course and day number
   * Key format: `${courseId}_day_${dayNumber}` or `all_day_${dayNumber}`
   */
  async getDayPlan(courseId: string, dayNumber: number): Promise<GoogleSheetDayPlanItem | null> {
    try {
      const all = await this.getCachedDayPlans();
      const specificKey = `${courseId.toLowerCase()}_day_${dayNumber}`;
      if (all[specificKey]) return all[specificKey];

      // Fallback to wildcard 'all' course
      const allKey = `all_day_${dayNumber}`;
      if (all[allKey]) return all[allKey];

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch and parse day plans directly from a Google Sheet
   */
  async syncGoogleSheet(urlOrId: string, sheetName: string = 'Sheet1'): Promise<{
    success: boolean;
    count: number;
    courses: string[];
    error?: string;
  }> {
    try {
      const sheetId = extractSpreadsheetId(urlOrId);
      if (!sheetId) {
        throw new Error('Invalid Google Spreadsheet URL or ID. Please check the link.');
      }

      // Try Google Sheets GViz API (works on public sheets with link sharing enabled)
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        sheetName
      )}`;

      let rows: string[][] = [];
      let headers: string[] = [];

      try {
        const res = await fetch(gvizUrl);
        const text = await res.text();

        // GViz returns /*O_o*/\ngoogle.visualization.Query.setResponse({...});
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          const table = parsed.table;
          headers = table.cols.map((col: any) => (col ? String(col.label || col.id || '').trim() : ''));
          rows = table.rows.map((r: any) =>
            (r.c || []).map((cell: any) => (cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim() : ''))
          );
        }
      } catch (gvizErr) {
        console.warn('[GoogleSheetsDayPlanService] GViz fetch failed, trying CSV export fallback:', gvizErr);
      }

      // Fallback to published CSV if GViz was blocked
      if (rows.length === 0) {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(
          sheetName
        )}`;
        const csvRes = await fetch(csvUrl);
        const csvText = await csvRes.text();
        const parsedCsv = this.parseCsv(csvText);
        if (parsedCsv.length > 0) {
          headers = parsedCsv[0];
          rows = parsedCsv.slice(1);
        }
      }

      if (rows.length === 0) {
        throw new Error(
          'Could not retrieve rows from Google Sheet. Make sure Link Sharing is set to "Anyone with the link can view".'
        );
      }

      // Map rows to structured Day Plans
      const headerMap = this.buildHeaderIndexMap(headers);
      const planStore: Record<string, GoogleSheetDayPlanItem> = {};
      const courseSet = new Set<string>();

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const dayVal = this.getColVal(row, headerMap.day);
        const dayNumber = parseInt(dayVal.replace(/\D/g, ''), 10);
        if (isNaN(dayNumber) || dayNumber <= 0) continue;

        const rawCourseId = this.getColVal(row, headerMap.courseId) || 'all';
        const courseId = rawCourseId.toLowerCase().trim();
        courseSet.add(courseId);

        const board = this.getColVal(row, headerMap.board) || 'ALL';

        // 1. Official Guidance Video
        const guidanceVidId = extractYouTubeId(this.getColVal(row, headerMap.guidanceVideoId)) || 'dQw4w9WgXcQ';
        const guidanceTitle = this.getColVal(row, headerMap.guidanceTitle) || 'Official Rule & Guidance — ICLE Technology';
        const guidanceSummary = this.getColVal(row, headerMap.guidanceSummary) || 'Follow daily ICLE Technology official guidelines and complete all tasks.';

        // 2. Tamil Task
        const tamilTopic = this.getColVal(row, headerMap.tamilTopic) || `Day ${dayNumber} தமிழ் பாடம்`;
        const tamilVid = extractYouTubeId(this.getColVal(row, headerMap.tamilVideoId));
        const tamilSummary = this.getColVal(row, headerMap.tamilSummary) || 'இன்றைய தமிழ் கருத்து விளக்கம் மற்றும் இலக்கணம்';

        // 3. English Task
        const englishTopic = this.getColVal(row, headerMap.englishTopic) || `Day ${dayNumber} English Grammar & Comprehension`;
        const englishVid = extractYouTubeId(this.getColVal(row, headerMap.englishVideoId));
        const englishSummary = this.getColVal(row, headerMap.englishSummary) || 'Daily English vocabulary, speaking and grammar drill';

        // 4. Maths Task
        const mathsTopic = this.getColVal(row, headerMap.mathsTopic) || `Day ${dayNumber} Mathematics Problem Solving`;
        const mathsVid = extractYouTubeId(this.getColVal(row, headerMap.mathsVideoId));
        const mathsFormula = this.getColVal(row, headerMap.mathsFormula) || 'Key Formula & Worked Step-by-Step Problem';

        // 5. Science Task
        const scienceTopic = this.getColVal(row, headerMap.scienceTopic) || `Day ${dayNumber} Science Practical & Core Concept`;
        const scienceVid = extractYouTubeId(this.getColVal(row, headerMap.scienceVideoId));
        const scienceConcept = this.getColVal(row, headerMap.scienceConcept) || 'Core Scientific Principle, Laws & Diagram';

        // 6. Social Science Task
        const socialTopic = this.getColVal(row, headerMap.socialTopic) || `Day ${dayNumber} Social Science & History Insights`;
        const socialVid = extractYouTubeId(this.getColVal(row, headerMap.socialVideoId));
        const socialFact = this.getColVal(row, headerMap.socialFact) || 'Key Historical Timeline, Map & Constitution Points';

        // 7. Life Skill Task
        const lifeSkillTitle = this.getColVal(row, headerMap.lifeSkillTitle) || 'Daily Leadership, Ethics & Life Skill';
        const lifeSkillDesc = this.getColVal(row, headerMap.lifeSkillDesc) || 'Practical wisdom on focus, time management, and ethical problem solving.';

        // 8. Homework Task
        const hwTitle = this.getColVal(row, headerMap.hwTitle) || `Day ${dayNumber} Homework & Self-Practice Questions`;
        const hwDesc = this.getColVal(row, headerMap.hwDesc) || 'Solve the designated textbook exercise questions and summarize your findings.';

        // 9. Exercise & Yoga Video
        const yogaVid = extractYouTubeId(this.getColVal(row, headerMap.yogaVideoId)) || 'dQw4w9WgXcQ';
        const yogaTitle = this.getColVal(row, headerMap.yogaTitle) || 'Daily Physical Fitness, Yoga & Brain Boosting Routine';
        const yogaAsana = this.getColVal(row, headerMap.yogaAsana) || 'Surya Namaskar & Pranayama Focus Breathing';

        // 10. Current Affairs & GK Video
        const caVid = extractYouTubeId(this.getColVal(row, headerMap.caVideoId)) || 'dQw4w9WgXcQ';
        const caTitle = this.getColVal(row, headerMap.caTitle) || 'Daily Current Affairs & All-India General Knowledge';

        const item: GoogleSheetDayPlanItem = {
          dayNumber,
          courseId,
          board,
          officialGuidanceVideo: {
            title: guidanceTitle,
            youtubeVideoId: guidanceVidId,
            channelName: 'ICLE Technology Official',
            summary: guidanceSummary,
            durationMinutes: 10,
          },
          tamilTask: {
            title: tamilTopic,
            topic: tamilTopic,
            youtubeVideoId: tamilVid,
            channelName: 'SuprO Tamil Masterclass',
            summary: tamilSummary,
            durationMinutes: 15,
          },
          englishTask: {
            title: englishTopic,
            topic: englishTopic,
            youtubeVideoId: englishVid,
            channelName: 'SuprO English Academy',
            summary: englishSummary,
            durationMinutes: 15,
          },
          mathsTask: {
            title: mathsTopic,
            topic: mathsTopic,
            youtubeVideoId: mathsVid,
            channelName: 'SuprO Maths Lab',
            summary: mathsFormula,
            durationMinutes: 20,
          },
          scienceTask: {
            title: scienceTopic,
            topic: scienceTopic,
            youtubeVideoId: scienceVid,
            channelName: 'SuprO Science Discovery',
            summary: scienceConcept,
            durationMinutes: 20,
          },
          socialScienceTask: {
            title: socialTopic,
            topic: socialTopic,
            youtubeVideoId: socialVid,
            channelName: 'SuprO Civics & History',
            summary: socialFact,
            durationMinutes: 15,
          },
          lifeSkillTask: {
            title: lifeSkillTitle,
            description: lifeSkillDesc,
            actionPrompt: 'Write 2 lines of personal takeaway on how to apply this skill today.',
          },
          homeworkTask: {
            title: hwTitle,
            description: hwDesc,
            questions: [
              `Question 1 on ${mathsTopic}`,
              `Question 2 on ${scienceTopic}`,
              `Short reflection on ${tamilTopic}`,
            ],
          },
          exercisePhysicVideo: {
            title: yogaTitle,
            youtubeVideoId: yogaVid,
            asanaOrWorkout: yogaAsana,
            benefits: ['Increases mental clarity & stamina', 'Reduces exam anxiety & fatigue', 'Sharpens neural memory'],
            durationMinutes: 10,
          },
          currentAffairsGkVideo: {
            title: caTitle,
            youtubeVideoId: caVid,
            keyPoints: ['National & Tamil Nadu Key Schemes', 'Science & Defense Milestones', 'Supreme Court & Civics Updates'],
            durationMinutes: 10,
          },
        };

        const storeKey = `${courseId}_day_${dayNumber}`;
        planStore[storeKey] = item;
      }

      const totalParsed = Object.keys(planStore).length;
      if (totalParsed === 0) {
        throw new Error('No valid day records found. Please ensure row numbers are present in the "Day" column.');
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.DAY_PLANS, JSON.stringify(planStore));

      // Save Config
      const config: GoogleSheetConfig = {
        sheetUrl: urlOrId,
        sheetId,
        sheetName,
        lastSyncedAt: new Date().toISOString(),
        totalDaysParsed: totalParsed,
        coursesFound: Array.from(courseSet),
        autoSyncEnabled: true,
      };
      await this.saveConfig(config);

      // Push to Supabase if connected
      try {
        await supabase.from('app_settings').upsert({
          key: 'google_sheet_tuto_plans',
          value: {
            config,
            plansSummary: { count: totalParsed, courses: Array.from(courseSet), syncedAt: new Date().toISOString() },
          },
          updated_at: new Date().toISOString(),
        });
      } catch (sbErr) {
        console.warn('[GoogleSheetsDayPlanService] Supabase sync optional warning:', sbErr);
      }

      return {
        success: true,
        count: totalParsed,
        courses: Array.from(courseSet),
      };
    } catch (err: any) {
      console.error('[GoogleSheetsDayPlanService] Sync error:', err);
      return {
        success: false,
        count: 0,
        courses: [],
        error: err?.message || 'Failed to sync Google Sheet',
      };
    }
  },

  /**
   * Helper: Parse CSV string
   */
  parseCsv(text: string): string[][] {
    const lines = text.split(/\r?\n/);
    const result: string[][] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const row: string[] = [];
      let inQuotes = false;
      let current = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      result.push(row);
    }
    return result;
  },

  /**
   * Helper: Build fuzzy header mapping indices
   */
  buildHeaderIndexMap(headers: string[]): Record<string, number> {
    const map: Record<string, number> = {};
    const norm = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const findMatch = (...aliases: string[]): number => {
      for (const alias of aliases) {
        const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
        const idx = norm.findIndex((h) => h.includes(cleanAlias));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    map.day = findMatch('day', 'daynumber', 'dayno');
    map.courseId = findMatch('courseid', 'course', 'class', 'standard', 'program');
    map.board = findMatch('board', 'curriculum', 'schoolboard');

    // 1. Official Guidance
    map.guidanceVideoId = findMatch('guidancevideoid', 'guidancevideo', 'officiallyoutube', 'icletechnology', 'adminvideo');
    map.guidanceTitle = findMatch('guidancetitle', 'officialsheading', 'adminruletitle');
    map.guidanceSummary = findMatch('guidancesummary', 'adminrulesummary', 'guidancedesc');

    // 2. Tamil
    map.tamilTopic = findMatch('tamiltopic', 'tamiltitle', 'tamil');
    map.tamilVideoId = findMatch('tamilvideoid', 'tamilvideo', 'tamilurl');
    map.tamilSummary = findMatch('tamilsummary', 'tamildesc');

    // 3. English
    map.englishTopic = findMatch('englishtopic', 'englishtitle', 'english');
    map.englishVideoId = findMatch('englishvideoid', 'englishvideo', 'englishurl');
    map.englishSummary = findMatch('englishsummary', 'englishdesc');

    // 4. Maths
    map.mathsTopic = findMatch('mathstopic', 'mathstitle', 'maths', 'math');
    map.mathsVideoId = findMatch('mathsvideoid', 'mathsvideo', 'mathsurl');
    map.mathsFormula = findMatch('mathsformula', 'mathssummary', 'mathsrule');

    // 5. Science
    map.scienceTopic = findMatch('sciencetopic', 'sciencetitle', 'science', 'physics', 'chemistry', 'biology');
    map.scienceVideoId = findMatch('sciencevideoid', 'sciencevideo', 'scienceurl');
    map.scienceConcept = findMatch('scienceconcept', 'sciencesummary', 'sciencedesc');

    // 6. Social Science
    map.socialTopic = findMatch('socialtopic', 'socialtitle', 'socialscience', 'social', 'history', 'civics');
    map.socialVideoId = findMatch('socialvideoid', 'socialvideo', 'socialurl');
    map.socialFact = findMatch('socialfact', 'socialsummary', 'socialdesc');

    // 7. Life Skill
    map.lifeSkillTitle = findMatch('lifeskilltitle', 'lifeskill', 'leadership', 'moral');
    map.lifeSkillDesc = findMatch('lifeskilldesc', 'lifeskillsummary');

    // 8. Homework
    map.hwTitle = findMatch('hwtitle', 'homeworktitle', 'homework', 'assignment');
    map.hwDesc = findMatch('hwdesc', 'homeworkdesc', 'homeworksummary');

    // 9. Yoga / Exercise
    map.yogaVideoId = findMatch('yogavideoid', 'yogavideo', 'exercisevideo', 'physicvideo');
    map.yogaTitle = findMatch('yogatitle', 'exercisetitle', 'yoga', 'physic');
    map.yogaAsana = findMatch('yogaasana', 'asananame', 'workout');

    // 10. Current Affairs
    map.caVideoId = findMatch('cavideoid', 'currentaffairsvideo', 'gkvideo', 'currentaffairs');
    map.caTitle = findMatch('catitle', 'currentaffairstitle', 'gktitle');

    return map;
  },

  getColVal(row: string[], idx: number): string {
    if (idx === -1 || !row[idx]) return '';
    return row[idx].trim();
  },

  /**
   * Helper: Generate CSV template headers for Admin to copy/paste directly to Google Sheet
   */
  getTemplateCsv(): string {
    return [
      'Day',
      'Course_ID',
      'Board',
      'Guidance_Video_ID',
      'Guidance_Title',
      'Guidance_Summary',
      'Tamil_Topic',
      'Tamil_Video_ID',
      'Tamil_Summary',
      'English_Topic',
      'English_Video_ID',
      'English_Summary',
      'Maths_Topic',
      'Maths_Video_ID',
      'Maths_Formula',
      'Science_Topic',
      'Science_Video_ID',
      'Science_Concept',
      'Social_Topic',
      'Social_Video_ID',
      'Social_Fact',
      'Life_Skill_Title',
      'Life_Skill_Desc',
      'Homework_Title',
      'Homework_Desc',
      'Yoga_Video_ID',
      'Yoga_Title',
      'Yoga_Asana',
      'Current_Affairs_Video_ID',
      'Current_Affairs_Title',
    ].join(',');
  },
};
