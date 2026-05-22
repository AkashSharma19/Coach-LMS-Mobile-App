import React, { useState } from 'react';
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

// High-fidelity Academic Summary mock details
const ACADEMIC_METRICS = {
  programName: 'Bachelor of Science in Quantitative Economics',
  totalTerms: 8,
  currentTerm: 4,
  yearOfStudy: 'Sophomore Year (Year 2)',
  gpaTrends: [
    { term: 'Term 1', gpa: 3.45, color: '#EBC063' },
    { term: 'Term 2', gpa: 3.62, color: '#FF9F0A' },
    { term: 'Term 3', gpa: 3.78, color: '#BF5AF2' },
    { term: 'Term 4', gpa: 3.89, color: '#30D158' }
  ],
  attendanceTrends: [
    { term: 'Term 1', presence: 92, color: '#4A90E2' },
    { term: 'Term 2', presence: 94, color: '#34C759' },
    { term: 'Term 3', presence: 89, color: '#FF375F' },
    { term: 'Term 4', presence: 96, color: '#64D2FF' }
  ],
  credits: {
    inClass: { completed: 54, pending: 36, target: 90 },
    outClass: { completed: 12, pending: 18, target: 30 }
  },
  courses: {
    attempted: 20,
    completed: 16,
    active: 4,
    completedBifurcation: {
      core: 12,
      elective: 4
    },
    activeBifurcation: {
      core: 3,
      elective: 1
    }
  }
};

