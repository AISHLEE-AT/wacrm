import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, GitBranch, Radio, Zap, Workflow, ChevronRight } from 'lucide-react-native';

const crmItems = [
  { id: 'contacts', title: 'Contacts', icon: Users, route: '/crm/contacts', color: '#3b82f6' },
  { id: 'pipelines', title: 'Pipelines', icon: GitBranch, route: '/crm/pipelines', color: '#10b981' },
  { id: 'broadcasts', title: 'Broadcasts', icon: Radio, route: '/crm/broadcasts', color: '#f59e0b' },
  { id: 'automations', title: 'Automations', icon: Zap, route: '/crm/automations', color: '#6366f1' },
  { id: 'flows', title: 'Flows', icon: Workflow, route: '/crm/flows', color: '#ec4899', isBeta: true },
];

export default function CrmHubScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>WhatsApp CRM</Text>
        <Text style={styles.subtitle}>Manage your customer relationships and automation.</Text>
      </View>

      <View style={styles.grid}>
        {crmItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '1A' }]}>
              <item.icon color={item.color} size={24} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.isBeta && (
                <View style={styles.betaBadge}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              )}
            </View>
            <ChevronRight color="#cbd5e1" size={20} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
  },
  grid: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  betaBadge: {
    marginLeft: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  betaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
});
