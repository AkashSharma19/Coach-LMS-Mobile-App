import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Text } from '../Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';

const DATA = [
  { id: '2', name: 'Atiksh Agarwal', rank: 2, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
  { id: '1', name: 'Arth Tayal', rank: 1, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: '3', name: 'Saanvi Batra', rank: 3, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
];

export default function LeaderboardPodium() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.podiumWrapper}>
        {/* Rank 2 */}
        <View style={styles.rankContainer}>
          <Image source={{ uri: DATA[0].avatar }} style={[styles.avatar, { borderColor: c.border }]} />
          <View style={[styles.badge, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
            <Text variant="bold" style={styles.badgeText}>2</Text>
          </View>
          <View style={[styles.column, { height: 120, backgroundColor: c.cardSecondary, borderColor: c.border }]}>
            <Text variant="bold" style={[styles.name, { color: c.text }]}>{DATA[0].name.split(' ')[0]}</Text>
          </View>
        </View>

        {/* Rank 1 */}
        <View style={styles.rankContainer}>
          <Image source={{ uri: DATA[1].avatar }} style={[styles.avatar, styles.avatarGold, { borderColor: c.gold }]} />
          <View style={[styles.badge, { backgroundColor: c.gold, borderColor: c.background }]}>
            <Text variant="bold" style={[styles.badgeText, { color: '#000' }]}>1</Text>
          </View>
          <View style={[styles.column, { height: 160, backgroundColor: c.gold, borderColor: c.gold }]}>
            <Text variant="bold" style={[styles.name, { color: '#000' }]}>{DATA[1].name.split(' ')[0]}</Text>
          </View>
        </View>

        {/* Rank 3 */}
        <View style={styles.rankContainer}>
          <Image source={{ uri: DATA[2].avatar }} style={[styles.avatar, { borderColor: c.border }]} />
          <View style={[styles.badge, { backgroundColor: c.border, borderColor: c.background }]}>
            <Text variant="bold" style={styles.badgeText}>3</Text>
          </View>
          <View style={[styles.column, { height: 100, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: c.border }]}>
            <Text variant="bold" style={[styles.name, { color: c.textSecondary }]}>{DATA[2].name.split(' ')[0]}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  podiumWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rankContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    marginBottom: -10,
    zIndex: 1,
  },
  avatarGold: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
  },
  badge: {
    position: 'absolute',
    top: 50,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    color: '#FFF',
  },
  column: {
    width: 90,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    justifyContent: 'flex-end',
    paddingBottom: 24,
    borderWidth: 1,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
