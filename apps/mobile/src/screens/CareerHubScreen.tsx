import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Linking,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Briefcase,
  ChevronLeft,
  Sparkles,
  FileText,
  MessageSquare,
  Compass,
  Building2,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Share2,
} from 'lucide-react-native';
import { geminiToolsService } from '../services/geminiToolsService';

const JOB_ALERTS = [
  {
    id: '1',
    title: 'TNPSC Group 4 Recruitment 2026',
    org: 'Tamil Nadu Public Service Commission',
    location: 'Tamil Nadu',
    type: 'Govt Job',
    badgeColor: '#10b981',
    vacancies: '6,244 Posts',
    deadline: 'Apply before 30th Sep',
    url: 'https://www.tnpsc.gov.in',
  },
  {
    id: '2',
    title: 'SBI Junior Associate (Clerk) 2026',
    org: 'State Bank of India',
    location: 'All India',
    type: 'Banking',
    badgeColor: '#3b82f6',
    vacancies: '8,773 Posts',
    deadline: 'Exam Date: Nov 2026',
    url: 'https://sbi.co.in/careers',
  },
  {
    id: '3',
    title: 'Graduate Software Engineer / Trainee',
    org: 'Zoho Corporation',
    location: 'Chennai / Tenkasi',
    type: 'IT Software',
    badgeColor: '#a855f7',
    vacancies: 'Open Hiring',
    deadline: 'Freshers Eligible (0-2 Yrs)',
    url: 'https://www.zoho.com/careers',
  },
  {
    id: '4',
    title: 'SSC CGL Combined Graduate Level',
    org: 'Staff Selection Commission',
    location: 'All India Central Govt',
    type: 'Central Govt',
    badgeColor: '#f59e0b',
    vacancies: '17,727 Posts',
    deadline: 'Tier 1 Upcoming',
    url: 'https://ssc.gov.in',
  },
  {
    id: '5',
    title: 'Junior Flutter & Mobile App Developer',
    org: 'TechCorp Solutions',
    location: 'Hybrid / Remote',
    type: 'Private Job',
    badgeColor: '#06b6d4',
    vacancies: '5 Openings',
    deadline: 'Immediate Joining',
    url: 'https://linkedin.com',
  },
];

const INTERVIEW_QUESTIONS = [
  {
    category: 'HR & Behavioral',
    question: 'Tell me about yourself and why you are the best fit for this role.',
    tip: 'Structure: Present (Current Skills) -> Past (Achievements) -> Future (Why this company fits your goals).',
  },
  {
    category: 'Govt & TNPSC Aptitude',
    question: 'Explain the separation of powers under the Indian Constitution.',
    tip: 'Mention Articles 50 (Directive Principles), Executive, Legislature, and Independent Judiciary.',
  },
  {
    category: 'Technical & Coding',
    question: 'What is the difference between State and Props in React Native / Flutter?',
    tip: 'Props are immutable parameters passed from parent; State is mutable and managed internally by the component.',
  },
  {
    category: 'Banking & Quantitative',
    question: 'How do you calculate Simple vs Compound Interest under quarterly compounding?',
    tip: 'Formula: A = P(1 + r/400)^(4n). Explain with a numerical example.',
  },
];

const ROADMAPS = [
  {
    title: 'Software Developer (Full Stack)',
    duration: '6 Months',
    steps: ['1. HTML/CSS & JavaScript Basics', '2. React Native & Flutter Mobile Apps', '3. Node.js & Supabase Backend', '4. Live Portfolio Projects'],
  },
  {
    title: 'TNPSC Group 1 & 2 Civil Officer',
    duration: '12 Months',
    steps: ['1. Samacheer 6-12th School Books', '2. Indian Polity & Tamil Culture', '3. Current Affairs & Aptitude', '4. TestO Mock Exam Series'],
  },
  {
    title: 'Banking Probationary Officer (PO)',
    duration: '8 Months',
    steps: ['1. Quantitative Aptitude & Reasoning', '2. Banking Awareness & English', '3. Speed Math & Calculation Tricks', '4. Sectional Timed Mock Tests'],
  },
  {
    title: 'AI & Data Science Specialist',
    duration: '9 Months',
    steps: ['1. Python Programming & NumPy', '2. Data Analytics & SQL Database', '3. Machine Learning & Gemini AI Prompts', '4. Real-world AI App Deployment'],
  },
];

