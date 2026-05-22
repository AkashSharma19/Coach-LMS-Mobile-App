import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

// High-fidelity dynamic Audited Courses database with Term properties
const AUDIT_COURSES = {
  inClass: [
    { code: 'ECON-302', name: 'Macroeconomic Theory', credits: 4, status: 'PASSED', grade: 'A', type: 'Core', term: 3 },
    { code: 'BUS-101', name: 'Introduction to Business', credits: 3, status: 'PASSED', grade: 'A-', type: 'Core', term: 1 },
    { code: 'CS-201', name: 'Data Structures Principles', credits: 4, status: 'PASSED', grade: 'B+', type: 'Core', term: 2 },
    { code: 'MATH-201', name: 'Calculus II', credits: 4, status: 'PASSED', grade: 'A', type: 'Core', term: 2 },
    { code: 'ECON-101', name: 'Microeconomics Principles', credits: 3, status: 'PASSED', grade: 'B', type: 'Core', term: 1 },
    { code: 'MKT-202', name: 'Consumer Behavior', credits: 3, status: 'PASSED', grade: 'A', type: 'Elective', term: 3 },
    { code: 'FIN-301', name: 'Corporate Finance', credits: 4, status: 'PASSED', grade: 'B-', type: 'Core', term: 3 },
    { code: 'HCI-201', name: 'Human-Computer Interaction', credits: 3, status: 'PASSED', grade: 'A', type: 'Elective', term: 2 },
    { code: 'STATS-210', name: 'Statistical Inference', credits: 4, status: 'PASSED', grade: 'B+', type: 'Core', term: 3 },
    
    // In Progress
    { code: 'CS-301', name: 'Algorithms & Complexity', credits: 4, status: 'IN_PROGRESS', type: 'Core', term: 4 },
    { code: 'ECON-401', name: 'Econometrics Analysis', credits: 4, status: 'IN_PROGRESS', type: 'Core', term: 4 },
    { code: 'MGMT-302', name: 'Strategic Decision Models', credits: 3, status: 'IN_PROGRESS', type: 'Elective', term: 4 },
    
    // Failed
    { code: 'MATH-102', name: 'Advanced Linear Algebra', credits: 3, status: 'FAILED', grade: 'F', type: 'Core', term: 1 },
  ],
  outClass: [
    { code: 'LDR-110', name: 'Student Leadership Project', credits: 3, status: 'PASSED', grade: 'CR', type: 'Out-Class', term: 1 },
    { code: 'COM-120', name: 'Community Outreach Service', credits: 3, status: 'PASSED', grade: 'CR', type: 'Out-Class', term: 2 },
    { code: 'ENT-201', name: 'Incubation Ideation Sprint', credits: 3, status: 'PASSED', grade: 'CR', type: 'Out-Class', term: 3 },
    { code: 'ATH-105', name: 'Inter-College Athletic Meet', credits: 3, status: 'PASSED', grade: 'CR', type: 'Out-Class', term: 2 },
    
    // In Progress
    { code: 'INT-220', name: 'Professional Internship Program', credits: 6, status: 'IN_PROGRESS', type: 'Out-Class', term: 4 },
  ]
};

