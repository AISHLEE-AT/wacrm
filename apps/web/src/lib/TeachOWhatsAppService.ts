export interface WhatsAppDayPlanAlertPayload {
  studentPhone: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
  courseBadge?: string;
  currentDay: number;
  totalDays: number;
  tasks: Array<{
    title: string;
    rawSubject?: string;
    rawTopic?: string;
    duration?: string;
  }>;
  streak?: number;
  xp?: number;
}

export class TeachOWhatsAppService {
  /**
   * Format and send daily syllabus routine & active session alert to student WhatsApp
   */
  static formatDayPlanMessage(payload: WhatsAppDayPlanAlertPayload): string {
    const {
      studentName,
      courseTitle,
      currentDay,
      totalDays,
      tasks,
      streak = 1,
      xp = 50,
    } = payload;

    const taskLines = tasks
      .map((t, idx) => {
        const stepNum = idx + 1;
        const subj = t.rawSubject ? `[${t.rawSubject}] ` : '';
        const dur = t.duration ? ` (${t.duration})` : ' (20 Min)';
        return `  ${stepNum}️⃣ ${subj}${t.title}${dur}`;
      })
      .join('\n');

    return (
      `🔔 *SuprO TeachO • Daily Study Alert* 🔔\n\n` +
      `வணக்கம் / Hello *${studentName}*! 👋\n` +
      `Your active learning session for *${courseTitle}* is ready!\n\n` +
      `📅 *Today's Milestone:* Day ${currentDay} of ${totalDays}\n` +
      `🔥 *Streak:* ${streak} Days | ⭐ *Total XP:* ${xp} XP\n\n` +
      `📋 *Today's 4-Step Learning Routine:*\n` +
      `${taskLines}\n\n` +
      `🤖 *AI Doubt Solver:* Ask any doubt 24/7 in English & Tamil.\n` +
      `📝 *TestO Assessment:* Take your 15-minute concept test to lock in XP.\n\n` +
      `🚀 *Continue Learning:* https://supro.poovisri.com/teacho\n` +
      `_Keep up the momentum and achieve Centum!_ ✨`
    );
  }

  /**
   * Dispatches WhatsApp alert via deep-link or Meta Cloud API
   */
  static async sendDayPlanAlert(payload: WhatsAppDayPlanAlertPayload): Promise<{ success: boolean; message: string }> {
    const cleanPhone = (payload.studentPhone || '6381029380').replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = this.formatDayPlanMessage(payload);

    // Deep link url
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }

    return {
      success: true,
      message: `WhatsApp alert pre-filled for ${payload.studentName} (${formattedPhone})!`,
    };
  }

  /**
   * Sends instant enrollment welcome alert
   */
  static async sendCourseRegistrationWelcome(
    studentPhone: string,
    studentName: string,
    courseTitle: string,
    totalDays: number
  ) {
    const cleanPhone = (studentPhone || '6381029380').replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const text =
      `🎉 *Course Registration Confirmed!* 🎓\n\n` +
      `Hello *${studentName}*,\n` +
      `Welcome to *${courseTitle}* on SuprO TeachO!\n\n` +
      `📅 *Program Duration:* ${totalDays} Structured Daily Steps\n` +
      `⏰ *Daily Study Routine:* 4 micro-lessons (~80 mins/day)\n` +
      `🤖 *AI Tutor & TestO Exam Engine:* Activated for your number.\n\n` +
      `Open your daily routine: https://supro.poovisri.com/teacho\n` +
      `Happy Learning! 🌟`;

    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  }
}
export default TeachOWhatsAppService;
