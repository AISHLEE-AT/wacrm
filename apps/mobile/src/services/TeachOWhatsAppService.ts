import { Linking, Platform, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { CourseOption } from '../data/coursesCatalog';
import { DayPlan } from '../data/curriculum';

export interface WhatsAppAlertOptions {
  studentPhone?: string;
  studentName?: string;
  course: CourseOption;
  currentDay: number;
  totalDays?: number;
  activeDayPlan: DayPlan | null;
  streak?: number;
  xp?: number;
}

export const TeachOWhatsAppService = {
  /**
   * Builds the formatted WhatsApp message text for a course day plan
   */
  formatDayPlanMessage(options: WhatsAppAlertOptions): string {
    const {
      studentName = 'Learner',
      course,
      currentDay,
      totalDays = course.totalDays || 200,
      activeDayPlan,
      streak = 1,
      xp = 50,
    } = options;

    const theme = activeDayPlan?.themeTitle || course.phaseTitle || 'Core Curriculum & High-Yield Revision';
    const tasks = activeDayPlan?.tasks || [];

    let stepsText = '';
    if (tasks.length > 0) {
      stepsText = tasks
        .map((t, idx) => {
          const numEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][idx] || `Step ${idx + 1}:`;
          const subject = t.subject ? `*${t.subject}:* ` : '';
          const duration = t.durationMinutes ? `⏱ ${t.durationMinutes} Min` : '⏱ 20 Min';
          return `${numEmoji} ${subject}${t.topic}\n   └ ${duration} • +20 XP`;
        })
        .join('\n\n');
    } else {
      stepsText = `1️⃣ *Step 1:* Core Concept Foundation (⏱ 20 Min)\n2️⃣ *Step 2:* Deep-Dive Masterclass (⏱ 20 Min)\n3️⃣ *Step 3:* Speed Practice & Quiz (⏱ 20 Min)\n4️⃣ *Step 4:* Exam Summary & Formulas (⏱ 15 Min)`;
    }

    return (
      `🎓 *SuprO TeachO • Daily Study Plan & Progress Alert* 📚\n\n` +
      `👤 *Student:* ${studentName}\n` +
      `🎯 *Enrolled Course:* ${course.title} (${course.badge || 'Tuition'})\n` +
      `📅 *Schedule:* Day ${currentDay} of ${totalDays}\n` +
      `🔥 *Streak:* ${streak} Days | ⭐️ *XP:* ${xp} XP\n` +
      `📖 *Day's Focus:* ${theme}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *TODAY'S MICRO-LESSON STEPS:*\n\n` +
      `${stepsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🤖 *AI Homework Tutor (Tamil & English):*\n` +
      `Ask any doubt for Day ${currentDay} topics with step-by-step guidance.\n\n` +
      `📝 *TestO Chapter Live Quiz:*\n` +
      `Test today's syllabus concepts with instant scoring & certificate.\n\n` +
      `⏰ *Reminder:* Complete today's sessions to keep your active streak alive!`
    );
  },

  /**
   * Dispatches WhatsApp notification via Meta API / Supabase CRM record or direct WhatsApp Intent
   */
  async sendDayPlanAlert(options: WhatsAppAlertOptions): Promise<{ success: boolean; message: string }> {
    const rawPhone = options.studentPhone || '9486335870';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const messageText = this.formatDayPlanMessage(options);

    try {
      // 1. Log or record in Supabase messages table for CRM tracking
      try {
        await supabase.from('messages').insert({
          to_phone: formattedPhone,
          content: messageText,
          status: 'sent',
          type: 'text',
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        // Table might not have direct anon insert, continue gracefully
      }

      // 2. Open WhatsApp directly on phone for immediate preview & delivery
      const encodedMsg = encodeURIComponent(messageText);
      const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMsg}`;
      const webWaUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        await Linking.openURL(waUrl);
      } else {
        await Linking.openURL(webWaUrl);
      }

      return {
        success: true,
        message: `WhatsApp Day Plan alert sent successfully to ${formattedPhone}!`,
      };
    } catch (err: any) {
      console.warn('Error sending TeachO WhatsApp notification:', err);
      return {
        success: false,
        message: err.message || 'Failed to dispatch WhatsApp alert.',
      };
    }
  },

  /**
   * Sends a course registration confirmation on WhatsApp
   */
  async sendCourseRegistrationWelcome(studentPhone: string, studentName: string, course: CourseOption): Promise<boolean> {
    const cleanPhone = studentPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const welcomeText =
      `🎉 *COURSE REGISTRATION CONFIRMED!* 🎓\n\n` +
      `👋 Welcome ${studentName || 'Student'} to *${course.title}* on SuprO TeachO!\n\n` +
      `📅 *Total Curriculum Duration:* ${course.totalDays || 200} Days\n` +
      `📚 *Board / Exam:* ${course.badge || 'Academic Excellence'}\n` +
      `🎯 *Daily Routine:* 4 Bite-Sized Micro-Lessons (60-80 mins/day)\n\n` +
      `🤖 *AI Tutor & TestO Integration:* Active 24/7\n` +
      `🔔 *WhatsApp Daily Alert:* Enabled for active study reminders.\n\n` +
      `*Start Day 1 now and begin your learning journey!*`;

    try {
      const encodedMsg = encodeURIComponent(welcomeText);
      const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMsg}`;
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        await Linking.openURL(waUrl);
      } else {
        await Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodedMsg}`);
      }
      return true;
    } catch (e) {
      return false;
    }
  },
};
export default TeachOWhatsAppService;
