import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot, CheckSquare, MessageSquare, Sparkles, Bell, Send, CheckCircle2 } from 'lucide-react-native';

interface TeachOQuickHubProps {
  onOpenAiTutor: () => void;
  onOpenTestO: () => void;
  onOpenNotes?: () => void;
  onSendWhatsAppAlert?: () => void;
  isWhatsAppAlertEnabled?: boolean;
}

export const TeachOQuickHub: React.FC<TeachOQuickHubProps> = ({
  onOpenAiTutor,
  onOpenTestO,
  onOpenNotes,
  onSendWhatsAppAlert,
  isWhatsAppAlertEnabled = true,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Learning Tools & Exam Hub</Text>

      {/* Main 2-Card Grid */}
      <View style={styles.gridRow}>
        {/* Card 1: AI Doubt Solver */}
        <TouchableOpacity
          style={[styles.hubCard, styles.aiCard]}
          onPress={onOpenAiTutor}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
            <Bot size={20} color="#c084fc" />
          </View>
          <Text style={styles.cardTitle}>AI Homework Tutor</Text>
          <Text style={styles.cardSub}>Ask doubts in Tamil & English with step prompt</Text>
        </TouchableOpacity>

        {/* Card 2: TestO Mock Tests */}
        <TouchableOpacity
          style={[styles.hubCard, styles.testoCard]}
          onPress={onOpenTestO}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <CheckSquare size={20} color="#fbbf24" />
          </View>
          <Text style={styles.cardTitle}>TestO Live Tests</Text>
          <Text style={styles.cardSub}>Chapter tests & instant score for day topics</Text>
        </TouchableOpacity>
      </View>

      {/* Card 3: WhatsApp CRM Daily Routine & Active Session Sync */}
      {onSendWhatsAppAlert && (
        <TouchableOpacity
          style={styles.waCard}
          onPress={onSendWhatsAppAlert}
          activeOpacity={0.85}
        >
          <View style={styles.waIconBox}>
            <MessageSquare size={18} color="#25D366" />
          </View>
          <View style={styles.waContent}>
            <View style={styles.waHeaderRow}>
              <Text style={styles.waTitle}>WhatsApp CRM Study Alerts</Text>
              <View style={styles.waBadge}>
                <CheckCircle2 size={10} color="#25D366" />
                <Text style={styles.waBadgeText}>Auto-Notify Active</Text>
              </View>
            </View>
            <Text style={styles.waDesc}>
              Tap to dispatch today's day plan, 4-step syllabus & active session reminder to your WhatsApp!
            </Text>
          </View>
          <View style={styles.waSendBtn}>
            <Send size={14} color="#25D366" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hubCard: {
    flex: 1,
    backgroundColor: '#131e32',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  aiCard: {
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  testoCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
  },
  waCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
    gap: 10,
  },
  waIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waContent: {
    flex: 1,
  },
  waHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  waTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
  },
  waBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(37, 211, 102, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  waBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#25D366',
  },
  waDesc: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
  },
  waSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
