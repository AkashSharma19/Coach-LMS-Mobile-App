import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as DefaultView, ImageBackground } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { BlurView } from 'expo-blur';

import AttendanceGauge from '@/components/Home/AttendanceGauge';
import QuickAccessIcon from '@/components/Home/QuickAccessIcon';
import CalendarStrip from '@/components/Home/CalendarStrip';
import UpcomingClassCard from '@/components/Home/UpcomingClassCard';
import LeaderboardPodium from '@/components/Home/LeaderboardPodium';
import SectionHeader from '@/components/SectionHeader';

const SECTION_GAP = 12;
const QUICK_ACCESS = [
  { id: '1', name: 'Assignments', icon: 'document-text-outline' as const },
  { id: '2', name: 'Academic Summary', icon: 'stats-chart-outline' as const },
  { id: '3', name: 'Messages', icon: 'chatbubbles-outline' as const },
  { id: '4', name: 'Career Coach', icon: 'briefcase-outline' as const },
];

const MOCK_SESSIONS = [
  {
    id: '1',
    subject: 'MICROECONOMICS | UNDERSTANDING THE...',
    topic: 'Game Theory II: Dynamic Games & Applications',
    location: '207, 2nd floor - CDS',
    time: '09:00 AM - 10:30 AM',
    category: 'INCLASS',
    status: 'completed' as const
  },
  {
    id: '2',
    subject: 'BUSINESS ADMINISTRATION | INTRO...',
    topic: 'Organizational Behavior & Human Capital',
    location: 'Auditorium 1, Ground Floor',
    time: '11:15 AM - 12:45 PM',
    category: 'INCLASS',
    status: 'upcoming' as const
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Dynamic Background Accent */}
      <DefaultView style={styles.bgAccent} />
      
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatarCircle, { borderColor: c.border, backgroundColor: c.card }]}>
              <Text variant="bold" style={{ fontSize: 13, color: c.gold }}>SF</Text>
            </View>
            <View style={styles.headerTexts}>
              <Text variant="medium" style={[styles.greeting, { color: c.textSecondary }]}>
                Hello, <Text variant="bold" style={{ color: c.gold }}>SHENELLE</Text>
              </Text>
              <Text variant="bold" style={[styles.welcomeSub, { color: c.text }]}>Welcome to Coach LMS</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: c.card + '80', borderColor: c.border }]}>
              <Ionicons name="search" size={20} color={c.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: c.card + '80', borderColor: c.border, marginLeft: 12 }]}>
              <Ionicons name="notifications-outline" size={20} color={c.text} />
              <DefaultView style={[styles.notifBadge, { backgroundColor: c.gold, borderColor: c.background }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Status Widget */}
        <AttendanceGauge percentage={79} />

        {/* Interaction Layers */}
        <View style={styles.section}>
          <SectionHeader title="QUICK ACCESS" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAccessList}>
            {QUICK_ACCESS.map((item) => (
              <QuickAccessIcon key={item.id} name={item.name} icon={item.icon} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="SCHEDULE" actionText="VIEW ALL" />
          <CalendarStrip />
        </View>

        <View style={{ marginTop: SECTION_GAP }}>
          {MOCK_SESSIONS.map((session, index) => (
            <UpcomingClassCard 
              key={session.id}
              subject={session.subject}
              topic={session.topic}
              location={session.location}
              time={session.time}
              category={session.category}
              status={session.status}
              style={{ marginTop: index === 0 ? 0 : 10 }}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="LEADERBOARD" actionText="VIEW ALL" />
          <Text variant="medium" style={[styles.leaderboardSub, { color: c.textSecondary }]}>
            Dean's List • Top Academic Performers
          </Text>
          <LeaderboardPodium />
        </View>

        <DefaultView style={{ height: 160 }} /> 
      </ScrollView>

      {/* Glossy Tab Overlays could be here, but let's stick to cleaning the main content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgAccent: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EBC063',
    opacity: 0.05,
    filter: 'blur(80px)', // Note: standard RN doesn't support filter, but it's a hint for web or specific libs
  },
  contentContainer: {
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#EBC063',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTexts: {
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  welcomeSub: {
    fontSize: 18,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  section: {
    marginTop: SECTION_GAP,
    backgroundColor: 'transparent',
  },
  quickAccessList: {
    paddingLeft: 20,
    paddingTop: 10,
  },
  leaderboardSub: {
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: -10,
    opacity: 0.6,
  },
});
