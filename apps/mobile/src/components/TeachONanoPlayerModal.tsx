import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Award,
  Sparkles,
  Zap,
  Bot,
  Key,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { geminiNanoPlayerEngine, GeneratedNanoLesson } from '../services/geminiNanoPlayerEngine';

interface TeachONanoPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  subject: string;
  topicTitle: string;
  tamilTopicTitle?: string;
  conceptCode?: string;
  keyFormulaOrRule?: string;
  dayNumber?: number;
  stepNumber?: number;
  initialTab?: 'lecture' | 'notes' | 'quiz' | 'tutor';
  onCompleteTask?: (earnedXp: number) => void;
}

export const TeachONanoPlayerModal: React.FC<TeachONanoPlayerModalProps> = ({
  visible,
  onClose,
  courseId,
  courseTitle,
  subject,
  topicTitle,
  tamilTopicTitle,
  conceptCode,
  keyFormulaOrRule,
  dayNumber = 1,
  stepNumber = 1,
  initialTab = 'lecture',
  onCompleteTask,
}) => {
  const insets = useSafeAreaInsets();
  const { geminiApiKey } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState<'lecture' | 'notes' | 'quiz' | 'tutor'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [lessonContent, setLessonContent] = useState<GeneratedNanoLesson | null>(null);

  // Lecture slide stepper
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // Socratic Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  useEffect(() => {
    if (visible && topicTitle) {
      loadContent();
    }
  }, [visible, topicTitle, subject, courseId]);

  useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await geminiNanoPlayerEngine.getOrGenerateNanoContent(
        courseId,
        subject,
        topicTitle,
        tamilTopicTitle,
        conceptCode,
        keyFormulaOrRule,
        geminiApiKey
      );
      setLessonContent(data);
      setCurrentSlideIndex(0);
      setSelectedAnswers({});
      setIsQuizSubmitted(false);
      setChatMessages([
        {
          sender: 'ai',
          text: `வணக்கம்! I am your TutO Socratic AI Tutor for ${topicTitle} (${subject}). Ask me anything about this concept, formulas, or how to solve 2/5-mark exam questions!`,
        },
      ]);
    } catch (e) {
      console.warn('Failed to load nano content:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const updatedHistory = [...chatMessages, { sender: 'user' as const, text: userMsg }];
    setChatMessages(updatedHistory);
    setIsSendingChat(true);

    try {
      const aiReply = await geminiNanoPlayerEngine.askSocraticTutor(
        userMsg,
        topicTitle,
        subject,
        courseTitle,
        geminiApiKey,
        updatedHistory
      );
      setChatMessages([...updatedHistory, { sender: 'ai' as const, text: aiReply }]);
    } catch (e) {
      setChatMessages([
        ...updatedHistory,
        {
          sender: 'ai' as const,
          text: `Great question! In ${topicTitle}, make sure to remember the core formula: ${keyFormulaOrRule || 'standard rule'}.`,
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSelectQuizOption = (questionIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const calculateQuizScore = () => {
    if (!lessonContent?.quizQuestions) return 0;
    let score = 0;
    lessonContent.quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleCompleteAndEarn = () => {
    const earnedXp = 50 + (isQuizSubmitted ? calculateQuizScore() * 15 : 25);
    if (onCompleteTask) {
      onCompleteTask(earnedXp);
    }
    Alert.alert('Task Completed! 🎉', `You mastered ${conceptCode || topicTitle} and earned +${earnedXp} XP!`, [
      { text: 'Awesome', onPress: onClose },
    ]);
  };

  if (!visible) return null;

  const slides = lessonContent?.lectureSlides || [];
  const currentSlide = slides[currentSlideIndex];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={styles.tagRow}>
                {conceptCode && (
                  <View style={styles.codeTag}>
                    <Text style={styles.codeTagText}>{conceptCode}</Text>
                  </View>
                )}
                <View style={styles.subjectTag}>
                  <Text style={styles.subjectTagText}>{subject}</Text>
                </View>
                <View style={styles.keyTag}>
                  <Key size={10} color={geminiApiKey ? '#00D084' : '#F59E0B'} />
                  <Text style={[styles.keyTagText, { color: geminiApiKey ? '#00D084' : '#F59E0B' }]}>
                    {geminiApiKey ? 'Gemini AI Active' : 'Fallback Engine'}
                  </Text>
                </View>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {topicTitle}
              </Text>
              {tamilTopicTitle && (
                <Text style={styles.headerTamilSub} numberOfLines={1}>
                  {tamilTopicTitle}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Player Mode Switcher Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'lecture' && styles.tabBtnActive]}
              onPress={() => setActiveTab('lecture')}
            >
              <Play size={13} color={activeTab === 'lecture' ? '#00D084' : '#94A3B8'} />
              <Text style={[styles.tabBtnText, activeTab === 'lecture' && styles.tabBtnTextActive]}>
                AI Lecture
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'notes' && styles.tabBtnActive]}
              onPress={() => setActiveTab('notes')}
            >
              <FileText size={13} color={activeTab === 'notes' ? '#00D084' : '#94A3B8'} />
              <Text style={[styles.tabBtnText, activeTab === 'notes' && styles.tabBtnTextActive]}>
                Deep Notes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'quiz' && styles.tabBtnActive]}
              onPress={() => setActiveTab('quiz')}
            >
              <Award size={13} color={activeTab === 'quiz' ? '#00D084' : '#94A3B8'} />
              <Text style={[styles.tabBtnText, activeTab === 'quiz' && styles.tabBtnTextActive]}>
                CBT Quiz
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'tutor' && styles.tabBtnActive]}
              onPress={() => setActiveTab('tutor')}
            >
              <Bot size={13} color={activeTab === 'tutor' ? '#00D084' : '#94A3B8'} />
              <Text style={[styles.tabBtnText, activeTab === 'tutor' && styles.tabBtnTextActive]}>
                AI Tutor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content Body */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00D084" />
              <Text style={styles.loadingText}>Generating AI Nano Lesson with Gemini Engine...</Text>
              <Text style={styles.loadingSub}>Synthesizing Tamil explanations, formulas & exam questions</Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {/* TAB 1: AI INTERACTIVE LECTURE */}
              {activeTab === 'lecture' && (
                <View style={styles.lectureContainer}>
                  <ScrollView style={styles.lectureScroll} showsVerticalScrollIndicator={false}>
                    {/* Slide Screen Simulation Card */}
                    <View style={styles.slideCard}>
                      <View style={styles.slideHeader}>
                        <View style={styles.slideStepTag}>
                          <Text style={styles.slideStepTagText}>
                            Slide {currentSlideIndex + 1} of {slides.length || 1}
                          </Text>
                        </View>
                        <Text style={styles.slideSubjectText}>{subject}</Text>
                      </View>

                      <Text style={styles.slideHeading}>{currentSlide?.heading || topicTitle}</Text>
                      {currentSlide?.tamilHeading && (
                        <Text style={styles.slideTamilHeading}>{currentSlide?.tamilHeading}</Text>
                      )}

                      {/* Bullet points */}
                      <View style={styles.slidePointsList}>
                        {(currentSlide?.points || []).map((pt, pIdx) => (
                          <View key={pIdx} style={styles.slidePointRow}>
                            <View style={styles.pointDot} />
                            <Text style={styles.pointText}>{pt}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Formula callout if present */}
                      {(currentSlide?.formulaOrRule || keyFormulaOrRule) && (
                        <View style={styles.slideFormulaBox}>
                          <Text style={styles.formulaLabel}>GOVT NORMS KEY FORMULA / RULE:</Text>
                          <Text style={styles.formulaText}>
                            {currentSlide?.formulaOrRule || keyFormulaOrRule}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Audio Transcript / Teacher Speech Simulation */}
                    <View style={styles.transcriptCard}>
                      <View style={styles.transcriptHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Bot size={15} color="#00D084" />
                          <Text style={styles.transcriptTitle}>AI Teacher Voiceover Simulation</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.playAudioBtn}
                          onPress={() => setIsPlayingAudio(!isPlayingAudio)}
                        >
                          {isPlayingAudio ? (
                            <Pause size={12} color="#070C18" />
                          ) : (
                            <Play size={12} color="#070C18" />
                          )}
                          <Text style={styles.playAudioBtnText}>
                            {isPlayingAudio ? 'Pause Voice' : 'Play Voice'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.transcriptText}>
                        "{currentSlide?.audioScript || lessonContent?.summary}"
                      </Text>
                    </View>
                  </ScrollView>

                  {/* Slide Stepper Controls */}
                  <View style={styles.slideControlsBar}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, currentSlideIndex === 0 && { opacity: 0.5 }]}
                      disabled={currentSlideIndex === 0}
                      onPress={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    >
                      <ChevronLeft size={16} color="#F8FAFC" />
                      <Text style={styles.stepperBtnText}>Previous</Text>
                    </TouchableOpacity>

                    <Text style={styles.slideCountIndicator}>
                      {currentSlideIndex + 1} / {slides.length || 1}
                    </Text>

                    <TouchableOpacity
                      style={[styles.stepperBtn, currentSlideIndex >= slides.length - 1 && { opacity: 0.5 }]}
                      disabled={currentSlideIndex >= slides.length - 1}
                      onPress={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    >
                      <Text style={styles.stepperBtnText}>Next Slide</Text>
                      <ChevronRight size={16} color="#F8FAFC" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB 2: DEEP STUDY NOTES */}
              {activeTab === 'notes' && (
                <ScrollView style={styles.notesScroll} showsVerticalScrollIndicator={false}>
                  {/* Summary Box */}
                  <View style={styles.notesSummaryBox}>
                    <Text style={styles.notesSummaryLabel}>BILINGUAL CONCEPT OVERVIEW</Text>
                    <Text style={styles.notesSummaryText}>{lessonContent?.summary}</Text>
                    {lessonContent?.tamilSummary && (
                      <Text style={styles.notesTamilSummaryText}>{lessonContent?.tamilSummary}</Text>
                    )}
                  </View>

                  {/* Key Formulas Section */}
                  {lessonContent?.keyFormulas && lessonContent.keyFormulas.length > 0 && (
                    <View style={styles.notesSection}>
                      <Text style={styles.sectionTitle}>📐 Key Axioms & Mathematical Formulas</Text>
                      {lessonContent.keyFormulas.map((f, i) => (
                        <View key={i} style={styles.formulaNoteCard}>
                          <Text style={styles.formulaNoteText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Model 2-Mark & 5-Mark Exam Answers */}
                  {lessonContent?.modelQuestions && lessonContent.modelQuestions.length > 0 && (
                    <View style={styles.notesSection}>
                      <Text style={styles.sectionTitle}>🎯 Official Blueprint Model Questions & Answers</Text>
                      {lessonContent.modelQuestions.map((mq, i) => (
                        <View key={i} style={styles.modelQuestionCard}>
                          <View style={styles.modelQHeader}>
                            <View style={styles.qTypeBadge}>
                              <Text style={styles.qTypeBadgeText}>{mq.type}</Text>
                            </View>
                            <Text style={styles.marksBadgeText}>{mq.marks} Marks</Text>
                          </View>
                          <Text style={styles.questionText}>Q: {mq.question}</Text>
                          {mq.tamilQuestion && (
                            <Text style={styles.tamilQuestionText}>வினா: {mq.tamilQuestion}</Text>
                          )}
                          <View style={styles.stepAnswerBox}>
                            <Text style={styles.answerLabel}>Model Step-by-Step Answer:</Text>
                            <Text style={styles.answerText}>{mq.stepByStepAnswer}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={{ height: 30 }} />
                </ScrollView>
              )}

              {/* TAB 3: CBT MICRO-DRILL QUIZ */}
              {activeTab === 'quiz' && (
                <ScrollView style={styles.quizScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.quizHeaderCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Award size={18} color="#00D084" />
                      <Text style={styles.quizHeaderTitle}>Nano Concept Mastery Quiz</Text>
                    </View>
                    <Text style={styles.quizHeaderSub}>
                      Answer all {lessonContent?.quizQuestions?.length || 0} questions to test your retention.
                    </Text>
                  </View>

                  {/* Questions List */}
                  {(lessonContent?.quizQuestions || []).map((q, qIdx) => {
                    const selectedOpt = selectedAnswers[qIdx];
                    const isCorrect = selectedOpt === q.correctIndex;

                    return (
                      <View key={q.id || qIdx} style={styles.quizQuestionCard}>
                        <Text style={styles.quizQNumber}>Question {qIdx + 1}</Text>
                        <Text style={styles.quizQText}>{q.question}</Text>
                        {q.tamilQuestion && (
                          <Text style={styles.quizQTamil}>{q.tamilQuestion}</Text>
                        )}

                        <View style={styles.optionsList}>
                          {q.options.map((opt, oIdx) => {
                            const isChosen = selectedOpt === oIdx;
                            let optStyle = styles.optionBtn;
                            let textStyle = styles.optionBtnText;

                            if (isQuizSubmitted) {
                              if (oIdx === q.correctIndex) {
                                optStyle = [styles.optionBtn, styles.optionCorrect];
                                textStyle = [styles.optionBtnText, styles.optionTextCorrect];
                              } else if (isChosen && !isCorrect) {
                                optStyle = [styles.optionBtn, styles.optionWrong];
                                textStyle = [styles.optionBtnText, styles.optionTextWrong];
                              }
                            } else if (isChosen) {
                              optStyle = [styles.optionBtn, styles.optionChosen];
                              textStyle = [styles.optionBtnText, styles.optionTextChosen];
                            }

                            return (
                              <TouchableOpacity
                                key={oIdx}
                                style={optStyle}
                                disabled={isQuizSubmitted}
                                onPress={() => handleSelectQuizOption(qIdx, oIdx)}
                              >
                                <View style={styles.optionIndexBadge}>
                                  <Text style={styles.optionIndexText}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </Text>
                                </View>
                                <Text style={textStyle}>{opt}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Explanation on submit */}
                        {isQuizSubmitted && (
                          <View style={styles.explanationBox}>
                            <Text style={styles.explanationLabel}>
                              {isCorrect ? '✅ Correct Answer!' : '❌ Explanation & Rationale:'}
                            </Text>
                            <Text style={styles.explanationText}>{q.explanation}</Text>
                            {q.tamilExplanation && (
                              <Text style={styles.explanationTamilText}>{q.tamilExplanation}</Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {/* Submit / Score Button */}
                  {!isQuizSubmitted ? (
                    <TouchableOpacity
                      style={styles.submitQuizBtn}
                      onPress={() => setIsQuizSubmitted(true)}
                    >
                      <Award size={16} color="#070C18" />
                      <Text style={styles.submitQuizBtnText}>Submit & Check Score</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.scoreResultCard}>
                      <Text style={styles.scoreTitle}>
                        Score: {calculateQuizScore()} / {lessonContent?.quizQuestions?.length || 0}
                      </Text>
                      <Text style={styles.scoreSub}>
                        {calculateQuizScore() === lessonContent?.quizQuestions?.length
                          ? '🌟 Outstanding! 100% Concept Mastery!'
                          : 'Great effort! Review the explanations to achieve Centum.'}
                      </Text>
                    </View>
                  )}
                  <View style={{ height: 30 }} />
                </ScrollView>
              )}

              {/* TAB 4: SOCRATIC AI TUTOR */}
              {activeTab === 'tutor' && (
                <View style={styles.tutorContainer}>
                  <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
                    {chatMessages.map((msg, mIdx) => (
                      <View
                        key={mIdx}
                        style={[
                          styles.chatBubble,
                          msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                        ]}
                      >
                        {msg.sender === 'ai' && (
                          <View style={styles.aiAvatarBox}>
                            <Bot size={14} color="#00D084" />
                          </View>
                        )}
                        <Text
                          style={[
                            styles.chatText,
                            msg.sender === 'user' ? styles.userChatText : styles.aiChatText,
                          ]}
                        >
                          {msg.text}
                        </Text>
                      </View>
                    ))}
                    {isSendingChat && (
                      <View style={[styles.chatBubble, styles.aiBubble]}>
                        <ActivityIndicator size="small" color="#00D084" />
                        <Text style={[styles.chatText, styles.aiChatText, { marginLeft: 8 }]}>
                          TutO AI is thinking...
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* Chat Input Bar */}
                  <View style={styles.chatInputBar}>
                    <TextInput
                      style={styles.chatTextInput}
                      placeholder="Ask any doubt in Tamil or English..."
                      placeholderTextColor="#64748B"
                      value={chatInput}
                      onChangeText={setChatInput}
                      onSubmitEditing={handleSendChat}
                    />
                    <TouchableOpacity
                      style={[styles.sendChatBtn, !chatInput.trim() && { opacity: 0.5 }]}
                      disabled={!chatInput.trim() || isSendingChat}
                      onPress={handleSendChat}
                    >
                      <Send size={15} color="#070C18" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Sticky Complete Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteAndEarn}>
              <CheckCircle2 size={16} color="#070C18" />
              <Text style={styles.completeBtnText}>Complete Task & Earn XP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#070C18',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#0E172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  codeTag: {
    backgroundColor: '#38BDF820',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#38BDF8',
  },
  codeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  subjectTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subjectTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  keyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  keyTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerTamilSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#131F37',
  },
  tabBtnActive: {
    backgroundColor: '#00D08420',
    borderWidth: 1,
    borderColor: '#00D084',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#00D084',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  loadingSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  lectureContainer: {
    flex: 1,
  },
  lectureScroll: {
    flex: 1,
    padding: 16,
  },
  slideCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  slideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slideStepTag: {
    backgroundColor: '#00D08420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  slideStepTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
  slideSubjectText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  slideHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  slideTamilHeading: {
    fontSize: 12,
    color: '#94A3B8',
  },
  slidePointsList: {
    gap: 8,
    marginTop: 4,
  },
  slidePointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D084',
    marginTop: 6,
  },
  pointText: {
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
    lineHeight: 18,
  },
  slideFormulaBox: {
    backgroundColor: '#131F37',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#38BDF8',
    gap: 2,
    marginTop: 6,
  },
  formulaLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38BDF8',
  },
  formulaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  transcriptCard: {
    backgroundColor: '#0E172A',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D084',
  },
  playAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D084',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  playAudioBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#070C18',
  },
  transcriptText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  slideControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0E172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  stepperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stepperBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  slideCountIndicator: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  notesScroll: {
    flex: 1,
    padding: 16,
  },
  notesSummaryBox: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
    marginBottom: 14,
  },
  notesSummaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  notesSummaryText: {
    fontSize: 12,
    color: '#F8FAFC',
    lineHeight: 17,
  },
  notesTamilSummaryText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  notesSection: {
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  formulaNoteCard: {
    backgroundColor: '#131F37',
    padding: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#38BDF8',
  },
  formulaNoteText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modelQuestionCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  modelQHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qTypeBadge: {
    backgroundColor: '#00D08420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qTypeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00D084',
  },
  marksBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  questionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  tamilQuestionText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  stepAnswerBox: {
    backgroundColor: '#131F37',
    padding: 8,
    borderRadius: 8,
    gap: 3,
    marginTop: 4,
  },
  answerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
  },
  answerText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  quizScroll: {
    flex: 1,
    padding: 16,
  },
  quizHeaderCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
    marginBottom: 14,
  },
  quizHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  quizHeaderSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  quizQuestionCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
    marginBottom: 14,
  },
  quizQNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
  quizQText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 17,
  },
  quizQTamil: {
    fontSize: 11,
    color: '#94A3B8',
  },
  optionsList: {
    gap: 8,
    marginTop: 4,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#131F37',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  optionChosen: {
    borderColor: '#00D084',
    backgroundColor: '#00D08415',
  },
  optionCorrect: {
    borderColor: '#00D084',
    backgroundColor: '#00D08425',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444420',
  },
  optionIndexBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0E172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  optionBtnText: {
    fontSize: 11,
    color: '#E2E8F0',
    flex: 1,
  },
  optionTextChosen: {
    color: '#00D084',
    fontWeight: '700',
  },
  optionTextCorrect: {
    color: '#00D084',
    fontWeight: '800',
  },
  optionTextWrong: {
    color: '#EF4444',
    fontWeight: '700',
  },
  explanationBox: {
    backgroundColor: '#131F37',
    padding: 10,
    borderRadius: 8,
    gap: 3,
    marginTop: 4,
  },
  explanationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  explanationText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  explanationTamilText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  submitQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  submitQuizBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070C18',
  },
  scoreResultCard: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#00D084',
    marginTop: 6,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00D084',
  },
  scoreSub: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  tutorContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
    padding: 16,
  },
  chatBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    maxWidth: '88%',
  },
  aiBubble: {
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#00D08420',
    borderWidth: 1,
    borderColor: '#00D08450',
    alignSelf: 'flex-end',
  },
  aiAvatarBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#131F37',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  chatText: {
    fontSize: 12,
    lineHeight: 17,
  },
  aiChatText: {
    color: '#F8FAFC',
    flex: 1,
  },
  userChatText: {
    color: '#00D084',
    fontWeight: '600',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0E172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#131F37',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#F8FAFC',
  },
  sendChatBtn: {
    backgroundColor: '#00D084',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0E172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 10,
  },
  completeBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#070C18',
  },
});
