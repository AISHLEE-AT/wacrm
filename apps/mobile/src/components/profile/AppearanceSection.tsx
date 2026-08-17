import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Palette, Sun, Moon } from 'lucide-react-native';
import { colors, spacing, radius, fontSize, ACCENT_THEMES } from '../../lib/theme';

interface AppearanceSectionProps {
  currentMode: 'light' | 'dark';
  currentAccent: string;
  onModeChange: (mode: 'light' | 'dark') => void;
  onAccentChange: (accentId: string) => void;
}

export function AppearanceSection({
  currentMode,
  currentAccent,
  onModeChange,
  onAccentChange
}: AppearanceSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Palette size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Theme Mode</Text>
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }, currentMode === 'light' && { borderColor: colors.primary, backgroundColor: colors.inputBg }]}
          onPress={() => onModeChange('light')}
          activeOpacity={0.7}
        >
          <View style={styles.modeIconRow}>
            <Sun size={24} color={currentMode === 'light' ? colors.primary : colors.textSecondary} />
            {currentMode === 'light' && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={[styles.modeText, { color: colors.text }, currentMode === 'light' && { color: colors.primary }]}>Light</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }, currentMode === 'dark' && { borderColor: colors.primary, backgroundColor: colors.inputBg }]}
          onPress={() => onModeChange('dark')}
          activeOpacity={0.7}
        >
          <View style={styles.modeIconRow}>
            <Moon size={24} color={currentMode === 'dark' ? colors.primary : colors.textSecondary} />
            {currentMode === 'dark' && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={[styles.modeText, { color: colors.text }, currentMode === 'dark' && { color: colors.primary }]}>Dark</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Accent Color</Text>
      <View style={styles.accentGrid}>
        {ACCENT_THEMES.map((theme) => {
          const isActive = currentAccent === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.accentCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                isActive && { borderColor: theme.swatch }
              ]}
              onPress={() => onAccentChange(theme.id)}
              activeOpacity={0.7}
            >
              <View style={styles.accentHeader}>
                <View style={[styles.swatch, { backgroundColor: theme.swatch }]} />
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: theme.swatch + '20' }]}>
                    <Text style={[styles.activeBadgeText, { color: theme.swatch }]}>Active</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.accentName, { color: colors.text }]}>{theme.name}</Text>
              <Text style={[styles.accentTagline, { color: colors.textSecondary }]} numberOfLines={1}>{theme.tagline}</Text>
              <View style={styles.colorBarContainer}>
                <View style={[styles.colorBar, { backgroundColor: theme.swatch }]} />
                <View style={[styles.colorBar, { backgroundColor: theme.swatch, opacity: 0.6 }]} />
                <View style={[styles.colorBar, { backgroundColor: theme.swatch, opacity: 0.3 }]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  activeModeCard: {},
  modeIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  activeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  modeText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  activeModeText: {},
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  accentCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  accentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  accentName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  accentTagline: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  colorBarContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 1,
  },
  colorBar: {
    flex: 1,
    height: '100%',
  },
});
