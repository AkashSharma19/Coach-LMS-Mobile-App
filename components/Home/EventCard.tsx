import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  description: string;
}

export default function EventCard({ title, date, time, description }: EventCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.background, borderColor: theme.tabIconDefault + '33' }]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
          <View style={[styles.dateBadge, { backgroundColor: theme.tint + '10' }]}>
            <Text style={[styles.dateText, { color: theme.tint }]}>{date}</Text>
          </View>
        </View>
        
        <Text style={[styles.description, { color: theme.icon }]} numberOfLines={2}>
          {description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={theme.icon} />
            <Text style={[styles.metaText, { color: theme.icon }]}>{time}</Text>
          </View>
          <Text style={[styles.joinText, { color: theme.tint }]}>Learn More</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  joinText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
