const fs = require('fs');

const tnpscSubjects = `export const TNPSC_UNIFIED_OFFICIAL_SUBJECTS: SyllabusSubject[] = [
  {
    subjectId: 'tnpsc_tamil',
    subjectName: 'PAPER 1: GENERAL TAMIL',
    icon: '📜',
    color: '#ec4899',
    totalChapters: 3,
    totalMicroTopics: 66,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Part A: Tamil Grammar (இலக்கணம்)',
        description: 'Ezhuthu, Sol, Porul, and Yappu Ilakkanam',
        microTopics: [
          { id: 'tnpsc_t_1', topicTitle: 'எழுத்து இலக்கணம்', subtopic: 'உயிர் எழுத்துகள் (12)', dayNumber: 1, periodNumber: 1, type: 'concept', importance: 'Foundational' },
          { id: 'tnpsc_t_2', topicTitle: 'எழுத்து இலக்கணம்', subtopic: 'மெய் எழுத்துகள் (18)', dayNumber: 1, periodNumber: 2, type: 'concept', importance: 'Foundational' },
          { id: 'tnpsc_t_3', topicTitle: 'எழுத்து இலக்கணம்', subtopic: 'உயிர்மெய் (216)', dayNumber: 1, periodNumber: 3, type: 'concept', importance: 'Foundational' },
          { id: 'tnpsc_t_4', topicTitle: 'எழுத்து இலக்கணம்', subtopic: 'குற்றியலிகரம்', dayNumber: 2, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_5', topicTitle: 'எழுத்து இலக்கணம்', subtopic: 'குற்றியலுகரம்', dayNumber: 2, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_6', topicTitle: 'எழுத்து இலக்கணம்', subtopic: 'ஆய்த எழுத்து', dayNumber: 2, periodNumber: 3, type: 'concept', importance: 'Foundational' },
          
          { id: 'tnpsc_t_7', topicTitle: 'சொல் இலக்கணம்', subtopic: 'பெயர்ச்சொல்', dayNumber: 3, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_8', topicTitle: 'சொல் இலக்கணம்', subtopic: 'வினைச்சொல்', dayNumber: 3, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_9', topicTitle: 'சொல் இலக்கணம்', subtopic: 'இடைச்சொல்', dayNumber: 3, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_10', topicTitle: 'சொல் இலக்கணம்', subtopic: 'உரிச்சொல்', dayNumber: 4, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          
          { id: 'tnpsc_t_11', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'முதல் வேற்றுமை', dayNumber: 4, periodNumber: 2, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_t_12', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'இரண்டாம் வேற்றுமை', dayNumber: 4, periodNumber: 3, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_t_13', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'மூன்றாம் வேற்றுமை', dayNumber: 5, periodNumber: 1, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_t_14', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'நான்காம் வேற்றுமை', dayNumber: 5, periodNumber: 2, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_t_15', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'ஐந்தாம் வேற்றுமை', dayNumber: 5, periodNumber: 3, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_t_16', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'ஆறாம் வேற்றுமை', dayNumber: 6, periodNumber: 1, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_t_17', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'ஏழாம் வேற்றுமை', dayNumber: 6, periodNumber: 2, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_t_18', topicTitle: 'வேற்றுமை உருபுகள்', subtopic: 'எட்டாம் வேற்றுமை', dayNumber: 6, periodNumber: 3, type: 'concept', importance: 'High-Yield' },
          
          { id: 'tnpsc_t_19', topicTitle: 'பொருள் இலக்கணம்: அகத்திணை', subtopic: 'குறிஞ்சி', dayNumber: 7, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_20', topicTitle: 'பொருள் இலக்கணம்: அகத்திணை', subtopic: 'முல்லை', dayNumber: 7, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_21', topicTitle: 'பொருள் இலக்கணம்: அகத்திணை', subtopic: 'மருதம்', dayNumber: 7, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_22', topicTitle: 'பொருள் இலக்கணம்: அகத்திணை', subtopic: 'நெய்தல்', dayNumber: 8, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_23', topicTitle: 'பொருள் இலக்கணம்: அகத்திணை', subtopic: 'பாலை', dayNumber: 8, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_24', topicTitle: 'பொருள் இலக்கணம்: அகத்திணை', subtopic: 'கைக்கிளை', dayNumber: 8, periodNumber: 3, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_t_25', topicTitle: 'பொருள் இலக்கணம்: அகத்திணை', subtopic: 'பெருந்திணை', dayNumber: 9, periodNumber: 1, type: 'memorization', importance: 'Core Standard' },
          
          { id: 'tnpsc_t_26', topicTitle: 'பொருள் இலக்கணம்: புறத்திணை', subtopic: 'வெட்சி', dayNumber: 9, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_27', topicTitle: 'பொருள் இலக்கணம்: புறத்திணை', subtopic: 'கரந்தை', dayNumber: 9, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_28', topicTitle: 'பொருள் இலக்கணம்: புறத்திணை', subtopic: 'வஞ்சி', dayNumber: 10, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_29', topicTitle: 'பொருள் இலக்கணம்: புறத்திணை', subtopic: 'காஞ்சி', dayNumber: 10, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_30', topicTitle: 'பொருள் இலக்கணம்: புறத்திணை', subtopic: 'உழிஞை', dayNumber: 10, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_31', topicTitle: 'பொருள் இலக்கணம்: புறத்திணை', subtopic: 'தும்பை', dayNumber: 11, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_32', topicTitle: 'பொருள் இலக்கணம்: புறத்திணை', subtopic: 'வாகை', dayNumber: 11, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          
          { id: 'tnpsc_t_33', topicTitle: 'யாப்பு இலக்கணம்', subtopic: 'அசை', dayNumber: 11, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_34', topicTitle: 'யாப்பு இலக்கணம்', subtopic: 'சீர்', dayNumber: 12, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_35', topicTitle: 'யாப்பு இலக்கணம்', subtopic: 'தளை', dayNumber: 12, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_36', topicTitle: 'யாப்பு இலக்கணம்', subtopic: 'அடி', dayNumber: 12, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_t_37', topicTitle: 'யாப்பு இலக்கணம்', subtopic: 'தொடை', dayNumber: 13, periodNumber: 1, type: 'concept', importance: 'Core Standard' }
        ]
      },
      {
        chapterNumber: 2,
        chapterTitle: 'Part B: Tamil Literature (இலக்கியம்)',
        description: 'Sangam Literature, Thirukkural, Epics',
        microTopics: [
          { id: 'tnpsc_t_38', topicTitle: 'எட்டுத்தொகை', subtopic: 'நற்றிணை', dayNumber: 13, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_39', topicTitle: 'எட்டுத்தொகை', subtopic: 'குறுந்தொகை', dayNumber: 13, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_40', topicTitle: 'எட்டுத்தொகை', subtopic: 'ஐங்குறுநூறு', dayNumber: 14, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_41', topicTitle: 'எட்டுத்தொகை', subtopic: 'பதிற்றுப்பத்து', dayNumber: 14, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_42', topicTitle: 'எட்டுத்தொகை', subtopic: 'பரிபாடல்', dayNumber: 14, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_43', topicTitle: 'எட்டுத்தொகை', subtopic: 'கலித்தொகை', dayNumber: 15, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_44', topicTitle: 'எட்டுத்தொகை', subtopic: 'அகநானூறு', dayNumber: 15, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_45', topicTitle: 'எட்டுத்தொகை', subtopic: 'புறநானூறு', dayNumber: 15, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          
          { id: 'tnpsc_t_46', topicTitle: 'பத்துப்பாட்டு', subtopic: 'திருமுருகாற்றுப்படை', dayNumber: 16, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_47', topicTitle: 'பத்துப்பாட்டு', subtopic: 'பொருநராற்றுப்படை', dayNumber: 16, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_48', topicTitle: 'பத்துப்பாட்டு', subtopic: 'சிறுபாணாற்றுப்படை', dayNumber: 16, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_49', topicTitle: 'பத்துப்பாட்டு', subtopic: 'பெரும்பாணாற்றுப்படை', dayNumber: 17, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_50', topicTitle: 'பத்துப்பாட்டு', subtopic: 'முல்லைப்பாட்டு', dayNumber: 17, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_51', topicTitle: 'பத்துப்பாட்டு', subtopic: 'மதுரைக்காஞ்சி', dayNumber: 17, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_52', topicTitle: 'பத்துப்பாட்டு', subtopic: 'நெடுநல்வாடை', dayNumber: 18, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_53', topicTitle: 'பத்துப்பாட்டு', subtopic: 'குறிஞ்சிப்பாட்டு', dayNumber: 18, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_54', topicTitle: 'பத்துப்பாட்டு', subtopic: 'பட்டினப்பாலை', dayNumber: 18, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_55', topicTitle: 'பத்துப்பாட்டு', subtopic: 'மலைபடுகடாம்', dayNumber: 19, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          
          { id: 'tnpsc_t_56', topicTitle: 'திருக்குறள்', subtopic: 'அறத்துப்பால்', dayNumber: 19, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_57', topicTitle: 'திருக்குறள்', subtopic: 'பொருட்பால்', dayNumber: 19, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_58', topicTitle: 'திருக்குறள்', subtopic: 'காமத்துப்பால்', dayNumber: 20, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          
          { id: 'tnpsc_t_59', topicTitle: 'காப்பியங்கள்', subtopic: 'சிலப்பதிகாரம்', dayNumber: 20, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_60', topicTitle: 'காப்பியங்கள்', subtopic: 'மணிமேகலை', dayNumber: 20, periodNumber: 3, type: 'memorization', importance: 'High-Yield' }
        ]
      },
      {
        chapterNumber: 3,
        chapterTitle: 'Part C: Tamil Scholars (தமிழ் அறிஞர்கள்)',
        description: 'Biographies and works of important Tamil scholars',
        microTopics: [
          { id: 'tnpsc_t_61', topicTitle: 'தமிழ் அறிஞர்கள்', subtopic: 'பாரதியார்', dayNumber: 21, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_62', topicTitle: 'தமிழ் அறிஞர்கள்', subtopic: 'பாரதிதாசன்', dayNumber: 21, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_63', topicTitle: 'தமிழ் அறிஞர்கள்', subtopic: 'நாமக்கல் கவிஞர்', dayNumber: 21, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_64', topicTitle: 'தமிழ் அறிஞர்கள்', subtopic: 'கண்ணதாசன்', dayNumber: 22, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_t_65', topicTitle: 'தமிழ் அறிஞர்கள்', subtopic: 'வள்ளலார்', dayNumber: 22, periodNumber: 2, type: 'memorization', importance: 'High-Yield' }
        ]
      }
    ]
  },
  {
    subjectId: 'tnpsc_gs',
    subjectName: 'PAPER 2: GENERAL STUDIES',
    icon: '🌍',
    color: '#0284c7',
    totalChapters: 10,
    totalMicroTopics: 48,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Unit 1: General Science',
        description: 'Physics, Chemistry, Biology',
        microTopics: [
          { id: 'tnpsc_gs_1', topicTitle: 'Physics', subtopic: 'Newton\\'s Laws', dayNumber: 1, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_2', topicTitle: 'Physics', subtopic: 'Optics', dayNumber: 1, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_3', topicTitle: 'Physics', subtopic: 'Electricity', dayNumber: 1, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_4', topicTitle: 'Chemistry', subtopic: 'Periodic Table', dayNumber: 2, periodNumber: 1, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_5', topicTitle: 'Chemistry', subtopic: 'Acids', dayNumber: 2, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_6', topicTitle: 'Chemistry', subtopic: 'Bases', dayNumber: 2, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_7', topicTitle: 'Biology', subtopic: 'Nutrition', dayNumber: 3, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_8', topicTitle: 'Biology', subtopic: 'Respiration', dayNumber: 3, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_9', topicTitle: 'Biology', subtopic: 'Circulation', dayNumber: 3, periodNumber: 3, type: 'concept', importance: 'Core Standard' }
        ]
      },
      {
        chapterNumber: 2,
        chapterTitle: 'Unit 2: Current Events',
        description: 'Current Events',
        microTopics: [
          { id: 'tnpsc_gs_10', topicTitle: 'Current Events', subtopic: 'Indian', dayNumber: 4, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_gs_11', topicTitle: 'Current Events', subtopic: 'International', dayNumber: 4, periodNumber: 2, type: 'memorization', importance: 'High-Yield' }
        ]
      },
      {
        chapterNumber: 3,
        chapterTitle: 'Unit 3: Geography',
        description: 'Geography of India',
        microTopics: [
          { id: 'tnpsc_gs_12', topicTitle: 'Geography', subtopic: 'Indian Physical Features', dayNumber: 4, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_13', topicTitle: 'Geography', subtopic: 'Climate', dayNumber: 5, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_14', topicTitle: 'Geography', subtopic: 'Rainfall', dayNumber: 5, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_15', topicTitle: 'Geography', subtopic: 'Rivers', dayNumber: 5, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_gs_16', topicTitle: 'Geography', subtopic: 'Soil Types', dayNumber: 6, periodNumber: 1, type: 'concept', importance: 'Core Standard' }
        ]
      },
      {
        chapterNumber: 4,
        chapterTitle: 'Unit 4: History',
        description: 'History and Culture of India',
        microTopics: [
          { id: 'tnpsc_gs_17', topicTitle: 'Ancient History', subtopic: 'Indus Valley', dayNumber: 6, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_18', topicTitle: 'Ancient History', subtopic: 'Vedic Period', dayNumber: 6, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_19', topicTitle: 'Ancient History', subtopic: 'Mauryas', dayNumber: 7, periodNumber: 1, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_20', topicTitle: 'Ancient History', subtopic: 'Guptas', dayNumber: 7, periodNumber: 2, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_21', topicTitle: 'Medieval History', subtopic: 'Delhi Sultanate', dayNumber: 7, periodNumber: 3, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_22', topicTitle: 'Medieval History', subtopic: 'Mughals', dayNumber: 8, periodNumber: 1, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_23', topicTitle: 'Modern History', subtopic: '1857 Revolt', dayNumber: 8, periodNumber: 2, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_gs_24', topicTitle: 'Modern History', subtopic: 'Congress Formation', dayNumber: 8, periodNumber: 3, type: 'concept', importance: 'High-Yield' }
        ]
      },
      {
        chapterNumber: 5,
        chapterTitle: 'Unit 5: Indian Polity',
        description: 'Indian Constitution',
        microTopics: [
          { id: 'tnpsc_gs_25', topicTitle: 'Indian Polity', subtopic: 'Preamble', dayNumber: 9, periodNumber: 1, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_gs_26', topicTitle: 'Indian Polity', subtopic: 'FR (Fundamental Rights)', dayNumber: 9, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_gs_27', topicTitle: 'Indian Polity', subtopic: 'DPSP', dayNumber: 9, periodNumber: 3, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_gs_28', topicTitle: 'Indian Polity', subtopic: 'Parliament', dayNumber: 10, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_29', topicTitle: 'Indian Polity', subtopic: 'Judiciary', dayNumber: 10, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_30', topicTitle: 'Indian Polity', subtopic: 'Amendments', dayNumber: 10, periodNumber: 3, type: 'memorization', importance: 'High-Yield' }
        ]
      },
      {
        chapterNumber: 6,
        chapterTitle: 'Unit 6: Indian Economy',
        description: 'Economy',
        microTopics: [
          { id: 'tnpsc_gs_31', topicTitle: 'Indian Economy', subtopic: 'Five Year Plans', dayNumber: 11, periodNumber: 1, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_32', topicTitle: 'Indian Economy', subtopic: 'NITI Aayog', dayNumber: 11, periodNumber: 2, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_33', topicTitle: 'Indian Economy', subtopic: 'GST', dayNumber: 11, periodNumber: 3, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_gs_34', topicTitle: 'Indian Economy', subtopic: 'Banking', dayNumber: 12, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_35', topicTitle: 'Indian Economy', subtopic: 'Budget', dayNumber: 12, periodNumber: 2, type: 'concept', importance: 'Core Standard' }
        ]
      },
      {
        chapterNumber: 7,
        chapterTitle: 'Unit 7: Indian National Movement',
        description: 'INM',
        microTopics: [
          { id: 'tnpsc_gs_36', topicTitle: 'INM', subtopic: 'Early Phase', dayNumber: 12, periodNumber: 3, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_37', topicTitle: 'INM', subtopic: 'Moderate Phase', dayNumber: 13, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_38', topicTitle: 'INM', subtopic: 'Extremist Phase', dayNumber: 13, periodNumber: 2, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_gs_39', topicTitle: 'INM', subtopic: 'Salt Satyagraha', dayNumber: 13, periodNumber: 3, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_gs_40', topicTitle: 'INM', subtopic: 'Quit India', dayNumber: 14, periodNumber: 1, type: 'concept', importance: 'High-Yield' }
        ]
      },
      {
        chapterNumber: 8,
        chapterTitle: 'Unit 8: Tamil Nadu Heritage',
        description: 'History, Culture, Heritage and Socio-Political Movements in TN',
        microTopics: [
          { id: 'tnpsc_gs_41', topicTitle: 'Tamil Nadu Heritage', subtopic: 'Sangam Age', dayNumber: 14, periodNumber: 2, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_gs_42', topicTitle: 'Tamil Nadu Heritage', subtopic: 'Pallava', dayNumber: 14, periodNumber: 3, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_43', topicTitle: 'Tamil Nadu Heritage', subtopic: 'Chola', dayNumber: 15, periodNumber: 1, type: 'memorization', importance: 'High-Yield' },
          { id: 'tnpsc_gs_44', topicTitle: 'Tamil Nadu Heritage', subtopic: 'Pandya', dayNumber: 15, periodNumber: 2, type: 'memorization', importance: 'Core Standard' },
          { id: 'tnpsc_gs_45', topicTitle: 'Tamil Nadu Heritage', subtopic: 'Social Reformers', dayNumber: 15, periodNumber: 3, type: 'concept', importance: 'High-Yield' }
        ]
      },
      {
        chapterNumber: 9,
        chapterTitle: 'Unit 9: Development Administration',
        description: 'Development Administration in Tamil Nadu',
        microTopics: [
          { id: 'tnpsc_gs_46', topicTitle: 'Development Admin', subtopic: 'e-Governance', dayNumber: 16, periodNumber: 1, type: 'concept', importance: 'Core Standard' },
          { id: 'tnpsc_gs_47', topicTitle: 'Development Admin', subtopic: 'HDI', dayNumber: 16, periodNumber: 2, type: 'concept', importance: 'High-Yield' },
          { id: 'tnpsc_gs_48', topicTitle: 'Development Admin', subtopic: 'Smart Cities', dayNumber: 16, periodNumber: 3, type: 'concept', importance: 'Core Standard' }
        ]
      },
      {
        chapterNumber: 10,
        chapterTitle: 'Unit 10: Aptitude',
        description: 'Aptitude and Mental Ability',
        microTopics: [
          { id: 'tnpsc_gs_49', topicTitle: 'Aptitude', subtopic: 'Number System', dayNumber: 17, periodNumber: 1, type: 'solved_problem', importance: 'High-Yield' },
          { id: 'tnpsc_gs_50', topicTitle: 'Aptitude', subtopic: 'Percentage', dayNumber: 17, periodNumber: 2, type: 'solved_problem', importance: 'High-Yield' },
          { id: 'tnpsc_gs_51', topicTitle: 'Aptitude', subtopic: 'Profit', dayNumber: 17, periodNumber: 3, type: 'solved_problem', importance: 'High-Yield' },
          { id: 'tnpsc_gs_52', topicTitle: 'Aptitude', subtopic: 'Loss', dayNumber: 18, periodNumber: 1, type: 'solved_problem', importance: 'High-Yield' },
          { id: 'tnpsc_gs_53', topicTitle: 'Aptitude', subtopic: 'Time & Work', dayNumber: 18, periodNumber: 2, type: 'solved_problem', importance: 'High-Yield' },
          { id: 'tnpsc_gs_54', topicTitle: 'Aptitude', subtopic: 'Time & Distance', dayNumber: 18, periodNumber: 3, type: 'solved_problem', importance: 'High-Yield' }
        ]
      }
    ]
  }
];`;

const filePath = 'D:/w/apps/web/src/data/curriculum/officialExhaustiveSyllabi.ts';
let fileContent = fs.readFileSync(filePath, 'utf-8');

const regex = /export const TNPSC_UNIFIED_OFFICIAL_SUBJECTS:\s*SyllabusSubject\[\] = \[\s*\{[\s\S]*?\];/m;

if (regex.test(fileContent)) {
    fileContent = fileContent.replace(regex, tnpscSubjects);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log("Successfully replaced TNPSC_UNIFIED_OFFICIAL_SUBJECTS array.");
} else {
    console.log("Regex did not match.");
}
