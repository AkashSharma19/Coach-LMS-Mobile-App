import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform,
  Modal,
  Linking
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { MOCK_COURSES, Session, Assignment } from '../../constants/MockData';
import { useAssignmentSubmissions } from '../../store/assignmentStore';

export default function CourseDetailsScreen() {
  const { id, sessionIndex } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  const course = MOCK_COURSES.find(c => c.id === id);

  const [activeTab, setActiveTab] = useState<'details' | 'sessions' | 'assignments' | 'grades'>('details');
  const [selectedSession, setSelectedSession] = useState<(Session & { index: number }) | null>(null);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);

  // Dynamic Session Interactive States
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<Record<string, 'pending' | 'submitted'>>({});
  const [userRating, setUserRating] = useState<number>(0);
  const [checkedInSessions, setCheckedInSessions] = useState<Record<string, boolean>>({});

  // Dynamic Assignment Submissions Shared State Hook
  const assignmentSubmissions = useAssignmentSubmissions();

  React.useEffect(() => {
    if (sessionIndex !== undefined && course) {
      const idx = parseInt(sessionIndex as string, 10);
      if (!isNaN(idx) && course.sessions[idx]) {
        setActiveTab('sessions');
        setSelectedSession({ ...course.sessions[idx], index: idx });
        setIsSessionModalVisible(true);
      }
    }
  }, [sessionIndex, id]);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={64} color={c.textSecondary} />
        <Text variant="bold" style={{ color: c.text, fontSize: 18, marginTop: 16 }}>
          Course Not Found
        </Text>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.back()}
        >
          <Text variant="bold" style={{ color: c.text }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Ionicons name="link-outline" size={12} color={course.color} />
          <Text
            variant="medium"
            style={[
              styles.materialItemText,
              { color: course.color, textDecorationLine: 'underline' }
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

  // Define tab keys and names
  const TABS = [
    { key: 'details', label: 'Details', icon: 'information-circle-outline' },
    { key: 'sessions', label: 'Sessions', icon: 'calendar-outline' },
    { key: 'assignments', label: 'Assignments', icon: 'document-text-outline' },
    { key: 'grades', label: 'Grades', icon: 'trophy-outline' }
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Background Accent */}
      <DefaultView style={[styles.bgAccent, { backgroundColor: course.color }]} />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={[styles.circleBackBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>
        
        <DefaultView style={styles.headerBadges}>
          <DefaultView style={[styles.badge, { backgroundColor: c.border }]}>
            <Text variant="bold" style={[styles.badgeText, { color: c.text }]}>
              {course.code}
            </Text>
          </DefaultView>
          <DefaultView style={[styles.badge, { backgroundColor: course.color + '15' }]}>
            <Text variant="bold" style={[styles.badgeText, { color: course.color }]}>
              {course.category}
            </Text>
          </DefaultView>
        </DefaultView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Hero Area */}
        <View style={styles.heroSection}>
          <Text variant="bold" style={[styles.courseTitle, { color: c.text }]}>
            {course.title}
          </Text>
          
          <DefaultView style={styles.professorRow}>
            <DefaultView style={[styles.profAvatar, { borderColor: c.border, backgroundColor: c.cardSecondary }]}>
              <Text variant="bold" style={{ fontSize: 13, color: course.color }}>
                {course.instructor.initials}
              </Text>
            </DefaultView>
            <DefaultView style={{ backgroundColor: 'transparent' }}>
              <Text variant="bold" style={[styles.profName, { color: c.text }]}>
                {course.instructor.name}
              </Text>
              <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary }}>
                Lead Course Instructor
              </Text>
            </DefaultView>
          </DefaultView>
        </View>

        {/* Segmented Controller Tab Bar */}
        <DefaultView style={[styles.tabBarContainer, { backgroundColor: c.card, borderColor: c.border }]}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={[
                  styles.tabButton,
                  isActive && { backgroundColor: c.cardSecondary, borderColor: c.border }
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={16} 
                  color={isActive ? course.color : c.textSecondary} 
                  style={{ marginBottom: 2 }}
                />
                <Text 
                  variant="bold" 
                  style={[
                    styles.tabLabel, 
                    { color: isActive ? c.text : c.textSecondary }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </DefaultView>

        {/* Dynamic Content Panel */}
        <View style={styles.panelContainer}>
          {activeTab === 'details' && (
            <DefaultView style={styles.panel}>
              {/* General details list */}
              <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                  COURSE INFO
                </Text>
                
                <DefaultView style={styles.infoGrid}>
                  <DefaultView style={styles.infoCol}>
                    <Text variant="semiBold" style={[styles.infoLabel, { color: c.textSecondary }]}>Academic Term</Text>
                    <Text variant="bold" style={[styles.infoValue, { color: c.text }]}>{course.term}</Text>
                  </DefaultView>
                  <DefaultView style={styles.infoCol}>
                    <Text variant="semiBold" style={[styles.infoLabel, { color: c.textSecondary }]}>Class Type</Text>
                    <Text variant="bold" style={[styles.infoValue, { color: c.text }]}>
                      {course.classType === 'InClass' ? 'In-Class' : 'Out-Class'}
                    </Text>
                  </DefaultView>
                </DefaultView>

                <DefaultView style={[styles.infoGrid, { marginTop: 14 }]}>
                  <DefaultView style={styles.infoCol}>
                    <Text variant="semiBold" style={[styles.infoLabel, { color: c.textSecondary }]}>Location</Text>
                    <Text variant="bold" style={[styles.infoValue, { color: c.text }]} numberOfLines={1}>
                      {course.location}
                    </Text>
                  </DefaultView>
                </DefaultView>
              </View>

              {/* Objective */}
              <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                  COURSE OBJECTIVE
                </Text>
                <Text variant="regular" style={[styles.bodyText, { color: c.text }]}>
                  {course.objective}
                </Text>
              </View>

              {/* Progress gauge card */}
              <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                  SYLLABUS PATH COMPLETION
                </Text>
                <DefaultView style={styles.progressRow}>
                  <Text variant="bold" style={[styles.progressValText, { color: course.color }]}>
                    {Math.round(course.progress * 100)}% Completed
                  </Text>
                  <DefaultView style={[styles.progressBarTrack, { backgroundColor: c.border }]}>
                    <DefaultView 
                      style={[
                        styles.progressBarActive, 
                        { 
                          backgroundColor: course.color, 
                          width: `${course.progress * 100}%` 
                        }
                      ]} 
                    />
                  </DefaultView>
                </DefaultView>
              </View>

              {/* Evaluation Weights list */}
              <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                  EVALUATION WEIGHTS
                </Text>
                {course.evaluationCriteria.map((crit, idx) => (
                  <DefaultView key={idx} style={styles.criteriaRow}>
                    <Text variant="medium" style={[styles.critName, { color: c.text }]}>
                      {crit.name}
                    </Text>
                    <DefaultView style={[styles.critWeightBadge, { backgroundColor: course.color + '15' }]}>
                      <Text variant="bold" style={[styles.critWeightVal, { color: course.color }]}>
                        {crit.weight}
                      </Text>
                    </DefaultView>
                  </DefaultView>
                ))}
              </View>
            </DefaultView>
          )}

          {activeTab === 'sessions' && (
            <DefaultView style={styles.panel}>

              {/* Academic Sessions Header */}
              <Text variant="bold" style={[styles.panelSectionHeader, { color: c.textSecondary }]}>
                ACADEMIC SESSIONS
              </Text>

              {/* Sessions List */}
              <DefaultView style={{ gap: 10 }}>
                {course.sessions.map((session, idx) => {
                  let badgeBg = c.green;
                  if (session.status === 'A') badgeBg = '#FF4A4A';
                  if (session.status === 'U') badgeBg = '#8E8E93';

                  return (
                    <TouchableOpacity 
                      key={idx} 
                      activeOpacity={0.7}
                      style={[styles.sessionCardItem, { backgroundColor: c.card, borderColor: c.border }]}
                      onPress={() => {
                        setSelectedSession({ ...session, index: idx + 1 });
                        setUserRating(0); // Reset interactive rating state for selected session
                        setIsSessionModalVisible(true);
                      }}
                    >
                      <DefaultView style={styles.sessionLeft}>
                        <DefaultView style={[styles.sessionIdxCircle, { backgroundColor: course.color + '12' }]}>
                          <Text variant="bold" style={[styles.sessionIdxText, { color: course.color }]}>
                            S{idx + 1}
                          </Text>
                        </DefaultView>
                        
                        <DefaultView style={{ backgroundColor: 'transparent', flex: 1, marginRight: 8 }}>
                          <Text variant="medium" style={[styles.sessionTopic, { color: c.text }]} numberOfLines={1}>
                            {session.topic}
                          </Text>
                          <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, backgroundColor: 'transparent', flexWrap: 'wrap' }}>
                            <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary }}>
                              {session.date}  •  {session.time}
                            </Text>
                            <DefaultView style={[
                              styles.typeBadge, 
                              { 
                                borderColor: session.type === 'Online' ? '#4A90E2' : session.type === 'Offline' ? '#EBC063' : '#4CAF50',
                              }
                            ]}>
                              <Ionicons 
                                name={session.type === 'Online' ? 'videocam-outline' : session.type === 'Offline' ? 'location-outline' : 'git-branch-outline'} 
                                size={9} 
                                color={session.type === 'Online' ? '#4A90E2' : session.type === 'Offline' ? '#EBC063' : '#4CAF50'} 
                              />
                              <Text variant="bold" style={[
                                styles.typeBadgeText, 
                                { color: session.type === 'Online' ? '#4A90E2' : session.type === 'Offline' ? '#EBC063' : '#4CAF50' }
                              ]}>
                                {session.type}
                              </Text>
                            </DefaultView>
                          </DefaultView>
                        </DefaultView>
                      </DefaultView>
                      
                      <DefaultView style={styles.sessionRight}>
                        <DefaultView style={[styles.sessionStatusCircle, { backgroundColor: badgeBg }]}>
                          <Text variant="bold" style={styles.statusTextLetter}>
                            {session.status}
                          </Text>
                        </DefaultView>
                        <Ionicons name="chevron-forward" size={14} color={c.textSecondary} style={{ opacity: 0.6 }} />
                      </DefaultView>
                    </TouchableOpacity>
                  );
                })}
              </DefaultView>
            </DefaultView>
          )}

          {activeTab === 'assignments' && (
            <DefaultView style={styles.panel}>
              {/* Assignments Section Header */}
              <Text variant="bold" style={[styles.panelSectionHeader, { color: c.textSecondary }]}>
                ASSIGNMENT CHECKS
              </Text>

              {/* Assignments List */}
              <DefaultView style={{ gap: 10 }}>
                {course.assignments.map((assignment, idx) => {
                  const localSub = assignmentSubmissions[assignment.title];
                  const isSubmitted = !!localSub || assignment.status === 'submitted';
                  const isGraded = assignment.status === 'submitted' && !!assignment.score;
                  
                  const statusLabel = isGraded 
                    ? 'Graded & Saved' 
                    : isSubmitted 
                      ? 'Awaiting Evaluation' 
                      : `Due: ${assignment.dueDate}`;
                      
                  const statusIcon = isGraded 
                    ? "checkmark-circle" 
                    : isSubmitted 
                      ? "time" 
                      : "document-text-outline";

                  const statusColor = isGraded 
                    ? c.green 
                    : isSubmitted 
                      ? '#EBC063' 
                      : course.color;

                  return (
                    <TouchableOpacity 
                      key={idx} 
                      activeOpacity={0.7}
                      style={[styles.assignmentCardItem, { backgroundColor: c.card, borderColor: c.border }]}
                      onPress={() => {
                        router.push({
                          pathname: '/assignment/[assignmentId]',
                          params: { assignmentId: `${course.id}_${idx}` }
                        });
                      }}
                    >
                      <DefaultView style={styles.assignLeft}>
                        <DefaultView style={[styles.assignIconCircle, { backgroundColor: statusColor + '12' }]}>
                          <Ionicons 
                            name={statusIcon as any} 
                            size={16} 
                            color={statusColor} 
                          />
                        </DefaultView>
                        <DefaultView style={{ backgroundColor: 'transparent', flex: 1, marginRight: 8 }}>
                          <Text variant="bold" style={[styles.assignTitle, { color: c.text }]} numberOfLines={1}>
                            {assignment.title}
                          </Text>
                          <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4 }}>
                            {statusLabel}  •  Weight: {assignment.weight || 'N/A'}
                          </Text>
                        </DefaultView>
                      </DefaultView>

                      <DefaultView style={styles.assignRight}>
                        {isGraded ? (
                          <DefaultView style={[styles.scoreBadge, { backgroundColor: c.green + '15' }]}>
                            <Text variant="bold" style={{ fontSize: 11, color: c.green }}>
                              {assignment.score}/{assignment.totalScore || '100'}
                            </Text>
                          </DefaultView>
                        ) : isSubmitted ? (
                          <DefaultView style={[styles.scoreBadge, { backgroundColor: '#EBC06315' }]}>
                            <Text variant="bold" style={{ fontSize: 11, color: '#EBC063' }}>
                              Pending
                            </Text>
                          </DefaultView>
                        ) : (
                          <DefaultView style={[styles.scoreBadge, { backgroundColor: c.border }]}>
                            <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary }}>
                              Open
                            </Text>
                          </DefaultView>
                        )}
                        <Ionicons name="chevron-forward" size={14} color={course.color} />
                      </DefaultView>
                    </TouchableOpacity>
                  );
                })}
              </DefaultView>
            </DefaultView>
          )}

          {activeTab === 'grades' && (
            <DefaultView style={styles.panel}>
              {/* Main Overall Grade Card */}
              <LinearGradient
                colors={[c.card, '#1E1D19']}
                style={[styles.gradeBannerCard, { borderColor: c.border }]}
              >
                <DefaultView style={styles.gradeBannerLeft}>
                  <Text variant="semiBold" style={{ fontSize: 12, color: course.color, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Overall Grade
                  </Text>
                  <Text variant="bold" style={[styles.hugeGradeText, { color: c.text }]}>
                    {course.grade}
                  </Text>
                </DefaultView>

                {/* Score Circular Glow representation - Course GPA Gauge */}
                {(() => {
                  const gpa = (() => {
                    switch (course.grade) {
                      case 'A+': return '4.0';
                      case 'A': return '4.0';
                      case 'A-': return '3.7';
                      case 'B+': return '3.3';
                      case 'B': return '3.0';
                      case 'B-': return '2.7';
                      case 'C+': return '2.3';
                      case 'C': return '2.0';
                      default: return '3.0';
                    }
                  })();
                  const isPerfect = gpa === '4.0';
                  return (
                    <DefaultView style={[
                      styles.circularGauge, 
                      { 
                        borderColor: course.color,
                        borderBottomColor: isPerfect ? course.color : 'rgba(255, 255, 255, 0.08)'
                      }
                    ]}>
                      <Text variant="bold" style={{ fontSize: 17, color: course.color }}>
                        {gpa}
                      </Text>
                      <Text variant="bold" style={{ fontSize: 8, color: c.textSecondary, marginTop: 1, letterSpacing: 0.2 }}>
                        OUT OF 4.0
                      </Text>
                    </DefaultView>
                  );
                })()}
              </LinearGradient>

              {/* Detailed Grade breakdown */}
              <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                  GRADED PERFORMANCE
                </Text>
                
                {/* Simulated list of items */}
                {(() => {
                  const items = course.assignments.filter(a => a.status === 'submitted' || !!assignmentSubmissions[a.title]);
                  if (items.length === 0) {
                    return (
                      <DefaultView style={{ paddingVertical: 12, alignItems: 'center', backgroundColor: 'transparent' }}>
                        <Text variant="medium" style={{ fontSize: 13, color: c.textSecondary }}>
                          No graded components submitted yet
                        </Text>
                      </DefaultView>
                    );
                  }
                  return items.map((assign, idx, arr) => {
                    const localSub = assignmentSubmissions[assign.title];
                    const isSubmitted = !!localSub || assign.status === 'submitted';
                    const isGraded = assign.status === 'submitted' && !!assign.score;
                    const isLast = idx === arr.length - 1;

                    return (
                      <DefaultView key={idx} style={[styles.gradedItemRow, isLast && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                        <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                          <Text variant="bold" style={{ fontSize: 13, color: c.text }} numberOfLines={1}>
                            {assign.title}
                          </Text>
                          <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
                            Weight: {assign.weight || 'N/A'} • Max Score: {assign.totalScore || '100'}
                          </Text>
                        </DefaultView>

                        <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'transparent' }}>
                          {isGraded ? (
                            <DefaultView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
                              <Text variant="bold" style={{ fontSize: 14, color: course.color }}>
                                {assign.score} / {assign.totalScore || '100'}
                              </Text>
                              {assign.grade && (
                                <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary, marginTop: 1 }}>
                                  Grade: {assign.grade}
                                </Text>
                              )}
                            </DefaultView>
                          ) : (
                            <DefaultView style={[styles.scoreBadge, { backgroundColor: '#EBC06312', borderColor: '#EBC06325', borderWidth: 1 }]}>
                              <Text variant="bold" style={{ fontSize: 10, color: '#EBC063' }}>
                                Awaiting Grading
                              </Text>
                            </DefaultView>
                          )}
                        </DefaultView>
                      </DefaultView>
                    );
                  });
                })()}
              </View>
            </DefaultView>
          )}
        </View>

        {/* Space spacing */}
        <DefaultView style={{ height: 100 }} />
      </ScrollView>

      {/* Premium Session Details Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSessionModalVisible && selectedSession !== null}
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
          {/* Drag Handle */}
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />

          {/* Close Icon in Top Right */}
          <TouchableOpacity 
            style={styles.closeIconBtn} 
            activeOpacity={0.7}
            onPress={() => setIsSessionModalVisible(false)}
          >
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </TouchableOpacity>

          {selectedSession && (
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.sessionModalScroll}
            >
              {/* Header Bar: S{index} and attendance indicator */}
              <DefaultView style={styles.sessionModalHeader}>
                <DefaultView style={styles.sessionModalBadgeRow}>
                  <DefaultView style={[styles.badge, { backgroundColor: course.color + '15' }]}>
                    <Text variant="bold" style={[styles.badgeText, { color: course.color }]}>
                      Session {selectedSession.index}
                    </Text>
                  </DefaultView>
                  <DefaultView style={[
                    styles.sessionStatusCircle, 
                    { 
                      backgroundColor: selectedSession.status === 'P' ? c.green : selectedSession.status === 'A' ? '#FF4A4A' : '#8E8E93',
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                    }
                  ]}>
                    <Text variant="bold" style={{ fontSize: 10, color: '#000' }}>
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
                  <Ionicons name="time-outline" size={14} color={course.color} />
                  <Text variant="semiBold" style={{ fontSize: 12, color: c.textSecondary }}>
                    {selectedSession.date}  •  {selectedSession.time}
                  </Text>
                </DefaultView>
              </DefaultView>

              {/* Faculty & PA Information Row */}
              <DefaultView style={styles.peopleGrid}>
                <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <DefaultView style={[styles.peopleAvatar, { backgroundColor: course.color + '15' }]}>
                    <Ionicons name="school-outline" size={15} color={course.color} />
                  </DefaultView>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                      {selectedSession.faculty || course.instructor.name}
                    </Text>
                    <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 1 }}>
                      Faculty Instructor
                    </Text>
                  </DefaultView>
                </View>

                <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <DefaultView style={[styles.peopleAvatar, { backgroundColor: course.color + '15' }]}>
                    <Ionicons name="people-outline" size={15} color={course.color} />
                  </DefaultView>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                      {selectedSession.programAssociate || 'Not Assigned'}
                    </Text>
                    <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 1 }}>
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
                        Location: {course.location}
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
                              backgroundColor: checkedInSessions[selectedSession.topic] ? c.green + '20' : course.color,
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
                        {course.location.split(',')[0]}
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
              <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 8 }]}>
                  LEARNING MATERIALS
                </Text>

                {/* Pre-Reads */}
                {selectedSession.preReads && selectedSession.preReads.length > 0 && (
                  <DefaultView style={styles.materialSubGroup}>
                    <DefaultView style={styles.materialSubHeader}>
                      <Ionicons name="book-outline" size={13} color={course.color} />
                      <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Pre-Reads Material</Text>
                    </DefaultView>
                    {selectedSession.preReads.map((mat, idx) => renderMaterialItem(mat, idx, 'document-text-outline'))}
                  </DefaultView>
                )}

                {/* In-Class */}
                {selectedSession.inClassMaterial && selectedSession.inClassMaterial.length > 0 && (
                  <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                    <DefaultView style={styles.materialSubHeader}>
                      <Ionicons name="easel-outline" size={13} color={course.color} />
                      <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>In-Class Material</Text>
                    </DefaultView>
                    {selectedSession.inClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'document-attach-outline'))}
                  </DefaultView>
                )}

                {/* Post-Class */}
                {selectedSession.postClassMaterial && selectedSession.postClassMaterial.length > 0 && (
                  <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                    <DefaultView style={styles.materialSubHeader}>
                      <Ionicons name="checkbox-outline" size={13} color={course.color} />
                      <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Post-Class Material</Text>
                    </DefaultView>
                    {selectedSession.postClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'clipboard-outline'))}
                  </DefaultView>
                )}
              </View>

              {/* Interactive Rating & Feedback Widget for past sessions */}
              {selectedSession.status !== 'U' && (
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
                                color={userRating >= star ? course.color : c.textSecondary}
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
                              backgroundColor: userRating > 0 ? course.color : c.border,
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

              {/* Spacer at the bottom of the ScrollView inside Bottom Sheet */}
              <DefaultView style={{ height: 20 }} />
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
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.05,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  circleBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  courseTitle: {
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  professorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'transparent',
  },
  profAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profName: {
    fontSize: 14,
  },
  tabBarContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  panelContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  panel: {
    backgroundColor: 'transparent',
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
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    gap: 16,
  },
  infoCol: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  infoLabel: {
    fontSize: 10,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 4,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
  },
  progressRow: {
    backgroundColor: 'transparent',
  },
  progressValText: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    borderRadius: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  critName: {
    fontSize: 13,
  },
  critWeightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  critWeightVal: {
    fontSize: 11,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLetter: {
    fontSize: 9,
    fontFamily: 'Outfit_700Bold',
    color: '#000',
  },
  legendLabel: {
    fontSize: 10,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.85,
    backgroundColor: 'transparent',
  },
  sessionIdx: {
    fontSize: 13,
    marginRight: 12,
    width: 24,
  },
  sessionTopic: {
    fontSize: 13,
  },
  sessionStatusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextLetter: {
    fontSize: 11,
    color: '#000',
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  assignmentCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  assignIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assignLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 0.75,
  },
  assignRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  assignTitle: {
    fontSize: 13,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeBannerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradeBannerLeft: {
    backgroundColor: 'transparent',
    flex: 0.7,
  },
  hugeGradeText: {
    fontSize: 36,
    letterSpacing: -1,
    marginTop: 2,
  },
  circularGauge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  gradedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 12,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  backBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
  },
  panelSectionHeader: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 10,
    paddingLeft: 4,
    backgroundColor: 'transparent',
  },
  sessionCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sessionIdxCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionIdxText: {
    fontSize: 12,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 8,
    fontFamily: 'Outfit_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});
