import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { MOCK_COURSES } from '../constants/MockData';

// GPA letter points mapping
const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0
};

export default function GradesScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // Selected term filter ('All Terms' or specific terms)
  const [selectedTerm, setSelectedTerm] = useState<string>('Spring 2026');

  // Expanded accordion courses
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({ '1': true });

  // Domain grouping and modal filter sheet states
  const [groupByDomain, setGroupByDomain] = useState<boolean>(false);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState<boolean>(false);

  // Download simulation states
  const [downloadingTranscript, setDownloadingTranscript] = useState(false);
  const [downloadingTermReport, setDownloadingTermReport] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Extract unique terms from mock database
  const availableTerms = useMemo(() => {
    return Array.from(new Set(MOCK_COURSES.map(course => course.term)));
  }, []);

  // Map Course prefixes to Subject Domains (matches attendance logic for branding consistency)
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

  const getCourseDomainName = (code: string) => {
    return getCourseDomain(code).name;
  };

  // Filter courses by selected term
  const termCourses = useMemo(() => {
    return MOCK_COURSES.filter(course => course.term === selectedTerm);
  }, [selectedTerm]);

  // Grouped courses by domain
  const domainGroups = useMemo(() => {
    const groups: Record<string, typeof MOCK_COURSES> = {};
    termCourses.forEach(course => {
      const dName = getCourseDomainName(course.code);
      if (!groups[dName]) {
        groups[dName] = [];
      }
      groups[dName].push(course);
    });
    return groups;
  }, [termCourses]);

  const getDomainGPA = (courses: typeof MOCK_COURSES) => {
    let totalPoints = 0;
    courses.forEach(c => {
      totalPoints += GRADE_POINTS[c.grade] ?? 4.0;
    });
    return (totalPoints / courses.length).toFixed(2);
  };

  // Compute TGPA (Term GPA)
  const tgpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    termCourses.forEach(course => {
      const pts = GRADE_POINTS[course.grade] ?? 4.0;
      totalPoints += pts * 4;
      totalCredits += 4;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '4.00';
  }, [termCourses]);

  // Compute CGPA (Cumulative GPA across all terms in mock database)
  const cgpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    MOCK_COURSES.forEach(course => {
      const pts = GRADE_POINTS[course.grade] ?? 4.0;
      totalPoints += pts * 4;
      totalCredits += 4;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '3.88';
  }, []);

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Simulated download triggers
  const handleDownloadTranscript = () => {
    setDownloadingTranscript(true);
    setDownloadSuccessMessage(null);
    setTimeout(() => {
      setDownloadingTranscript(false);
      setDownloadSuccessMessage("Official Academic Transcript PDF downloaded to local files!");
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    }, 1500);
  };

  const handleDownloadTermReport = () => {
    setDownloadingTermReport(true);
    setDownloadSuccessMessage(null);
    setTimeout(() => {
      setDownloadingTermReport(false);
      setDownloadSuccessMessage(`${selectedTerm} Term Report compiled and saved to local files!`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    }, 1500);
  };

  // Helper renderer to render clean accordion course cards
  const renderCourseAccordionCard = (course: typeof MOCK_COURSES[0]) => {
    const isExpanded = expandedCourses[course.id];
    
    // Calculate dynamic total score achieved so far from submitted assignments
    const submittedAssignments = course.assignments.filter(a => a.status === 'submitted');
    const totalWeightSubmitted = submittedAssignments.reduce((acc, curr) => {
      const w = parseFloat(curr.weight?.replace('%', '') || '0');
      return acc + w;
    }, 0);
    const scoreAchieved = submittedAssignments.reduce((acc, curr) => {
      const score = parseFloat(curr.score || '0');
      const totalScore = parseFloat(curr.totalScore || '100');
      const weight = parseFloat(curr.weight?.replace('%', '') || '0');
      return acc + (score / totalScore) * weight;
    }, 0);

    const calculatedAverage = totalWeightSubmitted > 0 
      ? ((scoreAchieved / totalWeightSubmitted) * 100).toFixed(1)
      : 'N/A';

    return (
      <View 
        key={course.id} 
        style={[styles.courseAccordionCard, { backgroundColor: c.card, borderColor: c.border }]}
      >
        {/* Header Row Click trigger */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleCourseExpand(course.id)}
          style={styles.accordionHeaderRow}
        >
          <DefaultView style={[styles.accordionIndicator, { backgroundColor: course.color }]} />
          <DefaultView style={{ flex: 1, backgroundColor: 'transparent', marginLeft: 10 }}>
            <Text variant="bold" style={{ fontSize: 14, color: c.text }} numberOfLines={1}>
              {course.title}
            </Text>
            <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
              Prof. {course.instructor.name}
            </Text>
          </DefaultView>

          {/* Grade score display */}
          <DefaultView style={[styles.coursePctBox, { borderColor: course.color }]}>
            <Text variant="bold" style={{ fontSize: 13, color: course.color }}>
              {course.grade}
            </Text>
          </DefaultView>

          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={c.textSecondary} 
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

        {/* Collapsible Assignment details */}
        {isExpanded && (
          <DefaultView style={[styles.accordionBody, { borderTopColor: c.border + '30' }]}>
            <DefaultView style={styles.courseSummaryRow}>
              <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary }}>
                RUNNING AVERAGE: <Text style={{ color: c.text, fontWeight: 'bold' }}>{calculatedAverage}%</Text>
              </Text>
              <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary }}>
                OFFICIAL: <Text style={{ color: course.color, fontWeight: 'bold' }}>GPA {(GRADE_POINTS[course.grade] ?? 4.0).toFixed(1)}</Text>
              </Text>
            </DefaultView>

            {/* Header row */}
            <DefaultView style={styles.assignmentHeaderRow}>
              <Text variant="bold" style={[styles.colHeader, { flex: 2.2 }]}>ASSIGNMENT BRIEF</Text>
              <Text variant="bold" style={[styles.colHeader, { flex: 0.8, textAlign: 'center' }]}>WEIGHT</Text>
              <Text variant="bold" style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>SCORE</Text>
            </DefaultView>

            {course.assignments.length === 0 ? (
              <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 10 }}>
                No assignment records available.
              </Text>
            ) : (
              course.assignments.map((ass, assIdx) => {
                const w = ass.weight || 'N/A';
                const score = ass.score ? `${ass.score} / ${ass.totalScore || 100}` : 'Pending';
                const isSubmitted = ass.status === 'submitted';
                
                return (
                  <TouchableOpacity 
                    key={ass.id} 
                    activeOpacity={0.7}
                    onPress={() => router.push(`/assignment/${course.id}_${assIdx}`)}
                    style={[styles.assignmentRow, { borderBottomColor: c.border + '15' }]}
                  >
                    <DefaultView style={{ flex: 2.2, backgroundColor: 'transparent', justifyContent: 'center' }}>
                      <Text variant="bold" style={{ fontSize: 11, color: c.text }} numberOfLines={1}>
                        {ass.title}
                      </Text>
                    </DefaultView>

                    <DefaultView style={{ flex: 0.8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                      <DefaultView style={[styles.badge, { backgroundColor: c.border + '30' }]}>
                        <Text variant="bold" style={{ fontSize: 8, color: c.textSecondary }}>{w}</Text>
                      </DefaultView>
                    </DefaultView>

                    <DefaultView style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'transparent', gap: 4 }}>
                      <Text variant="bold" style={{ fontSize: 11, color: isSubmitted ? c.text : c.textSecondary }}>
                        {score}
                      </Text>
                      <Ionicons name="chevron-forward" size={12} color={c.textSecondary} />
                    </DefaultView>
                  </TouchableOpacity>
                );
              })
            )}
          </DefaultView>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Background visual gradients */}
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
            Academic Grades
          </Text>
          <Text variant="bold" style={{ fontSize: 8, color: c.gold, marginTop: 2, letterSpacing: 0.5 }}>
            GPA TRACKER • PERFORMANCE AUDIT{groupByDomain ? ' • GROUPED BY DOMAIN' : ''}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Dynamic Download Success Alert banner */}
        {downloadSuccessMessage && (
          <DefaultView style={[styles.alertBanner, { backgroundColor: c.green + '18', borderColor: c.green }]}>
            <Ionicons name="checkmark-circle" size={16} color={c.green} />
            <Text variant="bold" style={{ fontSize: 10, color: c.text, flex: 1 }}>
              {downloadSuccessMessage}
            </Text>
          </DefaultView>
        )}

        {/* CGPA / OVERALL PERFORMANCE CONTAINER */}
        <View style={[styles.profileCard, { backgroundColor: c.card, borderColor: c.border, padding: 18, borderLeftWidth: 4, borderLeftColor: c.gold }]}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
            
            {/* Left Box: CGPA */}
            <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
              <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary, letterSpacing: 0.6 }}>
                CUMULATIVE CGPA
              </Text>
              <Text variant="bold" style={{ fontSize: 32, color: c.text, marginTop: 4 }}>
                {cgpa} <Text style={{ fontSize: 14, color: c.textSecondary, fontWeight: 'normal' }}>/ 4.00</Text>
              </Text>
            </DefaultView>

            {/* Middle Divider Line */}
            <DefaultView style={{ width: 1, height: 42, backgroundColor: c.border + '40', marginHorizontal: 16 }} />

            {/* Right Box: Total Credits */}
            <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
              <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary, letterSpacing: 0.6 }}>
                TOTAL CREDITS
              </Text>
              <Text variant="bold" style={{ fontSize: 32, color: c.gold, marginTop: 4 }}>
                20 <Text style={{ fontSize: 14, color: c.textSecondary, fontWeight: 'normal' }}>Credits</Text>
              </Text>
            </DefaultView>

          </DefaultView>

          {/* Download Transcript Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleDownloadTranscript}
            disabled={downloadingTranscript}
            style={[
              styles.downloadButton, 
              { 
                backgroundColor: c.gold + '12', 
                borderColor: c.gold + '50', 
                borderWidth: 1,
                marginTop: 18,
                height: 42,
                borderRadius: 12
              }
            ]}
          >
            {downloadingTranscript ? (
              <ActivityIndicator size="small" color={c.gold} />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={16} color={c.gold} />
                <Text variant="bold" style={{ fontSize: 11, color: c.gold, letterSpacing: 0.2 }}>
                  Download Academic Transcript (PDF)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* TERM SELECTOR ROW */}
        <DefaultView style={styles.termSelectorWrapper}>
          <Text variant="bold" style={{ fontSize: 10, color: c.textSecondary, letterSpacing: 0.5, marginBottom: 8 }}>
            SELECT ACADEMIC TERM
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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
                      backgroundColor: isSelected ? c.gold + '15' : c.card,
                      borderColor: isSelected ? c.gold : c.border
                    }
                  ]}
                >
                  <Text variant="bold" style={{ fontSize: 10, color: isSelected ? c.gold : c.text }}>
                    {term.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </DefaultView>

        {/* TGPA & TERM REPORT BUTTON */}
        <View style={[styles.tgpaCard, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
            <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
              <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary, letterSpacing: 0.5 }}>
                TERM GPA (TGPA) • {selectedTerm.toUpperCase()}
              </Text>
              <Text variant="bold" style={{ fontSize: 24, color: c.text, marginTop: 4 }}>
                {tgpa} <Text style={{ fontSize: 13, color: c.textSecondary }}>/ 4.00</Text>
              </Text>
            </DefaultView>

            {selectedTerm !== 'All Terms' && (
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleDownloadTermReport}
                disabled={downloadingTermReport}
                style={[styles.termReportBtn, { backgroundColor: c.gold, borderColor: c.gold }]}
              >
                {downloadingTermReport ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Ionicons name="document-text-outline" size={13} color="#000" />
                    <Text variant="bold" style={{ fontSize: 10, color: '#000' }}>
                      Term Report
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </DefaultView>
        </View>

        {/* ENROLLED COURSE LISTING WITH INDIVIDUAL ASSIGNMENT GPAS */}
        <DefaultView style={{ marginTop: 12, backgroundColor: 'transparent' }}>
          <Text variant="bold" style={{ fontSize: 10, color: c.textSecondary, letterSpacing: 0.6, marginBottom: 10 }}>
            COURSES & SCORECARD DETAILS
          </Text>

          {termCourses.length === 0 ? (
            <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, paddingVertical: 12, textAlign: 'center' }}>
              No course records found for this term.
            </Text>
          ) : !groupByDomain ? (
            termCourses.map(course => renderCourseAccordionCard(course))
          ) : (
            Object.keys(domainGroups).map(domainName => {
              const coursesInDomain = domainGroups[domainName];
              if (coursesInDomain.length === 0) return null;

              const domainInfo = getCourseDomain(coursesInDomain[0].code);
              const domainGPA = getDomainGPA(coursesInDomain);

              return (
                <DefaultView key={domainName} style={{ marginBottom: 18, backgroundColor: 'transparent' }}>
                  {/* Domain Category Header Ribbon */}
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
                        {domainGPA} GPA
                      </Text>
                    </DefaultView>
                  </DefaultView>

                  {coursesInDomain.map(course => renderCourseAccordionCard(course))}
                </DefaultView>
              );
            })
          )}
        </DefaultView>

      </ScrollView>

      {/* FILTER BOTTOM SHEET DRAWER (replicates Attendance page) */}
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
                Personalize your scorecard academic filters and views
              </Text>
            </DefaultView>

            {/* Academic Term Selection Section */}
            <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 8 }]}>
              <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                ACADEMIC TERM
              </Text>
              <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, marginBottom: 12 }}>
                Filter GPA scorecard timeline by academic semester.
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
                    Organize your GPA scorecards by subject domain (e.g. Economics, UX Design) showing combined average grade points.
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
    backgroundColor: '#FF453A',
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
  backButton: {
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
    paddingBottom: 40,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 12,
    marginTop: 18,
  },
  termSelectorWrapper: {
    backgroundColor: 'transparent',
    marginBottom: 14,
  },
  termFilterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tgpaCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  termReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  courseAccordionCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  accordionIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  badge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  coursePctBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  accordionBody: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  courseSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  assignmentHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  colHeader: {
    fontSize: 8,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  assignmentRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },

  // DOMAIN HEADERS STYLING
  domainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
    marginTop: 10,
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

  // FILTER BOTTOM SHEET DRAWER OVERLAYS
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
  sessionModalScroll: {
    paddingBottom: 20,
  },
  sessionModalHeader: {
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  sessionModalTitle: {
    lineHeight: 22,
  },
  sectionHeading: {
    fontSize: 9,
    letterSpacing: 0.6,
  },
  detailSectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
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
  feedbackSubmitBtn: {
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