export default function CreditAuditScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // Selected filters
  const [activeTab, setActiveTab] = useState<'inClass' | 'outClass'>('inClass');
  const [selectedTerm, setSelectedTerm] = useState<number | 'all'>('all');

  const termsList = [
    { label: 'All Terms', value: 'all' as const },
    { label: 'Term 1', value: 1 },
    { label: 'Term 2', value: 2 },
    { label: 'Term 3', value: 3 },
    { label: 'Term 4 (Active)', value: 4 },
  ];

  // Dynamic filter lists
  const currentList = AUDIT_COURSES[activeTab];
  const filteredList = currentList.filter(item => selectedTerm === 'all' || item.term === selectedTerm);

  const passed = filteredList.filter(item => item.status === 'PASSED');
  const inProgress = filteredList.filter(item => item.status === 'IN_PROGRESS');
  const failed = filteredList.filter(item => item.status === 'FAILED');

  // Completed metrics
  const totalEarnedCredits = currentList
    .filter(item => item.status === 'PASSED')
    .reduce((sum, item) => sum + item.credits, 0);

  const currentTermCredits = currentList
    .filter(item => item.term === 4)
    .reduce((sum, item) => sum + item.credits, 0);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Dynamic Visual Accent Overlay */}
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
        <DefaultView style={{ flex: 1, marginLeft: 12, backgroundColor: 'transparent' }}>
          <Text variant="bold" style={{ fontSize: 16, color: c.text }}>Credit Audit</Text>
          <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>Fulfillment Progress Tracker</Text>
        </DefaultView>
      </View>

      {/* Top Banner Stats Grid */}
      <DefaultView style={styles.statsBanner}>
        <View style={[styles.statsBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text variant="bold" style={{ fontSize: 16, color: c.gold }}>{totalEarnedCredits} CR</Text>
          <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>TOTAL EARNED</Text>
        </View>
        <View style={[styles.statsBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text variant="bold" style={{ fontSize: 16, color: '#4A90E2' }}>{currentTermCredits} CR</Text>
          <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>TERM 4 ACTIVE</Text>
        </View>
      </DefaultView>

      {/* Horizontal Credit Category Switcher */}
      <DefaultView style={{ paddingHorizontal: 16, marginTop: 12, backgroundColor: 'transparent' }}>
        <DefaultView style={[styles.miniSwitcher, { backgroundColor: c.card, borderColor: c.border }]}>
          <TouchableOpacity 
            style={[styles.switcherBtn, { flex: 1 }, activeTab === 'inClass' && { backgroundColor: c.background }]}
            onPress={() => {
              setActiveTab('inClass');
              setSelectedTerm('all');
            }}
          >
            <Text variant="bold" style={{ fontSize: 10, color: activeTab === 'inClass' ? c.gold : c.textSecondary, textAlign: 'center' }}>
              IN-CLASS CREDITS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.switcherBtn, { flex: 1 }, activeTab === 'outClass' && { backgroundColor: c.background }]}
            onPress={() => {
              setActiveTab('outClass');
              setSelectedTerm('all');
            }}
          >
            <Text variant="bold" style={{ fontSize: 10, color: activeTab === 'outClass' ? c.gold : c.textSecondary, textAlign: 'center' }}>
              OUT-CLASS ACTIVITY
            </Text>
          </TouchableOpacity>
        </DefaultView>
      </DefaultView>

      {/* Scrollable Term Filter Row */}
      <DefaultView style={{ marginTop: 16, backgroundColor: 'transparent' }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.termScroll}
        >
          {termsList.map(t => {
            const isSelected = selectedTerm === t.value;
            return (
              <TouchableOpacity
                key={t.label}
                activeOpacity={0.8}
                onPress={() => setSelectedTerm(t.value)}
                style={[
                  styles.termCapsule, 
                  { 
                    backgroundColor: isSelected ? c.gold : c.card, 
                    borderColor: isSelected ? c.gold : c.border 
                  }
                ]}
              >
                <Text 
                  variant="bold" 
                  style={{ 
                    fontSize: 10, 
                    color: isSelected ? '#000' : c.textSecondary 
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </DefaultView>

      {/* Main Filtered Course List View */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {filteredList.length === 0 ? (
          <DefaultView style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={40} color={c.border} />
            <Text variant="bold" style={{ fontSize: 12, color: c.textSecondary, marginTop: 10 }}>
              No courses matching this term filter
            </Text>
          </DefaultView>
        ) : (
          <DefaultView style={{ gap: 14, backgroundColor: 'transparent' }}>
            
            {/* A. IN PROGRESS SECTION */}
            {inProgress.length > 0 && (
              <View style={[styles.auditGroupCard, { backgroundColor: c.card, borderColor: '#4A90E233' }]}>
                <DefaultView style={[styles.auditGroupHeader, { borderLeftColor: '#4A90E2' }]}>
                  <Text variant="bold" style={{ fontSize: 10, color: '#4A90E2', letterSpacing: 0.5 }}>
                    IN PROGRESS ({inProgress.length} {inProgress.length === 1 ? 'Course' : 'Courses'})
                  </Text>
                </DefaultView>
                
                <DefaultView style={{ gap: 8, backgroundColor: 'transparent', marginTop: 10 }}>
                  {inProgress.map(item => (
                    <DefaultView key={item.code} style={styles.auditCourseItem}>
                      <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 12, color: c.text }}>{item.code} — {item.name}</Text>
                        <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>
                          Term {item.term} • {item.type} Module
                        </Text>
                      </DefaultView>
                      <DefaultView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 11, color: '#4A90E2' }}>{item.credits} CR</Text>
                        <Text variant="bold" style={{ fontSize: 7, color: '#4A90E2', letterSpacing: 0.3, marginTop: 2 }}>ENROLLED</Text>
                      </DefaultView>
                    </DefaultView>
                  ))}
                </DefaultView>
              </View>
            )}

            {/* B. PASSED & COMPLETED SECTION */}
            {passed.length > 0 && (
              <View style={[styles.auditGroupCard, { backgroundColor: c.card, borderColor: '#34C75933' }]}>
                <DefaultView style={[styles.auditGroupHeader, { borderLeftColor: '#34C759' }]}>
                  <Text variant="bold" style={{ fontSize: 10, color: '#34C759', letterSpacing: 0.5 }}>
                    COMPLETED & PASSED ({passed.length} {passed.length === 1 ? 'Course' : 'Courses'})
                  </Text>
                </DefaultView>
                
                <DefaultView style={{ gap: 8, backgroundColor: 'transparent', marginTop: 10 }}>
                  {passed.map(item => (
                    <DefaultView key={item.code} style={styles.auditCourseItem}>
                      <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 12, color: c.text }}>{item.code} — {item.name}</Text>
                        <Text variant="medium" style={{ fontSize: 8, color: c.textSecondary, marginTop: 2 }}>
                          Term {item.term} • {item.type} Module
                        </Text>
                      </DefaultView>
                      <DefaultView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 11, color: '#34C759' }}>{item.credits} CR</Text>
                        <DefaultView style={[styles.gradeBadge, { backgroundColor: '#34C75915', borderColor: '#34C759' }]}>
                          <Text variant="bold" style={{ fontSize: 7, color: '#34C759' }}>GRADE: {item.grade}</Text>
                        </DefaultView>
                      </DefaultView>
                    </DefaultView>
                  ))}
                </DefaultView>
              </View>
            )}

            {/* C. FAILED SECTION */}
            {failed.length > 0 && (
              <View style={[styles.auditGroupCard, { backgroundColor: c.card, borderColor: '#FF375F33' }]}>
                <DefaultView style={[styles.auditGroupHeader, { borderLeftColor: '#FF375F' }]}>
                  <Text variant="bold" style={{ fontSize: 10, color: '#FF375F', letterSpacing: 0.5 }}>
                    UNFULFILLED / FAILED ({failed.length} {failed.length === 1 ? 'Course' : 'Courses'})
                  </Text>
                </DefaultView>
                
                <DefaultView style={{ gap: 8, backgroundColor: 'transparent', marginTop: 10 }}>
                  {failed.map(item => (
                    <DefaultView key={item.code} style={styles.auditCourseItem}>
                      <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 12, color: c.text }}>{item.code} — {item.name}</Text>
                        <Text variant="medium" style={{ fontSize: 8, color: '#FF375F', marginTop: 2 }}>Prerequisite retake required</Text>
                      </DefaultView>
                      <DefaultView style={{ alignItems: 'flex-end', backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 11, color: '#FF375F' }}>{item.credits} CR</Text>
                        <DefaultView style={[styles.gradeBadge, { backgroundColor: '#FF375F15', borderColor: '#FF375F' }]}>
                          <Text variant="bold" style={{ fontSize: 7, color: '#FF375F' }}>GRADE: F</Text>
                        </DefaultView>
                      </DefaultView>
                    </DefaultView>
                  ))}
                </DefaultView>
              </View>
            )}

          </DefaultView>
        )}
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
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: '#FFD700',
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  statsBanner: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  statsBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  miniSwitcher: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 2,
    alignItems: 'center',
  },
  switcherBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  termCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    opacity: 0.6,
    backgroundColor: 'transparent',
  },
  auditGroupCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 4,
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
});
