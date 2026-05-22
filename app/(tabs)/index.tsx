import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform,
  Dimensions,
  Modal,
  Linking,
  TextInput,
  Image
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { MOCK_COURSES } from '@/constants/MockData';

const { width } = Dimensions.get('window');

// Curated dynamic home mock data matching Hand Shake features
const QUICK_ACTIONS = [
  { id: '1', name: 'Assignments', icon: 'document-text-outline' as const, route: '/assignments', color: '#4A90E2', desc: '4 pending' },
  { id: '2', name: 'Academic Summary', icon: 'stats-chart-outline' as const, route: '/academic-summary', color: '#FFD700', desc: 'GPA 3.82' },
  { id: '3', name: 'Events Hub', icon: 'ribbon-outline' as const, route: '/events', color: '#34C759', desc: 'Next RSVP: Fri' },
  { id: '4', name: 'Study Library', icon: 'folder-open-outline' as const, route: '/repository', color: '#FF9500', desc: '14 files' },
];

const DAYS_SELECTOR = [
  { id: 'Fri', label: 'Fri', date: '22', isToday: true },
  { id: 'Sat', label: 'Sat', date: '23', isToday: false },
  { id: 'Sun', label: 'Sun', date: '24', isToday: false },
  { id: 'Mon', label: 'Mon', date: '25', isToday: false },
  { id: 'Tue', label: 'Tue', date: '26', isToday: false },
  { id: 'Wed', label: 'Wed', date: '27', isToday: false },
  { id: 'Thu', label: 'Thu', date: '28', isToday: false },
  { id: 'Fri2', label: 'Fri', date: '29', isToday: false },
];

const SCHEDULE_TIMELINE = [
  // Friday (Today)
  {
    id: '1',
    day: 'Fri',
    courseId: '1',
    sessionIndex: 0,
    subject: 'ECON-302: MICROECONOMICS III',
    topic: 'Intro to Game Theory & Nash Equilibrium',
    time: '09:00 AM - 10:30 AM',
    room: 'Room 207, 2nd Floor - CDS',
    type: 'Core',
    status: 'completed',
  },
  {
    id: '2',
    day: 'Fri',
    courseId: '2',
    sessionIndex: 1,
    subject: 'BUS-101: BUSINESS ADMINISTRATION',
    topic: 'Thomas-Kilmann Mode & Negotiation ZOPA',
    time: '11:15 AM - 12:45 PM',
    room: 'Auditorium 1, Ground Floor',
    type: 'Core',
    status: 'active',
  },
  {
    id: '3',
    day: 'Fri',
    courseId: '1',
    sessionIndex: 1,
    subject: 'ECON-302: MICROECONOMICS III',
    topic: 'Dynamic Games & Subgame Perfection',
    time: '02:00 PM - 03:30 PM',
    room: 'Room 207, 2nd Floor - CDS',
    type: 'Core',
    status: 'upcoming',
  },
  // Saturday
  {
    id: '4',
    day: 'Sat',
    courseId: '3',
    sessionIndex: 0,
    subject: 'CS-401: REACT NATIVE DEV',
    topic: 'React Native Animations & Custom Layouts',
    time: '09:30 AM - 11:00 AM',
    room: 'Lab 304, 3rd Floor',
    type: 'Core',
    status: 'upcoming',
  },
  {
    id: '5',
    day: 'Sat',
    courseId: '1',
    sessionIndex: 2,
    subject: 'ACAD-101: ACADEMIC PLANNER',
    topic: 'Personal Finance & Career Pathing Seminar',
    time: '01:00 PM - 02:30 PM',
    room: 'Seminar Hall B, Main Block',
    type: 'Elective',
    status: 'upcoming',
  },
  // Monday
  {
    id: '6',
    day: 'Mon',
    courseId: '2',
    sessionIndex: 2,
    subject: 'BUS-101: BUSINESS ADMINISTRATION',
    topic: 'Case Study: Harvard Negotiation Scenarios',
    time: '10:00 AM - 11:30 AM',
    room: 'Auditorium 1, Ground Floor',
    type: 'Core',
    status: 'upcoming',
  },
  {
    id: '7',
    day: 'Mon',
    courseId: '1',
    sessionIndex: 3,
    subject: 'ECON-302: MICROECONOMICS III',
    topic: 'Introduction to Capital Assets Pricing Model',
    time: '02:00 PM - 03:30 PM',
    room: 'Room 102, CDS Building',
    type: 'Core',
    status: 'upcoming',
  },
  // Tuesday
  {
    id: '8',
    day: 'Tue',
    courseId: '3',
    sessionIndex: 1,
    subject: 'CS-401: REACT NATIVE DEV',
    topic: 'Performance Optimization & Profiling Tooling',
    time: '11:15 AM - 12:45 PM',
    room: 'Room 304, Computer Block',
    type: 'Core',
    status: 'upcoming',
  },
  // Wednesday
  {
    id: '9',
    day: 'Wed',
    courseId: '1',
    sessionIndex: 2,
    subject: 'ECON-302: MICROECONOMICS III',
    topic: 'Advanced Game Theory & Asymmetric Info',
    time: '09:00 AM - 10:30 AM',
    room: 'Room 207, 2nd Floor - CDS',
    type: 'Core',
    status: 'upcoming',
  },
  {
    id: '10',
    day: 'Wed',
    courseId: '1',
    sessionIndex: 3,
    subject: 'ACAD-101: ACADEMIC PLANNER',
    topic: 'Industry Mentorship & Careers Round-Table',
    time: '03:00 PM - 04:30 PM',
    room: 'Seminar Hall B, Main Block',
    type: 'Elective',
    status: 'upcoming',
  },
  // Thursday
  {
    id: '11',
    day: 'Thu',
    courseId: '2',
    sessionIndex: 3,
    subject: 'BUS-101: BUSINESS ADMINISTRATION',
    topic: 'Cross-border Negotiations & Mergers Case',
    time: '11:15 AM - 12:45 PM',
    room: 'Auditorium 1, Ground Floor',
    type: 'Core',
    status: 'upcoming',
  },
  // Friday 29th
  {
    id: '12',
    day: 'Fri2',
    courseId: '3',
    sessionIndex: 2,
    subject: 'CS-401: REACT NATIVE DEV',
    topic: 'Final Project Submission Showcase Panel',
    time: '02:00 PM - 05:00 PM',
    room: 'Lab 304, Computer Block',
    type: 'Core',
    status: 'upcoming',
  }
];

