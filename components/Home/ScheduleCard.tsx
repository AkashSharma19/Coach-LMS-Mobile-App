import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Text, View } from '../Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleCardProps {
  time: string;
  subject: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Workshop';
  style?: ViewStyle;
}

export default function ScheduleCard({ time, subject, room, type, style }: ScheduleCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.tabIconDefault + '33' }, style]}>
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: theme.tint + '15' }]}>
          <Text style={[styles.badgeText, { color: theme.tint }]}>{type}</Text>
        </View>
        <Text style={[styles.time, { color: theme.icon }]}>{time}</Text>
      </View>
      
      <Text style={[styles.subject, { color: theme.text }]} numberOfLines={2}>{subject}</Text>
      
      <View style={styles.footer}>
        <Ionicons name="location-outline" size={14} color={theme.icon} />
        <Text style={[styles.room, { color: theme.icon }]}>{room}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
  },
  subject: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  room: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
});
