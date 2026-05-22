import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '../Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';

interface SessionCardProps {
  subject: string;
  topic: string;
  location: string;
  time: string;
  category: string;
  status?: 'upcoming' | 'completed';
  style?: any;
}

export default function SessionCard({ 
  subject, 
  topic, 
  location, 
  time, 
  category, 
  status = 'upcoming',
  style
}: SessionCardProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];
  const isCompleted = status === 'completed';

  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.cardWrapper, style]}>
      <LinearGradient
        colors={[c.card, '#1A1A1A']}
        style={[
          styles.container, 
          { borderColor: c.border }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={[
              styles.categoryBadge, 
              { backgroundColor: c.gold + '15' }
            ]}>
              <Text variant="bold" style={[
                styles.categoryText, 
                { color: c.gold }
              ]}>
                {category}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={c.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <Text variant="bold" style={[styles.subject, { color: c.textSecondary }]}>{subject}</Text>
        <Text variant="bold" style={[styles.topic, { color: c.text }]} numberOfLines={2}>
          {topic}
        </Text>
        
        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <View style={[styles.iconBox, { backgroundColor: c.cardSecondary }]}>
              <Ionicons name="location-sharp" size={14} color={c.gold} />
            </View>
            <Text variant="medium" style={[styles.metaText, { color: c.text }]}>{location}</Text>
          </View>
          
          <View style={[styles.metaItem, { marginTop: 12 }]}>
            <View style={[styles.iconBox, { backgroundColor: c.cardSecondary }]}>
              <Ionicons name="time-sharp" size={14} color={c.gold} />
            </View>
            <Text variant="medium" style={[styles.metaText, { color: c.text }]}>{time}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: c.green }]} />
            <Text variant="semiBold" style={[styles.statusText, { color: c.green }]}>
              Class is Confirmed
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.actionBtn, 
              { backgroundColor: c.gold }
            ]} 
            activeOpacity={0.7}
          >
            <Text variant="bold" style={[styles.actionText, { color: '#000' }]}>
              Resources
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  container: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  doneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subject: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    opacity: 0.5,
  },
  topic: {
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 20,
    opacity: 0.5,
  },
  metaContainer: {
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 13,
  },
});
