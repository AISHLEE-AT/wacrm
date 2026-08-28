import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Platform,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Search,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  Filter,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCode,
  Tag,
  Hash,
  ArrowRight,
  Sliders,
  GraduationCap,
  ListFilter,
  Compass,
  Database,
  Cloud,
  Globe,
  Check,
} from 'lucide-react-native';

import {
  StructuredMCQ,
  MASTER_QBANK_STORE,
  SUBJECT_TAXONOMY_MAP,
  EXAM_CATEGORIES,
  QUESTION_FORMATS,
  ExamCategory,
  QuestionFormat,
  searchQuestions,
  querySupabaseQuestionBank,
  parseQuestionUID,
  parseRangeExpression,
  classifyAndFormatRawMCQs,
} from '../../lib/qbankTaxonomyEngine';

interface TutOQBankModalProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialSubjectCode?: string;
}

export const TutOQBankModal: React.FC<TutOQBankModalProps> = ({
  visible,
  onClose,
  initialQuery = '',
  initialSubjectCode = 'ALL',
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'taxonomist'>('search');
  const [inputVal, setInputVal] = useState<string>(initialQuery);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectCode);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Instant typing debounce (80ms) for 60 FPS smooth input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputVal);
    }, 80);
    return () => clearTimeout(handler);
  }, [inputVal]);

  // Sync initial query & subject when modal opens
  useEffect(() => {
    if (visible) {
      setInputVal(initialQuery || '');
      setSearchQuery(initialQuery || '');
      if (initialSubjectCode) setSelectedSubject(initialSubjectCode);
    }
  }, [visible, initialQuery, initialSubjectCode]);

  // Category-Wise & Format-Wise Filters
  const [selectedExamCategory, setSelectedExamCategory] = useState<ExamCategory>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | 'ALL'>('ALL');

  // Dedicated Range Filter States (e.g. 100 to 200)
  const [rangeStartInput, setRangeStartInput] = useState<string>('');
  const [rangeEndInput, setRangeEndInput] = useState<string>('');
  const [activeRangePreset, setActiveRangePreset] = useState<string>('ALL');

  // Live Cloud Database (200,000+ Questions in kindle_content_cache)
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [cloudLoadedQuestions, setCloudLoadedQuestions] = useState<StructuredMCQ[]>([]);

  // Interactive User Selection & Answer State
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Taxonomist Studio State
  const [rawInputText, setRawInputText] = useState<string>('');
  const [classifiedJsonOutput, setClassifiedJsonOutput] = useState<string>('');

  // Live Cloud Fetch from 2 Lakh Dataset
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const fetchLiveQuestions = async () => {
      setIsLoadingCloud(true);
      try {
        const rangeOpt = {
          rangeStart: rangeStartInput ? parseInt(rangeStartInput, 10) || undefined : undefined,
          rangeEnd: rangeEndInput ? parseInt(rangeEndInput, 10) || undefined : undefined,
          examCategory: selectedExamCategory,
          format: selectedFormat,
        };

        const results = await querySupabaseQuestionBank(
          searchQuery,
          selectedSubject,
          selectedDifficulty,
          rangeOpt
        );

        if (isMounted) {
          setCloudLoadedQuestions(results);
        }
      } catch (err) {
        console.warn('Live cloud QBank fetch error:', err);
      } finally {
        if (isMounted) setIsLoadingCloud(false);
      }
    };

    const timer = setTimeout(fetchLiveQuestions, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [visible, searchQuery, selectedSubject, selectedDifficulty, selectedExamCategory, selectedFormat, rangeStartInput, rangeEndInput]);

  // Handle Range Presets across 2 Lakh Questions
  const handleRangePreset = (preset: string) => {
    setActiveRangePreset(preset);
    if (preset === 'ALL') {
      setRangeStartInput('');
      setRangeEndInput('');
    } else if (preset === '100-200') {
      setRangeStartInput('100');
      setRangeEndInput('200');
    } else if (preset === '1-500') {
      setRangeStartInput('1');
      setRangeEndInput('500');
    } else if (preset === '1000-2000') {
      setRangeStartInput('1000');
      setRangeEndInput('2000');
    } else if (preset === '10k-11k') {
      setRangeStartInput('10000');
      setRangeEndInput('11000');
    } else if (preset === '50k-51k') {
      setRangeStartInput('50000');
      setRangeEndInput('51000');
    } else if (preset === '100k-101k') {
      setRangeStartInput('100000');
      setRangeEndInput('101000');
    } else if (preset === '150k-151k') {
      setRangeStartInput('150000');
      setRangeEndInput('151000');
    } else if (preset === '200k-201k') {
      setRangeStartInput('200000');
      setRangeEndInput('201000');
    }
  };

  // Unified Questions Pool (Local Master Store + Loaded Cloud Data) - Clean Objective MCQs
  const combinedPool = useMemo(() => {
    let pool: StructuredMCQ[] = MASTER_QBANK_STORE;
    if (cloudLoadedQuestions && cloudLoadedQuestions.length > 0) {
      const map = new Map<string, StructuredMCQ>();
      MASTER_QBANK_STORE.forEach((q) => map.set(q.question_uid, q));
      cloudLoadedQuestions.forEach((q) => map.set(q.question_uid, q));
      pool = Array.from(map.values());
    }
    // Filter out fill_in_the_blank questions and ensure clean objective MCQs
    return pool.filter(q => (q.question_format as string) !== 'fill_in_the_blank');
  }, [cloudLoadedQuestions]);

  // Synchronous, instant search across UID, Number, Range, Format, and Keywords
  const filteredQuestions = useMemo(() => {
    const rangeOpt = {
      rangeStart: rangeStartInput ? parseInt(rangeStartInput, 10) || undefined : undefined,
      rangeEnd: rangeEndInput ? parseInt(rangeEndInput, 10) || undefined : undefined,
      examCategory: selectedExamCategory,
      format: selectedFormat,
    };

    return searchQuestions(searchQuery, selectedSubject, selectedDifficulty, combinedPool, rangeOpt);
  }, [combinedPool, searchQuery, selectedSubject, selectedDifficulty, selectedExamCategory, selectedFormat, rangeStartInput, rangeEndInput]);

  const handleOptionPress = (questionUid: string, optKey: 'A' | 'B' | 'C' | 'D') => {
    setUserSelectedOptions((prev) => ({
      ...prev,
      [questionUid]: optKey,
    }));
    setExpandedSolutions((prev) => ({
      ...prev,
      [questionUid]: true,
    }));
  };

  const toggleSolution = (uid: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const handleCopyUid = (uid: string) => {
    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(uid);
      Alert.alert('Copied!', `Question UID copied: ${uid}`);
    } else {
      Share.share({ message: uid });
    }
  };

  const handleRunClassifier = () => {
    if (!rawInputText.trim()) {
      Alert.alert('Input Required', 'Please paste raw question JSON or text.');
      return;
    }

    const res = classifyAndFormatRawMCQs(rawInputText);
    if (res.success) {
      setClassifiedJsonOutput(JSON.stringify(res.data, null, 2));
      Alert.alert('Taxonomy Classified ✨', `Successfully generated ${res.count} structured question(s) with deterministic UIDs!`);
    } else {
      Alert.alert('Classification Error', res.error || 'Failed to parse raw questions.');
    }
  };

  const handleCopyClassifiedJson = () => {
    if (!classifiedJsonOutput) return;
    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(classifiedJsonOutput);
      Alert.alert('Copied!', 'Supabase JSON copied to clipboard.');
    } else {
      Share.share({ message: classifiedJsonOutput });
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <View style={styles.verifiedBadge}>
                  <Hash size={13} color="#00D084" />
                  <Text style={styles.verifiedBadgeText}>NUMBER & TAXONOMY QBANK</Text>
                </View>
                <View style={styles.cloudBadge}>
                  <Globe size={11} color="#38BDF8" />
                  <Text style={styles.cloudBadgeText}>2 LAKH+ OBJECTIVE MCQS MAPPED</Text>
                </View>
              </View>
              <Text style={styles.title}>Complete MCQ Question Bank</Text>
              <Text style={styles.subtitle}>Objective MCQs · High-Yield Question Bank · Range Search · Instant Practice</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'search' && styles.tabBtnActive]}
              onPress={() => setActiveTab('search')}
            >
              <Search size={14} color={activeTab === 'search' ? '#00D084' : '#94A3B8'} />
              <Text style={[styles.tabBtnText, activeTab === 'search' && styles.tabBtnTextActive]}>
                Search & Practice ({filteredQuestions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'taxonomist' && styles.tabBtnActive]}
              onPress={() => setActiveTab('taxonomist')}
            >
              <FileCode size={14} color={activeTab === 'taxonomist' ? '#00D084' : '#94A3B8'} />
              <Text style={[styles.tabBtnText, activeTab === 'taxonomist' && styles.tabBtnTextActive]}>
                Taxonomist Studio (JSON Generator)
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'search' ? (
            <FlatList
              data={filteredQuestions}
              keyExtractor={(item, idx) => item.question_uid || String(idx)}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View>
                  {/* 1. Primary Word / Number Search Bar */}
                  <View style={styles.searchBarContainer}>
                    <Search size={16} color="#00D084" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search by keyword (e.g. velocity, friction, cell), UID, or range..."
                      placeholderTextColor="#64748B"
                      value={inputVal}
                      onChangeText={setInputVal}
                      clearButtonMode="while-editing"
                    />
                    {isLoadingCloud && (
                      <ActivityIndicator size="small" color="#00D084" style={{ marginRight: 6 }} />
                    )}
                    {inputVal.length > 0 && (
                      <TouchableOpacity onPress={() => { setInputVal(''); setSearchQuery(''); }}>
                        <X size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* 2. TYPE-WISE: Question Format Selector */}
                  <View style={styles.categorySection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeaderLabel}>📑 QUESTION FORMAT & TYPE SEARCH:</Text>
                      {selectedFormat !== 'ALL' && (
                        <TouchableOpacity onPress={() => setSelectedFormat('ALL')}>
                          <Text style={styles.clearMiniText}>Reset Type</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsRow}>
                      {QUESTION_FORMATS.map((fmt) => {
                        const isSelected = selectedFormat === fmt.id;
                        return (
                          <TouchableOpacity
                            key={fmt.id}
                            style={[styles.formatPill, isSelected && styles.formatPillActive]}
                            onPress={() => setSelectedFormat(fmt.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={{ fontSize: 11 }}>{fmt.icon}</Text>
                            <Text style={[styles.formatPillText, isSelected && styles.formatPillTextActive]}>
                              {fmt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* 3. CATEGORY-WISE: Exam Category Selector */}
                  <View style={styles.categorySection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeaderLabel}>🎓 EXAM CATEGORY SEARCH:</Text>
                      {selectedExamCategory !== 'ALL' && (
                        <TouchableOpacity onPress={() => setSelectedExamCategory('ALL')}>
                          <Text style={styles.clearMiniText}>Reset Exam</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsRow}>
                      {EXAM_CATEGORIES.map((cat) => {
                        const isSelected = selectedExamCategory === cat.id;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                            onPress={() => setSelectedExamCategory(cat.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={{ fontSize: 11 }}>{cat.icon}</Text>
                            <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                              {cat.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* 4. RANGE-WISE: Sequential Number Range Search */}
                  <View style={styles.rangeSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeaderLabel}>🎯 QUESTION NUMBER & SEQUENCE RANGE:</Text>
                      {(rangeStartInput || rangeEndInput || activeRangePreset !== 'ALL') && (
                        <TouchableOpacity onPress={() => handleRangePreset('ALL')}>
                          <Text style={styles.clearMiniText}>Clear Range</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Custom Range Number Inputs */}
                    <View style={styles.rangeInputRow}>
                      <View style={styles.rangeInputBox}>
                        <Text style={styles.rangeInputPrefix}>From #</Text>
                        <TextInput
                          style={styles.rangeNumberInput}
                          placeholder="100"
                          placeholderTextColor="#64748B"
                          keyboardType="numeric"
                          value={rangeStartInput}
                          onChangeText={(val) => {
                            setRangeStartInput(val);
                            setActiveRangePreset('CUSTOM');
                          }}
                        />
                      </View>

                      <View style={styles.rangeSeparator}>
                        <Text style={styles.rangeSeparatorText}>TO</Text>
                      </View>

                      <View style={styles.rangeInputBox}>
                        <Text style={styles.rangeInputPrefix}>To #</Text>
                        <TextInput
                          style={styles.rangeNumberInput}
                          placeholder="200"
                          placeholderTextColor="#64748B"
                          keyboardType="numeric"
                          value={rangeEndInput}
                          onChangeText={(val) => {
                            setRangeEndInput(val);
                            setActiveRangePreset('CUSTOM');
                          }}
                        />
                      </View>
                    </View>

                    {/* Quick Range Presets for 2 Lakh Dataset */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rangePresetsRow}>
                      {[
                        { id: 'ALL', label: 'All Questions' },
                        { id: '100-200', label: '🎯 #100 to #200' },
                        { id: '1-500', label: '#1 to #500' },
                        { id: '1000-2000', label: '#1,000 to #2,000' },
                        { id: '10k-11k', label: '#10k to #11k' },
                        { id: '50k-51k', label: '#50k to #51k' },
                        { id: '100k-101k', label: '#100k to #101k' },
                        { id: '150k-151k', label: '#150k to #151k' },
                        { id: '200k-201k', label: '#200k to #201k' },
                      ].map((preset) => (
                        <TouchableOpacity
                          key={preset.id}
                          style={[styles.rangePresetPill, activeRangePreset === preset.id && styles.rangePresetPillActive]}
                          onPress={() => handleRangePreset(preset.id)}
                        >
                          <Text style={[styles.rangePresetPillText, activeRangePreset === preset.id && styles.rangePresetPillTextActive]}>
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* 5. Subject Filter Pills */}
                  <View style={styles.categorySection}>
                    <Text style={styles.sectionHeaderLabel}>📚 SUBJECT DISCIPLINE SEARCH:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                      <TouchableOpacity
                        style={[styles.filterPill, selectedSubject === 'ALL' && styles.filterPillActive]}
                        onPress={() => setSelectedSubject('ALL')}
                      >
                        <Text style={[styles.filterPillText, selectedSubject === 'ALL' && styles.filterPillTextActive]}>
                          All Subjects
                        </Text>
                      </TouchableOpacity>

                      {Object.entries(SUBJECT_TAXONOMY_MAP).map(([code, subj]) => (
                        <TouchableOpacity
                          key={code}
                          style={[styles.filterPill, selectedSubject === code && styles.filterPillActive]}
                          onPress={() => setSelectedSubject(code)}
                        >
                          <Text style={{ fontSize: 11 }}>{subj.icon}</Text>
                          <Text style={[styles.filterPillText, selectedSubject === code && styles.filterPillTextActive]}>
                            {code} ({subj.name})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* 6. Difficulty Filters */}
                  <View style={styles.diffFilterRow}>
                    <Text style={styles.diffLabel}>Difficulty:</Text>
                    {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                      <TouchableOpacity
                        key={diff}
                        style={[styles.diffPill, selectedDifficulty === diff && styles.diffPillActive]}
                        onPress={() => setSelectedDifficulty(diff)}
                      >
                        <Text
                          style={[
                            styles.diffPillText,
                            selectedDifficulty === diff && styles.diffPillTextActive,
                            diff === 'Easy' && { color: '#10B981' },
                            diff === 'Medium' && { color: '#F59E0B' },
                            diff === 'Hard' && { color: '#F43F5E' },
                          ]}
                        >
                          {diff === 'ALL' ? 'All' : diff}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Result Summary Bar */}
                  <View style={styles.resultsSummaryBar}>
                    <Text style={styles.resultsSummaryText}>
                      Showing <Text style={{ color: '#00D084', fontWeight: '900' }}>{filteredQuestions.length}</Text> Questions
                      {selectedFormat !== 'ALL' ? ` [${selectedFormat}]` : ''}
                      {selectedExamCategory !== 'ALL' ? ` in [${selectedExamCategory}]` : ''}
                      {(rangeStartInput && rangeEndInput) ? ` in range #${rangeStartInput} to #${rangeEndInput}` : ''}
                      {searchQuery ? ` matching "${searchQuery}"` : ''}
                    </Text>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <HelpCircle size={32} color="#64748B" />
                  <Text style={styles.emptyTitle}>No Questions Found</Text>
                  <Text style={styles.emptySubtitle}>
                    No questions matched your search in the 2 Lakh+ database. Try adjusting your search query, type, or filters.
                  </Text>
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => {
                      setInputVal('');
                      setSearchQuery('');
                      setSelectedSubject('ALL');
                      setSelectedDifficulty('ALL');
                      setSelectedExamCategory('ALL');
                      setSelectedFormat('ALL');
                      setRangeStartInput('');
                      setRangeEndInput('');
                      setActiveRangePreset('ALL');
                    }}
                  >
                    <Text style={styles.resetBtnText}>Reset All Filters</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item: qItem, index: idx }) => {
                const selectedOpt = userSelectedOptions[qItem.question_uid];
                const isAnswered = Boolean(selectedOpt);
                const isCorrect = selectedOpt === qItem.correct_option;
                const isSolExpanded = expandedSolutions[qItem.question_uid] !== false;

                const formatObj = QUESTION_FORMATS.find(f => f.id === qItem.question_format);
                const examObj = EXAM_CATEGORIES.find(e => e.id === qItem.exam_category);

                return (
                  <View key={qItem.question_uid || idx} style={styles.qCard}>
                    {/* Top UID & Tag Row */}
                    <View style={styles.qHeader}>
                      <TouchableOpacity
                        style={styles.uidBadge}
                        onPress={() => handleCopyUid(qItem.question_uid)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.uidBadgeText}>{qItem.question_uid}</Text>
                        <Copy size={11} color="#38BDF8" />
                      </TouchableOpacity>

                      <View style={styles.badgeGroup}>
                        {formatObj && formatObj.id !== 'ALL' && (
                          <View style={styles.formatTagBadge}>
                            <Text style={styles.formatTagBadgeText}>{formatObj.icon} {formatObj.label}</Text>
                          </View>
                        )}
                        {examObj && examObj.id !== 'ALL' && (
                          <View style={styles.examTagBadge}>
                            <Text style={styles.examTagBadgeText}>{examObj.icon} {examObj.label}</Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.diffBadge,
                            qItem.taxonomy.difficulty === 'Easy' && styles.diffEasy,
                            qItem.taxonomy.difficulty === 'Medium' && styles.diffMedium,
                            qItem.taxonomy.difficulty === 'Hard' && styles.diffHard,
                          ]}
                        >
                          <Text
                            style={[
                              styles.diffBadgeText,
                              qItem.taxonomy.difficulty === 'Easy' && { color: '#10B981' },
                              qItem.taxonomy.difficulty === 'Medium' && { color: '#F59E0B' },
                              qItem.taxonomy.difficulty === 'Hard' && { color: '#F43F5E' },
                            ]}
                          >
                            {qItem.taxonomy.difficulty}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Taxonomy Path Trail */}
                    <View style={styles.taxonomyTrail}>
                      <Text style={styles.taxonomyTrailText}>
                        {qItem.taxonomy.subject} ({qItem.taxonomy.subject_code}) &gt;{' '}
                        {qItem.taxonomy.domain} &gt; {qItem.taxonomy.topic} &gt;{' '}
                        {qItem.taxonomy.subtopic} &gt; {qItem.taxonomy.microtopic}
                      </Text>
                    </View>

                    {/* Question Text */}
                    <Text style={styles.questionText}>{qItem.question_text}</Text>
                    {qItem.question_text_ta ? (
                      <Text style={styles.questionTextTa}>{qItem.question_text_ta}</Text>
                    ) : null}

                    {/* Options (A, B, C, D) */}
                    <View style={styles.optionsContainer}>
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = qItem.options[optKey];
                        const optTextTa = qItem.options_ta?.[optKey];
                        if (!optText) return null;

                        const isUserChoice = selectedOpt === optKey;
                        const isCorrectChoice = optKey === qItem.correct_option;

                        let optStyle: any = styles.optionBtn;
                        let textStyle: any = styles.optionText;
                        let badgeStyle: any = styles.optionLetterBadge;
                        let badgeTextStyle: any = styles.optionLetterText;

                        if (isAnswered) {
                          if (isCorrectChoice) {
                            optStyle = [styles.optionBtn, styles.optionBtnCorrect];
                            textStyle = [styles.optionText, styles.optionTextCorrect];
                            badgeStyle = [styles.optionLetterBadge, styles.optionLetterCorrect];
                            badgeTextStyle = [styles.optionLetterText, styles.optionLetterTextCorrect];
                          } else if (isUserChoice && !isCorrect) {
                            optStyle = [styles.optionBtn, styles.optionBtnWrong];
                            textStyle = [styles.optionText, styles.optionTextWrong];
                            badgeStyle = [styles.optionLetterBadge, styles.optionLetterWrong];
                            badgeTextStyle = [styles.optionLetterText, styles.optionLetterTextWrong];
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={optKey}
                            style={optStyle}
                            activeOpacity={0.8}
                            onPress={() => handleOptionPress(qItem.question_uid, optKey)}
                          >
                            <View style={badgeStyle}>
                              <Text style={badgeTextStyle}>{optKey}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={textStyle}>{optText}</Text>
                              {optTextTa ? <Text style={styles.optionTamil}>{optTextTa}</Text> : null}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Explanation Toggle Header */}
                    <TouchableOpacity
                      style={styles.solutionHeader}
                      onPress={() => toggleSolution(qItem.question_uid)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={14} color="#00D084" />
                        <Text style={styles.solutionHeaderTitle}>
                          {isAnswered
                            ? isCorrect
                              ? 'Correct! Explanation & Governing Law'
                              : 'Incorrect. Solution & Correct Rule'
                            : 'View Explanation & Solution'}
                        </Text>
                      </View>
                      {isSolExpanded ? (
                        <ChevronUp size={16} color="#94A3B8" />
                      ) : (
                        <ChevronDown size={16} color="#94A3B8" />
                      )}
                    </TouchableOpacity>

                    {/* Solution & Formulas Body */}
                    {isSolExpanded && (
                      <View style={styles.solutionBox}>
                        <View style={styles.correctPill}>
                          <CheckCircle2 size={13} color="#00D084" />
                          <Text style={styles.correctPillText}>
                            Correct Option: [{qItem.correct_option}] {qItem.options[qItem.correct_option]}
                          </Text>
                        </View>

                        <Text style={styles.explanationText}>{qItem.explanation}</Text>
                        {qItem.explanation_ta ? (
                          <Text style={styles.explanationTamil}>{qItem.explanation_ta}</Text>
                        ) : null}

                        {qItem.formula_or_law ? (
                          <View style={styles.formulaBox}>
                            <Text style={styles.formulaLabel}>GOVERNING LAW / FORMULA:</Text>
                            <Text style={styles.formulaText}>{qItem.formula_or_law}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              }}
            />
          ) : (
            /* ═════════════════════════════════════════════════════════════════
               🛠️ TAXONOMIST STUDIO (RAW QUESTION -> DETERMINISTIC SUPABASE JSON)
               ═════════════════════════════════════════════════════════════════ */
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.taxonomistContainer}>
                <View style={styles.taxonomistHero}>
                  <Text style={styles.taxonomistTitle}>Taxonomy Classifier & UID Generator</Text>
                  <Text style={styles.taxonomistDesc}>
                    Paste raw MCQs to automatically construct standard deterministic UIDs and export formatted JSON for Supabase import.
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.sectionLabel}>RAW QUESTIONS INPUT (JSON OR TEXT):</Text>
                  <TextInput
                    style={styles.rawTextInput}
                    multiline
                    numberOfLines={8}
                    placeholder={`[\n  {\n    "question": "The speed of light in vacuum is approximately:",\n    "options": ["3 x 10^8 m/s", "3 x 10^6 m/s", "9.8 m/s^2", "Zero"],\n    "subject": "Physics",\n    "subject_code": "PHY",\n    "domain": "Optics",\n    "domain_code": "OPT",\n    "difficulty": "Easy",\n    "question_format": "single_choice",\n    "correctAnswer": "A",\n    "explanation": "c = 3 x 10^8 m/s in vacuum."\n  }\n]`}
                    placeholderTextColor="#64748B"
                    value={rawInputText}
                    onChangeText={setRawInputText}
                  />

                  <TouchableOpacity style={styles.processBtn} onPress={handleRunClassifier}>
                    <Sparkles size={16} color="#070C18" />
                    <Text style={styles.processBtnText}>Classify & Generate Deterministic UIDs</Text>
                  </TouchableOpacity>
                </View>

                {classifiedJsonOutput.length > 0 && (
                  <View style={styles.outputSection}>
                    <View style={styles.outputHeader}>
                      <Text style={styles.sectionLabel}>CLASSIFIED SUPABASE JSON OUTPUT:</Text>
                      <TouchableOpacity style={styles.copyJsonBtn} onPress={handleCopyClassifiedJson}>
                        <Copy size={13} color="#00D084" />
                        <Text style={styles.copyJsonBtnText}>Copy JSON</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.rawTextOutput}
                      multiline
                      editable={false}
                      value={classifiedJsonOutput}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#070C18',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    height: '95%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0E172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  cloudBadgeText: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#38BDF8',
    fontWeight: '800',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#131F37',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
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
    fontWeight: '900',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0E172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#F8FAFC',
    padding: 0,
  },
  categorySection: {
    gap: 6,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  clearMiniText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F43F5E',
  },
  categoryPillsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    borderColor: '#00D084',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  categoryPillTextActive: {
    color: '#00D084',
    fontWeight: '900',
  },
  formatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  formatPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38BDF8',
  },
  formatPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  formatPillTextActive: {
    color: '#38BDF8',
    fontWeight: '900',
  },
  rangeSection: {
    gap: 6,
    marginBottom: 10,
  },
  rangeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  rangeInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rangeInputPrefix: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  rangeNumberInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#00D084',
    padding: 0,
  },
  rangeSeparator: {
    paddingHorizontal: 4,
  },
  rangeSeparatorText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  rangePresetsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  rangePresetPill: {
    backgroundColor: '#0E172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rangePresetPillActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.2)',
    borderColor: '#00D084',
  },
  rangePresetPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  rangePresetPillTextActive: {
    color: '#00D084',
    fontWeight: '900',
  },
  filterRow: {
    gap: 6,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0E172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: '#00D084',
    borderColor: '#00D084',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#070C18',
    fontWeight: '900',
  },
  diffFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  diffLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  diffPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  diffPillActive: {
    backgroundColor: '#131F37',
    borderColor: '#94A3B8',
  },
  diffPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  diffPillTextActive: {
    fontWeight: '900',
  },
  resultsSummaryBar: {
    paddingVertical: 4,
    marginBottom: 8,
  },
  resultsSummaryText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  resetBtn: {
    backgroundColor: '#00D084',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#070C18',
  },
  qCard: {
    backgroundColor: '#0E172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
    gap: 8,
  },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  uidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  uidBadgeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#38BDF8',
    fontWeight: '800',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  examTagBadge: {
    backgroundColor: '#131F37',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  examTagBadgeText: {
    fontSize: 9,
    color: '#F59E0B',
    fontWeight: '800',
  },
  formatTagBadge: {
    backgroundColor: '#131F37',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  formatTagBadgeText: {
    fontSize: 9,
    color: '#38BDF8',
    fontWeight: '700',
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  diffEasy: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  diffMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  diffHard: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#F43F5E',
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  taxonomyTrail: {
    backgroundColor: '#131F37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 2,
  },
  taxonomyTrailText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
    lineHeight: 15,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 21,
    marginTop: 4,
  },
  questionTextTa: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginTop: 2,
  },
  optionsContainer: {
    gap: 8,
    marginTop: 6,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#131F37',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  optionBtnCorrect: {
    borderColor: '#00D084',
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
  },
  optionBtnWrong: {
    borderColor: '#F43F5E',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  optionLetterBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0E172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterCorrect: {
    backgroundColor: '#00D084',
    borderColor: '#00D084',
  },
  optionLetterWrong: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  optionLetterText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
  },
  optionLetterTextCorrect: {
    color: '#070C18',
  },
  optionLetterTextWrong: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
    lineHeight: 18,
  },
  optionTextCorrect: {
    color: '#00D084',
    fontWeight: '800',
  },
  optionTextWrong: {
    color: '#F43F5E',
    fontWeight: '800',
  },
  optionTamil: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131F37',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  solutionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D084',
  },
  solutionBox: {
    backgroundColor: '#091020',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#00D084',
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  correctPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
    alignSelf: 'flex-start',
  },
  correctPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D084',
  },
  explanationText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  explanationTamil: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  formulaBox: {
    backgroundColor: '#0E172A',
    borderRadius: 6,
    padding: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  formulaLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  formulaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  taxonomistContainer: {
    gap: 14,
    paddingBottom: 40,
  },
  taxonomistHero: {
    backgroundColor: '#0E172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  taxonomistTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  taxonomistDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  inputSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D084',
    letterSpacing: 0.5,
  },
  rawTextInput: {
    backgroundColor: '#0E172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 10,
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  processBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  processBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070C18',
  },
  outputSection: {
    gap: 6,
    marginTop: 8,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyJsonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyJsonBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D084',
  },
  rawTextOutput: {
    backgroundColor: '#0E172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 10,
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    minHeight: 180,
    textAlignVertical: 'top',
  },
});
