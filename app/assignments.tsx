import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform,
  Modal
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { MOCK_COURSES } from '@/constants/MockData';

// Context anchor date
const ANCHOR_DATE = new Date('2026-05-22');

export default function AssignmentsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // States
  const [selectedTerm, setSelectedTerm] = useState<string>('Spring 2026');
  const [selectedCourse, setSelectedCourse] = useState<string>('All Courses');
  const [groupBySubject, setGroupBySubject] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'submitted'>('upcoming');
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState<boolean>(false);

  // Extract list of all terms from mock database
  const availableTerms = useMemo(() => {
    return Array.from(new Set(MOCK_COURSES.map(course => course.term)));
  }, []);

  // Filter courses by active term
  const activeTermCourses = useMemo(() => {
    return MOCK_COURSES.filter(course => course.term === selectedTerm);
  }, [selectedTerm]);

  // Map Course prefixes to Subject Domains (attendance & grades parity)
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

  // Compile full assignments database flattened with parent course context info
  const compiledAssignments = useMemo(() => {
    const list: any[] = [];
    MOCK_COURSES.forEach(course => {
      course.assignments.forEach((ass, index) => {
        list.push({
          ...ass,
          courseId: course.id,
          courseTitle: course.title,
          courseCode: course.code,
          courseColor: course.color,
          courseTerm: course.term,
          assignmentIndex: index,
        });
      });
    });
    return list;
  }, []);

  // Filter compiled assignments by active preferences (Term & Course selection)
  const filteredAssignments = useMemo(() => {
    return compiledAssignments.filter(ass => {
      const matchTerm = ass.courseTerm === selectedTerm;
      const matchCourse = selectedCourse === 'All Courses' || ass.courseTitle === selectedCourse;
      return matchTerm && matchCourse;
    });
  }, [compiledAssignments, selectedTerm, selectedCourse]);

  // Bifurcate filtered assignments dynamically relative to ANCHOR_DATE (May 22, 2026)
  const bifurcatedAssignments = useMemo(() => {
    const today: typeof compiledAssignments = [];
    const overdue: typeof compiledAssignments = [];
    const upcoming: typeof compiledAssignments = [];
    const submitted: typeof compiledAssignments = [];

    filteredAssignments.forEach(ass => {
      if (ass.status === 'submitted' || ass.dueDate === 'Completed') {
        submitted.push(ass);
      } else if (ass.dueDate === 'Today' || ass.dueDate === 'May 22, 2026') {
        today.push(ass);
      } else {
        try {
          const dueTime = new Date(ass.dueDate);
          if (isNaN(dueTime.getTime())) {
            upcoming.push(ass);
          } else if (dueTime < ANCHOR_DATE) {
            overdue.push(ass);
          } else {
            upcoming.push(ass);
          }
        } catch (e) {
          upcoming.push(ass);
        }
      }
    });

    return { today, overdue, upcoming, submitted };
  }, [filteredAssignments]);

  // Get active tab flat list
  const activeTabAssignments = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return [...bifurcatedAssignments.today, ...bifurcatedAssignments.upcoming];
      case 'overdue':
        return bifurcatedAssignments.overdue;
      case 'submitted':
        return bifurcatedAssignments.submitted;
      default:
        return [];
    }
  }, [bifurcatedAssignments, activeTab]);

  // Groups assignments by subject domain when Group by Subject is enabled
  const groupedBySubjectList = useMemo(() => {
    const groups: Record<string, typeof compiledAssignments> = {};
    activeTabAssignments.forEach(ass => {
      const domainName = getCourseDomain(ass.courseCode).name;
      if (!groups[domainName]) {
        groups[domainName] = [];
      }
      groups[domainName].push(ass);
    });
    return groups;
  }, [activeTabAssignments]);

  // Helper row renderer to display cards consistently
  const renderAssignmentItemCard = (ass: any, isOverdue = false, isToday = false) => {
    const isGraded = ass.status === 'submitted' && !!ass.score;
    const isSubmitted = ass.status === 'submitted';
    const domainInfo = getCourseDomain(ass.courseCode);

    return (
      <TouchableOpacity
        key={ass.id}
        activeOpacity={0.8}
        onPress={() => router.push(`/assignment/${ass.courseId}_${ass.assignmentIndex}`)}
        style={[
          styles.assignmentCard, 
          { 
            backgroundColor: c.card, 
            borderColor: isToday ? c.gold : isOverdue ? '#FF453A' : c.border 
          }
        ]}
      >
        {/* Left vertical color strip */}
        <DefaultView style={[styles.cardAccentStrip, { backgroundColor: isToday ? c.gold : isOverdue ? '#FF453A' : ass.courseColor }]} />

        <DefaultView style={styles.cardMainArea}>
          <DefaultView style={styles.cardHeaderRow}>
            {/* Course label */}
            <Text variant="bold" style={{ fontSize: 9, color: ass.courseColor, letterSpacing: 0.3 }} numberOfLines={1}>
              {ass.courseCode.toUpperCase()} • {ass.courseTitle.toUpperCase()}
            </Text>

            {/* Weightage Badge */}
            <DefaultView style={[styles.weightBadge, { backgroundColor: c.border + '30' }]}>
              <Text variant="bold" style={{ fontSize: 8, color: c.textSecondary }}>{ass.weight || 'N/A'}</Text>
            </DefaultView>
          </DefaultView>

          {/* Title */}
          <Text variant="bold" style={{ fontSize: 13, color: c.text, marginTop: 4 }} numberOfLines={1}>
            {ass.title}
          </Text>

          {/* Bottom Metabar */}
          <DefaultView style={styles.cardMetabar}>
            <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' }}>
              <Ionicons 
                name={isSubmitted ? "checkmark-circle" : "calendar-outline"} 
                size={12} 
                color={isToday ? c.gold : isOverdue ? '#FF453A' : isSubmitted ? c.green : c.textSecondary} 
              />
              <Text 
                variant="medium" 
                style={{ 
                  fontSize: 10, 
                  color: isToday ? c.gold : isOverdue ? '#FF453A' : isSubmitted ? c.green : c.textSecondary,
                  fontWeight: (isToday || isOverdue) ? 'bold' : 'normal'
                }}
              >
                {isSubmitted ? 'Completed' : isToday ? 'Due Today!' : isOverdue ? `Overdue (${ass.dueDate})` : `Due ${ass.dueDate}`}
              </Text>
            </DefaultView>

            {/* Grading State Badge */}
            {isGraded ? (
              <DefaultView style={[styles.statusBadge, { backgroundColor: c.green + '12', borderColor: c.green, borderWidth: 1 }]}>
                <Ionicons name="ribbon-outline" size={9} color={c.green} style={{ marginRight: 2 }} />
                <Text variant="bold" style={{ fontSize: 8, color: c.green }}>
                  GRADED • {ass.score} / {ass.totalScore || 100}
                </Text>
              </DefaultView>
            ) : isSubmitted ? (
              <DefaultView style={[styles.statusBadge, { backgroundColor: c.gold + '12', borderColor: c.gold, borderWidth: 1 }]}>
                <Ionicons name="time-outline" size={9} color={c.gold} style={{ marginRight: 2 }} />
                <Text variant="bold" style={{ fontSize: 8, color: c.gold }}>
                  EVALUATING
                </Text>
              </DefaultView>
            ) : (
              <DefaultView style={[styles.statusBadge, { backgroundColor: c.border + '30', borderColor: c.border, borderWidth: 1 }]}>
                <Text variant="bold" style={{ fontSize: 8, color: c.textSecondary }}>
                  PENDING
                </Text>
              </DefaultView>
            )}
          </DefaultView>
        </DefaultView>
      </TouchableOpacity>
    );
  };

  // Quick stats calculations
  const totalPending = bifurcatedAssignments.today.length + bifurcatedAssignments.overdue.length + bifurcatedAssignments.upcoming.length;
  const totalSubmitted = bifurcatedAssignments.submitted.length;
  const totalOverdue = bifurcatedAssignments.overdue.length;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top visual gradient anchor */}
      <DefaultView style={styles.bgAccent} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.circleButton, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>
        
        <DefaultView style={[styles.headerLabelWrapper, { flex: 1, marginLeft: 4 }]}>
          <Text variant="bold" style={[styles.headerTitle, { color: c.text }]}>
            Assignments
          </Text>
          <Text variant="bold" style={{ fontSize: 8, color: c.gold, marginTop: 2, letterSpacing: 0.5 }}>
            TASK LIST • SOLUTIONS MANAGER{groupBySubject ? ' • GROUPED BY SUBJECT' : ''}
          </Text>
        </DefaultView>

        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => setIsFilterSheetVisible(true)}
          style={[styles.circleButton, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Ionicons name="options-outline" size={20} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PREMIUM TABS BAR */}
        <DefaultView style={[styles.tabBarContainer, { backgroundColor: c.card, borderColor: c.border }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('upcoming')}
            style={[
              styles.tabButton,
              activeTab === 'upcoming' && { backgroundColor: c.gold + '15', borderColor: c.gold }
            ]}
          >
            <Text 
              variant="bold" 
              style={[
                styles.tabText, 
                { color: activeTab === 'upcoming' ? c.gold : c.textSecondary }
              ]}
            >
              Upcoming ({bifurcatedAssignments.today.length + bifurcatedAssignments.upcoming.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('overdue')}
            style={[
              styles.tabButton,
              activeTab === 'overdue' && { backgroundColor: '#FF453A15', borderColor: '#FF453A' }
            ]}
          >
            <Text 
              variant="bold" 
              style={[
                styles.tabText, 
                { color: activeTab === 'overdue' ? '#FF453A' : c.textSecondary }
              ]}
            >
              Overdue ({bifurcatedAssignments.overdue.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('submitted')}
            style={[
              styles.tabButton,
              activeTab === 'submitted' && { backgroundColor: c.green + '15', borderColor: c.green }
            ]}
          >
            <Text 
              variant="bold" 
              style={[
                styles.tabText, 
                { color: activeTab === 'submitted' ? c.green : c.textSecondary }
              ]}
            >
              Submitted ({bifurcatedAssignments.submitted.length})
            </Text>
          </TouchableOpacity>
        </DefaultView>

        {/* ACTIVE MAIN RENDERING ACCORDING TO Preferences */}
        {!groupBySubject ? (
          /* CHRONOLOGICAL Relative Urgency bifurcated lists */
          <DefaultView style={{ backgroundColor: 'transparent', gap: 18 }}>
            
            {/* TODAY SECTION (Only shown under Upcoming tab) */}
            {activeTab === 'upcoming' && bifurcatedAssignments.today.length > 0 && (
              <DefaultView style={{ backgroundColor: 'transparent' }}>
                <DefaultView style={[styles.sectionHeaderRow, { borderBottomColor: c.gold + '40' }]}>
                  <Ionicons name="alarm-outline" size={13} color={c.gold} />
                  <Text variant="bold" style={{ fontSize: 11, color: c.gold, letterSpacing: 0.5 }}>
                    DUE TODAY
                  </Text>
                  <DefaultView style={[styles.countBadge, { backgroundColor: c.gold + '15', borderColor: c.gold, borderWidth: 1 }]}>
                    <Text variant="bold" style={{ fontSize: 8, color: c.gold }}>{bifurcatedAssignments.today.length}</Text>
                  </DefaultView>
                </DefaultView>
                <DefaultView style={{ gap: 10, marginTop: 10, backgroundColor: 'transparent' }}>
                  {bifurcatedAssignments.today.map(ass => renderAssignmentItemCard(ass, false, true))}
                </DefaultView>
              </DefaultView>
            )}

            {/* UPCOMING SECTION */}
            {activeTab === 'upcoming' && (
              <DefaultView style={{ backgroundColor: 'transparent' }}>
                <DefaultView style={[styles.sectionHeaderRow, { borderBottomColor: c.border + '30' }]}>
                  <Ionicons name="time-outline" size={13} color={c.textSecondary} />
                  <Text variant="bold" style={{ fontSize: 11, color: c.text, letterSpacing: 0.5 }}>
                    UPCOMING DEADLINES
                  </Text>
                  <DefaultView style={[styles.countBadge, { backgroundColor: c.cardSecondary, borderColor: c.border, borderWidth: 1 }]}>
                    <Text variant="bold" style={{ fontSize: 8, color: c.textSecondary }}>{bifurcatedAssignments.upcoming.length}</Text>
                  </DefaultView>
                </DefaultView>
                {bifurcatedAssignments.upcoming.length === 0 ? (
                  <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 14, textAlign: 'center' }}>
                    No upcoming deadlines on schedule.
                  </Text>
                ) : (
                  <DefaultView style={{ gap: 10, marginTop: 10, backgroundColor: 'transparent' }}>
                    {bifurcatedAssignments.upcoming.map(ass => renderAssignmentItemCard(ass))}
                  </DefaultView>
                )}
              </DefaultView>
            )}

            {/* OVERDUE SECTION */}
            {activeTab === 'overdue' && (
              <DefaultView style={{ backgroundColor: 'transparent' }}>
                <DefaultView style={[styles.sectionHeaderRow, { borderBottomColor: '#FF453A35' }]}>
                  <Ionicons name="alert-circle-outline" size={13} color="#FF453A" />
                  <Text variant="bold" style={{ fontSize: 11, color: '#FF453A', letterSpacing: 0.5 }}>
                    OVERDUE TASK BARS
                  </Text>
                  <DefaultView style={[styles.countBadge, { backgroundColor: '#FF453A15', borderColor: '#FF453A', borderWidth: 1 }]}>
                    <Text variant="bold" style={{ fontSize: 8, color: '#FF453A' }}>{bifurcatedAssignments.overdue.length}</Text>
                  </DefaultView>
                </DefaultView>
                {bifurcatedAssignments.overdue.length === 0 ? (
                  <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 14, textAlign: 'center' }}>
                    No overdue assignments. Excellent work!
                  </Text>
                ) : (
                  <DefaultView style={{ gap: 10, marginTop: 10, backgroundColor: 'transparent' }}>
                    {bifurcatedAssignments.overdue.map(ass => renderAssignmentItemCard(ass, true, false))}
                  </DefaultView>
                )}
              </DefaultView>
            )}

            {/* SUBMITTED SECTION */}
            {activeTab === 'submitted' && (
              <DefaultView style={{ backgroundColor: 'transparent' }}>
                <DefaultView style={[styles.sectionHeaderRow, { borderBottomColor: c.green + '30' }]}>
                  <Ionicons name="checkmark-done-circle-outline" size={13} color={c.green} />
                  <Text variant="bold" style={{ fontSize: 11, color: c.green, letterSpacing: 0.5 }}>
                    SUBMITTED SOLUTIONS
                  </Text>
                  <DefaultView style={[styles.countBadge, { backgroundColor: c.green + '15', borderColor: c.green, borderWidth: 1 }]}>
                    <Text variant="bold" style={{ fontSize: 8, color: c.green }}>{bifurcatedAssignments.submitted.length}</Text>
                  </DefaultView>
                </DefaultView>
                {bifurcatedAssignments.submitted.length === 0 ? (
                  <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 14, textAlign: 'center' }}>
                    No submitted solutions yet.
                  </Text>
                ) : (
                  <DefaultView style={{ gap: 10, marginTop: 10, backgroundColor: 'transparent' }}>
                    {bifurcatedAssignments.submitted.map(ass => renderAssignmentItemCard(ass))}
                  </DefaultView>
                )}
              </DefaultView>
            )}

          </DefaultView>
        ) : (
          /* SUBJECT DOMAIN GROUPED VIEW */
          <DefaultView style={{ backgroundColor: 'transparent', gap: 18 }}>
            {Object.keys(groupedBySubjectList).length === 0 ? (
              <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 20, textAlign: 'center' }}>
                No {activeTab} assignment records matching subject filters.
              </Text>
            ) : (
              Object.keys(groupedBySubjectList).map(domainName => {
                const list = groupedBySubjectList[domainName];
                if (list.length === 0) return null;

                const sampleAss = list[0];
                const domainInfo = getCourseDomain(sampleAss.courseCode);

                return (
                  <DefaultView key={domainName} style={{ backgroundColor: 'transparent' }}>
                    {/* Subject category banner ribbon */}
                    <DefaultView style={styles.domainHeaderRow}>
                      <DefaultView style={[styles.domainHeaderIconBox, { backgroundColor: domainInfo.color + '15' }]}>
                        <Ionicons name={domainInfo.icon as any} size={14} color={domainInfo.color} />
                      </DefaultView>
                      <Text variant="bold" style={[styles.domainTitleText, { color: c.text }]}>
                        {domainName.toUpperCase()}
                      </Text>
                      <DefaultView style={{ flex: 1, height: 1, backgroundColor: c.border + '30', marginLeft: 8, marginRight: 8 }} />
                      <DefaultView style={[styles.countBadge, { backgroundColor: domainInfo.color + '12', borderColor: domainInfo.color, borderWidth: 1 }]}>
                        <Text variant="bold" style={{ fontSize: 8, color: domainInfo.color }}>
                          {list.length} {list.length === 1 ? 'Task' : 'Tasks'}
                        </Text>
                      </DefaultView>
                    </DefaultView>

                    {/* Nested items inside this domain */}
                    <DefaultView style={{ gap: 10, backgroundColor: 'transparent' }}>
                      {list.map(ass => {
                        const isOverdue = ass.status === 'pending' && new Date(ass.dueDate) < ANCHOR_DATE;
                        const isToday = ass.status === 'pending' && (ass.dueDate === 'Today' || ass.dueDate === 'May 22, 2026');
                        return renderAssignmentItemCard(ass, isOverdue, isToday);
                      })}
                    </DefaultView>
                  </DefaultView>
                );
              })
            )}
          </DefaultView>
        )}

      </ScrollView>

      {/* STUNNING SLIDE-UP PREFERENCES BOTTOM DRAWER DIALOG */}
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
            <DefaultView style={styles.modalHeader}>
              <Text variant="bold" style={[styles.modalTitle, { color: c.text, fontSize: 18 }]}>
                Filters & Preferences
              </Text>
              <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4 }}>
                Personalize your LMS assignment schedule lists and domain structures.
              </Text>
            </DefaultView>

            {/* Academic Term Selection Card */}
            <View style={[styles.prefSectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text variant="bold" style={[styles.prefLabel, { color: c.textSecondary }]}>
                ACADEMIC TERM
              </Text>
              <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, marginBottom: 12 }}>
                Filter coursework by enrollment term timeline.
              </Text>

              <DefaultView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' }}>
                {availableTerms.map(term => {
                  const isSelected = selectedTerm === term;
                  return (
                    <TouchableOpacity
                      key={term}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedTerm(term);
                        setSelectedCourse('All Courses'); // reset course when term shifts to avoid zero mismatches
                      }}
                      style={[
                        styles.prefPill,
                        { 
                          backgroundColor: isSelected ? c.gold + '15' : c.cardSecondary,
                          borderColor: isSelected ? c.gold : c.border,
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

            {/* Specific Course Selection Card */}
            <View style={[styles.prefSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 14 }]}>
              <Text variant="bold" style={[styles.prefLabel, { color: c.textSecondary }]}>
                ENROLLED COURSE
              </Text>
              <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, marginBottom: 12 }}>
                Isolate list tasks to a single core syllabus subject.
              </Text>

              <DefaultView style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' }}>
                {/* All Courses option */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedCourse('All Courses')}
                  style={[
                    styles.prefPill,
                    { 
                      backgroundColor: selectedCourse === 'All Courses' ? c.gold + '15' : c.cardSecondary,
                      borderColor: selectedCourse === 'All Courses' ? c.gold : c.border,
                    }
                  ]}
                >
                  <Text variant="bold" style={{ fontSize: 10, color: selectedCourse === 'All Courses' ? c.gold : c.text }}>
                    ALL COURSES
                  </Text>
                </TouchableOpacity>

                {activeTermCourses.map(course => {
                  const isSelected = selectedCourse === course.title;
                  return (
                    <TouchableOpacity
                      key={course.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedCourse(course.title)}
                      style={[
                        styles.prefPill,
                        { 
                          backgroundColor: isSelected ? c.gold + '15' : c.cardSecondary,
                          borderColor: isSelected ? c.gold : c.border,
                        }
                      ]}
                    >
                      <Text variant="bold" style={{ fontSize: 10, color: isSelected ? c.gold : c.text }}>
                        {course.code.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </DefaultView>
            </View>

            {/* Group by Subject Toggle Card */}
            <View style={[styles.prefSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 14 }]}>
              <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
                <DefaultView style={{ backgroundColor: 'transparent', flex: 1, marginRight: 16 }}>
                  <Text variant="bold" style={[styles.prefLabel, { color: c.textSecondary, marginBottom: 4 }]}>
                    GROUP BY SUBJECT DOMAIN
                  </Text>
                  <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, lineHeight: 16 }}>
                    Structure lists by academic field name (e.g. UX Design, Computer Science) instead of chore deadline lists.
                  </Text>
                </DefaultView>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setGroupBySubject(prev => !prev)}
                  style={[
                    styles.toggleSwitch,
                    { 
                      backgroundColor: groupBySubject ? c.gold + '25' : c.border + '30',
                      borderColor: groupBySubject ? c.gold : c.border
                    }
                  ]}
                >
                  <DefaultView 
                    style={[
                      styles.toggleCircle, 
                      { 
                        backgroundColor: groupBySubject ? c.gold : c.textSecondary,
                        transform: [{ translateX: groupBySubject ? 16 : 0 }]
                      }
                    ]} 
                  />
                </TouchableOpacity>
              </DefaultView>
            </View>

            {/* Apply & Close Button */}
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: c.gold, marginTop: 20 }]}
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
    backgroundColor: '#FF9F0A',
    opacity: 0.02,
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
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerLabelWrapper: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  countBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  assignmentCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 80,
  },
  cardAccentStrip: {
    width: 4,
  },
  cardMainArea: {
    flex: 1,
    padding: 12,
    backgroundColor: 'transparent',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  weightBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardMetabar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // DOMAIN HEADER BANNER RIBBONS
  domainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
    marginTop: 6,
    marginBottom: 12,
  },
  domainHeaderIconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  domainTitleText: {
    fontSize: 11,
    letterSpacing: 0.8,
  },

  // BOTTOM FILTER SHEETS SLIDING MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 24,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
    opacity: 0.6,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalHeader: {
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    lineHeight: 22,
  },
  prefSectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  prefLabel: {
    fontSize: 9,
    letterSpacing: 0.6,
  },
  prefPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  applyBtn: {
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
