import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Play, Lock, ChevronLeft, ChevronRight } from 'lucide-react-native';

export interface RoutineTask {
  id: string;
  type: 'video' | 'notes' | 'quiz' | 'code';
  duration: string;
  title: string;
  subtitle?: string;
  rawTopic?: string;
  rawSubject?: string;
  status: 'completed' | 'in_progress' | 'locked';
  xp: number;
  actionLabel: string;
}

interface TeachORoutineStepsProps {
  currentDay: number;
  totalDays: number;
  tasks: RoutineTask[];
  onSelectDay: (day: number) => void;
  onTaskPress: (task: RoutineTask) => void;
}

export const TeachORoutineSteps: React.FC<TeachORoutineStepsProps> = ({
  currentDay,
  totalDays,
  tasks,
  onSelectDay,
  onTaskPress,
}) => {
  return (
    <View style={styles.sectionContainer}>
      {/* Section Title & Day Stepper */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Daily Routine Steps</Text>
          <Text style={styles.sectionSubtitle}>
            {tasks.length} bite-sized micro-lessons for Day {currentDay}
          </Text>
        </View>

        {/* Day Navigator */}
        <View style={styles.dayStepper}>
          <TouchableOpacity
            style={[styles.stepperBtn, currentDay <= 1 && styles.stepperBtnDisabled]}
            disabled={currentDay <= 1}
            onPress={() => onSelectDay(Math.max(1, currentDay - 1))}
            activeOpacity={0.7}
          >
            <ChevronLeft size={16} color={currentDay <= 1 ? '#475569' : '#94a3b8'} />
          </TouchableOpacity>

          <View style={styles.stepperLabel}>
            <Text style={styles.stepperLabelText}>Day {currentDay}</Text>
          </View>

          <TouchableOpacity
            style={[styles.stepperBtn, currentDay >= totalDays && styles.stepperBtnDisabled]}
            disabled={currentDay >= totalDays}
            onPress={() => onSelectDay(Math.min(totalDays, currentDay + 1))}
            activeOpacity={0.7}
          >
            <ChevronRight size={16} color={currentDay >= totalDays ? '#475569' : '#94a3b8'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      <View style={styles.tasksList}>
        {tasks.map((task, index) => {
          const isDone = task.status === 'completed';
          const isCurrent = task.status === 'in_progress';
          const isLocked = task.status === 'locked';

          return (
            <TouchableOpacity
              key={task.id || `step-${index}`}
              style={[
                styles.taskCard,
                isDone && styles.taskCardDone,
                isCurrent && styles.taskCardCurrent,
                isLocked && styles.taskCardLocked,
              ]}
              onPress={() => onTaskPress(task)}
              activeOpacity={isLocked ? 1 : 0.75}
            >
              {/* Step Status Indicator Icon */}
              <View
                style={[
                  styles.statusIconBox,
                  isDone && styles.statusIconBoxDone,
                  isCurrent && styles.statusIconBoxCurrent,
                  isLocked && styles.statusIconBoxLocked,
                ]}
              >
                {isDone ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : isCurrent ? (
                  <Play size={18} color="#06b6d4" fill="#06b6d4" />
                ) : (
                  <Lock size={16} color="#64748b" />
                )}
              </View>

              {/* Task Details */}
              <View style={styles.taskInfo}>
                <View style={styles.taskMetaRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>Step {index + 1}</Text>
                  </View>
                  <Text style={styles.durationText}>⏱ {task.duration}</Text>
                  <Text style={styles.xpText}>+{task.xp} XP</Text>
                </View>

                <Text
                  style={[
                    styles.taskTitle,
                    isDone && styles.taskTitleDone,
                    isLocked && styles.taskTitleLocked,
                  ]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
              </View>

              {/* Action Button / Pill */}
              <View
                style={[
                  styles.actionPill,
                  isDone && styles.actionPillDone,
                  isCurrent && styles.actionPillCurrent,
                  isLocked && styles.actionPillLocked,
                ]}
              >
                <Text
                  style={[
                    styles.actionPillText,
                    isDone && styles.actionPillTextDone,
                    isCurrent && styles.actionPillTextCurrent,
                    isLocked && styles.actionPillTextLocked,
                  ]}
                >
                  {isDone ? 'Review' : isCurrent ? 'Start' : 'Locked'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  dayStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131e32',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  stepperBtnDisabled: {
    backgroundColor: 'transparent',
  },
  stepperLabel: {
    paddingHorizontal: 8,
  },
  stepperLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131e32',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  taskCardDone: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  taskCardCurrent: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  taskCardLocked: {
    opacity: 0.6,
  },
  statusIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIconBoxDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusIconBoxCurrent: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  statusIconBoxLocked: {
    backgroundColor: '#1e293b',
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  durationText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  xpText: {
    fontSize: 11,
    color: '#c084fc',
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
    lineHeight: 18,
  },
  taskTitleDone: {
    color: '#cbd5e1',
  },
  taskTitleLocked: {
    color: '#64748b',
  },
  actionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  actionPillDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  actionPillCurrent: {
    backgroundColor: '#06b6d4',
  },
  actionPillLocked: {
    backgroundColor: '#1e293b',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  actionPillTextDone: {
    color: '#34d399',
  },
  actionPillTextCurrent: {
    color: '#0B1120',
  },
  actionPillTextLocked: {
    color: '#64748b',
  },
});