const CAMPUS_ANNOUNCEMENTS = [
  {
    id: '1',
    tag: 'SEMINAR',
    title: 'AI & Computational Finance Summit',
    date: 'May 25, 2026',
    speaker: 'Dr. Evelyn Harris (HedgeForce)',
    bg: '#4A90E2',
    imageUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=400',
    eligibility: 'Eligible (GPA ≥ 3.5)',
    isEligible: true,
  },
  {
    id: '2',
    tag: 'ACADEMIC',
    title: 'Honors Research Colloquium',
    date: 'May 30, 2026',
    speaker: 'Deans Office (Main Hall)',
    bg: '#AF52DE',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400',
    eligibility: 'Ineligible (GPA ≥ 3.9)',
    isEligible: false,
  },
  {
    id: '3',
    tag: 'SPORTS',
    title: 'Hand Shake Annual Football Derby',
    date: 'May 28, 2026',
    speaker: 'MU Stadium (Main Arena)',
    bg: '#34C759',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400',
    eligibility: 'Eligible (Open to All)',
    isEligible: true,
  }
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // bottom sheet states matching internal course modal layout
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState<boolean>(false);

  // Daily To-Do deadlines organized by 4 tabs: Today, Upcoming, Overdue, Feedbacks
  const [activeTodoTab, setActiveTodoTab] = useState<'Today' | 'Upcoming' | 'Overdue' | 'Feedbacks'>('Today');
  
  // Leaderboard active sub-tab state (Dean's List, Attendance, PRS)
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'DeansList' | 'Attendance' | 'PRS'>('DeansList');
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>('Fri');
  const [todos, setTodos] = useState([
    // Today
    { id: '1', text: 'Submit React Native assignment draft', deadline: 'Due today by 11:59 PM', course: 'React Native', category: 'Assignment', tab: 'Today' },
    { id: '2', text: 'Online Micro-Quiz 3 on Game Theory', deadline: 'Due before 02:00 PM', course: 'Microeconomics III', category: 'Quiz', tab: 'Today' },
    { id: '3', text: 'Fill feedback response form: Lecture 2', deadline: 'Submit before 06:00 PM', course: 'Academic Seminar', category: 'Forms', tab: 'Today' },
    // Upcoming
    { id: '4', text: 'Academic Project Milestone 1 submission', deadline: 'Due on May 26, 2026', course: 'React Native', category: 'Milestones', tab: 'Upcoming' },
    { id: '5', text: 'Group Assignment: Business Negotiations case slides', deadline: 'Due on May 29, 2026', course: 'Business Admin', category: 'Group Assignment', tab: 'Upcoming' },
    // Overdue
    { id: '6', text: 'Late Upload: Financial Accounting Group Assignment', deadline: 'Was due May 20 (2 days ago)', course: 'Financial Accounting', category: 'Group Assignment', tab: 'Overdue' },
    { id: '7', text: 'Missed: Online Micro-Quiz 2 verification', deadline: 'Was due May 18 (4 days ago)', course: 'React Native', category: 'Quiz', tab: 'Overdue' },
    // Feedbacks
    { id: '8', text: 'Feedback Form: Rate Microeconomics III session', deadline: 'Closing on May 24, 2026', course: 'Microeconomics III', category: 'Forms', tab: 'Feedbacks' },
    { id: '9', text: 'Feedback Form: Rate Business Negotiation seminar', deadline: 'Closing on May 27, 2026', course: 'Business Admin', category: 'Forms', tab: 'Feedbacks' },
  ]);

  // Render Leaderboard Ranking Lists (Dean's List, Attendance, PRS)
  const getLeaderboardData = () => {
    switch (activeLeaderboardTab) {
      case 'DeansList':
        return [
          { rank: 1, name: 'Adithya Bandara', avatar: 'AB', score: '3.96 CGPA', isCurrentUser: false },
          { rank: 2, name: 'Shenelle Fernando', avatar: 'SF', score: '3.82 CGPA', isCurrentUser: true },
          { rank: 3, name: 'Dinuka Perera', avatar: 'DP', score: '3.79 CGPA', isCurrentUser: false },
          { rank: 4, name: 'Thilan Wijesinghe', avatar: 'TW', score: '3.74 CGPA', isCurrentUser: false },
        ];
      case 'Attendance':
        return [
          { rank: 1, name: 'Thilan Wijesinghe', avatar: 'TW', score: '98% Attend', isCurrentUser: false },
          { rank: 2, name: 'Dinuka Perera', avatar: 'DP', score: '95% Attend', isCurrentUser: false },
          { rank: 3, name: 'Adithya Bandara', avatar: 'AB', score: '92% Attend', isCurrentUser: false },
          { rank: 4, name: 'Shenelle Fernando', avatar: 'SF', score: '84% Attend', isCurrentUser: true },
        ];
      case 'PRS':
        return [
          { rank: 1, name: 'Shenelle Fernando', avatar: 'SF', score: '9.6/10 PRS', isCurrentUser: true },
          { rank: 2, name: 'Adithya Bandara', avatar: 'AB', score: '9.4/10 PRS', isCurrentUser: false },
          { rank: 3, name: 'Thilan Wijesinghe', avatar: 'TW', score: '9.0/10 PRS', isCurrentUser: false },
          { rank: 4, name: 'Dinuka Perera', avatar: 'DP', score: '8.8/10 PRS', isCurrentUser: false },
        ];
      default:
        return [];
    }
  };

  // Exact file rendering item helper from [id].tsx
  const renderMaterialItem = (mat: any, idx: number, defaultIcon: any) => {
    if (!mat) return null;
    const isLink = !!(mat && typeof mat === 'object' && mat.url);
    const name = mat && typeof mat === 'object' ? mat.name : String(mat);
    const url = mat && typeof mat === 'object' ? mat.url : undefined;

    if (isLink) {
      return (
        <TouchableOpacity
          key={idx}
          activeOpacity={0.7}
          style={styles.materialItem}
          onPress={() => {
            if (url) {
              Linking.openURL(url).catch(err => {
                console.error("Failed to open URL", err);
              });
            }
          }}
        >
          <Ionicons name="link-outline" size={12} color={selectedCourse?.color || '#EBC063'} />
          <Text
            variant="medium"
            style={[
              styles.materialItemText,
              { color: selectedCourse?.color || '#EBC063', textDecorationLine: 'underline' }
            ]}
          >
            {name}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <DefaultView key={idx} style={styles.materialItem}>
        <Ionicons name={defaultIcon} size={12} color={c.textSecondary} />
        <Text variant="medium" style={[styles.materialItemText, { color: c.textSecondary }]}>
          {name}
        </Text>
      </DefaultView>
    );
  };

  // Quick stats state mock
  const stats = {
    attendance: 84,
    term: 4,
    streak: 6,
    points: 1450,
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top Graphic Accent Glow */}
      <DefaultView style={styles.bgAccent} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* 1. PREMIUM HEADER SECTION */}
        <View style={styles.header}>
          <DefaultView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
            <DefaultView style={[styles.avatarBorder, { borderColor: c.gold }]}>
              <View style={[styles.avatarBox, { backgroundColor: c.card }]}>
                <Text variant="bold" style={{ fontSize: 13, color: c.gold }}>SF</Text>
              </View>
              <DefaultView style={[styles.activeStatusDot, { backgroundColor: '#34C759', borderColor: c.background }]} />
            </DefaultView>
            
            <DefaultView style={{ marginLeft: 12, backgroundColor: 'transparent' }}>
              <Text variant="bold" style={{ fontSize: 11, color: c.textSecondary }}>SHENELLE FERNANDO</Text>
              <Text variant="bold" style={{ fontSize: 15, color: c.text, marginTop: 1 }}>Let's excel today! 🚀</Text>
            </DefaultView>
          </DefaultView>

          <DefaultView style={{ flexDirection: 'row', gap: 10, backgroundColor: 'transparent' }}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}>
              <Ionicons name="search" size={18} color={c.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}>
              <Ionicons name="notifications-outline" size={18} color={c.text} />
              <DefaultView style={[styles.pulseDot, { backgroundColor: c.gold, borderColor: c.background }]} />
            </TouchableOpacity>
          </DefaultView>
        </View>

        {/* 2. DYNAMIC GAMIFICATION & METRICS CARD */}
        <View style={[styles.gamifiedCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <DefaultView style={styles.cardHeaderRow}>
            <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
              <Ionicons name="trophy-outline" size={14} color={c.gold} />
              <Text variant="bold" style={{ fontSize: 8, color: c.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Hand Shake Leaderboard Status
              </Text>
            </DefaultView>
            <Text variant="bold" style={{ fontSize: 8, color: c.gold }}>LEVEL 4 STUDENT</Text>
          </DefaultView>

          {/* Core metrics row */}
          <DefaultView style={styles.metricsRow}>
            <DefaultView style={styles.metricBlock}>
              <Text variant="bold" style={{ fontSize: 18, color: c.text }}>{stats.attendance}%</Text>
              <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>Presence</Text>
            </DefaultView>
            
            <DefaultView style={[styles.metricDivider, { backgroundColor: c.border }]} />

            <DefaultView style={styles.metricBlock}>
              <Text variant="bold" style={{ fontSize: 18, color: c.gold }}>3.82</Text>
              <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>CGPA Score</Text>
            </DefaultView>
          </DefaultView>

        </View>

        {/* 3. PREMIUM GRID QUICK ACTIONS GALLERY */}
        <DefaultView style={{ paddingHorizontal: 16, marginTop: 16, backgroundColor: 'transparent' }}>
          <Text variant="bold" style={styles.sectionTitle}>QUICK DIRECTORY</Text>
          <DefaultView style={styles.quickGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.8}
                onPress={() => router.push(action.route as any)}
                style={[styles.gridItem, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <DefaultView style={[styles.actionIconBox, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={18} color={action.color} />
                </DefaultView>
                <Text variant="bold" style={[styles.actionTitle, { color: c.text }]}>{action.name}</Text>
                <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>{action.desc}</Text>
              </TouchableOpacity>
            ))}
          </DefaultView>
        </DefaultView>

        {/* 4. PREMIUM CALENDAR CAMPUS SCHEDULE */}
        <DefaultView style={{ paddingHorizontal: 16, marginTop: 20, backgroundColor: 'transparent' }}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
            <Text variant="bold" style={styles.sectionTitle}>CAMPUS SCHEDULE</Text>
            <TouchableOpacity onPress={() => router.push('/schedule')}>
              <Text variant="bold" style={{ fontSize: 10, color: c.gold }}>FULL TIMETABLE</Text>
            </TouchableOpacity>
          </DefaultView>

          {/* Horizontal Days Selector Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scheduleDaysScroll}
          >
            {DAYS_SELECTOR.map(day => {
              const isSelected = selectedScheduleDay === day.id;
              return (
                <TouchableOpacity
                  key={day.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedScheduleDay(day.id)}
                  style={[
                    styles.scheduleDayCard,
                    {
                      backgroundColor: isSelected ? c.gold : c.card,
                      borderColor: isSelected ? 'transparent' : c.border,
                    }
                  ]}
                >
                  <Text
                    variant="bold"
                    style={{
                      fontSize: 8,
                      color: isSelected ? '#000' : c.textSecondary,
                      letterSpacing: 0.2,
                      textTransform: 'uppercase'
                    }}
                  >
                    {day.label}
                  </Text>
                  
                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 1, backgroundColor: 'transparent' }}>
                    <Text
                      variant="bold"
                      style={{
                        fontSize: 12,
                        color: isSelected ? '#000' : c.text,
                      }}
                    >
                      {day.date}
                    </Text>
                    {day.isToday && (
                      <DefaultView 
                        style={{ 
                          width: 3.5, 
                          height: 3.5, 
                          borderRadius: 1.75, 
                          backgroundColor: isSelected ? '#000' : c.gold, 
                        }} 
                      />
                    )}
                  </DefaultView>

                  {(() => {
                    const dayCount = SCHEDULE_TIMELINE.filter(s => s.day === day.id).length;
                    return (
                      <DefaultView style={{ 
                        backgroundColor: isSelected ? '#000' : 'rgba(255,255,255,0.06)',
                        borderRadius: 6,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        marginTop: 3,
                        minWidth: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 0.5,
                        borderColor: isSelected ? '#000' : c.border
                      }}>
                        <Text style={{ fontSize: 6.5, color: isSelected ? c.gold : c.textSecondary, fontWeight: 'bold' }}>
                          {dayCount}
                        </Text>
                      </DefaultView>
                    );
                  })()}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <DefaultView style={{ gap: 10, marginTop: 4, backgroundColor: 'transparent' }}>
            {(() => {
              const filteredTimeline = SCHEDULE_TIMELINE.filter(s => s.day === selectedScheduleDay);
              if (filteredTimeline.length === 0) {
                return (
                  <DefaultView 
                    style={[
                      styles.timelineCard, 
                      { 
                        backgroundColor: c.card, 
                        borderColor: c.border, 
                        paddingVertical: 24,
                        paddingHorizontal: 16, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderStyle: 'dashed',
                        borderWidth: 1
                      }
                    ]}
                  >
                    <Ionicons name="sparkles-outline" size={24} color={c.gold} style={{ marginBottom: 6 }} />
                    <Text variant="bold" style={{ fontSize: 13, color: c.text, textAlign: 'center' }}>
                      Rest & Recharge!
                    </Text>
                    <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, textAlign: 'center', marginTop: 4 }}>
                      No academic sessions scheduled for Sunday. Enjoy your weekend! ⚡
                    </Text>
                  </DefaultView>
                );
              }

              return filteredTimeline.map(item => {
                const isActive = item.status === 'active';
                const isCompleted = item.status === 'completed';
                
                let accentColor = '#4A90E2';
                if (isCompleted) accentColor = '#34C759';
                if (item.status === 'upcoming') accentColor = c.gold;

                return (
                  <TouchableOpacity 
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      const foundCourse = MOCK_COURSES.find(crs => crs.id === item.courseId);
                      if (foundCourse && foundCourse.sessions[item.sessionIndex]) {
                        setSelectedCourse(foundCourse);
                        setSelectedSession({
                          ...foundCourse.sessions[item.sessionIndex],
                          index: item.sessionIndex
                        });
                        setIsCheckedIn(false);
                        setRating(0);
                        setIsFeedbackSubmitted(false);
                        setIsSessionModalVisible(true);
                      }
                    }}
                    style={[
                      styles.timelineCard, 
                      { 
                        backgroundColor: c.card, 
                        borderColor: isActive ? accentColor : c.border 
                      }
                    ]}
                  >
                    {/* Left accent indicator border stripe */}
                    <DefaultView style={[styles.leftAccentStripe, { backgroundColor: accentColor }]} />
                    
                    <DefaultView style={{ flex: 1, backgroundColor: 'transparent', paddingLeft: 12 }}>
                      <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 11, color: accentColor }}>{item.subject}</Text>
                        {isActive && (
                          <DefaultView style={[styles.liveIndicator, { backgroundColor: '#FF375F' }]}>
                            <Text variant="bold" style={{ fontSize: 7, color: '#fff' }}>LIVE NOW</Text>
                          </DefaultView>
                        )}
                      </DefaultView>
                      
                      <Text variant="bold" style={{ fontSize: 12, color: c.text, marginTop: 4 }}>{item.topic}</Text>
                      
                      <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, backgroundColor: 'transparent' }}>
                        <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' }}>
                          <Ionicons name="time-outline" size={10} color={c.textSecondary} />
                          <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary }}>{item.time}</Text>
                        </DefaultView>
                        <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' }}>
                          <Ionicons name="location-outline" size={10} color={c.textSecondary} />
                          <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary }}>{item.room}</Text>
                        </DefaultView>
                      </DefaultView>
                    </DefaultView>
                  </TouchableOpacity>
                );
              });
            })()}
          </DefaultView>
        </DefaultView>

        {/* DAILY DEADLINES & ACTIONS */}
        <DefaultView style={{ paddingHorizontal: 16, marginTop: 22, backgroundColor: 'transparent' }}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 8 }}>
            <Text variant="bold" style={styles.sectionTitle}>DEADLINES & ACTIONS</Text>
            <DefaultView style={{ backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="alarm-outline" size={13} color={c.gold} />
              <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary }}>
                {todos.filter(t => t.tab === activeTodoTab).length} PENDING
              </Text>
            </DefaultView>
          </DefaultView>

          {/* 4-Tab Navigation Row */}
          <DefaultView style={styles.todoTabBar}>
            {(['Today', 'Upcoming', 'Overdue', 'Feedbacks'] as const).map((tab) => {
              const isActive = activeTodoTab === tab;
              const tabCount = todos.filter(t => t.tab === tab).length;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.7}
                  onPress={() => setActiveTodoTab(tab)}
                  style={[
                    styles.todoTabBtn,
                    { 
                      backgroundColor: isActive ? c.gold : c.card,
                      borderColor: isActive ? 'transparent' : c.border
                    }
                  ]}
                >
                  <Text 
                    variant="bold" 
                    style={{ 
                      fontSize: 10, 
                      color: isActive ? '#000' : c.textSecondary,
                      textAlign: 'center'
                    }}
                  >
                    {tab}
                  </Text>
                  {tabCount > 0 && (
                    <DefaultView style={[
                      styles.todoTabBadgeCircle, 
                      { backgroundColor: isActive ? '#000' : c.gold }
                    ]}>
                      <Text style={{ fontSize: 8, color: isActive ? c.gold : '#000', fontWeight: 'bold', textAlign: 'center', lineHeight: 12 }}>
                        {tabCount}
                      </Text>
                    </DefaultView>
                  )}
                </TouchableOpacity>
              );
            })}
          </DefaultView>

          <View style={[styles.todoCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {/* List of Tasks filtered by tab */}
            <DefaultView style={{ backgroundColor: 'transparent', gap: 8 }}>
              {todos.filter(t => t.tab === activeTodoTab).length === 0 ? (
                <DefaultView style={{ paddingVertical: 18, alignItems: 'center', backgroundColor: 'transparent' }}>
                  <Ionicons name="hourglass-outline" size={24} color={c.textSecondary} style={{ opacity: 0.3, marginBottom: 6 }} />
                  <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, opacity: 0.7 }}>
                    All caught up! No deadlines under {activeTodoTab}.
                  </Text>
                </DefaultView>
              ) : (
                todos.filter(t => t.tab === activeTodoTab).map(todo => {
                  // Select category specific icon
                  let iconName = 'bookmark-outline';
                  let iconColor = c.gold;
                  switch (todo.category) {
                    case 'Quiz': iconName = 'help-circle-outline'; iconColor = '#AF52DE'; break;
                    case 'Assignment': iconName = 'document-text-outline'; iconColor = '#4A90E2'; break;
                    case 'Group Assignment': iconName = 'people-outline'; iconColor = '#34C759'; break;
                    case 'Milestones': iconName = 'flag-outline'; iconColor = '#FF9500'; break;
                    case 'Forms': iconName = 'clipboard-outline'; iconColor = '#FF375F'; break;
                  }

                  return (
                    <DefaultView
                      key={todo.id}
                      style={[
                        styles.todoItemRow,
                        { 
                          backgroundColor: c.background,
                          borderColor: c.border
                        }
                      ]}
                    >
                      <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, backgroundColor: 'transparent' }}>
                        <DefaultView style={[styles.todoIconWrapper, { backgroundColor: iconColor + '15' }]}>
                          <Ionicons name={iconName as any} size={15} color={iconColor} />
                        </DefaultView>
                        
                        <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                          {/* Course Name */}
                          <Text variant="bold" style={{ fontSize: 9, color: iconColor, marginBottom: 2 }}>
                            {todo.course}
                          </Text>
                          
                          {/* Session / Task Title */}
                          <Text variant="bold" style={{ fontSize: 12, color: c.text }}>
                            {todo.text}
                          </Text>
                          
                          {/* Deadline Details */}
                          <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 4 }}>
                            {todo.deadline}
                          </Text>
                        </DefaultView>
                      </DefaultView>

                      <DefaultView style={[
                        styles.todoCategoryBadge, 
                        { 
                          backgroundColor: c.card,
                          borderColor: c.border
                        }
                      ]}>
                        <Text 
                          variant="bold" 
                          style={{ 
                            fontSize: 7, 
                            color: iconColor,
                            letterSpacing: 0.5
                          }}
                        >
                          {todo.category}
                        </Text>
                      </DefaultView>
                    </DefaultView>
                  );
                })
              )}
            </DefaultView>
          </View>
        </DefaultView>

        {/* CAMPUS LEADERBOARD SECTION */}
        <DefaultView style={{ paddingHorizontal: 16, marginTop: 22, backgroundColor: 'transparent' }}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 8 }}>
            <Text variant="bold" style={styles.sectionTitle}>CAMPUS LEADERBOARD</Text>
            <DefaultView style={{ backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="trophy-outline" size={13} color={c.gold} />
              <Text variant="bold" style={{ fontSize: 9, color: c.gold }}>TOP RANKINGS</Text>
            </DefaultView>
          </DefaultView>

          {/* Sub-tab selection panel */}
          <DefaultView style={styles.leaderboardTabBar}>
            {[
              { id: 'DeansList', label: "Dean's List" },
              { id: 'Attendance', label: 'Attendance' },
              { id: 'PRS', label: 'PRS Score' }
            ].map((tab) => {
              const isActive = activeLeaderboardTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.7}
                  onPress={() => setActiveLeaderboardTab(tab.id as any)}
                  style={[
                    styles.leaderboardTabBtn,
                    { 
                      backgroundColor: isActive ? c.gold : c.card,
                      borderColor: isActive ? 'transparent' : c.border
                    }
                  ]}
                >
                  <Text 
                    variant="bold" 
                    style={{ 
                      fontSize: 10, 
                      color: isActive ? '#000' : c.textSecondary,
                      textAlign: 'center'
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </DefaultView>

          {/* Leaderboard Podium & List Card */}
          {(() => {
            const data = getLeaderboardData();
            const first = data.find(s => s.rank === 1);
            const second = data.find(s => s.rank === 2);
            const third = data.find(s => s.rank === 3);
            const remainder = data.filter(s => s.rank > 3);

            return (
              <View style={[styles.leaderboardCard, { backgroundColor: c.card, borderColor: c.border }]}>
                {/* Visual Podium Row */}
                <DefaultView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingTop: 16, paddingBottom: 12, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: c.border + '50', marginBottom: 12 }}>
                  
                  {/* Rank 2 - Left Pedestal */}
                  {second && (
                    <DefaultView style={{ alignItems: 'center', flex: 1, backgroundColor: 'transparent' }}>
                      <DefaultView style={[styles.avatarPodiumCircle, { borderColor: '#C0C0C0', borderWidth: 1.5 }]}>
                        <Text variant="bold" style={{ fontSize: 10, color: '#C0C0C0' }}>{second.avatar}</Text>
                        <DefaultView style={[styles.podiumBadgeCircle, { backgroundColor: '#C0C0C0' }]}>
                          <Text style={{ fontSize: 7, color: '#000', fontWeight: 'bold', textAlign: 'center', lineHeight: 10 }}>2</Text>
                        </DefaultView>
                      </DefaultView>
                      <Text variant="bold" numberOfLines={1} style={{ fontSize: 10, color: second.isCurrentUser ? c.gold : c.text, marginTop: 6, width: 80, textAlign: 'center' }}>
                        {second.name.split(' ')[0]}
                      </Text>
                      <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>
                        {second.score.split(' ')[0]}
                      </Text>
                      {/* Pedestal Block */}
                      <DefaultView style={[styles.pedestalBlock, { height: 45, backgroundColor: c.border + '40', borderColor: '#C0C0C0', borderTopWidth: 2 }]}>
                        <Text variant="bold" style={{ fontSize: 14, color: '#C0C0C0' + '70' }}>2nd</Text>
                      </DefaultView>
                    </DefaultView>
                  )}

                  {/* Rank 1 - Center Pedestal */}
                  {first && (
                    <DefaultView style={{ alignItems: 'center', flex: 1.2, backgroundColor: 'transparent', zIndex: 5 }}>
                      {/* Floating Golden Trophy Icon overlay */}
                      <Ionicons name="ribbon" size={16} color={c.gold} style={{ marginBottom: -4 }} />
                      <DefaultView style={[styles.avatarPodiumCircle, { width: 44, height: 44, borderRadius: 22, borderColor: c.gold, borderWidth: 2 }]}>
                        <Text variant="bold" style={{ fontSize: 12, color: c.gold }}>{first.avatar}</Text>
                        <DefaultView style={[styles.podiumBadgeCircle, { backgroundColor: c.gold, width: 14, height: 14, borderRadius: 7, bottom: -2, right: -2 }]}>
                          <Text style={{ fontSize: 8, color: '#000', fontWeight: 'bold', lineHeight: 14, textAlign: 'center' }}>1</Text>
                        </DefaultView>
                      </DefaultView>
                      <Text variant="bold" numberOfLines={1} style={{ fontSize: 11, color: first.isCurrentUser ? c.gold : c.text, marginTop: 6, width: 90, textAlign: 'center' }}>
                        {first.name.split(' ')[0]}
                      </Text>
                      <Text variant="bold" style={{ fontSize: 9, color: c.gold, marginTop: 2 }}>
                        {first.score.split(' ')[0]}
                      </Text>
                      {/* Tall Pedestal Block */}
                      <DefaultView style={[styles.pedestalBlock, { height: 65, backgroundColor: c.gold + '15', borderColor: c.gold, borderTopWidth: 3 }]}>
                        <Text variant="bold" style={{ fontSize: 18, color: c.gold + '90' }}>1st</Text>
                      </DefaultView>
                    </DefaultView>
                  )}

                  {/* Rank 3 - Right Pedestal */}
                  {third && (
                    <DefaultView style={{ alignItems: 'center', flex: 1, backgroundColor: 'transparent' }}>
                      <DefaultView style={[styles.avatarPodiumCircle, { borderColor: '#CD7F32', borderWidth: 1.5 }]}>
                        <Text variant="bold" style={{ fontSize: 10, color: '#CD7F32' }}>{third.avatar}</Text>
                        <DefaultView style={[styles.podiumBadgeCircle, { backgroundColor: '#CD7F32' }]}>
                          <Text style={{ fontSize: 7, color: '#000', fontWeight: 'bold', textAlign: 'center', lineHeight: 10 }}>3</Text>
                        </DefaultView>
                      </DefaultView>
                      <Text variant="bold" numberOfLines={1} style={{ fontSize: 10, color: third.isCurrentUser ? c.gold : c.text, marginTop: 6, width: 80, textAlign: 'center' }}>
                        {third.name.split(' ')[0]}
                      </Text>
                      <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>
                        {third.score.split(' ')[0]}
                      </Text>
                      {/* Pedestal Block */}
                      <DefaultView style={[styles.pedestalBlock, { height: 32, backgroundColor: c.border + '20', borderColor: '#CD7F32', borderTopWidth: 2 }]}>
                        <Text variant="bold" style={{ fontSize: 12, color: '#CD7F32' + '70' }}>3rd</Text>
                      </DefaultView>
                    </DefaultView>
                  )}

                </DefaultView>

                {/* Other ranks flat list */}
                <DefaultView style={{ backgroundColor: 'transparent', gap: 6 }}>
                  {remainder.map((student) => (
                    <DefaultView
                      key={student.name}
                      style={[
                        styles.leaderboardRow,
                        { 
                          backgroundColor: student.isCurrentUser ? c.gold + '10' : c.background,
                          borderColor: student.isCurrentUser ? c.gold + '50' : c.border,
                          borderWidth: student.isCurrentUser ? 1 : 0.5
                        }
                      ]}
                    >
                      <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 10, color: c.textSecondary, width: 18, textAlign: 'center' }}>
                          #{student.rank}
                        </Text>
                        <DefaultView style={[
                          styles.leaderboardAvatarBox, 
                          { 
                            backgroundColor: student.isCurrentUser ? c.gold + '20' : c.card,
                            borderColor: student.isCurrentUser ? c.gold : c.border
                          }
                        ]}>
                          <Text variant="bold" style={{ fontSize: 9, color: student.isCurrentUser ? c.gold : c.textSecondary }}>
                            {student.avatar}
                          </Text>
                        </DefaultView>
                        <DefaultView style={{ backgroundColor: 'transparent' }}>
                          <Text variant="bold" style={{ fontSize: 12, color: student.isCurrentUser ? c.gold : c.text }}>
                            {student.name}
                          </Text>
                          {student.isCurrentUser && (
                            <Text variant="medium" style={{ fontSize: 7, color: c.gold, letterSpacing: 0.5, marginTop: 1 }}>
                              YOU (RANK {student.rank})
                            </Text>
                          )}
                        </DefaultView>
                      </DefaultView>

                      <DefaultView style={[
                        styles.leaderboardScoreBadge,
                        { 
                          backgroundColor: student.isCurrentUser ? c.gold + '20' : c.card,
                          borderColor: student.isCurrentUser ? c.gold + '40' : c.border
                        }
                      ]}>
                        <Text variant="bold" style={{ fontSize: 9, color: student.isCurrentUser ? c.gold : c.text }}>
                          {student.score}
                        </Text>
                      </DefaultView>
                    </DefaultView>
                  ))}
                </DefaultView>
              </View>
            );
          })()}
        </DefaultView>

        {/* 5. CAMPUS ANNOUNCEMENTS & RSVP CAROUSEL */}
        <DefaultView style={{ paddingHorizontal: 16, marginTop: 22, backgroundColor: 'transparent' }}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
            <Text variant="bold" style={styles.sectionTitle}>CAMPUS HIGHLIGHTS</Text>
            <TouchableOpacity onPress={() => router.push('/events')}>
              <Text variant="bold" style={{ fontSize: 10, color: c.gold }}>EVENTS FEED</Text>
            </TouchableOpacity>
          </DefaultView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.announcementScroll}
          >
            {CAMPUS_ANNOUNCEMENTS.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => router.push('/events')}
                style={[styles.announcementCard, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.announcementImage}
                  resizeMode="cover"
                />

                <DefaultView style={{ padding: 10, backgroundColor: 'transparent' }}>
                  <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
                    <DefaultView style={[styles.tagBadge, { backgroundColor: item.bg + '15', borderColor: item.bg }]}>
                      <Text variant="bold" style={{ fontSize: 7, color: item.bg }}>{item.tag}</Text>
                    </DefaultView>
                    <Ionicons name="arrow-forward" size={12} color={c.textSecondary} />
                  </DefaultView>
                  
                  <Text variant="bold" style={{ fontSize: 11, color: c.text, marginTop: 6 }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  
                  <DefaultView style={{ marginTop: 8, backgroundColor: 'transparent' }}>
                    <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary }} numberOfLines={1}>
                      {item.speaker}
                    </Text>
                    
                    <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, backgroundColor: 'transparent' }}>
                      <Text variant="bold" style={{ fontSize: 8, color: c.gold }}>
                        {item.date}
                      </Text>

                      {/* Eligibility Pill Badge */}
                      <DefaultView style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 3, 
                        backgroundColor: item.isEligible ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 55, 95, 0.12)',
                        borderColor: item.isEligible ? '#34C759' : '#FF375F',
                        borderWidth: 0.5,
                        borderRadius: 6,
                        paddingHorizontal: 5,
                        paddingVertical: 1.5
                      }}>
                        <Ionicons 
                          name={item.isEligible ? "checkmark-circle" : "close-circle"} 
                          size={8} 
                          color={item.isEligible ? '#34C759' : '#FF375F'} 
                        />
                        <Text variant="bold" style={{ fontSize: 6.5, color: item.isEligible ? '#34C759' : '#FF375F' }}>
                          {item.isEligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                        </Text>
                      </DefaultView>
                    </DefaultView>

                  </DefaultView>
                </DefaultView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </DefaultView>

        <DefaultView style={{ height: 60 }} />
      </ScrollView>

      {/* Sliding Bottom Sheet Modal exact replication */}
      <Modal
        visible={isSessionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSessionModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsSessionModalVisible(false)}
        >
          <DefaultView style={{ flex: 1 }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          
          {/* Top Drag Handle Indicator */}
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />

          {/* Close Button Top Right */}
          <TouchableOpacity 
            style={styles.closeIconBtn} 
            activeOpacity={0.7}
            onPress={() => setIsSessionModalVisible(false)}
          >
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </TouchableOpacity>

          {selectedSession && selectedCourse && (
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.sessionModalScroll}
            >
              {/* Header Bar */}
              <DefaultView style={styles.sessionModalHeader}>
                <DefaultView style={styles.sessionModalBadgeRow}>
                  <DefaultView style={[styles.badge, { backgroundColor: selectedCourse.color + '15' }]}>
                    <Text variant="bold" style={[styles.badgeText, { color: selectedCourse.color }]}>
                      Session {selectedSession.index + 1}
                    </Text>
                  </DefaultView>
                  <DefaultView style={[
                    styles.sessionStatusCircle, 
                    { 
                      backgroundColor: selectedSession.status === 'P' ? c.green : selectedSession.status === 'A' ? '#FF4A4A' : '#8E8E93',
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }
                  ]}>
                    <Text variant="bold" style={{ fontSize: 10, color: '#000', textAlign: 'center' }}>
                      {selectedSession.status}
                    </Text>
                  </DefaultView>
                </DefaultView>
                
                <Text variant="bold" style={[styles.sessionModalTitle, { color: c.text }]}>
                  {selectedSession.topic}
                </Text>
                
                {selectedSession.subtopic && (
                  <Text variant="medium" style={[styles.sessionModalSubtopic, { color: c.textSecondary }]}>
                    {selectedSession.subtopic}
                  </Text>
                )}

                <DefaultView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6, backgroundColor: 'transparent' }}>
                  <Ionicons name="time-outline" size={14} color={selectedCourse.color} />
                  <Text variant="semiBold" style={{ fontSize: 12, color: c.textSecondary }}>
                    {selectedSession.date}  •  {selectedSession.time}
                  </Text>
                </DefaultView>
              </DefaultView>

              {/* Faculty & PA grid */}
              <DefaultView style={styles.peopleGrid}>
                <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <DefaultView style={[styles.peopleAvatar, { backgroundColor: selectedCourse.color + '15' }]}>
                    <Ionicons name="school-outline" size={15} color={selectedCourse.color} />
                  </DefaultView>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                      {selectedSession.faculty || selectedCourse.instructor.name}
                    </Text>
                    <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 1 }}>
                      Faculty Instructor
                    </Text>
                  </DefaultView>
                </View>

                <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <DefaultView style={[styles.peopleAvatar, { backgroundColor: selectedCourse.color + '15' }]}>
                    <Ionicons name="people-outline" size={15} color={selectedCourse.color} />
                  </DefaultView>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                      {selectedSession.programAssociate || 'Marcus Chen'}
                    </Text>
                    <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 1 }}>
                      Program Associate
                    </Text>
                  </DefaultView>
                </View>
              </DefaultView>

              {/* Delivery widget */}
              {selectedSession.type === 'Online' && (
                <View style={[styles.customDeliveryCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <DefaultView style={styles.deliveryHeaderRow}>
                    <DefaultView style={[styles.deliveryIconBox, { backgroundColor: '#4A90E215' }]}>
                      <Ionicons name="videocam" size={16} color="#4A90E2" />
                    </DefaultView>
                    <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Online Session Details</Text>
                      <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                        Delivery Format: 100% Virtual Remote Class
                      </Text>
                    </DefaultView>
                  </DefaultView>

                  {selectedSession.status === 'U' ? (
                    <DefaultView style={{ marginTop: 12, backgroundColor: 'transparent' }}>
                      <Text variant="regular" style={{ fontSize: 12, color: c.textSecondary, lineHeight: 17, marginBottom: 12 }}>
                        This lecture is scheduled online via Zoom. Click the action button below to join the virtual classroom lobby.
                      </Text>
                      <TouchableOpacity 
                        style={[styles.joinClassBtn, { backgroundColor: '#4A90E2' }]}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="videocam-outline" size={14} color="#FFF" style={{ marginRight: 6 }} />
                        <Text variant="bold" style={{ fontSize: 13, color: '#FFF' }}>Join Zoom Lecture</Text>
                      </TouchableOpacity>
                    </DefaultView>
                  ) : (
                    <DefaultView style={{ marginTop: 12, backgroundColor: 'transparent' }}>
                      <Text variant="regular" style={{ fontSize: 12, color: c.textSecondary, lineHeight: 17 }}>
                        This class has finished. If you missed the live stream, you can access the full recording playback below.
                      </Text>
                    </DefaultView>
                  )}
                </View>
              )}

              {selectedSession.type === 'Offline' && (
                <View style={[styles.customDeliveryCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <DefaultView style={styles.deliveryHeaderRow}>
                    <DefaultView style={[styles.deliveryIconBox, { backgroundColor: '#EBC06315' }]}>
                      <Ionicons name="location" size={16} color="#EBC063" />
                    </DefaultView>
                    <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Offline Campus Details</Text>
                      <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                        Location: {selectedCourse.location}
                      </Text>
                    </DefaultView>
                  </DefaultView>

                  <DefaultView style={{ marginTop: 12, backgroundColor: 'transparent', gap: 10 }}>
                    <Text variant="regular" style={{ fontSize: 12, color: c.textSecondary, lineHeight: 17 }}>
                      This is an on-campus physical session. Attendance is registered at the classroom entrance.
                    </Text>

                    <DefaultView style={{ flexDirection: 'row', gap: 10, backgroundColor: 'transparent', marginTop: 2 }}>
                      <TouchableOpacity 
                        style={[styles.smallOutlineBtn, { borderColor: c.border }]}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="map-outline" size={13} color={c.text} style={{ marginRight: 4 }} />
                        <Text variant="bold" style={{ fontSize: 12, color: c.text }}>Campus Map</Text>
                      </TouchableOpacity>

                      {selectedSession.status === 'U' && (
                        <TouchableOpacity 
                          style={[
                            styles.smallSolidBtn, 
                            { 
                              backgroundColor: isCheckedIn ? c.green + '20' : selectedCourse.color,
                              borderColor: isCheckedIn ? c.green : 'transparent',
                              borderWidth: isCheckedIn ? 1 : 0
                            }
                          ]}
                          activeOpacity={0.7}
                          onPress={() => setIsCheckedIn(true)}
                        >
                          <Ionicons 
                            name={isCheckedIn ? "checkmark-circle" : "checkbox-outline"} 
                            size={13} 
                            color={isCheckedIn ? c.green : '#000'} 
                            style={{ marginRight: 4 }} 
                          />
                          <Text variant="bold" style={{ fontSize: 12, color: isCheckedIn ? c.green : '#000' }}>
                            {isCheckedIn ? "Checked In" : "Check In"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </DefaultView>
                  </DefaultView>
                </View>
              )}

              {selectedSession.type === 'Hybrid' && (
                <View style={[styles.customDeliveryCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <DefaultView style={styles.deliveryHeaderRow}>
                    <DefaultView style={[styles.deliveryIconBox, { backgroundColor: '#4CAF5015' }]}>
                      <Ionicons name="git-branch" size={16} color="#4CAF50" />
                    </DefaultView>
                    <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Hybrid Session Details</Text>
                      <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                        Choose: Attend On-Campus or Stream Online
                      </Text>
                    </DefaultView>
                  </DefaultView>

                  <Text variant="regular" style={{ fontSize: 12, color: c.textSecondary, lineHeight: 17, marginTop: 12, marginBottom: 12 }}>
                    This session supports dynamic hybrid delivery. You are welcome to sit inside the physical lecture hall or join the online broadcast stream.
                  </Text>

                  <DefaultView style={{ flexDirection: 'row', gap: 10, backgroundColor: 'transparent' }}>
                    <TouchableOpacity 
                      style={[styles.smallOutlineBtn, { flex: 1, borderColor: c.border }]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="location-outline" size={12} color={c.text} style={{ marginRight: 4 }} />
                      <Text variant="bold" style={{ fontSize: 11, color: c.text }} numberOfLines={1}>
                        {selectedCourse.location.split(',')[0]}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.smallOutlineBtn, { flex: 1, borderColor: c.border }]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="videocam-outline" size={12} color={c.text} style={{ marginRight: 4 }} />
                      <Text variant="bold" style={{ fontSize: 11, color: c.text }} numberOfLines={1}>
                        Stream Session
                      </Text>
                    </TouchableOpacity>
                  </DefaultView>
                </View>
              )}

              {/* Session Objective */}
              {selectedSession.objective && (
                <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                    SESSION OBJECTIVE
                  </Text>
                  <Text variant="regular" style={[styles.bodyText, { color: c.text }]}>
                    {selectedSession.objective}
                  </Text>
                </View>
              )}

              {/* Recording Card */}
              {selectedSession.recordingUrl && (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.recordingCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}
                >
                  <DefaultView style={styles.recordingLeft}>
                    <DefaultView style={[styles.playCircle, { backgroundColor: '#FF4A4A15' }]}>
                      <Ionicons name="play-circle" size={24} color="#FF4A4A" />
                    </DefaultView>
                    <DefaultView style={{ backgroundColor: 'transparent' }}>
                      <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Session Recording</Text>
                      <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>Watch online lecture playback</Text>
                    </DefaultView>
                  </DefaultView>
                  <Ionicons name="chevron-forward" size={16} color={c.textSecondary} />
                </TouchableOpacity>
              )}

              {/* Learning Materials */}
              <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 8 }]}>
                  LEARNING MATERIALS
                </Text>

                {/* Pre-Reads */}
                {selectedSession.preReads && selectedSession.preReads.length > 0 && (
                  <DefaultView style={styles.materialSubGroup}>
                    <DefaultView style={styles.materialSubHeader}>
                      <Ionicons name="book-outline" size={13} color={selectedCourse.color} />
                      <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Pre-Reads Material</Text>
                    </DefaultView>
                    {selectedSession.preReads.map((mat: any, idx: number) => renderMaterialItem(mat, idx, 'document-text-outline'))}
                  </DefaultView>
                )}

                {/* In-Class */}
                {selectedSession.inClassMaterial && selectedSession.inClassMaterial.length > 0 && (
                  <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                    <DefaultView style={styles.materialSubHeader}>
                      <Ionicons name="easel-outline" size={13} color={selectedCourse.color} />
                      <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>In-Class Material</Text>
                    </DefaultView>
                    {selectedSession.inClassMaterial.map((mat: any, idx: number) => renderMaterialItem(mat, idx, 'document-attach-outline'))}
                  </DefaultView>
                )}

                {/* Post-Class */}
                {selectedSession.postClassMaterial && selectedSession.postClassMaterial.length > 0 && (
                  <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                    <DefaultView style={styles.materialSubHeader}>
                      <Ionicons name="checkbox-outline" size={13} color={selectedCourse.color} />
                      <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Post-Class Material</Text>
                    </DefaultView>
                    {selectedSession.postClassMaterial.map((mat: any, idx: number) => renderMaterialItem(mat, idx, 'clipboard-outline'))}
                  </DefaultView>
                )}
              </View>

              {/* Rating Feedback Widget */}
              {selectedSession.status !== 'U' && (
                <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                    SESSION RATING & FEEDBACK
                  </Text>

                  {isFeedbackSubmitted ? (
                    <DefaultView style={[styles.feedbackSubmittedRow, { backgroundColor: c.green + '12', borderColor: c.green + '30' }]}>
                      <Ionicons name="checkmark-circle" size={20} color={c.green} style={{ marginRight: 10 }} />
                      <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                        <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Feedback Submitted</Text>
                        <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                          Thank you! Your ratings have been logged directly with the course faculty.
                        </Text>
                      </DefaultView>
                    </DefaultView>
                  ) : (
                    <DefaultView style={{ backgroundColor: 'transparent', marginTop: 4 }}>
                      <Text variant="regular" style={{ fontSize: 12, color: c.textSecondary, lineHeight: 17 }}>
                        How would you rate this session's content, pedagogy, and delivery? Share your review to help us improve.
                      </Text>

                      {/* Stars row */}
                      <DefaultView style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            activeOpacity={0.7}
                            onPress={() => setRating(star)}
                          >
                            <Ionicons
                              name={rating >= star ? "star" : "star-outline"}
                              size={26}
                              color={rating >= star ? selectedCourse.color : c.textSecondary}
                              style={{ marginRight: star === 5 ? 0 : 8 }}
                            />
                          </TouchableOpacity>
                        ))}
                      </DefaultView>

                      {/* Submit Button */}
                      <TouchableOpacity
                        style={[
                          styles.feedbackSubmitBtn,
                          { 
                            backgroundColor: rating > 0 ? selectedCourse.color : c.border,
                          }
                        ]}
                        disabled={rating === 0}
                        activeOpacity={0.8}
                        onPress={() => setIsFeedbackSubmitted(true)}
                      >
                        <Text variant="bold" style={{ fontSize: 13, color: rating > 0 ? '#000' : c.textSecondary }}>
                          Submit Feedback
                        </Text>
                      </TouchableOpacity>
                    </DefaultView>
                  )}
                </View>
              )}

            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: '#FFD700',
    opacity: 0.04,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  avatarBorder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
  gamifiedCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  metricBlock: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
  },
  metricDivider: {
    width: 0.5,
    height: 24,
    opacity: 0.15,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 1,
    color: '#8E8E93',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  gridItem: {
    width: (width - 42) / 2,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
  timelineCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingRight: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  leftAccentStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
  },
  liveIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  announcementScroll: {
    marginTop: 8,
    gap: 10,
  },
  announcementCard: {
    width: width * 0.62,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  announcementImage: {
    width: '100%',
    height: 90,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 14,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sessionModalScroll: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  sessionModalHeader: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sessionModalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sessionStatusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionModalTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 26,
    backgroundColor: 'transparent',
  },
  sessionModalSubtopic: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    opacity: 0.8,
    backgroundColor: 'transparent',
  },
  peopleGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  peopleCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  peopleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customDeliveryCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  deliveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  deliveryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  smallOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  smallSolidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  detailSectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  sectionHeading: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
  },
  recordingCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialSubGroup: {
    backgroundColor: 'transparent',
  },
  materialSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  materialSubTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
    paddingLeft: 4,
    marginBottom: 8,
  },
  materialItemText: {
    fontSize: 12,
    flex: 1,
  },
  feedbackSubmittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  feedbackSubmitBtn: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  todoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  todoInput: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
  },
  addTodoBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  todoIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  todoTabBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  todoTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  todoTabBadgeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardTabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  leaderboardTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  rankBadgeWrapper: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  leaderboardAvatarBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  avatarPodiumCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    position: 'relative',
  },
  podiumBadgeCircle: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pedestalBlock: {
    width: '85%',
    borderRadius: 8,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  scheduleDaysScroll: {
    paddingVertical: 10,
    gap: 8,
  },
  scheduleDayCard: {
    width: 46,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