export default function CareerHubScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'jobs' | 'resume' | 'interview' | 'roadmaps'>('jobs');

  // AI Resume Builder State
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [skills, setSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateResume = async () => {
    if (!name.trim() || !skills.trim() || !targetRole.trim()) {
      alert('Please fill in your Name, Skills, and Target Role.');
      return;
    }

    setIsGenerating(true);
    setGeneratedResume('');

    const prompt = `Generate a high-impact, professional, ATS-friendly single-page Resume and Professional Summary for:
Name: ${name}
Degree / Education: ${degree || 'Graduate'}
Skills: ${skills}
Target Job Role: ${targetRole}

Format cleanly with:
1. Contact & Header Placeholder
2. Professional Summary (3 strong lines)
3. Core Technical / Domain Skills (bullet points)
4. Key Projects & Experience Highlights
5. Education & Certifications
6. 3 Suggested Interview Talking Points`;

    try {
      const res = await geminiToolsService.executePrompt(prompt);
      setGeneratedResume(res.text || 'Could not generate resume. Please verify Gemini API key.');
    } catch (e: any) {
      setGeneratedResume(`Error generating resume: ${e.message || e}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareResume = () => {
    if (!generatedResume) return;
    Share.share({
      message: generatedResume,
      title: `${name} - Resume`,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Navigation Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.navTitle}>Career & Placement Hub</Text>
            <View style={styles.badge}>
              <Sparkles size={10} color="#10b981" style={{ marginRight: 3 }} />
              <Text style={styles.badgeText}>EduVerse AI</Text>
            </View>
          </View>
          <Text style={styles.navSub}>Job Alerts, AI Resume Builder & Mock Interviews</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'jobs' && styles.tabBtnActive]}
          onPress={() => setActiveTab('jobs')}
        >
          <Briefcase size={14} color={activeTab === 'jobs' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>Job Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'resume' && styles.tabBtnActive]}
          onPress={() => setActiveTab('resume')}
        >
          <FileText size={14} color={activeTab === 'resume' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'resume' && styles.tabTextActive]}>AI Resume</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'interview' && styles.tabBtnActive]}
          onPress={() => setActiveTab('interview')}
        >
          <MessageSquare size={14} color={activeTab === 'interview' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'interview' && styles.tabTextActive]}>Interview Qs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'roadmaps' && styles.tabBtnActive]}
          onPress={() => setActiveTab('roadmaps')}
        >
          <Compass size={14} color={activeTab === 'roadmaps' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
          <Text style={[styles.tabText, activeTab === 'roadmaps' && styles.tabTextActive]}>Roadmaps</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* TAB 1: JOB ALERTS */}
        {activeTab === 'jobs' && (
          <View>
            <Text style={styles.sectionHeader}>Live Govt & Private Job Opportunities</Text>
            {JOB_ALERTS.map(job => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Building2 size={13} color="#94a3b8" style={{ marginRight: 4 }} />
                      <Text style={styles.jobOrg}>{job.org}</Text>
                    </View>
                  </View>
                  <View style={[styles.jobTypeBadge, { backgroundColor: `${job.badgeColor}20`, borderColor: `${job.badgeColor}50` }]}>
                    <Text style={[styles.jobTypeText, { color: job.badgeColor }]}>{job.type}</Text>
                  </View>
                </View>

                <View style={styles.jobMetaRow}>
                  <View style={styles.jobMetaItem}>
                    <MapPin size={12} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={styles.jobMetaText}>{job.location}</Text>
                  </View>
                  <Text style={styles.jobMetaText}>*</Text>
                  <Text style={[styles.jobMetaText, { color: '#10b981', fontWeight: 'bold' }]}>{job.vacancies}</Text>
                  <Text style={styles.jobMetaText}>*</Text>
                  <Text style={[styles.jobMetaText, { color: '#f59e0b' }]}>{job.deadline}</Text>
                </View>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => Linking.openURL(job.url).catch(() => alert('Could not open portal URL'))}
                >
                  <Text style={styles.applyBtnText}>View Official Notification</Text>
                  <ExternalLink size={14} color="#0a0f1e" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* TAB 2: AI RESUME BUILDER */}
        {activeTab === 'resume' && (
          <View>
            <View style={styles.aiResumeHero}>
              <Sparkles size={20} color="#10b981" style={{ marginBottom: 6 }} />
              <Text style={styles.aiResumeHeroTitle}>AI ATS-Compliant Resume Builder</Text>
              <Text style={styles.aiResumeHeroSub}>
                Enter your background to instantly generate a tailored professional resume and elevator pitch.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                placeholder="e.g. Anandha Kumar"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
                style={styles.inputField}
              />

              <Text style={styles.inputLabel}>Degree / College</Text>
              <TextInput
                placeholder="e.g. B.E Computer Science / B.Sc Physics"
                placeholderTextColor="#64748b"
                value={degree}
                onChangeText={setDegree}
                style={styles.inputField}
              />

              <Text style={styles.inputLabel}>Target Job Role</Text>
              <TextInput
                placeholder="e.g. Mobile Developer / TNPSC Group 2 Aspirant"
                placeholderTextColor="#64748b"
                value={targetRole}
                onChangeText={setTargetRole}
                style={styles.inputField}
              />

              <Text style={styles.inputLabel}>Key Skills & Strengths</Text>
              <TextInput
                placeholder="e.g. React, Flutter, Python, SQL, Tamil Literature, Fast Typing"
                placeholderTextColor="#64748b"
                value={skills}
                onChangeText={setSkills}
                style={[styles.inputField, { height: 70, textAlignVertical: 'top' }]}
                multiline
              />

              <TouchableOpacity
                style={styles.generateBtn}
                disabled={isGenerating}
                onPress={handleGenerateResume}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#0a0f1e" />
                ) : (
                  <>
                    <Sparkles size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
                    <Text style={styles.generateBtnText}>Generate Tailored Resume</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {generatedResume ? (
              <View style={styles.resumeResultCard}>
                <View style={styles.resumeHeaderRow}>
                  <Text style={styles.resumeResultTitle}>Generated Resume Draft</Text>
                  <TouchableOpacity style={styles.shareBtn} onPress={handleShareResume}>
                    <Share2 size={15} color="#10b981" />
                    <Text style={styles.shareBtnText}>Share / Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.resumeText}>{generatedResume}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* TAB 3: MOCK INTERVIEWS */}
        {activeTab === 'interview' && (
          <View>
            <Text style={styles.sectionHeader}>High-Frequency Interview Questions & Strategy</Text>
            {INTERVIEW_QUESTIONS.map((q, idx) => (
              <View key={idx} style={styles.qCard}>
                <View style={styles.qHeader}>
                  <Text style={styles.qCategory}>{q.category}</Text>
                  <Text style={styles.qNumber}>Q{idx + 1}</Text>
                </View>
                <Text style={styles.qText}>{q.question}</Text>
                <View style={styles.qTipBox}>
                  <Text style={styles.qTipTitle}>AI Pro-Tip & Answering Strategy:</Text>
                  <Text style={styles.qTipText}>{q.tip}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: ROADMAPS */}
        {activeTab === 'roadmaps' && (
          <View>
            <Text style={styles.sectionHeader}>Career Learning Roadmaps</Text>
            {ROADMAPS.map((rm, idx) => (
              <View key={idx} style={styles.roadmapCard}>
                <View style={styles.roadmapHeader}>
                  <Text style={styles.roadmapTitle}>{rm.title}</Text>
                  <View style={styles.roadmapDuration}>
                    <Text style={styles.roadmapDurationText}>{rm.duration}</Text>
                  </View>
                </View>
                {rm.steps.map((step, sIdx) => (
                  <View key={sIdx} style={styles.roadmapStepRow}>
                    <CheckCircle2 size={16} color="#10b981" style={{ marginRight: 8 }} />
                    <Text style={styles.roadmapStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabBtnActive: {
    backgroundColor: '#10b981',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0a0f1e',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  jobCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  jobOrg: {
    color: '#94a3b8',
    fontSize: 12,
  },
  jobTypeBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  jobTypeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobMetaText: {
    color: '#64748b',
    fontSize: 12,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  applyBtnText: {
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: 'bold',
  },
  aiResumeHero: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  aiResumeHeroTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiResumeHeroSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  inputField: {
    backgroundColor: '#0a0f1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
  },
  generateBtnText: {
    color: '#0a0f1e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resumeResultCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginTop: 10,
  },
  resumeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  resumeResultTitle: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: 'bold',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shareBtnText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  resumeText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
  qCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  qCategory: {
    color: '#a855f7',
    fontSize: 11,
    fontWeight: 'bold',
  },
  qNumber: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  qText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 10,
  },
  qTipBox: {
    backgroundColor: '#0a0f1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
  },
  qTipTitle: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  qTipText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  roadmapCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  roadmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roadmapTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  roadmapDuration: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roadmapDurationText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roadmapStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roadmapStepText: {
    color: '#cbd5e1',
    fontSize: 13,
  },
});
