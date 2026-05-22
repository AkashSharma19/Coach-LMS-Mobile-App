import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform, 
  Modal,
  Dimensions,
  Linking
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { MOCK_COURSES } from '@/constants/MockData';

interface FlatSession {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseColor: string;
  classType: 'InClass' | 'OutClass';
  location: string;
  instructorName: string;
  term: string;
  
  topic: string;
  subtopic?: string;
  date: string; // e.g. "May 10" or "April 12"
  time: string; // e.g. "09:00 AM - 10:30 AM"
  status: 'P' | 'A' | 'U';
  type: 'Online' | 'Offline' | 'Hybrid';
  feedbackStatus?: 'pending' | 'submitted';
  objective?: string;
  recordingUrl?: string;
  preReads?: any[];
  inClassMaterial?: any[];
  postClassMaterial?: any[];
  faculty?: string;
  programAssociate?: string;
}

export default function AttendanceScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // Core navigation states
  const [activeView, setActiveView] = useState<'course' | 'day' | 'week' | 'month'>('course');
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({ '1': true }); // ECON-302 expanded by default!
  
  // Dynamic Academic Term Filter State
  const [selectedTerm, setSelectedTerm] = useState<string>('All Terms');

  // Group by Academic Domain Toggle State
  const [groupByDomain, setGroupByDomain] = useState<boolean>(false);

  // Bottom Sheet Modal states
  const [selectedSession, setSelectedSession] = useState<FlatSession | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);

  // Dynamic Session Interactive States (shared globally across calendar and details sheet)
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<Record<string, 'pending' | 'submitted'>>({});
  const [userRating, setUserRating] = useState<number>(0);
  const [checkedInSessions, setCheckedInSessions] = useState<Record<string, boolean>>({});

  // Helper to map month strings to numbers for sorting
  const monthNameToNum: Record<string, number> = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  // Maps Course prefixes to Subject Domains
  const getCourseDomain = (code: string) => {
    const prefix = code.split('-')[0].toUpperCase();
    switch (prefix) {
      case 'ECON':
        return { name: 'Economics & Policy', icon: 'trending-up-outline', color: '#EBC063' };
      case 'BUS':
        return { name: 'Business Administration', icon: 'briefcase-outline', color: '#4A90E2' };
      case 'HCI':
        return { name: 'UX & Human-Computer Interaction', icon: 'easel-outline', color: '#FF9F0A' };
      case 'CS':
        return { name: 'Computer Science', icon: 'code-slash-outline', color: '#FFE500' };
      default:
        return { name: 'General Studies', icon: 'book-outline', color: '#8E8E93' };
    }
  };

  // Convert raw mock data into a clean, flat list of active sessions with full attributes
  const allSessions: FlatSession[] = useMemo(() => {
    const list: FlatSession[] = [];
    MOCK_COURSES.forEach(course => {
      course.sessions.forEach(session => {
        list.push({
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          courseColor: course.color,
          classType: (course.classType || 'InClass') as 'InClass' | 'OutClass',
          location: course.location,
          instructorName: course.instructor.name,
          term: course.term || 'Spring 2026',
          
          topic: session.topic,
          subtopic: session.subtopic,
          date: session.date,
          time: session.time,
          status: session.status,
          type: session.type,
          feedbackStatus: session.feedbackStatus,
          objective: session.objective,
          recordingUrl: session.recordingUrl,
          preReads: session.preReads,
          inClassMaterial: session.inClassMaterial,
          postClassMaterial: session.postClassMaterial,
          faculty: session.faculty || course.instructor.name,
          programAssociate: session.programAssociate
        });
      });
    });
    return list;
  }, []);

  // Compute dynamic unique list of Terms
  const availableTerms = useMemo(() => {
    const terms = new Set<string>();
    MOCK_COURSES.forEach(course => {
      if (course.term) {
        terms.add(course.term);
      }
    });
    return ['All Terms', ...Array.from(terms)];
  }, []);

  // Filtered Sessions & Courses based on active term
  const filteredSessions = useMemo(() => {
    if (selectedTerm === 'All Terms') return allSessions;
    return allSessions.filter(s => s.term === selectedTerm);
  }, [allSessions, selectedTerm]);

  const filteredCourses = useMemo(() => {
    if (selectedTerm === 'All Terms') return MOCK_COURSES;
    return MOCK_COURSES.filter(c => c.term === selectedTerm);
  }, [selectedTerm]);

  // Group Courses by their academic Domain
  const domainGroups = useMemo(() => {
    const groups: Record<string, typeof MOCK_COURSES> = {};
    filteredCourses.forEach(course => {
      const domainName = getCourseDomain(course.code).name;
      if (!groups[domainName]) {
        groups[domainName] = [];
      }
      groups[domainName].push(course);
    });
    return groups;
  }, [filteredCourses]);

  // Compute session status by integrating dynamic check-in state
  const getSessionStatus = (session: FlatSession) => {
    if (checkedInSessions[session.topic]) {
      return 'P'; // Instantly convert to Present!
    }
    return session.status;
  };

  // Dynamic Attendance Statistics calculations based on completed classes (Present or Absent status)
  const stats = useMemo(() => {
    let overallAttended = 0;
    let overallTotal = 0;

    let inClassAttended = 0;
    let inClassTotal = 0;

    let outClassAttended = 0;
    let outClassTotal = 0;

    filteredSessions.forEach(session => {
      const status = getSessionStatus(session);
      if (status === 'P' || status === 'A') {
        overallTotal += 1;
        if (status === 'P') overallAttended += 1;

        if (session.classType === 'OutClass') {
          outClassTotal += 1;
          if (status === 'P') outClassAttended += 1;
        } else {
          inClassTotal += 1;
          if (status === 'P') inClassAttended += 1;
        }
      }
    });

    const overallPct = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 100;
    const inClassPct = inClassTotal > 0 ? Math.round((inClassAttended / inClassTotal) * 100) : 100;
    const outClassPct = outClassTotal > 0 ? Math.round((outClassAttended / outClassTotal) * 100) : 100;

    return {
      overallPct,
      overallAttended,
      overallTotal,
      inClassPct,
      inClassAttended,
      inClassTotal,
      outClassPct,
      outClassAttended,
      outClassTotal
    };
  }, [filteredSessions, checkedInSessions]);

  // Compute individual attendance percentage for each specific Course card
  const getCourseAttendancePct = (courseId: string) => {
    let attended = 0;
    let total = 0;
    filteredSessions.filter(s => s.courseId === courseId).forEach(s => {
      const status = getSessionStatus(s);
      if (status === 'P' || status === 'A') {
        total += 1;
        if (status === 'P') attended += 1;
      }
    });
    return total > 0 ? Math.round((attended / total) * 100) : 100;
  };

  // Compute aggregated attendance percentage for an entire academic domain
  const getDomainAttendancePct = (domainCourses: typeof MOCK_COURSES) => {
    let attended = 0;
    let total = 0;
    const courseIds = domainCourses.map(c => c.id);
    filteredSessions.filter(s => courseIds.includes(s.courseId)).forEach(s => {
      const status = getSessionStatus(s);
      if (status === 'P' || status === 'A') {
        total += 1;
        if (status === 'P') attended += 1;
      }
    });
    return total > 0 ? Math.round((attended / total) * 100) : 100;
  };

  // GROUPING 1: Day View clusters (chronologically grouped dates)
  const dayGroups = useMemo(() => {
    const groups: Record<string, FlatSession[]> = {};
    filteredSessions.forEach(session => {
      const dateKey = session.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    // Sort dates logically (May 06, May 08... May 21)
    const sortedDates = Object.keys(groups).sort((a, b) => {
      const aMatch = a.match(/(\w+)\s+(\d+)/);
      const bMatch = b.match(/(\w+)\s+(\d+)/);
      if (aMatch && bMatch) {
        const aMonth = monthNameToNum[aMatch[1]] ?? 4;
        const bMonth = monthNameToNum[bMatch[1]] ?? 4;
        const aDay = parseInt(aMatch[2], 10);
        const bDay = parseInt(bMatch[2], 10);
        if (aMonth !== bMonth) return aMonth - bMonth;
        return aDay - bDay;
      }
      return 0;
    });

    return sortedDates.map(date => ({
      date,
      sessions: groups[date]
    }));
  }, [filteredSessions]);

  // GROUPING 2: Week View clusters (mathematical week blocks in May 2026)
  const weekGroups = useMemo(() => {
    const groups: Array<{ label: string; startDay: number; endDay: number; sessions: FlatSession[] }> = [
      { label: 'Week of May 4 - May 10', startDay: 4, endDay: 10, sessions: [] },
      { label: 'Week of May 11 - May 17', startDay: 11, endDay: 17, sessions: [] },
      { label: 'Week of May 18 - May 24', startDay: 18, endDay: 24, sessions: [] },
      { label: 'Week of April 12 - April 18 (Completed term)', startDay: 1, endDay: 31, sessions: [] } // CS-210 April fallback
    ];

    filteredSessions.forEach(session => {
      const match = session.date.match(/(\w+)\s+(\d+)/);
      if (match) {
        const month = match[1];
        const day = parseInt(match[2], 10);

        if (month === 'April' || month === 'Apr') {
          groups[3].sessions.push(session);
        } else if (month === 'May' || month === 'Mar') {
          if (day >= 4 && day <= 10) {
            groups[0].sessions.push(session);
          } else if (day >= 11 && day <= 17) {
            groups[1].sessions.push(session);
          } else if (day >= 18 && day <= 24) {
            groups[2].sessions.push(session);
          }
        }
      }
    });

    return groups.filter(g => g.sessions.length > 0);
  }, [filteredSessions]);

  // Compute dynamic attendance stats for a specific week block
  const getWeekStats = (sessionsList: FlatSession[]) => {
    let attended = 0;
    let total = 0;
    sessionsList.forEach(s => {
      const status = getSessionStatus(s);
      if (status === 'P' || status === 'A') {
        total += 1;
        if (status === 'P') attended += 1;
      }
    });
    const pct = total > 0 ? Math.round((attended / total) * 100) : 100;
    return { pct, attended, total };
  };

  // GROUPING 3: Month View clusters
  const monthGroups = useMemo(() => {
    const groups: Record<string, FlatSession[]> = {};
    filteredSessions.forEach(session => {
      const match = session.date.match(/^([A-Za-z]+)/);
      const monthLabel = match ? match[1] === 'Apr' ? 'April 2026' : 'May 2026' : 'May 2026';
      if (!groups[monthLabel]) {
        groups[monthLabel] = [];
      }
      groups[monthLabel].push(session);
    });

    return Object.keys(groups).map(monthLabel => ({
      monthLabel,
      sessions: groups[monthLabel]
    }));
  }, [filteredSessions]);

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleOpenSessionModal = (session: FlatSession) => {
    setSelectedSession(session);
    setUserRating(0); // Reset ratings stars
    setIsModalVisible(true);
  };

  // Helper method to draw dynamic colored progress borders
  const getProgressColor = (pct: number) => {
    if (pct >= 85) return c.green;
    if (pct >= 75) return c.gold;
    return '#FF4A4A';
  };

  // Helper to render documents or pre-reads links
  const renderMaterialItem = (mat: any, idx: number, defaultIcon: any, color: string) => {
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
          <Ionicons name="link-outline" size={12} color={color} />
          <Text
            variant="medium"
            style={[
              styles.materialItemText,
              { color: color, textDecorationLine: 'underline' }
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

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Visual Accent */}
      <DefaultView style={styles.bgAccent} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>
        
        <DefaultView style={[styles.headerLabelWrapper, { flex: 1, marginLeft: 4 }]}>
          <Text variant="bold" style={[styles.headerTitle, { color: c.text }]}>
            Attendance Tracker
          </Text>
          <Text variant="bold" style={{ fontSize: 8, color: c.gold, marginTop: 2, letterSpacing: 0.5 }}>
            {selectedTerm.toUpperCase()}{groupByDomain && activeView === 'course' ? ' • GROUPED BY DOMAIN' : ''}
          </Text>
        </DefaultView>

        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => setIsFilterSheetVisible(true)}
          style={[styles.backButton, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Ionicons name="options-outline" size={20} color={c.text} />
        </TouchableOpacity>
      </View>

      {/* THREE DYNAMIC SUMMARY STATS CARDS (Cascading directly from selected Term) */}
      <DefaultView style={styles.statsContainer}>
        {/* Card 1: InClass */}
        <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <DefaultView style={[styles.statsIconBox, { backgroundColor: c.gold + '15' }]}>
            <Ionicons name="school-outline" size={16} color={c.gold} />
          </DefaultView>
          <Text variant="bold" style={[styles.statsValue, { color: getProgressColor(stats.inClassPct) }]}>
            {stats.inClassPct}%
          </Text>
          <Text variant="bold" style={styles.statsLabel}>IN-CLASS AVERAGE</Text>
          <Text variant="medium" style={styles.statsDetails}>
            {stats.inClassAttended} / {stats.inClassTotal} recorded
          </Text>
        </View>

        {/* Card 2: OutClass */}
        <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <DefaultView style={[styles.statsIconBox, { backgroundColor: '#BF5AF215' }]}>
            <Ionicons name="trophy-outline" size={16} color="#BF5AF2" />
          </DefaultView>
          <Text variant="bold" style={[styles.statsValue, { color: getProgressColor(stats.outClassPct) }]}>
            {stats.outClassPct}%
          </Text>
          <Text variant="bold" style={styles.statsLabel}>OUT-CLASS AVERAGE</Text>
          <Text variant="medium" style={styles.statsDetails}>
            {stats.outClassAttended} / {stats.outClassTotal} recorded
          </Text>
        </View>

        {/* Card 3: Overall */}
        <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <DefaultView style={[styles.statsIconBox, { backgroundColor: c.green + '15' }]}>
            <Ionicons name="checkmark-done" size={16} color={c.green} />
          </DefaultView>
          <Text variant="bold" style={[styles.statsValue, { color: getProgressColor(stats.overallPct) }]}>
            {stats.overallPct}%
          </Text>
          <Text variant="bold" style={styles.statsLabel}>OVERALL RECORD</Text>
          <Text variant="medium" style={styles.statsDetails}>
            {stats.overallAttended} / {stats.overallTotal} total lectures
          </Text>
        </View>
      </DefaultView>

      {/* VIEW TYPE SELECTOR */}
      <DefaultView style={[styles.tabBar, { backgroundColor: c.card, borderColor: c.border }]}>
        {(['course', 'day', 'week', 'month'] as const).map((view) => {
          const isActive = activeView === view;
          const labelMap: Record<string, string> = {
            course: 'COURSE-WISE',
            day: 'DAY VIEW',
            week: 'WEEK VIEW',
            month: 'MONTH VIEW'
          };
          return (
            <TouchableOpacity
              key={view}
              activeOpacity={0.8}
              style={[
                styles.tabBtn,
                isActive && { backgroundColor: c.cardSecondary, borderColor: c.border }
              ]}
              onPress={() => setActiveView(view)}
            >
              <Text 
                variant="bold" 
                style={[
                  styles.tabBtnLabel,
                  { color: isActive ? c.gold : c.textSecondary }
                ]}
              >
                {labelMap[view]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DefaultView>

      {/* DYNAMIC SCROLL CONTAINER */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* VIEW 1: COURSE-WISE COLLAPSIBLE ACCORDION */}
        {activeView === 'course' && (
          !groupByDomain ? (
            filteredCourses.map(course => {
              const isExpanded = expandedCourses[course.id];
              const courseSessions = filteredSessions.filter(s => s.courseId === course.id);
              const coursePct = getCourseAttendancePct(course.id);
              
              return (
                <View 
                  key={course.id} 
                  style={[styles.courseAccordionCard, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleCourseExpand(course.id)}
                    style={styles.accordionHeaderRow}
                  >
                    <DefaultView style={[styles.accordionIndicator, { backgroundColor: course.color }]} />
                    <DefaultView style={{ flex: 1, backgroundColor: 'transparent', marginLeft: 10 }}>
                      <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 14, color: c.text, flexShrink: 1 }} numberOfLines={1}>
                          {course.title}
                        </Text>
                        <DefaultView style={[styles.badge, { backgroundColor: c.border, paddingVertical: 1, paddingHorizontal: 6 }]}>
                          <Text variant="bold" style={{ fontSize: 7, color: c.textSecondary }}>
                            {course.classType || 'INCLASS'}
                          </Text>
                        </DefaultView>
                      </DefaultView>
                      <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
                        Prof. {course.instructor.name}
                      </Text>
                    </DefaultView>

                    <DefaultView style={[styles.coursePctBox, { borderColor: getProgressColor(coursePct) }]}>
                      <Text variant="bold" style={{ fontSize: 13, color: getProgressColor(coursePct) }}>
                        {coursePct}%
                      </Text>
                    </DefaultView>

                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color={c.textSecondary} 
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <DefaultView style={[styles.accordionBody, { borderTopColor: c.border + '30' }]}>
                      {courseSessions.length === 0 ? (
                        <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 10 }}>
                          No session data available.
                        </Text>
                      ) : (
                        courseSessions.map((session, idx) => {
                          const status = getSessionStatus(session);
                          return (
                            <TouchableOpacity
                              key={idx}
                              activeOpacity={0.7}
                              onPress={() => handleOpenSessionModal(session)}
                              style={[styles.sessionListItem, { borderBottomColor: idx === courseSessions.length - 1 ? 'transparent' : c.border + '20' }]}
                            >
                              <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                                <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                                  Session {idx + 1}: {session.topic}
                                </Text>
                                <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
                                  {session.date}  •  {session.time}
                                </Text>
                              </DefaultView>

                              <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'transparent' }}>
                                <DefaultView style={[styles.badge, { backgroundColor: course.color + '15' }]}>
                                  <Text variant="bold" style={{ fontSize: 7, color: course.color }}>{session.type}</Text>
                                </DefaultView>

                                <DefaultView style={[
                                  styles.statusCircle,
                                  { 
                                    backgroundColor: status === 'P' ? c.green : status === 'A' ? '#FF4A4A' : c.border,
                                  }
                                ]}>
                                  <Text variant="bold" style={{ fontSize: 9, color: '#000' }}>{status}</Text>
                                </DefaultView>
                              </DefaultView>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </DefaultView>
                  )}
                </View>
              );
            })
          ) : (
            Object.keys(domainGroups).map((domainName) => {
              const coursesInDomain = domainGroups[domainName];
              if (coursesInDomain.length === 0) return null;
              
              const domainInfo = getCourseDomain(coursesInDomain[0].code);
              const domainPct = getDomainAttendancePct(coursesInDomain);
              return (
                <DefaultView key={domainName} style={{ marginBottom: 18, backgroundColor: 'transparent' }}>
                  {/* Domain Category Ribbon Header */}
                  <DefaultView style={styles.domainHeaderRow}>
                    <DefaultView style={[styles.domainHeaderIconBox, { backgroundColor: domainInfo.color + '15' }]}>
                      <Ionicons name={domainInfo.icon as any} size={14} color={domainInfo.color} />
                    </DefaultView>
                    <Text variant="bold" style={[styles.domainTitleText, { color: c.text }]}>
                      {domainName.toUpperCase()}
                    </Text>
                    <DefaultView style={{ flex: 1, height: 1, backgroundColor: c.border + '30', marginLeft: 8, marginRight: 8 }} />
                    <DefaultView style={[styles.badge, { backgroundColor: domainInfo.color + '12', borderColor: domainInfo.color, borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8 }]}>
                      <Text variant="bold" style={{ fontSize: 8, color: domainInfo.color, letterSpacing: 0.3 }}>
                        {domainPct}% ATTENDANCE
                      </Text>
                    </DefaultView>
                  </DefaultView>

                  {coursesInDomain.map(course => {
                    const isExpanded = expandedCourses[course.id];
                    const courseSessions = filteredSessions.filter(s => s.courseId === course.id);
                    const coursePct = getCourseAttendancePct(course.id);
                    
                    return (
                      <View 
                        key={course.id} 
                        style={[styles.courseAccordionCard, { backgroundColor: c.card, borderColor: c.border }]}
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => toggleCourseExpand(course.id)}
                          style={styles.accordionHeaderRow}
                        >
                          <DefaultView style={[styles.accordionIndicator, { backgroundColor: course.color }]} />
                          <DefaultView style={{ flex: 1, backgroundColor: 'transparent', marginLeft: 10 }}>
                            <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
                              <Text variant="bold" style={{ fontSize: 14, color: c.text, flexShrink: 1 }} numberOfLines={1}>
                                {course.title}
                              </Text>
                              <DefaultView style={[styles.badge, { backgroundColor: c.border, paddingVertical: 1, paddingHorizontal: 6 }]}>
                                <Text variant="bold" style={{ fontSize: 7, color: c.textSecondary }}>
                                  {course.classType || 'INCLASS'}
                                </Text>
                              </DefaultView>
                            </DefaultView>
                            <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
                              Prof. {course.instructor.name}
                            </Text>
                          </DefaultView>

                          <DefaultView style={[styles.coursePctBox, { borderColor: getProgressColor(coursePct) }]}>
                            <Text variant="bold" style={{ fontSize: 13, color: getProgressColor(coursePct) }}>
                              {coursePct}%
                            </Text>
                          </DefaultView>

                          <Ionicons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={16} 
                            color={c.textSecondary} 
                            style={{ marginLeft: 8 }}
                          />
                        </TouchableOpacity>

                        {isExpanded && (
                          <DefaultView style={[styles.accordionBody, { borderTopColor: c.border + '30' }]}>
                            {courseSessions.length === 0 ? (
                              <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 10 }}>
                                No session data available.
                              </Text>
                            ) : (
                              courseSessions.map((session, idx) => {
                                const status = getSessionStatus(session);
                                return (
                                  <TouchableOpacity
                                    key={idx}
                                    activeOpacity={0.7}
                                    onPress={() => handleOpenSessionModal(session)}
                                    style={[styles.sessionListItem, { borderBottomColor: idx === courseSessions.length - 1 ? 'transparent' : c.border + '20' }]}
                                  >
                                    <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                                      <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                                        Session {idx + 1}: {session.topic}
                                      </Text>
                                      <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
                                        {session.date}  •  {session.time}
                                      </Text>
                                    </DefaultView>

                                    <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'transparent' }}>
                                      <DefaultView style={[styles.badge, { backgroundColor: course.color + '15' }]}>
                                        <Text variant="bold" style={{ fontSize: 7, color: course.color }}>{session.type}</Text>
                                      </DefaultView>

                                      <DefaultView style={[
                                        styles.statusCircle,
                                        { 
                                          backgroundColor: status === 'P' ? c.green : status === 'A' ? '#FF4A4A' : c.border,
                                        }
                                      ]}>
                                        <Text variant="bold" style={{ fontSize: 9, color: '#000' }}>{status}</Text>
                                      </DefaultView>
                                    </DefaultView>
                                  </TouchableOpacity>
                                );
                              })
                            )}
                          </DefaultView>
                        )}
                      </View>
                    );
                  })}
                </DefaultView>
              );
            })
          )
        )}

        {/* VIEW 2: DAY VIEW CHRONOLOGICAL DATE GROUPS */}
        {activeView === 'day' && (
          dayGroups.map((group, groupIdx) => (
            <DefaultView key={groupIdx} style={{ backgroundColor: 'transparent', marginBottom: 20 }}>
              <Text variant="bold" style={[styles.dateHeaderLabel, { color: c.text }]}>
                {group.date}
              </Text>
              
              {group.sessions.map((session, idx) => {
                const status = getSessionStatus(session);
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => handleOpenSessionModal(session)}
                    style={[styles.cardListItem, { backgroundColor: c.card, borderColor: c.border }]}
                  >
                    <DefaultView style={[styles.colorLeftMarker, { backgroundColor: session.courseColor }]} />
                    
                    <DefaultView style={{ flex: 1, paddingLeft: 12, backgroundColor: 'transparent' }}>
                      <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 10, color: session.courseColor }} numberOfLines={1}>
                          {session.courseTitle}
                        </Text>
                        <DefaultView style={[styles.badge, { backgroundColor: c.border }]}>
                          <Text variant="bold" style={{ fontSize: 6, color: c.textSecondary }}>{session.classType}</Text>
                        </DefaultView>
                      </DefaultView>
                      
                      <Text variant="bold" style={{ fontSize: 13, color: c.text, marginTop: 4 }} numberOfLines={1}>
                        {session.topic}
                      </Text>
                      <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 2 }}>
                        {session.time}  •  {session.location}
                      </Text>
                    </DefaultView>

                    <DefaultView style={[
                      styles.statusCircle,
                      { 
                        backgroundColor: status === 'P' ? c.green : status === 'A' ? '#FF4A4A' : c.border,
                        marginRight: 10
                      }
                    ]}>
                      <Text variant="bold" style={{ fontSize: 10, color: '#000' }}>{status}</Text>
                    </DefaultView>
                  </TouchableOpacity>
                );
              })}
            </DefaultView>
          ))
        )}

        {/* VIEW 3: WEEK VIEW CALENDAR BLOCKS */}
        {activeView === 'week' && (
          weekGroups.map((week, idx) => {
            const weekStats = getWeekStats(week.sessions);
            return (
              <View 
                key={idx} 
                style={[styles.weekSectionCard, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <DefaultView style={[styles.weekCardHeader, { borderBottomColor: c.border + '30' }]}>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 14, color: c.text }}>{week.label}</Text>
                    <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                      {weekStats.attended} classes present out of {weekStats.total} total sessions
                    </Text>
                  </DefaultView>
                  
                  <DefaultView style={[styles.weekMetricBadge, { backgroundColor: getProgressColor(weekStats.pct) + '12', borderColor: getProgressColor(weekStats.pct) }]}>
                    <Text variant="bold" style={{ fontSize: 12, color: getProgressColor(weekStats.pct) }}>
                      {weekStats.pct}%
                    </Text>
                  </DefaultView>
                </DefaultView>

                <DefaultView style={{ backgroundColor: 'transparent', paddingHorizontal: 16, paddingBottom: 10 }}>
                  {week.sessions.map((session, sIdx) => {
                    const status = getSessionStatus(session);
                    return (
                      <TouchableOpacity
                        key={sIdx}
                        activeOpacity={0.7}
                        onPress={() => handleOpenSessionModal(session)}
                        style={[styles.weekSessionListItem, { borderBottomColor: sIdx === week.sessions.length - 1 ? 'transparent' : c.border + '15' }]}
                      >
                        <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                          <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                            {session.topic}
                          </Text>
                          <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 2 }}>
                            {session.courseTitle}  •  {session.date}  •  {session.time}
                          </Text>
                        </DefaultView>

                        <DefaultView style={[
                          styles.statusCircle,
                          { 
                            backgroundColor: status === 'P' ? c.green : status === 'A' ? '#FF4A4A' : c.border,
                          }
                        ]}>
                          <Text variant="bold" style={{ fontSize: 9, color: '#000' }}>{status}</Text>
                        </DefaultView>
                      </TouchableOpacity>
                    );
                  })}
                </DefaultView>
              </View>
            );
          })
        )}

        {/* VIEW 4: MONTH VIEW CALENDAR BLOCKS */}
        {activeView === 'month' && (
          monthGroups.map((month, idx) => {
            const mStats = getWeekStats(month.sessions);
            return (
              <View 
                key={idx} 
                style={[styles.weekSectionCard, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <DefaultView style={[styles.weekCardHeader, { borderBottomColor: c.border + '30' }]}>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 14, color: c.text }}>{month.monthLabel}</Text>
                    <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                      {mStats.attended} of {mStats.total} classes attended
                    </Text>
                  </DefaultView>
                  
                  <DefaultView style={[styles.weekMetricBadge, { backgroundColor: getProgressColor(mStats.pct) + '12', borderColor: getProgressColor(mStats.pct) }]}>
                    <Text variant="bold" style={{ fontSize: 12, color: getProgressColor(mStats.pct) }}>
                      {mStats.pct}%
                    </Text>
                  </DefaultView>
                </DefaultView>

                <DefaultView style={{ backgroundColor: 'transparent', paddingHorizontal: 16, paddingBottom: 10 }}>
                  {month.sessions.map((session, sIdx) => {
                    const status = getSessionStatus(session);
                    return (
                      <TouchableOpacity
                        key={sIdx}
                        activeOpacity={0.7}
                        onPress={() => handleOpenSessionModal(session)}
                        style={[styles.weekSessionListItem, { borderBottomColor: sIdx === month.sessions.length - 1 ? 'transparent' : c.border + '15' }]}
                      >
                        <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                          <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                            Session: {session.topic}
                          </Text>
                          <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 2 }}>
                            {session.courseTitle}  •  {session.date}  •  {session.time}
                          </Text>
                        </DefaultView>

                        <DefaultView style={[
                          styles.statusCircle,
                          { 
                            backgroundColor: status === 'P' ? c.green : status === 'A' ? '#FF4A4A' : c.border,
                          }
                        ]}>
                          <Text variant="bold" style={{ fontSize: 9, color: '#000' }}>{status}</Text>
                        </DefaultView>
                      </TouchableOpacity>
                    );
                  })}
                </DefaultView>
              </View>
            );
          })
        )}

        <DefaultView style={{ height: 40 }} />
      </ScrollView>

      {/* SLELEK 1:1 SYNCED SESSION DETAILS SHEET DRAWER MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible && selectedSession !== null}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsModalVisible(false)}
        >
          <DefaultView style={{ flex: 1 }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />
          
          <TouchableOpacity style={styles.closeIconBtn} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </TouchableOpacity>

          {selectedSession && (() => {
            const status = getSessionStatus(selectedSession);
            return (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sessionModalScroll}>
                <DefaultView style={styles.sessionModalHeader}>
                  <DefaultView style={styles.sessionModalBadgeRow}>
                    <DefaultView style={[styles.badge, { backgroundColor: selectedSession.courseColor + '15' }]}>
                      <Text variant="bold" style={[styles.badgeText, { color: selectedSession.courseColor }]}>
                        {selectedSession.classType.toUpperCase()}
                      </Text>
                    </DefaultView>
                    
                    <DefaultView style={[
                      styles.statusCircle, 
                      { 
                        backgroundColor: status === 'P' ? c.green : status === 'A' ? '#FF4A4A' : '#8E8E93',
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                      }
                    ]}>
                      <Text variant="bold" style={{ fontSize: 10, color: '#000' }}>
                        {status}
                      </Text>
                    </DefaultView>
                  </DefaultView>
                  
                  <Text variant="bold" style={[styles.sessionModalTitle, { color: c.text }]}>
                    {selectedSession.courseTitle}
                  </Text>
                  
                  <Text variant="medium" style={[styles.sessionModalSubtopic, { color: c.textSecondary, marginTop: 4 }]}>
                    {selectedSession.topic}
                  </Text>

                  {selectedSession.subtopic && (
                    <Text variant="medium" style={[styles.sessionModalSubtopic, { color: c.textSecondary, opacity: 0.8, marginTop: 2 }]}>
                      {selectedSession.subtopic}
                    </Text>
                  )}

                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6, backgroundColor: 'transparent' }}>
                    <Ionicons name="time-outline" size={14} color={selectedSession.courseColor} />
                    <Text variant="semiBold" style={{ fontSize: 12, color: c.textSecondary }}>
                      {selectedSession.date}  •  {selectedSession.time}
                    </Text>
                  </DefaultView>
                </DefaultView>

                <DefaultView style={styles.peopleGrid}>
                  <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <DefaultView style={[styles.peopleAvatar, { backgroundColor: selectedSession.courseColor + '15' }]}>
                      <Ionicons name="school-outline" size={15} color={selectedSession.courseColor} />
                    </DefaultView>
                    <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                        {selectedSession.faculty || selectedSession.instructorName}
                      </Text>
                      <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                        Faculty Instructor
                      </Text>
                    </DefaultView>
                  </View>

                  <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    <DefaultView style={[styles.peopleAvatar, { backgroundColor: selectedSession.courseColor + '15' }]}>
                      <Ionicons name="people-outline" size={15} color={selectedSession.courseColor} />
                    </DefaultView>
                    <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                        {selectedSession.programAssociate || 'Sarah Jenkins'}
                      </Text>
                      <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                        Program Associate
                      </Text>
                    </DefaultView>
                  </View>
                </DefaultView>

                {/* Custom Delivery Mode Widget */}
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

                    {status === 'U' ? (
                      <DefaultView style={{ marginTop: 12, backgroundColor: 'transparent' }}>
                        <Text variant="regular" style={{ fontSize: 12, color: c.textSecondary, lineHeight: 17, marginBottom: 12 }}>
                          This lecture is scheduled online via Zoom. Click the action button below to join the virtual classroom lobby.
                        </Text>
                        <TouchableOpacity 
                          style={[styles.joinClassBtn, { backgroundColor: '#4A90E2' }]}
                          activeOpacity={0.8}
                          onPress={() => {
                            Linking.openURL('https://zoom.us/join').catch(err => console.error("Failed to open link", err));
                          }}
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
                          Location: {selectedSession.location}
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

                        {status === 'U' && (
                          <TouchableOpacity 
                            style={[
                              styles.smallSolidBtn, 
                              { 
                                backgroundColor: checkedInSessions[selectedSession.topic] ? c.green + '20' : selectedSession.courseColor,
                                borderColor: checkedInSessions[selectedSession.topic] ? c.green : 'transparent',
                                borderWidth: checkedInSessions[selectedSession.topic] ? 1 : 0
                              }
                            ]}
                            activeOpacity={0.7}
                            onPress={() => setCheckedInSessions(prev => ({ ...prev, [selectedSession.topic]: true }))}
                          >
                            <Ionicons 
                              name={checkedInSessions[selectedSession.topic] ? "checkmark-circle" : "checkbox-outline"} 
                              size={13} 
                              color={checkedInSessions[selectedSession.topic] ? c.green : '#000'} 
                              style={{ marginRight: 4 }} 
                            />
                            <Text variant="bold" style={{ fontSize: 12, color: checkedInSessions[selectedSession.topic] ? c.green : '#000' }}>
                              {checkedInSessions[selectedSession.topic] ? "Checked In" : "Check In"}
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
                          {selectedSession.location.split(',')[0]}
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

                {/* Recording Action Card */}
                {selectedSession.recordingUrl && (
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    style={[styles.recordingCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}
                    onPress={() => {
                      Linking.openURL(selectedSession.recordingUrl!).catch(err => console.error("Failed to open recordingUrl", err));
                    }}
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

                {/* Learning Materials Container */}
                {((selectedSession.preReads && selectedSession.preReads.length > 0) || 
                  (selectedSession.inClassMaterial && selectedSession.inClassMaterial.length > 0) || 
                  (selectedSession.postClassMaterial && selectedSession.postClassMaterial.length > 0)) && (
                  <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                    <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 8 }]}>
                      LEARNING MATERIALS
                    </Text>

                    {/* Pre-Reads */}
                    {selectedSession.preReads && selectedSession.preReads.length > 0 && (
                      <DefaultView style={styles.materialSubGroup}>
                        <DefaultView style={styles.materialSubHeader}>
                          <Ionicons name="book-outline" size={13} color={selectedSession.courseColor} />
                          <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Pre-Reads Material</Text>
                        </DefaultView>
                        {selectedSession.preReads.map((mat, idx) => renderMaterialItem(mat, idx, 'document-text-outline', selectedSession.courseColor))}
                      </DefaultView>
                    )}

                    {/* In-Class */}
                    {selectedSession.inClassMaterial && selectedSession.inClassMaterial.length > 0 && (
                      <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                        <DefaultView style={styles.materialSubHeader}>
                          <Ionicons name="easel-outline" size={13} color={selectedSession.courseColor} />
                          <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>In-Class Material</Text>
                        </DefaultView>
                        {selectedSession.inClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'document-attach-outline', selectedSession.courseColor))}
                      </DefaultView>
                    )}

                    {/* Post-Class */}
                    {selectedSession.postClassMaterial && selectedSession.postClassMaterial.length > 0 && (
                      <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                        <DefaultView style={styles.materialSubHeader}>
                          <Ionicons name="checkbox-outline" size={13} color={selectedSession.courseColor} />
                          <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Post-Class Material</Text>
                        </DefaultView>
                        {selectedSession.postClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'clipboard-outline', selectedSession.courseColor))}
                      </DefaultView>
                    )}
                  </View>
                )}

                {/* Interactive Rating & Feedback Widget for past sessions */}
                {status !== 'U' && (
                  <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                    <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                      SESSION RATING & FEEDBACK
                    </Text>

                    {(() => {
                      const feedbackState = feedbackSubmissions[selectedSession.topic] || selectedSession.feedbackStatus || 'pending';
                      
                      if (feedbackState === 'submitted') {
                        return (
                          <DefaultView style={[styles.feedbackSubmittedRow, { backgroundColor: c.green + '12', borderColor: c.green + '30' }]}>
                            <Ionicons name="checkmark-circle" size={20} color={c.green} style={{ marginRight: 10 }} />
                            <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                              <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Feedback Submitted</Text>
                              <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                                Thank you! Your ratings have been logged directly with the course faculty.
                              </Text>
                            </DefaultView>
                          </DefaultView>
                        );
                      }

                      return (
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
                                onPress={() => setUserRating(star)}
                              >
                                <Ionicons
                                  name={userRating >= star ? "star" : "star-outline"}
                                  size={26}
                                  color={userRating >= star ? selectedSession.courseColor : c.textSecondary}
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
                                backgroundColor: userRating > 0 ? selectedSession.courseColor : c.border,
                              }
                            ]}
                            disabled={userRating === 0}
                            activeOpacity={0.8}
                            onPress={() => {
                              if (userRating > 0) {
                                setFeedbackSubmissions(prev => ({
                                  ...prev,
                                  [selectedSession.topic]: 'submitted'
                                }));
                              }
                            }}
                          >
                            <Text variant="bold" style={{ fontSize: 13, color: userRating > 0 ? '#000' : c.textSecondary }}>
                              Submit Feedback
                            </Text>
                          </TouchableOpacity>
                        </DefaultView>
                      );
                    })()}
                  </View>
                )}

                {/* Spacer at the bottom of the ScrollView */}
                <DefaultView style={{ height: 20 }} />
              </ScrollView>
            );
          })()}
        </View>
      </Modal>

      {/* PREMIUM FILTER & CONFIGURATION BOTTOM SHEET */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterSheetVisible}
        onRequestClose={() => setIsFilterSheetVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsFilterSheetVisible(false)}
        >
          <DefaultView style={{ flex: 1 }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />
          
          <TouchableOpacity style={styles.closeIconBtn} onPress={() => setIsFilterSheetVisible(false)}>
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sessionModalScroll}>
            <DefaultView style={styles.sessionModalHeader}>
              <Text variant="bold" style={[styles.sessionModalTitle, { color: c.text, fontSize: 18 }]}>
                Filters & Preferences
              </Text>
              <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4 }}>
                Personalize your academic presence and grouping views
              </Text>
            </DefaultView>

            {/* Academic Term Selection Section */}
            <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 8 }]}>
              <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                ACADEMIC TERM
              </Text>
              <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, marginBottom: 12 }}>
                Filter attendance averages and class timelines by academic semester.
              </Text>

              <DefaultView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' }}>
                {availableTerms.map(term => {
                  const isSelected = selectedTerm === term;
                  return (
                    <TouchableOpacity
                      key={term}
                      activeOpacity={0.8}
                      onPress={() => setSelectedTerm(term)}
                      style={[
                        styles.termFilterPill,
                        { 
                          backgroundColor: isSelected ? c.gold + '15' : c.cardSecondary,
                          borderColor: isSelected ? c.gold : c.border,
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                        }
                      ]}
                    >
                      <Text variant="bold" style={{ fontSize: 11, color: isSelected ? c.gold : c.text }}>
                        {term.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </DefaultView>
            </View>

            {/* Group by Domain Switch Section */}
            <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
              <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
                <DefaultView style={{ backgroundColor: 'transparent', flex: 1, marginRight: 16 }}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 4 }]}>
                    GROUP BY SUBJECT DOMAIN
                  </Text>
                  <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, lineHeight: 16 }}>
                    Organize your course-wise view into academic fields (e.g. Computer Science, Economics) with aggregated average marks.
                  </Text>
                </DefaultView>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setGroupByDomain(prev => !prev)}
                  style={[
                    styles.toggleSwitch,
                    { 
                      backgroundColor: groupByDomain ? c.gold + '25' : c.border + '30',
                      borderColor: groupByDomain ? c.gold : c.border
                    }
                  ]}
                >
                  <DefaultView 
                    style={[
                      styles.toggleCircle, 
                      { 
                        backgroundColor: groupByDomain ? c.gold : c.textSecondary,
                        transform: [{ translateX: groupByDomain ? 16 : 0 }]
                      }
                    ]} 
                  />
                </TouchableOpacity>
              </DefaultView>
            </View>

            {/* Apply & Close Button */}
            <TouchableOpacity
              style={[styles.feedbackSubmitBtn, { backgroundColor: c.gold, marginTop: 24 }]}
              activeOpacity={0.8}
              onPress={() => setIsFilterSheetVisible(false)}
            >
              <Text variant="bold" style={{ fontSize: 13, color: '#000' }}>
                Apply Preferences
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#30D158',
    opacity: 0.03,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'transparent',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabelWrapper: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: 'transparent',
    marginBottom: 18,
  },
  statsCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: 'flex-start',
  },
  statsIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  statsLabel: {
    fontSize: 8,
    color: '#8E8E93',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  statsDetails: {
    fontSize: 8,
    color: '#8E8E93',
    marginTop: 1,
    opacity: 0.7,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    height: 44,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnLabel: {
    fontSize: 9,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  courseAccordionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  accordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  accordionIndicator: {
    width: 4,
    height: 38,
    borderRadius: 2,
  },
  coursePctBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  accordionBody: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  sessionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    letterSpacing: 0.3,
  },
  statusCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateHeaderLabel: {
    fontSize: 15,
    fontFamily: 'Outfit-Bold',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  cardListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  colorLeftMarker: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  weekSectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  weekCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  weekMetricBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  weekSessionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
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
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 8,
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
    paddingBottom: 24,
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
  sessionModalTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 26,
    backgroundColor: 'transparent',
  },
  sessionModalSubtopic: {
    fontSize: 13,
    lineHeight: 18,
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
    padding: 18,
  },
  deliveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  deliveryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinClassBtn: {
    height: 44,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  smallOutlineBtn: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  smallSolidBtn: {
    height: 38,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 6,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
    backgroundColor: 'transparent',
  },
  feedbackSubmitBtn: {
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
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
  termFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  toggleSwitch: {
    width: 42,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  domainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 12,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  domainHeaderIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  domainTitleText: {
    fontSize: 11,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
  },
});
