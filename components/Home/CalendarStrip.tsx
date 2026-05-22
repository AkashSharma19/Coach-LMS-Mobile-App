import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';

const DAYS = [
  { id: '1', date: '20', day: 'Mon', sessions: 0 },
  { id: '2', date: '21', day: 'Tue', sessions: 3 },
  { id: '3', date: '22', day: 'Wed', sessions: 3 },
  { id: '4', date: '23', day: 'Thu', sessions: 2 },
  { id: '5', date: '24', day: 'Fri', sessions: 2 },
  { id: '6', date: '25', day: 'Sat', sessions: 1 },
  { id: '7', date: '26', day: 'Sun', sessions: 0 },
];

export default function CalendarStrip() {
  const [activeId, setActiveId] = useState('2');
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <View style={styles.outerContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {DAYS.map((day) => {
          const isActive = day.id === activeId;
          const sessionLabel = day.sessions > 0 ? (day.sessions < 10 ? `0${day.sessions}` : `${day.sessions}`) : '--';

          return (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayCard,
                { 
                  backgroundColor: isActive ? c.gold : c.card,
                  borderColor: isActive ? c.gold : c.border 
                }
              ]}
              onPress={() => setActiveId(day.id)}
              activeOpacity={0.7}
            >
              <Text variant="bold" style={[styles.dateText, { color: isActive ? '#000' : c.text }]}>
                {day.date}
              </Text>
              <Text variant="semiBold" style={[styles.dayText, { color: isActive ? '#000' : c.textSecondary }]}>
                {day.day}
              </Text>
              
              <View style={[
                styles.sessionBadge, 
                { backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)' }
              ]}>
                <Text variant="bold" style={[styles.sessionText, { color: isActive ? '#000' : c.textSecondary }]}>
                  {sessionLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  container: {
    paddingLeft: 20,
    paddingRight: 10,
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  dayCard: {
    width: 68,
    height: 105, // Increased height to accommodate the session count
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateText: {
    fontSize: 22,
  },
  dayText: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  sessionBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 32,
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
