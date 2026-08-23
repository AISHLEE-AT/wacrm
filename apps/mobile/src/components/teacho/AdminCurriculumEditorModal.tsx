import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  X,
  Plus,
  Save,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  Layers,
  BookOpen,
  HelpCircle,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { getCourseSyllabus, SyllabusUnit } from '../../lib/courseCatalogMaster';
import {
  persistTopicContentToDatabase,
  generateSectionTamilAnalogyAI,
  generateSectionVsaqsAI,
  generateSectionStepSolutionsAI,
  generateSectionCbtMcqsAI,
  generateSectionMnemonicsAI,
} from '../../lib/coursePlayerEngine';

interface AdminCurriculumEditorModalProps {
  visible: boolean;
  onClose: () => void;
  initialCourseId?: string;
  initialCourseTitle?: string;
}

export default function AdminCurriculumEditorModal({
  visible,
  onClose,
  initialCourseId = 'class_12_tamil_nadu',
  initialCourseTitle = 'Class 12 Board Exam',
}: AdminCurriculumEditorModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editAxiom, setEditAxiom] = useState('');
  const [editOverview, setEditOverview] = useState('');
  const [editTamil, setEditTamil] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New Custom Topic Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicAxiom, setNewTopicAxiom] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState('Core Subject');

  const syllabusUnits = useMemo(() => {
    return getCourseSyllabus(selectedCourseId);
  }, [selectedCourseId]);

  const handleSelectTopicForEdit = (title: string, axiom?: string, subjectName?: string) => {
    setSelectedTopic(title);
    setEditTitle(title);
    setEditAxiom(axiom || '');
    setSelectedSubject(subjectName || 'Core Subject');
    setEditOverview(`Comprehensive syllabus notes, governing principles, and standard derivations for ${title}.`);
    setEditTamil(`இப்பாடத்தின் அடிப்படைக் கருத்துக்கள் மற்றும் தேர்வுக்கான முக்கிய குறிப்புகள்: ${title}.`);
  };

  const handleAiAutoFill = async () => {
    if (!editTitle) {
      Alert.alert('AI Helper', 'Please select or enter a topic title first.');
      return;
    }

    try {
      setIsAiLoading(true);
      const [tamilRes, vsaqRes, stepRes, mcqRes, mnemRes] = await Promise.all([
        generateSectionTamilAnalogyAI(editTitle, initialCourseTitle),
        generateSectionVsaqsAI(editTitle, initialCourseTitle, 3),
        generateSectionStepSolutionsAI(editTitle, initialCourseTitle),
        generateSectionCbtMcqsAI(editTitle, initialCourseTitle, 5),
        generateSectionMnemonicsAI(editTitle, initialCourseTitle),
      ]);

      if (tamilRes?.colloquialIntro) {
        setEditTamil(tamilRes.colloquialIntro);
      }
      if (mnemRes?.formulasAndMnemonics?.[0]?.meaning) {
        setEditOverview(
          `Core Principles for ${editTitle}:\n${mnemRes.formulasAndMnemonics[0].meaning}\n\nAxiom: ${mnemRes.formulasAndMnemonics[0].formula}`
        );
      }

      Alert.alert('⚡ AI Generated', 'Topic overview, formulas, and Tamil notes auto-filled from Gemini AI.');
    } catch (e: any) {
      Alert.alert('AI Notice', 'Unable to auto-generate: ' + e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!editTitle) {
      Alert.alert('Save Notice', 'Topic title cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        notes: {
          overview: editOverview,
          keyPoints: [
            `Standard syllabus rule: ${editAxiom || editTitle}`,
            'Follow step-by-step rigorous derivation for maximum marks.',
          ],
          bilingualExplanation: {
            tamil: editTamil,
            english: editOverview,
          },
        },
        tamilExplanation: {
          colloquialIntro: editTamil,
          everydayAnalogy: 'நடைமுறை வாழ்க்கையோடு ஒப்பிட்டுப் படிக்கும் போது நினைவில் எளிதாக நிற்கும்!',
        },
        vsaqs: [
          { question: `Define ${editTitle}.`, answer: editAxiom || 'Governing physical / mathematical relationship.' },
          { question: `State the primary application of ${editTitle}.`, answer: 'Used for direct exam problem-solving.' },
        ],
        shortAnswers: [
          {
            question: `Derive and explain the fundamental law of ${editTitle}.`,
            marks: '5 Marks',
            solutionSteps: [
              `1. State governing equation: ${editAxiom || 'Standard law'}`,
              '2. Apply initial and boundary conditions.',
              '3. Conclude with final state equation.',
            ],
            keyTips: 'Ensure clear diagram and unit specifications.',
          },
        ],
      };

      const key = `${selectedCourseId}_${editTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
      const res = await persistTopicContentToDatabase(
        selectedCourseId,
        editTitle,
        key,
        payload,
        'admin_edited'
      );

      setIsSaving(false);
      if (res.success) {
        Alert.alert('💾 Database Updated', `Notes for "${editTitle}" have been saved to Supabase.`);
      } else {
        Alert.alert('Database Notice', res.message);
      }
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save to database: ' + err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle}>Admin Curriculum Console</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN ACCESS</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>Manage Syllabus, Edit Micro-Topics & Auto-Persist to DB</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Quick Actions Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.addTopicBtn}
              onPress={() => setIsAddModalOpen(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#0a0f1e" style={{ marginRight: 4 }} />
              <Text style={styles.addTopicBtnText}>Add Special Micro-Topic</Text>
            </TouchableOpacity>

            {selectedTopic && (
              <TouchableOpacity
                style={styles.aiFillBtn}
                onPress={handleAiAutoFill}
                disabled={isAiLoading}
                activeOpacity={0.8}
              >
                {isAiLoading ? (
                  <ActivityIndicator size="small" color="#38bdf8" />
                ) : (
                  <>
                    <Sparkles size={14} color="#38bdf8" style={{ marginRight: 4 }} />
                    <Text style={styles.aiFillBtnText}>⚡ AI Auto-Fill</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Micro-Topic Edit Box (if selected) */}
          {selectedTopic ? (
            <View style={styles.editorCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Edit3 size={16} color="#10b981" />
                  <Text style={styles.editorCardTitle}>Editing Micro-Topic</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedTopic(null)}>
                  <Text style={{ color: '#94a3b8', fontSize: 11 }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Topic Title</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Topic Title"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Key Axiom / Formula / Law</Text>
              <TextInput
                style={styles.input}
                value={editAxiom}
                onChangeText={setEditAxiom}
                placeholder="Formula or core axiom (e.g. F = qE)"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Theory & Overview Notes</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                value={editOverview}
                onChangeText={setEditOverview}
                multiline
                placeholder="Overview and theoretical breakdown"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Colloquial Tamil Explanation / Analogy</Text>
              <TextInput
                style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                value={editTamil}
                onChangeText={setEditTamil}
                multiline
                placeholder="Colloquial Tamil explanation"
                placeholderTextColor="#64748b"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveToDatabase}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#0a0f1e" />
                ) : (
                  <>
                    <Save size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
                    <Text style={styles.saveBtnText}>Save Changes to Supabase DB</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Syllabus Tree Explorer */}
          <Text style={styles.sectionHeaderTitle}>Syllabus Units & Micro-Topics (Tap to Edit)</Text>
          {syllabusUnits.map((unit, uIdx) => (
            <View key={unit.id || uIdx} style={styles.unitCard}>
              <Text style={styles.unitSubjectText}>{unit.subjectName || 'Subject'}</Text>
              <Text style={styles.unitTitleText}>
                {unit.unitNumber ? `Unit ${unit.unitNumber}: ` : ''}{unit.title}
              </Text>

              {unit.chapters?.map((chap, cIdx) => (
                <View key={cIdx} style={styles.chapContainer}>
                  <Text style={styles.chapTitleText}>
                    Chapter {chap.chapterNumber || cIdx + 1}: {chap.chapterTitle || chap.title}
                  </Text>

                  {chap.subtopics?.map((sub, sIdx) => (
                    <View key={sIdx} style={styles.subtopicContainer}>
                      <Text style={styles.subtopicTitleText}>{sub.title}</Text>
                      {sub.microTopics?.map((micro, mIdx) => {
                        const mTitle = micro.title || micro.topicTitle || `Topic ${mIdx + 1}`;
                        const isThisSelected = selectedTopic === mTitle;
                        return (
                          <TouchableOpacity
                            key={mIdx}
                            style={[styles.microTopicRow, isThisSelected && styles.microTopicRowActive]}
                            onPress={() => handleSelectTopicForEdit(mTitle, micro.keyAxiom || micro.keyFormulaOrLaw, unit.subjectName)}
                            activeOpacity={0.7}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={styles.microTopicRowText}>{mTitle}</Text>
                              {micro.keyAxiom || micro.keyFormulaOrLaw ? (
                                <Text style={styles.microAxiomRowText}>
                                  {micro.keyAxiom || micro.keyFormulaOrLaw}
                                </Text>
                              ) : null}
                            </View>
                            <Edit3 size={14} color={isThisSelected ? '#10b981' : '#64748b'} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Add Special Topic Modal */}
        <Modal visible={isAddModalOpen} transparent animationType="fade" onRequestClose={() => setIsAddModalOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Special Micro-Topic</Text>
              <Text style={styles.modalSub}>Inject custom topic directly into course syllabus and DB</Text>

              <Text style={styles.inputLabel}>Subject Area</Text>
              <TextInput
                style={styles.input}
                value={newTopicSubject}
                onChangeText={setNewTopicSubject}
                placeholder="e.g. Physics / Aptitude"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Special Topic Title</Text>
              <TextInput
                style={styles.input}
                value={newTopicTitle}
                onChangeText={setNewTopicTitle}
                placeholder="e.g. Special Relativity & Lorentz Boost"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Key Formula / Rule</Text>
              <TextInput
                style={styles.input}
                value={newTopicAxiom}
                onChangeText={setNewTopicAxiom}
                placeholder="e.g. γ = 1 / √(1 - v²/c²)"
                placeholderTextColor="#64748b"
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#334155' }]}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#10b981', flex: 1 }]}
                  onPress={() => {
                    if (!newTopicTitle) {
                      Alert.alert('Topic Title', 'Please enter a title for the new special topic.');
                      return;
                    }
                    setIsAddModalOpen(false);
                    handleSelectTopicForEdit(newTopicTitle, newTopicAxiom, newTopicSubject);
                  }}
                >
                  <Text style={{ color: '#0a0f1e', fontWeight: '900' }}>Proceed to Edit & Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 48,
    paddingBottom: 14,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  adminBadgeText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  addTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addTopicBtnText: {
    color: '#0a0f1e',
    fontSize: 12,
    fontWeight: '800',
  },
  aiFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  aiFillBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
  },
  editorCard: {
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10b98180',
    marginBottom: 16,
  },
  editorCardTitle: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  saveBtnText: {
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionHeaderTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  unitCard: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  unitSubjectText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  unitTitleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  chapContainer: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  chapTitleText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtopicContainer: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#334155',
    marginBottom: 4,
  },
  subtopicTitleText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  microTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  microTopicRowActive: {
    borderColor: '#10b981',
    borderWidth: 1,
  },
  microTopicRowText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  microAxiomRowText: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
