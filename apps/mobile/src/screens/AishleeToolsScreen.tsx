import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView } from 'react-native';
import { Bot, FileText, Download, Share2, History as HistoryIcon, X, Mic, Settings, Search, FileSignature, Globe, Camera } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import { AppContext } from '../context/AppContext';
import { geminiToolsService } from '../services/geminiToolsService';
import { historyService, HistoryItem } from '../services/historyService';
import * as SecureStore from 'expo-secure-store';

const CATEGORIES = [
  { id: 'summarize', name: 'Summarize AI', icon: FileText, tools: ['YouTube Summarizer', 'Webpage Summarizer', 'Text Summarizer'] },
  { id: 'agri', name: 'Agri & Rural', icon: Globe, tools: ['Crop Disease Analysis', 'Farming Insights'] },
  { id: 'govt', name: 'Govt & Citizen', icon: FileSignature, tools: ['TN E-Sevai Chat', 'Legal Translator'] },
  { id: 'education', name: 'Education', icon: Search, tools: ['Quiz Creator', 'Notes Maker'] },
  { id: 'work', name: 'Work & Content', icon: Bot, tools: ['Email Crafter', 'Social Media Gen', 'Resume Improver'] }
];

export default function AishleeToolsScreen({ navigation }: any) {
  const { geminiApiKey } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [activeTool, setActiveTool] = useState(CATEGORIES[0].tools[0]);
  const [language, setLanguage] = useState<'Tamil' | 'English'>('Tamil');
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, [showHistory]);

  const loadHistory = async () => {
    const items = await historyService.getHistory();
    setHistoryData(historyService.getGroupedHistory(items));
  };

  const handleGenerate = async () => {
    if (!input.trim()) return Alert.alert('Error', 'Please enter some text or URL.');
    
    setLoading(true);
    setOutput('');
    
    try {
      let result = { text: '', error: '' };
      
      switch (activeTool) {
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
          result = await geminiToolsService.analyzeCrop(input, geminiApiKey, language); // no image support yet
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
        case 'Quiz Creator':
          result = await geminiToolsService.createQuiz(input, geminiApiKey, language);
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

      if (result.error) {
        Alert.alert('AI Error', result.error);
      } else {
        setOutput(result.text);
        await historyService.saveItem({
          tool: activeTool,
          query: input,
          result: result.text,
          language
        });
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
            
            <div class="footer">
              Generated securely via SuprO - Aishlee AI Hub.
            </div>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (e: any) {
      Alert.alert('PDF Error', e.message);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(output);
    Alert.alert('Copied', 'Text copied to clipboard!');
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
              {group.data.map((item: HistoryItem) => (
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
              ))}
            </View>
          ))}
          {historyData.length === 0 && (
            <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>No history found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const isUrlTool = activeTool.includes('Summarizer');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Bot color="#06b6d4" size={28} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Aishlee Tools</Text>
            <Text style={styles.headerSub}>SuprO AI Hub</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={styles.langToggle} 
            onPress={() => setLanguage(l => l === 'Tamil' ? 'English' : 'Tamil')}
          >
            <Text style={styles.langText}>{language === 'Tamil' ? 'தமிழ்' : 'ENG'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHistory(true)}>
            <HistoryIcon color="#9ca3af" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Categories Tab Bar */}
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
                }}
              >
                <Icon color={isActive ? '#fff' : '#9ca3af'} size={16} />
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
              onPress={() => setActiveTool(tool)}
            >
              <Text style={[styles.toolChipText, activeTool === tool && styles.toolChipTextActive]}>{tool}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Area */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>
            {isUrlTool ? 'Paste Link / URL' : 'Describe your request'}
          </Text>
          <TextInput
            style={styles.textInput}
            multiline={!isUrlTool}
            numberOfLines={isUrlTool ? 1 : 4}
            placeholder={isUrlTool ? "https://..." : "e.g., My tomato leaves are turning yellow..."}
            placeholderTextColor="#6b7280"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.generateBtnText}>Generate {activeTool}</Text>}
          </TouchableOpacity>
        </View>

        {/* Output Area */}
        {output ? (
          <View style={styles.outputCard}>
            <View style={styles.outputHeader}>
              <Text style={styles.outputTitle}>AI Response</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={copyToClipboard}><FileText color="#6366f1" size={20} /></TouchableOpacity>
                <TouchableOpacity onPress={handleExportPDF}><Download color="#6366f1" size={20} /></TouchableOpacity>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <Markdown style={markdownStyles}>{output}</Markdown>
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
  langToggle: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
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

const markdownStyles = StyleSheet.create({
  body: { color: '#e5e7eb', fontSize: 15, lineHeight: 24 },
  heading1: { color: '#fff', marginTop: 16, marginBottom: 8 },
  heading2: { color: '#fff', marginTop: 16, marginBottom: 8 },
  heading3: { color: '#fff', marginTop: 16, marginBottom: 8 },
  list_item: { color: '#e5e7eb', marginVertical: 4 },
  strong: { color: '#fff', fontWeight: 'bold' },
  em: { fontStyle: 'italic', color: '#9ca3af' },
});
