import React, { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  Mic,
  MicOff,
  FileText,
  Send,
  Languages,
  Download,
  Share2,
  Copy,
  CheckCircle2,
  X,
  Building,
  Briefcase,
  Layers,
  ChevronRight,
  Printer,
  FileCheck,
  Calendar,
  Wallet,
  MessageCircle,
  Globe,
  PenTool,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { AppContext } from '../../context/AppContext';
import { colors, radius, spacing } from '../../lib/theme';
import { VoiceSpeechBridge, VoiceSpeechBridgeRef } from '../VoiceSpeechBridge';
import { GroupAiService, GroupPdfMetadata } from '../../services/GroupAiService';

const COURSE_GUIDE_WHATSAPP = '919486335870';
const TELEGRAM_COMMUNITY_URL = 'https://t.me/supro_education';

interface GroupAiAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string;
  groupType?: string;
  regCode?: string;
  village?: string;
  district?: string;
  onApplyResolution?: (resolutionText: string) => void;
}

type AiToolMode =
  | 'resolution'
  | 'bank_letter'
  | 'govt_petition'
  | 'project_plan'
  | 'meeting_notice'
  | 'savings_statement'
  | 'custom_doc'
  | 'translate';

export const GroupAiAssistantModal: React.FC<GroupAiAssistantModalProps> = ({
  visible,
  onClose,
  groupName,
  groupType = 'Women SHG (மகளிர் சுய உதவிக் குழு)',
  regCode = 'TNCDW-MDU-2024-8842',
  village = 'அலங்காநல்லூர் (Alanganallur)',
  district = 'மதுரை (Madurai)',
  onApplyResolution,
}) => {
  const insets = useSafeAreaInsets();
  const { geminiApiKey } = useContext(AppContext);

  const voiceBridgeRef = useRef<VoiceSpeechBridgeRef>(null);

  const [activeTool, setActiveTool] = useState<AiToolMode>('resolution');
  const [selectedLanguage, setSelectedLanguage] = useState<'Tamil' | 'English'>('Tamil');
  const [inputText, setInputText] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Voice Typing State
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Specific Form Inputs
  const [recipient, setRecipient] = useState('கிளை மேலாளர், கனரா வங்கி (Branch Manager, Canara Bank)');
  const [investmentAmount, setInvestmentAmount] = useState('200000');
  const [meetingDate, setMeetingDate] = useState('05-Sep-2026');
  const [meetingTime, setMeetingTime] = useState('10:30 AM');
  const [venue, setVenue] = useState('Panchayat Community Hall / கிராம அரங்கம்');

  // Start / Stop Voice Typing
  const handleToggleVoiceTyping = () => {
    if (isListening) {
      voiceBridgeRef.current?.stopListening();
      setIsListening(false);
      if (liveTranscript) {
        setInputText((prev) => (prev ? `${prev} ${liveTranscript}` : liveTranscript));
        setLiveTranscript('');
      }
    } else {
      setIsListening(true);
      setLiveTranscript('');
      const langCode = selectedLanguage === 'Tamil' ? 'ta-IN' : 'en-IN';
      voiceBridgeRef.current?.startListening(langCode);
    }
  };

  // Generate with AI
  const handleGenerateAi = async () => {
    const promptInput = inputText.trim() || liveTranscript.trim();
    if (!promptInput && activeTool !== 'savings_statement' && activeTool !== 'meeting_notice') {
      Alert.alert('உள்ளீடு தேவை (Input Required)', 'தயவுசெய்து குறிப்புகளை தட்டச்சு செய்யவும் அல்லது மைக்கை அழுத்தி பேசவும்.');
      return;
    }

    setIsGenerating(true);
    try {
      let result = '';
      if (activeTool === 'resolution') {
        result = await GroupAiService.draftResolution({
          rawNotes: promptInput,
          groupName,
          category: groupType,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'bank_letter') {
        result = await GroupAiService.generateOfficialLetter({
          letterType: 'BankLoan',
          recipientTitle: recipient,
          purpose: promptInput,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'govt_petition') {
        result = await GroupAiService.generateOfficialLetter({
          letterType: 'GovtPetition',
          recipientTitle: 'வட்டார வளர்ச்சி அலுவலர் (Block Development Officer - BDO) / ஊராட்சி தலைவர்',
          purpose: promptInput,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'project_plan') {
        result = await GroupAiService.generateProjectProposal({
          businessIdea: promptInput || 'ஆடை தயாரிப்பு & தையல் பயிலகம்',
          groupName,
          investmentBudget: parseFloat(investmentAmount) || 200000,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'meeting_notice') {
        result = await GroupAiService.generateMeetingNotice({
          meetingDate,
          meetingTime,
          venue,
          agenda: promptInput || '1. மாதாந்திர சேமிப்பு தணிக்கை\n2. புதிய உள் கடன் விண்ணப்பம்',
          groupName,
          regCode,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'savings_statement') {
        result = await GroupAiService.generateSavingsStatement({
          month: 'August 2026',
          totalSavingsPool: 145000,
          activeLoanPool: 40000,
          memberCount: 15,
          monthlyTarget: 500,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'custom_doc') {
        result = await GroupAiService.generateOfficialLetter({
          letterType: 'SubsidyScheme',
          recipientTitle: recipient,
          purpose: promptInput,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'translate') {
        result = await GroupAiService.translateDocument(
          promptInput,
          selectedLanguage,
          geminiApiKey
        );
      }

      setGeneratedResult(result);
    } catch (err: any) {
      Alert.alert('AI Error', err.message || 'Failed to generate document.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Translation of Result
  const handleTranslateResult = async () => {
    if (!generatedResult) return;
    setIsGenerating(true);
    try {
      const target = selectedLanguage === 'Tamil' ? 'English' : 'Tamil';
      const translated = await GroupAiService.translateDocument(generatedResult, target, geminiApiKey);
      setGeneratedResult(translated);
      setSelectedLanguage(target);
    } catch (err: any) {
      Alert.alert('Translation Error', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export as Official PDF
  const handleExportPdf = async () => {
    if (!generatedResult) {
      Alert.alert('Notice', 'Please generate or enter document text first.');
      return;
    }

    setIsExportingPdf(true);
    try {
      let docTitle = 'Official Group Resolution & Minutes';
      let docType: GroupPdfMetadata['docType'] = 'Resolution';

      if (activeTool === 'bank_letter') {
        docTitle = 'Bank Credit Linkage Representation';
        docType = 'BankLetter';
      } else if (activeTool === 'govt_petition') {
        docTitle = 'Government Representation Petition';
        docType = 'GovtPetition';
      } else if (activeTool === 'project_plan') {
        docTitle = 'Micro-Enterprise Business Project Plan';
        docType = 'ProjectProposal';
      } else if (activeTool === 'meeting_notice') {
        docTitle = 'Official Group Meeting Announcement Notice';
        docType = 'Resolution';
      } else if (activeTool === 'savings_statement') {
        docTitle = 'Monthly Savings & Audit Statement';
        docType = 'ProjectProposal';
      }

      await GroupAiService.generateAndShareGroupPdf({
        title: docTitle,
        docType,
        groupName,
        regCode,
        village,
        district,
        content: generatedResult,
      });
    } catch (err: any) {
      Alert.alert('PDF Export Error', err.message || 'Failed to generate PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Construct Formatted Text Message for Social / Messenger
  const buildFormattedTextMessage = () => {
    return (
      `👥 *${groupName} — Official Communication* 📄\n` +
      `📍 *Location:* ${village}, ${district}\n` +
      `🔖 *Reg Code:* ${regCode}\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${generatedResult}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `✨ *SuprO GroupO Digital Administration*`
    );
  };

  // 1. Share via Direct WhatsApp
  const handleShareToWhatsApp = () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Share.share({ message: msg });
    });
  };

  // 2. Share to Course Guide / BDO WhatsApp CRM
  const handleShareToCourseGuideWhatsApp = () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    const url = `whatsapp://send?phone=${COURSE_GUIDE_WHATSAPP}&text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${COURSE_GUIDE_WHATSAPP}?text=${encodeURIComponent(msg)}`);
    });
  };

  // 3. Share via Telegram
  const handleShareToTelegram = () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    const tgUrl = `tg://msg?text=${encodeURIComponent(msg)}`;
    const webTgUrl = `https://t.me/share/url?url=${encodeURIComponent(TELEGRAM_COMMUNITY_URL)}&text=${encodeURIComponent(msg)}`;
    Linking.openURL(tgUrl).catch(() => {
      Linking.openURL(webTgUrl).catch(() => {
        Share.share({ message: msg });
      });
    });
  };

  // 4. Share to Social Media & All Apps (Native Share Sheet)
  const handleShareToSocialMedia = () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    Share.share({
      title: `${groupName} Document`,
      message: msg,
    });
  };

  const handleCopyClipboard = async () => {
    if (!generatedResult) return;
    await Clipboard.setStringAsync(generatedResult);
    Alert.alert('Copied!', 'Document copied to clipboard.');
  };

  const handleApplyToResolution = () => {
    if (onApplyResolution && generatedResult) {
      onApplyResolution(generatedResult);
      Alert.alert('Applied!', 'AI generated resolution transferred to your Meeting Book.');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) + 10 }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerBadge}>
                <Sparkles size={13} color="#EC4899" />
                <Text style={styles.headerBadgeText}>GROUPO UNIVERSAL DOCUMENT & DISPATCH SUITE</Text>
              </View>
              <Text style={styles.modalTitle}>ஆவண உருவாக்கம் & பகிர்வு (Document & Share)</Text>
              <Text style={styles.modalSub}>{groupName} • {regCode}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Tool Modes Selector */}
          <View style={styles.toolsTabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'resolution' && styles.toolTabActive]}
                onPress={() => setActiveTool('resolution')}
              >
                <FileText size={13} color={activeTool === 'resolution' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'resolution' && styles.toolTabTextActive]}>
                  தீர்மானம் (Resolution)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'bank_letter' && styles.toolTabActive]}
                onPress={() => setActiveTool('bank_letter')}
              >
                <Building size={13} color={activeTool === 'bank_letter' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'bank_letter' && styles.toolTabTextActive]}>
                  வங்கி கடன் கடிதம்
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'meeting_notice' && styles.toolTabActive]}
                onPress={() => setActiveTool('meeting_notice')}
              >
                <Calendar size={13} color={activeTool === 'meeting_notice' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'meeting_notice' && styles.toolTabTextActive]}>
                  கூட்ட அறிவிப்பு (Notice)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'savings_statement' && styles.toolTabActive]}
                onPress={() => setActiveTool('savings_statement')}
              >
                <Wallet size={13} color={activeTool === 'savings_statement' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'savings_statement' && styles.toolTabTextActive]}>
                  சேமிப்பு அறிக்கை
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'govt_petition' && styles.toolTabActive]}
                onPress={() => setActiveTool('govt_petition')}
              >
                <Briefcase size={13} color={activeTool === 'govt_petition' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'govt_petition' && styles.toolTabTextActive]}>
                  அரசு மனு (Petition)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'project_plan' && styles.toolTabActive]}
                onPress={() => setActiveTool('project_plan')}
              >
                <Layers size={13} color={activeTool === 'project_plan' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'project_plan' && styles.toolTabTextActive]}>
                  தொழில் திட்டம் (Business Plan)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'custom_doc' && styles.toolTabActive]}
                onPress={() => setActiveTool('custom_doc')}
              >
                <PenTool size={13} color={activeTool === 'custom_doc' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'custom_doc' && styles.toolTabTextActive]}>
                  தனிப்பயன் கடிதம்
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolTab, activeTool === 'translate' && styles.toolTabActive]}
                onPress={() => setActiveTool('translate')}
              >
                <Languages size={13} color={activeTool === 'translate' ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.toolTabText, activeTool === 'translate' && styles.toolTabTextActive]}>
                  மொழிபெயர்ப்பு
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Input Section */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeaderRow}>
                <Text style={styles.inputSectionTitle}>
                  {activeTool === 'resolution'
                    ? '1. தீர்மான குறிப்புகள் (Resolution Notes / Voice):'
                    : activeTool === 'bank_letter'
                    ? '1. வங்கி கடித நோக்கம் (Bank Letter Purpose):'
                    : activeTool === 'meeting_notice'
                    ? '1. கூட்ட நாள் & நிகழ்ச்சி நிரல் (Meeting Agenda):'
                    : activeTool === 'savings_statement'
                    ? '1. மாதாந்திர வரவு-செலவு அறிக்கை குறிப்புகள்:'
                    : activeTool === 'govt_petition'
                    ? '1. மனு விவரம் (Petition Grievance):'
                    : activeTool === 'project_plan'
                    ? '1. தொழில் & திட்ட விவரம் (Project Scope):'
                    : '1. ஆவண விவரங்கள் (Document Content):'}
                </Text>

                {/* Language Switcher */}
                <View style={styles.langPill}>
                  <TouchableOpacity
                    style={[styles.langChoice, selectedLanguage === 'Tamil' && styles.langChoiceActive]}
                    onPress={() => setSelectedLanguage('Tamil')}
                  >
                    <Text style={[styles.langChoiceText, selectedLanguage === 'Tamil' && styles.langChoiceTextActive]}>
                      தமிழ்
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.langChoice, selectedLanguage === 'English' && styles.langChoiceActive]}
                    onPress={() => setSelectedLanguage('English')}
                  >
                    <Text style={[styles.langChoiceText, selectedLanguage === 'English' && styles.langChoiceTextActive]}>
                      English
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Specific Field Configuration */}
              {activeTool === 'bank_letter' && (
                <View style={styles.configBox}>
                  <Text style={styles.configLabel}>பெறுநர் (Recipient Bank & Branch):</Text>
                  <TextInput
                    style={styles.configInput}
                    value={recipient}
                    onChangeText={setRecipient}
                    placeholder="கிளை மேலாளர், கனரா வங்கி"
                    placeholderTextColor="#64748B"
                  />
                </View>
              )}

              {activeTool === 'meeting_notice' && (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <View style={[styles.configBox, { flex: 1 }]}>
                    <Text style={styles.configLabel}>கூட்ட தேதி (Date):</Text>
                    <TextInput
                      style={styles.configInput}
                      value={meetingDate}
                      onChangeText={setMeetingDate}
                    />
                  </View>
                  <View style={[styles.configBox, { flex: 1 }]}>
                    <Text style={styles.configLabel}>நேரம் (Time):</Text>
                    <TextInput
                      style={styles.configInput}
                      value={meetingTime}
                      onChangeText={setMeetingTime}
                    />
                  </View>
                </View>
              )}

              {activeTool === 'project_plan' && (
                <View style={styles.configBox}>
                  <Text style={styles.configLabel}>மதிப்பீட்டு முதலீடு ₹ (Estimated Project Capex):</Text>
                  <TextInput
                    style={styles.configInput}
                    keyboardType="numeric"
                    value={investmentAmount}
                    onChangeText={setInvestmentAmount}
                    placeholder="200000"
                    placeholderTextColor="#64748B"
                  />
                </View>
              )}

              {/* Main Prompt / Voice Box */}
              <View style={styles.textAreaBox}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  placeholder={
                    activeTool === 'resolution'
                      ? 'எ.கா: உறுப்பினர் லட்சுமி அவர்களுக்கு தையல் இயந்திரம் வாங்க ரூ.25,000 உள் கடன் 1.5% வட்டியில் வழங்க...'
                      : activeTool === 'bank_letter'
                      ? 'எ.கா: மகளிர் திட்ட நேரடி கடன் ரூ. 5 லட்சம் கோரி கனரா வங்கி மேலாளருக்கு மனு...'
                      : activeTool === 'meeting_notice'
                      ? 'எ.கா: வரும் ஞாயிற்றுக்கிழமை காலை 10 மணிக்கு கிராம சமுதாய கூடத்தில் மாதாந்திர கூட்டத்திற்கு அனைவரும் வரவும்...'
                      : 'இங்கு தட்டச்சு செய்யவும் அல்லது மைக்கை அழுத்தி தமிழில் பேசவும்...'
                  }
                  placeholderTextColor="#64748B"
                  value={isListening ? liveTranscript || 'குரல் பதிவு செய்யப்படுகிறது (Listening)...' : inputText}
                  onChangeText={setInputText}
                />

                {/* Voice Typing Button in corner */}
                <TouchableOpacity
                  style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
                  onPress={handleToggleVoiceTyping}
                  activeOpacity={0.8}
                >
                  {isListening ? (
                    <MicOff size={18} color="#FFFFFF" />
                  ) : (
                    <Mic size={18} color="#EC4899" />
                  )}
                  <Text style={[styles.voiceBtnText, isListening && { color: '#FFFFFF' }]}>
                    {isListening ? 'Stop' : 'குரல் வழி'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Generate Trigger Button */}
              <TouchableOpacity
                style={[styles.generateBtn, isGenerating && { opacity: 0.7 }]}
                onPress={handleGenerateAi}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={16} color="#FFFFFF" />
                    <Text style={styles.generateBtnText}>AI சட்டபூர்வ ஆவணமாக உருவாக்கு (Generate Document)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Generated Document & Multi-Channel Sharing Suite */}
            {generatedResult ? (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <FileCheck size={16} color="#00D084" />
                    <Text style={styles.resultTitle}>தயாரான ஆவணம் (Generated Document)</Text>
                  </View>
                  <TouchableOpacity style={styles.translateBtn} onPress={handleTranslateResult}>
                    <Languages size={13} color="#38BDF8" />
                    <Text style={styles.translateBtnText}>Translate (மொழிபெயர்)</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.resultEditor}
                  multiline
                  value={generatedResult}
                  onChangeText={setGeneratedResult}
                />

                {/* ─── MULTI-CHANNEL DISPATCH BAR ─── */}
                <Text style={styles.shareSectionLabel}>பகிர்வு & ஆவண வழிகள் (Export & Share Channels):</Text>

                {/* Primary Export Actions */}
                <View style={styles.primaryShareRow}>
                  <TouchableOpacity
                    style={[styles.mainActionBtn, { backgroundColor: '#EC4899' }]}
                    onPress={handleExportPdf}
                    disabled={isExportingPdf}
                  >
                    {isExportingPdf ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Printer size={16} color="#FFFFFF" />
                        <Text style={styles.mainActionBtnText}>Export Official PDF 📄</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.mainActionBtn, { backgroundColor: '#25D366' }]}
                    onPress={handleShareToWhatsApp}
                  >
                    <MessageCircle size={16} color="#FFFFFF" />
                    <Text style={styles.mainActionBtnText}>Share on WhatsApp 📲</Text>
                  </TouchableOpacity>
                </View>

                {/* Secondary Channel Matrix */}
                <View style={styles.secondaryShareGrid}>
                  <TouchableOpacity
                    style={[styles.subChannelBtn, { backgroundColor: '#229ED9' }]}
                    onPress={handleShareToTelegram}
                  >
                    <Send size={14} color="#FFFFFF" />
                    <Text style={styles.subChannelBtnText}>Telegram ✈️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subChannelBtn, { backgroundColor: '#075E54' }]}
                    onPress={handleShareToCourseGuideWhatsApp}
                  >
                    <MessageCircle size={14} color="#FFFFFF" />
                    <Text style={styles.subChannelBtnText}>BDO CRM Hotline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subChannelBtn, { backgroundColor: '#6366F1' }]}
                    onPress={handleShareToSocialMedia}
                  >
                    <Share2 size={14} color="#FFFFFF" />
                    <Text style={styles.subChannelBtnText}>Social Media 🌐</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subChannelBtn, { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' }]}
                    onPress={handleCopyClipboard}
                  >
                    <Copy size={14} color="#F8FAFC" />
                    <Text style={[styles.subChannelBtnText, { color: '#F8FAFC' }]}>Copy Text</Text>
                  </TouchableOpacity>
                </View>

                {onApplyResolution && activeTool === 'resolution' && (
                  <TouchableOpacity style={styles.applyMeetingBtn} onPress={handleApplyToResolution}>
                    <CheckCircle2 size={15} color="#0F172A" />
                    <Text style={styles.applyMeetingBtnText}>Apply directly to Meeting Resolution Book ✅</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </ScrollView>

          {/* Hidden Voice Speech Bridge */}
          <VoiceSpeechBridge
            ref={voiceBridgeRef}
            onSpeechResult={(transcript) => setLiveTranscript(transcript)}
            onSpeechEnd={() => setIsListening(false)}
            onSpeechError={() => setIsListening(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  headerBadgeText: {
    color: '#EC4899',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  toolsTabBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  toolTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolTabActive: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  toolTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  toolTabTextActive: {
    color: '#FFFFFF',
  },
  modalScroll: {
    maxHeight: 480,
    marginTop: 10,
  },
  inputContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputSectionTitle: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  langPill: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 2,
  },
  langChoice: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langChoiceActive: {
    backgroundColor: '#EC4899',
  },
  langChoiceText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  langChoiceTextActive: {
    color: '#FFFFFF',
  },
  configBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  configLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  configInput: {
    color: '#F8FAFC',
    fontSize: 12,
    paddingVertical: 2,
  },
  textAreaBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    minHeight: 90,
    position: 'relative',
  },
  textArea: {
    color: '#F8FAFC',
    fontSize: 12,
    textAlignVertical: 'top',
    paddingBottom: 30,
    lineHeight: 18,
  },
  voiceBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderWidth: 1,
    borderColor: '#EC4899',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  voiceBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  voiceBtnText: {
    color: '#EC4899',
    fontSize: 10,
    fontWeight: '800',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  resultContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 14,
    gap: 10,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  translateBtnText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  resultEditor: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    color: '#F8FAFC',
    fontSize: 12,
    minHeight: 180,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  shareSectionLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  primaryShareRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mainActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mainActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryShareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subChannelBtn: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  subChannelBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  applyMeetingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 4,
  },
  applyMeetingBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
});
