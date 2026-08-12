import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, SafeAreaView, Image 
} from 'react-native';
import { 
  Bot, FileText, Download, Share2, History as HistoryIcon, X, 
  Settings, Search, FileSignature, Globe, Camera, Paperclip, Mic 
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import { Audio } from 'expo-av';

import { AppContext } from '../context/AppContext';
import { geminiToolsService } from '../services/geminiToolsService';
import { historyService, HistoryItem } from '../services/historyService';
import { aishleeSupabase } from '../services/aishleeSupabase';

const CATEGORIES = [
  { id: 'summarize', name: 'Summarize AI', icon: FileText, tools: ['YouTube Summarizer', 'Webpage Summarizer', 'Text Summarizer'] },
  { id: 'agri', name: 'Agri & Rural', icon: Globe, tools: ['Crop Disease Analysis', 'Farming Insights'] },
  { id: 'govt', name: 'Govt & Citizen', icon: FileSignature, tools: ['TN E-Sevai Chat', 'Legal Translator'] },
  { id: 'education', name: 'Education', icon: Search, tools: ['Quiz Creator', 'Notes Maker'] },
  { id: 'work', name: 'Work & Content', icon: Bot, tools: ['Email Crafter', 'Social Media Gen', 'Resume Improver'] },
  { id: 'viral', name: 'Viral & Social', icon: Share2, tools: ['StatusO Quote Gen'] }
];

export default function AishleeToolsScreen({ navigation }: any) {
  const { geminiApiKey, user } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [activeTool, setActiveTool] = useState(CATEGORIES[0].tools[0]);
  const [language, setLanguage] = useState<'Tamil' | 'English'>('Tamil');
  
  // Standard Inputs
  const [input, setInput] = useState('');
  
  // Quiz specific inputs
  const [quizNumQuestions, setQuizNumQuestions] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');

  // Media inputs
  const [attachment, setAttachment] = useState<{ uri: string, base64: string, mimeType: string, name: string } | null>(null);

  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice Recording (Kural AI)
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Status Image Gen (StatusO)
  const viewShotRef = useRef<any>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, [showHistory]);

  const loadHistory = async () => {
    const items = await historyService.getHistory();
    setHistoryData(historyService.getGroupedHistory(items));
  };

  const resetInputs = () => {
    setInput('');
    setAttachment(null);
    setOutput('');
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRec);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      setAttachment({ uri, base64, mimeType: 'audio/m4a', name: 'Voice Input (Kural AI)' });
    }
    setRecording(null);
  };

  const shareWhatsAppStatus = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        await Sharing.shareAsync(uri, { dialogTitle: 'Share Status' });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to capture status');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      setAttachment({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
        name: 'Selected Image'
      });
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
        
        setAttachment({
          uri: fileUri,
          base64: base64,
          mimeType: result.assets[0].mimeType || 'application/pdf',
          name: result.assets[0].name
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to read document');
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() && !attachment) return Alert.alert('Error', 'Please enter some text, a URL, or attach a file.');
    
    setLoading(true);
    setOutput('');
    
    try {
      let result = { text: '', error: '' };
      const attachList = attachment ? [attachment] : [];
      
      if (activeTool === 'Quiz Creator') {
        const quizRes = await geminiToolsService.generateAndSaveQuiz(
          input, quizNumQuestions, quizDifficulty, geminiApiKey, language, attachList
        );
        
        if (quizRes.error) {
          result.error = quizRes.error;
        } else {
          // Success! We have the JSON data.
          if (user?.isAdmin) {
            // Save to Public unified_master_data
            const { error: dbErr } = await aishleeSupabase.from('unified_master_data').insert({
              item_type: 'o_test',
              title_name: 'AI Generated: ' + (input.substring(0, 30) || 'Quiz'),
              description_purpose: `A ${quizDifficulty} difficulty quiz generated by SuprO AI.`,
              additional_info: { questions: quizRes.data }
            });
            if (dbErr) throw dbErr;
            Alert.alert("Success", "Mock Exam generated and saved publicly to TestO!");
            
            // Navigate directly to play it? We can just set output text to let them know
            result.text = `### Quiz Successfully Generated!\n\n${quizNumQuestions} questions created and saved to the Public TestO Database.\n\nYou can now go to the TestO module to take this test.`;
          } else {
            // Save locally to history
            result.text = `### Quiz Successfully Generated!\n\n${quizNumQuestions} questions created. Saved to your local history.`;
            
            // We stringify the JSON payload so we can retrieve it from history
            await historyService.saveItem({
              tool: 'Quiz Creator Payload', // hidden payload
              query: input,
              result: JSON.stringify(quizRes.data),
              language
            });
            
            // Navigate directly to let them play it now!
            Alert.alert("Success", "Mock Exam generated successfully!", [
              { 
                text: "Play Now", 
                onPress: () => navigation.navigate('TestOExamScreen', { 
                  testId: 'local', 
                  title: 'My AI Quiz', 
                  localQuestions: quizRes.data 
                }) 
              },
              { text: "Later", style: 'cancel' }
            ]);
          }
        }
      } else if (attachment?.mimeType === 'audio/m4a' || attachment?.mimeType.startsWith('audio/')) {
        // Voice Assistant (Kural AI) processing
        result = await geminiToolsService.processAudioInput(geminiApiKey, attachment.base64, attachment.mimeType, language);
      } else {
        switch (activeTool) {
          case 'StatusO Quote Gen':
            result = await geminiToolsService.statusQuoteGen(input, 'Viral Status', geminiApiKey);
            break;
          case 'YouTube Summarizer':
            result = await geminiToolsService.summarizeYouTube(input, geminiApiKey, language);
            break;
          case 'Webpage Summarizer':
            result = await geminiToolsService.summarizeWebpage(input, geminiApiKey, language);
            break;
          case 'Text Summarizer':
            result = await geminiToolsService.summarizeText(input, geminiApiKey, language);
            break;
          case 'Crop Disease Analysis':
            result = await geminiToolsService.analyzeCrop(input, geminiApiKey, language, attachList);
            break;
          case 'Farming Insights':
            result = await geminiToolsService.farmingInsights(input, geminiApiKey, language);
            break;
          case 'TN E-Sevai Chat':
            result = await geminiToolsService.eSevaiChat(input, geminiApiKey, language);
            break;
          case 'Legal Translator':
            result = await geminiToolsService.legalTranslator(input, geminiApiKey, language);
            break;
          case 'Notes Maker':
            result = await geminiToolsService.makeNotes(input, geminiApiKey, language);
            break;
          case 'Email Crafter':
            result = await geminiToolsService.craftEmail(input, geminiApiKey, language);
            break;
          case 'Social Media Gen':
            result = await geminiToolsService.socialMediaGen(input, geminiApiKey, language);
            break;
          case 'Resume Improver':
            result = await geminiToolsService.improveResume(input, geminiApiKey, language);
            break;
          default:
            result = await geminiToolsService.summarizeText(input, geminiApiKey, language);
        }
      }

      if (result.error) {
        Alert.alert('AI Error', result.error);
      } else {
        if (result.text) {
          setOutput(result.text);
          if (activeTool !== 'Quiz Creator') {
            await historyService.saveItem({ tool: activeTool, query: input, result: result.text, language });
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; }
              .logo { font-size: 28px; font-weight: bold; color: #6366f1; }
              .sublogo { font-size: 14px; color: #666; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #1f2937; }
              .content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">SuprO App</div>
                <div class="sublogo">Powered by Aishlee AI</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #666;">
                Date: ${new Date().toLocaleDateString()}<br/>
                Tool: ${activeTool}
              </div>
            </div>
            
            <div class="title">${activeTool} Report</div>
            <div class="content">${output.replace(/\\n/g, '<br/>')}</div>
            
            <div class="footer">Generated securely via SuprO - Aishlee AI Hub.</div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert('Error', 'Sharing is not available');
      }
    } catch (e: any) {
      Alert.alert('PDF Error', e.message);
    }
  };

  const shareViaWhatsApp = async () => {
    const url = 'whatsapp://send?text=' + encodeURIComponent(output);
    try {
      await Sharing.shareAsync(url);
    } catch(e) {
      // Fallback if whatsapp intent fails
      Clipboard.setStringAsync(output);
      Alert.alert('Copied', 'Text copied to clipboard! Paste it in WhatsApp.');
    }
  };

  const renderDynamicInput = () => {
    const isUrlTool = ['YouTube Summarizer', 'Webpage Summarizer'].includes(activeTool);
    const isCropTool = activeTool === 'Crop Disease Analysis';
    const isQuizTool = activeTool === 'Quiz Creator';

    return (
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>
          {isUrlTool ? 'Paste Link / URL' : isCropTool ? 'Describe the issue or upload a photo' : isQuizTool ? 'Enter the syllabus, topic, or upload notes' : 'Describe your request'}
        </Text>
        
        {/* Media Attachments */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {(isCropTool || activeTool === 'Notes Maker' || isQuizTool || activeTool === 'Text Summarizer') && (
            <>
              <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
                <Camera color="#9ca3af" size={16} />
                <Text style={styles.attachText}>Image</Text>
              </TouchableOpacity>
              
              {(activeTool === 'Notes Maker' || isQuizTool || activeTool === 'Text Summarizer') && (
                <TouchableOpacity style={styles.attachBtn} onPress={handlePickDocument}>
                  <Paperclip color="#9ca3af" size={16} />
                  <Text style={styles.attachText}>PDF / Doc</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Voice Input for Kural AI (always available) */}
          <TouchableOpacity 
            style={[styles.attachBtn, isRecording && { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]} 
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Mic color={isRecording ? "#ef4444" : "#9ca3af"} size={16} />
            <Text style={[styles.attachText, isRecording && { color: '#ef4444' }]}>
              {isRecording ? "Recording..." : "Hold to Speak"}
            </Text>
          </TouchableOpacity>
        </View>

        {attachment && (
          <View style={styles.attachmentChip}>
            <Text style={styles.attachmentName} numberOfLines={1}>{attachment.name}</Text>
            <TouchableOpacity onPress={() => setAttachment(null)}>
              <X color="#ef4444" size={16} />
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.textInput}
          multiline={!isUrlTool}
          numberOfLines={isUrlTool ? 1 : 4}
          placeholder={isUrlTool ? "https://..." : "e.g., My tomato leaves are turning yellow..."}
          placeholderTextColor="#6b7280"
          value={input}
          onChangeText={setInput}
        />

        {/* Quiz Configurations */}
        {isQuizTool && (
          <View style={styles.quizConfig}>
            <Text style={styles.configLabel}>Number of Questions:</Text>
            <View style={styles.configRow}>
              {[5, 10, 20].map(n => (
                <TouchableOpacity 
                  key={n} 
                  style={[styles.configOption, quizNumQuestions === n && styles.configOptionActive]}
                  onPress={() => setQuizNumQuestions(n)}
                >
                  <Text style={[styles.configOptionText, quizNumQuestions === n && styles.configOptionTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.configLabel, { marginTop: 12 }]}>Difficulty Level:</Text>
            <View style={styles.configRow}>
              {['Easy', 'Medium', 'Hard'].map(d => (
                <TouchableOpacity 
                  key={d} 
                  style={[styles.configOption, quizDifficulty === d && styles.configOptionActive]}
                  onPress={() => setQuizDifficulty(d)}
                >
                  <Text style={[styles.configOptionText, quizDifficulty === d && styles.configOptionTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: '#06b6d4', marginTop: 12, fontSize: 12 }}>
              {user?.isAdmin ? "Admin Mode: Quiz will be saved publicly to TestO." : "User Mode: Quiz will be saved to your device and playable immediately."}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.generateBtnText}>Generate {activeTool}</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  const renderHistory = () => (
    <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Your AI History</Text>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ padding: 16 }}>
          {historyData.map((group, idx) => (
            <View key={idx} style={{ marginBottom: 24 }}>
              <Text style={styles.historyGroupTitle}>{group.title}</Text>
              {group.data.map((item: HistoryItem) => {
                if (item.tool === 'Quiz Creator Payload') {
                  // Special rendering for local quizzes
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[styles.historyCard, { borderColor: '#10b981' }]}
                      onPress={() => {
                        setShowHistory(false);
                        navigation.navigate('TestOExamScreen', { 
                          testId: 'local', 
                          title: 'My AI Quiz', 
                          localQuestions: JSON.parse(item.result) 
                        });
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.historyCardTool, { color: '#10b981' }]}>Mock Exam (Playable)</Text>
                        <Text style={styles.historyCardDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                      </View>
                      <Text style={styles.historyCardQuery} numberOfLines={2}>{item.query}</Text>
                    </TouchableOpacity>
                  );
                }
                
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.historyCard}
                    onPress={() => {
                      setActiveTool(item.tool);
                      setInput(item.query);
                      setOutput(item.result);
                      setShowHistory(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.historyCardTool}>{item.tool}</Text>
                      <Text style={styles.historyCardDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.historyCardQuery} numberOfLines={2}>{item.query}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          {historyData.length === 0 && (
            <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>No history found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Bot color="#06b6d4" size={32} />
          <View>
            <Text style={styles.headerTitle}>Aishlee Tools</Text>
            <Text style={styles.headerSub}>SuprO AI Hub</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={styles.langToggle}
            onPress={() => setLanguage(l => l === 'Tamil' ? 'English' : 'Tamil')}
          >
            <Text style={styles.langText}>{language === 'Tamil' ? 'தமிழ்' : 'Eng'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHistory(true)}>
            <HistoryIcon color="#9ca3af" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory.id === cat.id;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => {
                  setActiveCategory(cat);
                  setActiveTool(cat.tools[0]);
                  resetInputs();
                }}
              >
                <Icon color={isActive ? '#fff' : '#9ca3af'} size={18} />
                <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Micro-Tools Chips */}
        <View style={styles.toolsContainer}>
          {activeCategory.tools.map(tool => (
            <TouchableOpacity
              key={tool}
              style={[styles.toolChip, activeTool === tool && styles.toolChipActive]}
              onPress={() => {
                setActiveTool(tool);
                resetInputs();
              }}
            >
              <Text style={[styles.toolChipText, activeTool === tool && styles.toolChipTextActive]}>{tool}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Input Area */}
        {renderDynamicInput()}

        {/* Output Area */}
        {output ? (
          <View style={styles.outputCard}>
            <View style={styles.outputHeader}>
              <Text style={styles.outputTitle}>AI Response</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity onPress={shareViaWhatsApp}><Share2 color="#22c55e" size={20} /></TouchableOpacity>
                <TouchableOpacity onPress={copyToClipboard}><FileText color="#6366f1" size={20} /></TouchableOpacity>
                <TouchableOpacity onPress={handleExportPDF}><Download color="#6366f1" size={20} /></TouchableOpacity>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              {activeTool === 'StatusO Quote Gen' ? (
              <View>
                <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
                  <View style={{ backgroundColor: '#0f172a', padding: 32, borderRadius: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, fontStyle: 'italic' }}>
                      "{output}"
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.7 }}>
                      <Bot color="#06b6d4" size={16} />
                      <Text style={{ color: '#06b6d4', marginLeft: 8, fontSize: 12 }}>Generated by SuprO App</Text>
                    </View>
                  </View>
                </ViewShot>
                <View style={styles.outputActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={shareWhatsAppStatus}>
                    <Share2 color="#06b6d4" size={20} />
                    <Text style={styles.actionText}>Share to WhatsApp Status</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Markdown style={markdownStyles}>{output}</Markdown>
            )}
            </View>
          </View>
        ) : null}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {renderHistory()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { color: '#06b6d4', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: '#9ca3af', fontSize: 12 },
  langToggle: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, justifyContent: 'center' },
  langText: { color: '#06b6d4', fontWeight: 'bold', fontSize: 12 },
  
  categoryScroll: { paddingHorizontal: 16, marginTop: 16, maxHeight: 50 },
  categoryTab: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 12, height: 40 },
  categoryTabActive: { backgroundColor: '#6366f1' },
  categoryTabText: { color: '#9ca3af', marginLeft: 8, fontWeight: 'bold' },
  categoryTabTextActive: { color: '#fff' },

  toolsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 16, gap: 10 },
  toolChip: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  toolChipActive: { borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)' },
  toolChipText: { color: '#d1d5db', fontSize: 13 },
  toolChipTextActive: { color: '#06b6d4', fontWeight: 'bold' },

  inputCard: { backgroundColor: '#111827', margin: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  inputLabel: { color: '#9ca3af', marginBottom: 12, fontSize: 13 },
  textInput: { backgroundColor: '#0B0F19', color: '#fff', padding: 16, borderRadius: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  
  attachBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  attachText: { color: '#d1d5db', fontSize: 12, fontWeight: 'bold' },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 12 },
  attachmentName: { color: '#fff', fontSize: 12, flex: 1, marginRight: 8 },

  quizConfig: { marginTop: 16, padding: 12, backgroundColor: '#0B0F19', borderRadius: 12 },
  configLabel: { color: '#9ca3af', fontSize: 13, marginBottom: 8 },
  configRow: { flexDirection: 'row', gap: 8 },
  configOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#374151' },
  configOptionActive: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  configOptionText: { color: '#d1d5db', fontSize: 13 },
  configOptionTextActive: { color: '#10b981', fontWeight: 'bold' },

  generateBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  generateBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  outputCard: { backgroundColor: '#111827', marginHorizontal: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  outputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 12 },
  outputTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  historyContainer: { flex: 1, backgroundColor: '#0B0F19' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  historyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  historyGroupTitle: { color: '#6366f1', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  historyCard: { backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  historyCardTool: { color: '#06b6d4', fontWeight: 'bold', fontSize: 14 },
  historyCardDate: { color: '#6b7280', fontSize: 12 },
  historyCardQuery: { color: '#d1d5db', fontSize: 13, marginTop: 8 }
});

const markdownStyles = {
  body: { color: '#fff', fontSize: 15, lineHeight: 24 },
  heading1: { color: '#06b6d4', fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  heading2: { color: '#06b6d4', fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  bullet_list: { marginTop: 8, marginBottom: 8 },
  strong: { color: '#fff', fontWeight: 'bold' },
};
