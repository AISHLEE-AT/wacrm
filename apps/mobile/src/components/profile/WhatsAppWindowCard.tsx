import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MessageCircle, RefreshCw, Clock, Zap } from 'lucide-react-native';
import { AppContext } from '../../context/AppContext';

export function WhatsAppWindowCard() {
  const { lastWhatsAppSync, getWhatsAppWindowRemaining, renewWhatsAppWindow, user } = useContext(AppContext);
  const windowStatus = getWhatsAppWindowRemaining();

  const handleRenew = async () => {
    try {
      await renewWhatsAppWindow();
      Alert.alert(
        'WhatsApp Sync Sent! ⚡',
        'We opened WhatsApp for you to send a quick keep-alive message. Your 24-hour notification window is renewed!'
      );
    } catch (e: any) {
      Alert.alert('Notice', 'Could not open WhatsApp. Please ensure WhatsApp is installed.');
    }
  };

  const isExpired = windowStatus.isExpired;
  const isExpiringSoon = !isExpired && windowStatus.hours < 2;

  const cardBorderColor = isExpired
    ? '#ef4444'
    : isExpiringSoon
    ? '#f59e0b'
    : 'rgba(52, 211, 153, 0.3)';

  const cardBgColor = isExpired
    ? 'rgba(239, 68, 68, 0.08)'
    : isExpiringSoon
    ? 'rgba(245, 158, 11, 0.08)'
    : '#111827';

  const badgeColor = isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981';

  return (
    <View style={[styles.card, { borderColor: cardBorderColor, backgroundColor: cardBgColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${badgeColor}20` }]}>
            <MessageCircle color={badgeColor} size={20} />
          </View>
          <View>
            <Text style={styles.title}>WHATSAPP 24H LIVE WINDOW</Text>
            <Text style={styles.subTitle}>Meta CRM & Instant Alerts</Text>
          </View>
        </View>

        {/* Live Pill Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${badgeColor}20`, borderColor: badgeColor }]}>
          <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
          <Text style={[styles.statusText, { color: badgeColor }]}>
            {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING' : 'ACTIVE'}
          </Text>
        </View>
      </View>

      {/* Description & Time */}
      <View style={styles.infoRow}>
        <Clock size={16} color={badgeColor} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.timeRemainingText, { color: badgeColor }]}>
            {isExpired ? 'Window Locked (>24h since last message)' : windowStatus.formatted}
          </Text>
          <Text style={styles.descText}>
            {isExpired
              ? 'Inbound message required every 23h so RideO driver alerts, RentO bookings & mandi prices arrive with zero delay.'
              : 'Your Meta 24-hour customer window is active. All system alerts, driver chats & AI replies are delivered instantly.'}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      {!isExpired && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${windowStatus.percentage}%`, backgroundColor: badgeColor }]} />
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          { backgroundColor: isExpired ? '#10b981' : isExpiringSoon ? '#f59e0b' : '#1e293b' },
          !isExpired && !isExpiringSoon && { borderWidth: 1, borderColor: '#334155' },
        ]}
        onPress={handleRenew}
      >
        {isExpired ? (
          <>
            <Zap size={16} color="#000" />
            <Text style={[styles.actionBtnText, { color: '#000' }]}>
              Re-Activate 24h Window (1-Click)
            </Text>
          </>
        ) : isExpiringSoon ? (
          <>
            <RefreshCw size={16} color="#000" />
            <Text style={[styles.actionBtnText, { color: '#000' }]}>
              Renew 24h Window Now
            </Text>
          </>
        ) : (
          <>
            <RefreshCw size={16} color="#34d399" />
            <Text style={[styles.actionBtnText, { color: '#34d399' }]}>
              Keep-Alive Ping (WhatsApp)
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 10,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  subTitle: {
    color: '#94a3b8',
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeRemainingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  descText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
});