export default function AcademicSummaryScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // Active sub-tab switcher for historical trends section
  const [activeGraphTab, setActiveGraphTab] = useState<'gpa' | 'attendance'>('gpa');

  // GPA calculation helper to convert dynamic bar height representation
  const maxGpa = 4.0;
  const maxPresence = 100;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Visual background accent overlay */}
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
            Academic Summary
          </Text>
          <Text variant="bold" style={{ fontSize: 8, color: c.gold, marginTop: 2, letterSpacing: 0.5 }}>
            PROGRAM ROADMAP • CREDIT AUDITS
          </Text>
        </DefaultView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. PROGRAM PROGRESS ROADMAP CARD */}
        <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text variant="bold" style={[styles.sectionLabel, { color: c.textSecondary }]}>
            PROGRAM PROGRESS
          </Text>
          <Text variant="bold" style={{ fontSize: 15, color: c.text, marginTop: 4 }}>
            {ACADEMIC_METRICS.programName}
          </Text>
          <Text variant="medium" style={{ fontSize: 11, color: c.gold, marginTop: 2 }}>
            {ACADEMIC_METRICS.yearOfStudy} • Currently in Term {ACADEMIC_METRICS.currentTerm} of {ACADEMIC_METRICS.totalTerms}
          </Text>

          {/* Timeline Grid Roadmap */}
          <DefaultView style={styles.roadmapGrid}>
            {Array.from({ length: ACADEMIC_METRICS.totalTerms }).map((_, idx) => {
              const termNum = idx + 1;
              const isCompleted = termNum < ACADEMIC_METRICS.currentTerm;
              const isActive = termNum === ACADEMIC_METRICS.currentTerm;

              return (
                <DefaultView 
                  key={termNum} 
                  style={[
                    styles.termCircle,
                    { 
                      backgroundColor: isActive 
                        ? c.gold + '20' 
                        : isCompleted 
                          ? c.border + '40' 
                          : c.background,
                      borderColor: isActive 
                        ? c.gold 
                        : isCompleted 
                          ? c.border 
                          : c.border + '60'
                    }
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={c.text} />
                  ) : (
                    <Text 
                      variant="bold" 
                      style={{ 
                        fontSize: 11, 
                        color: isActive ? c.gold : c.textSecondary 
                      }}
                    >
                      T{termNum}
                    </Text>
                  )}
                  {isActive && <DefaultView style={[styles.activeIndicator, { backgroundColor: c.gold }]} />}
                </DefaultView>
              );
            })}
          </DefaultView>
          
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, backgroundColor: 'transparent' }}>
            <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
              Completed: {ACADEMIC_METRICS.currentTerm - 1} Terms
            </Text>
            <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
              Remaining: {ACADEMIC_METRICS.totalTerms - ACADEMIC_METRICS.currentTerm + 1} Terms
            </Text>
          </DefaultView>
        </View>

        {/* 2. COURSE MATRICULATION GRID (CORE VS ELECTIVE) */}
        <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 14 }]}>
          <Text variant="bold" style={[styles.sectionLabel, { color: c.textSecondary }]}>
            COURSE MATRICULATION
          </Text>

          {/* Top general statistics comparison */}
          <DefaultView style={styles.statsCardGrid}>
            <DefaultView style={[styles.statsCardBox, { backgroundColor: c.background, borderColor: c.border }]}>
              <Text variant="bold" style={{ fontSize: 20, color: c.gold }}>
                {ACADEMIC_METRICS.courses.attempted}
              </Text>
              <Text variant="bold" style={styles.statsCardLabel}>
                ATTEMPTED
              </Text>
            </DefaultView>

            <DefaultView style={[styles.statsCardBox, { backgroundColor: c.background, borderColor: c.border }]}>
              <Text variant="bold" style={{ fontSize: 20, color: '#34C759' }}>
                {ACADEMIC_METRICS.courses.completed}
              </Text>
              <Text variant="bold" style={styles.statsCardLabel}>
                COMPLETED
              </Text>
            </DefaultView>

            <DefaultView style={[styles.statsCardBox, { backgroundColor: c.background, borderColor: c.border }]}>
              <Text variant="bold" style={{ fontSize: 20, color: '#4A90E2' }}>
                {ACADEMIC_METRICS.courses.active}
              </Text>
              <Text variant="bold" style={styles.statsCardLabel}>
                ENROLLED / ACTIVE
              </Text>
            </DefaultView>
          </DefaultView>

          {/* Dynamic Core vs Elective Grid Breakdown */}
          <DefaultView style={styles.divider} />

          <DefaultView style={styles.bifurcationTable}>
            <DefaultView style={styles.tableHeaderRow}>
              <Text variant="bold" style={styles.tableHeadCellFirst}>COURSE CATEGORY</Text>
              <Text variant="bold" style={[styles.tableHeadCellSec, { textAlign: 'right' }]}>COMPLETED</Text>
              <Text variant="bold" style={[styles.tableHeadCellSec, { textAlign: 'right' }]}>ENROLLED</Text>
            </DefaultView>

            <DefaultView style={styles.tableBodyRow}>
              <DefaultView style={styles.tableCellMainContainer}>
                <DefaultView style={[styles.rowColorDot, { backgroundColor: c.gold }]} />
                <Text variant="medium" style={[styles.tableCellMain, { color: c.textSecondary }]}>Core Program Modules</Text>
              </DefaultView>
              <Text variant="bold" style={[styles.tableCellVal, { textAlign: 'right', color: c.text }]}>
                {ACADEMIC_METRICS.courses.completedBifurcation.core}
              </Text>
              <Text variant="bold" style={[styles.tableCellVal, { textAlign: 'right', color: c.textSecondary }]}>
                {ACADEMIC_METRICS.courses.activeBifurcation.core}
              </Text>
            </DefaultView>

            <DefaultView style={styles.tableBodyRow}>
              <DefaultView style={styles.tableCellMainContainer}>
                <DefaultView style={[styles.rowColorDot, { backgroundColor: '#4A90E2' }]} />
                <Text variant="medium" style={[styles.tableCellMain, { color: c.textSecondary }]}>Elective Modules</Text>
              </DefaultView>
              <Text variant="bold" style={[styles.tableCellVal, { textAlign: 'right', color: c.text }]}>
                {ACADEMIC_METRICS.courses.completedBifurcation.elective}
              </Text>
              <Text variant="bold" style={[styles.tableCellVal, { textAlign: 'right', color: c.textSecondary }]}>
                {ACADEMIC_METRICS.courses.activeBifurcation.elective}
              </Text>
            </DefaultView>
          </DefaultView>
        </View>

        {/* 3. HISTORICAL PERFORMANCE TREND GRAPHS (AXIS ALIGNED) */}
        <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 14 }]}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 12 }}>
            <Text variant="bold" style={[styles.sectionLabel, { color: c.textSecondary }]}>
              PERFORMANCE TRENDS
            </Text>
            
            <DefaultView style={[styles.miniSwitcher, { backgroundColor: c.background, borderColor: c.border }]}>
              <TouchableOpacity 
                style={[styles.switcherBtn, activeGraphTab === 'gpa' && { backgroundColor: c.card }]}
                onPress={() => setActiveGraphTab('gpa')}
              >
                <Text variant="bold" style={{ fontSize: 9, color: activeGraphTab === 'gpa' ? c.gold : c.textSecondary }}>GPA</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.switcherBtn, activeGraphTab === 'attendance' && { backgroundColor: c.card }]}
                onPress={() => setActiveGraphTab('attendance')}
              >
                <Text variant="bold" style={{ fontSize: 9, color: activeGraphTab === 'attendance' ? c.gold : c.textSecondary }}>PRESENCE</Text>
              </TouchableOpacity>
            </DefaultView>
          </DefaultView>

          {activeGraphTab === 'gpa' ? (
            // GPA TREND AXIS GRAPH
            <DefaultView style={styles.chartContainer}>
              <DefaultView style={styles.yAxis}>
                <Text variant="bold" style={styles.axisLabel}>4.0</Text>
                <Text variant="bold" style={styles.axisLabel}>3.0</Text>
                <Text variant="bold" style={styles.axisLabel}>2.0</Text>
                <Text variant="bold" style={styles.axisLabel}>1.0</Text>
                <Text variant="bold" style={styles.axisLabel}>0.0</Text>
              </DefaultView>

              <DefaultView style={styles.chartCanvas}>
                {/* Horizontal reference grid lines */}
                {[0, 1, 2, 3, 4].map(line => (
                  <DefaultView 
                    key={line} 
                    style={[
                      styles.gridLine, 
                      { 
                        top: `${line * 25}%`,
                        borderColor: c.border + '20' 
                      }
                    ]} 
                  />
                ))}

                {/* Column Bars */}
                <DefaultView style={styles.barsContainer}>
                  {ACADEMIC_METRICS.gpaTrends.map(item => {
                    const percentageHeight = (item.gpa / maxGpa) * 100;
                    return (
                      <DefaultView key={item.term} style={styles.barColumn}>
                        <Text variant="bold" style={styles.barTopLabel}>{item.gpa.toFixed(2)}</Text>
                        <DefaultView 
                          style={[
                            styles.barFill, 
                            { 
                              height: `${percentageHeight}%` as any, 
                              backgroundColor: item.color 
                            }
                          ]} 
                        />
                        <Text variant="bold" style={[styles.barBottomLabel, { color: c.textSecondary }]}>
                          {item.term}
                        </Text>
                      </DefaultView>
                    );
                  })}
                </DefaultView>
              </DefaultView>
            </DefaultView>
          ) : (
            // ATTENDANCE TREND AXIS GRAPH
            <DefaultView style={styles.chartContainer}>
              <DefaultView style={styles.yAxis}>
                <Text variant="bold" style={styles.axisLabel}>100%</Text>
                <Text variant="bold" style={styles.axisLabel}>75%</Text>
                <Text variant="bold" style={styles.axisLabel}>50%</Text>
                <Text variant="bold" style={styles.axisLabel}>25%</Text>
                <Text variant="bold" style={styles.axisLabel}>0%</Text>
              </DefaultView>

              <DefaultView style={styles.chartCanvas}>
                {/* Horizontal reference grid lines */}
                {[0, 1, 2, 3, 4].map(line => (
                  <DefaultView 
                    key={line} 
                    style={[
                      styles.gridLine, 
                      { 
                        top: `${line * 25}%`,
                        borderColor: c.border + '20' 
                      }
                    ]} 
                  />
                ))}

                {/* Column Bars */}
                <DefaultView style={styles.barsContainer}>
                  {ACADEMIC_METRICS.attendanceTrends.map(item => {
                    const percentageHeight = (item.presence / maxPresence) * 100;
                    return (
                      <DefaultView key={item.term} style={styles.barColumn}>
                        <Text variant="bold" style={styles.barTopLabel}>{item.presence}%</Text>
                        <DefaultView 
                          style={[
                            styles.barFill, 
                            { 
                              height: `${percentageHeight}%` as any, 
                              backgroundColor: item.color 
                            }
                          ]} 
                        />
                        <Text variant="bold" style={[styles.barBottomLabel, { color: c.textSecondary }]}>
                          {item.term}
                        </Text>
                      </DefaultView>
                    );
                  })}
                </DefaultView>
              </DefaultView>
            </DefaultView>
          )}
        </View>

        {/* 4. CREDIT AUDIT PROGRESS (INCLASS VS OUTCLASS) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            router.push('/credit-audit');
          }}
          style={{ marginTop: 14 }}
        >
          <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
              <Text variant="bold" style={[styles.sectionLabel, { color: c.textSecondary }]}>
                CREDIT AUDIT REPORT
              </Text>
              <Ionicons name="arrow-forward" size={16} color={c.gold} />
            </DefaultView>

            {/* IN-CLASS AUDIT COMPARISON */}
            <DefaultView style={{ marginTop: 12, backgroundColor: 'transparent' }}>
              <DefaultView style={styles.auditHeader}>
                <Text variant="bold" style={{ fontSize: 13, color: c.text }}>
                  In-Class Core Credits
                </Text>
                <Text variant="bold" style={{ fontSize: 12, color: c.gold }}>
                  {ACADEMIC_METRICS.credits.inClass.completed} completed / {ACADEMIC_METRICS.credits.inClass.target} Total
                </Text>
              </DefaultView>

              {/* Custom linear progress meter bar */}
              <DefaultView style={[styles.progressTrack, { backgroundColor: c.background, borderColor: c.border }]}>
                <DefaultView 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: c.gold, 
                      width: `${(ACADEMIC_METRICS.credits.inClass.completed / ACADEMIC_METRICS.credits.inClass.target) * 100}%` as any 
                    }
                  ]} 
                />
              </DefaultView>

              <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, backgroundColor: 'transparent' }}>
                <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                  Earned: {ACADEMIC_METRICS.credits.inClass.completed} Credits
                </Text>
                <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                  Pending: {ACADEMIC_METRICS.credits.inClass.pending} Credits
                </Text>
              </DefaultView>
            </DefaultView>

            {/* OUT-CLASS AUDIT COMPARISON */}
            <DefaultView style={{ marginTop: 18, backgroundColor: 'transparent' }}>
              <DefaultView style={styles.auditHeader}>
                <Text variant="bold" style={{ fontSize: 13, color: c.text }}>
                  Out-Class Activity Credits
                </Text>
                <Text variant="bold" style={{ fontSize: 12, color: '#4A90E2' }}>
                  {ACADEMIC_METRICS.credits.outClass.completed} completed / {ACADEMIC_METRICS.credits.outClass.target} Total
                </Text>
              </DefaultView>

              {/* Custom linear progress meter bar */}
              <DefaultView style={[styles.progressTrack, { backgroundColor: c.background, borderColor: c.border }]}>
                <DefaultView 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: '#4A90E2', 
                      width: `${(ACADEMIC_METRICS.credits.outClass.completed / ACADEMIC_METRICS.credits.outClass.target) * 100}%` as any 
                    }
                  ]} 
                />
              </DefaultView>

              <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, backgroundColor: 'transparent' }}>
                <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                  Earned: {ACADEMIC_METRICS.credits.outClass.completed} Credits
                </Text>
                <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                  Pending: {ACADEMIC_METRICS.credits.outClass.pending} Credits
                </Text>
              </DefaultView>
            </DefaultView>
          </View>
        </TouchableOpacity>

        <DefaultView style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: '#BF5AF2',
    opacity: 0.015,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'transparent',
    marginBottom: 10,
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
    paddingBottom: 40,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 0.8,
  },
  
  // ROADMAP GRID
  roadmapGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  termCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // STATS GRID
  statsCardGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  statsCardBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardLabel: {
    fontSize: 7,
    letterSpacing: 0.3,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    opacity: 0.15,
    marginVertical: 14,
  },

  // BIFURCATION TABLE
  bifurcationTable: {
    gap: 8,
    backgroundColor: 'transparent',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  tableHeadCellFirst: {
    fontSize: 8,
    color: '#8E8E93',
    letterSpacing: 0.4,
    width: '50%',
  },
  tableHeadCellSec: {
    fontSize: 8,
    color: '#8E8E93',
    letterSpacing: 0.4,
    width: '25%',
  },
  tableCellMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    width: '50%',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  rowColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tableCellMain: {
    fontSize: 11,
    color: '#8E8E93',
    flex: 1,
  },
  tableCellVal: {
    fontSize: 12,
    width: '25%',
  },

  // PERFORMANCE Mini switch
  miniSwitcher: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 2,
    alignItems: 'center',
  },
  switcherBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // AXIS GRAPH STYLING
  chartContainer: {
    flexDirection: 'row',
    height: 160,
    backgroundColor: 'transparent',
    marginTop: 10,
    alignItems: 'stretch',
  },
  yAxis: {
    width: 32,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  axisLabel: {
    fontSize: 9,
    color: '#8E8E93',
  },
  chartCanvas: {
    flex: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  barsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
  barColumn: {
    width: 38,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  barTopLabel: {
    fontSize: 8,
    marginBottom: 4,
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  barBottomLabel: {
    fontSize: 8,
    marginTop: 6,
    position: 'absolute',
    bottom: -18,
  },

  // CREDIT AUDIT
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },

  // MODAL & AUDIT LIST STYLING
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
    opacity: 0.3,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  modalScroll: {
    paddingBottom: 40,
  },
  modalHeader: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 18,
    marginTop: 4,
  },
  auditGroupCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  auditGroupHeader: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    backgroundColor: 'transparent',
  },
  auditCourseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'transparent',
  },
  gradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  applyBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
});
