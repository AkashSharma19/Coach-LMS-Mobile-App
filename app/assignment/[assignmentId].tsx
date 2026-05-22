import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform,
  Linking
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { MOCK_COURSES } from '@/constants/MockData';
import { assignmentStore, useAssignmentSubmissions } from '@/store/assignmentStore';

export default function AssignmentDetailsScreen() {
  const { assignmentId } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // Parse assignmentId, e.g. "1_0" (courseId_assignmentIndex)
  const [courseId, assignmentIndexStr] = String(assignmentId).split('_');
  const course = MOCK_COURSES.find(crs => crs.id === courseId);
  const assignmentIndex = parseInt(assignmentIndexStr, 10);
  const assignment = course?.assignments[assignmentIndex];

  // Dynamic submissions store binding
  const submissions = useAssignmentSubmissions();
  const localSub = assignment ? submissions[assignment.title] : null;

  // Local upload state before submission
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  if (!course || !assignment) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={64} color={c.textSecondary} />
        <Text variant="bold" style={{ color: c.text, fontSize: 18, marginTop: 16 }}>
          Assignment Not Found
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

  const isSubmitted = !!localSub || assignment.status === 'submitted';
  const isGraded = assignment.status === 'submitted' && !!assignment.score;

  // Handle resource items click
  const renderResourceItem = (res: { name: string; url?: string }, idx: number) => {
    const isLink = !!res.url;
    if (isLink) {
      return (
        <TouchableOpacity
          key={idx}
          activeOpacity={0.7}
          style={styles.materialItem}
          onPress={() => {
            if (res.url) {
              Linking.openURL(res.url).catch(err => {
                console.error("Failed to open URL", err);
              });
            }
          }}
        >
          <Ionicons name="link-outline" size={14} color={course.color} />
          <Text
            variant="medium"
            style={[
              styles.materialItemText,
              { color: course.color, textDecorationLine: 'underline' }
            ]}
          >
            {res.name}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <DefaultView key={idx} style={styles.materialItem}>
        <Ionicons name="document-text-outline" size={14} color={c.textSecondary} />
        <Text variant="medium" style={[styles.materialItemText, { color: c.textSecondary }]}>
          {res.name}
        </Text>
      </DefaultView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Background Accent Gradient */}
      <DefaultView style={[styles.bgAccent, { backgroundColor: course.color }]} />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={[styles.circleBackBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Area */}
        <View style={styles.heroSection}>
          <DefaultView style={styles.statusBadgeRow}>
            <DefaultView style={[styles.typeBadge, { borderColor: course.color }]}>
              <Text variant="bold" style={[styles.typeBadgeText, { color: course.color }]}>
                ASSIGNMENT
              </Text>
            </DefaultView>
            <DefaultView style={[
              styles.typeBadge, 
              { 
                borderColor: isGraded ? c.green : isSubmitted ? '#EBC063' : course.color,
                backgroundColor: isGraded ? c.green + '10' : isSubmitted ? '#EBC06310' : 'transparent',
              }
            ]}>
              <Text variant="bold" style={[
                styles.typeBadgeText, 
                { color: isGraded ? c.green : isSubmitted ? '#EBC063' : course.color }
              ]}>
                {isGraded ? 'Graded' : isSubmitted ? 'Awaiting Evaluation' : 'Pending Solution'}
              </Text>
            </DefaultView>
          </DefaultView>

          <Text variant="bold" style={[styles.courseTitle, { color: c.text }]}>
            {assignment.title}
          </Text>
        </View>

        {/* Dynamic Context Dashboard Panels */}
        <View style={styles.panelContainer}>
          {/* Metadata Statistics Row */}
          <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, padding: 16 }]}>
            <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
              <DefaultView style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center' }}>
                <Text variant="regular" style={{ fontSize: 10, color: c.textSecondary }}>WEIGHT</Text>
                <Text variant="bold" style={{ fontSize: 14, color: c.text, marginTop: 4 }}>
                  {assignment.weight || 'N/A'}
                </Text>
              </DefaultView>

              <DefaultView style={{ width: 1, height: 30, backgroundColor: c.border, alignSelf: 'center' }} />

              <DefaultView style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center' }}>
                <Text variant="regular" style={{ fontSize: 10, color: c.textSecondary }}>MAX SCORE</Text>
                <Text variant="bold" style={{ fontSize: 14, color: c.text, marginTop: 4 }}>
                  {assignment.totalScore || '100'} Pts
                </Text>
              </DefaultView>

              <DefaultView style={{ width: 1, height: 30, backgroundColor: c.border, alignSelf: 'center' }} />

              <DefaultView style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center' }}>
                <Text variant="regular" style={{ fontSize: 10, color: c.textSecondary }}>DUE DATE</Text>
                <Text variant="bold" style={{ fontSize: 13, color: isSubmitted ? c.green : '#FF4A4A', marginTop: 4 }}>
                  {isSubmitted ? 'Handed In' : assignment.dueDate}
                </Text>
              </DefaultView>
            </DefaultView>
          </View>

          {/* Dynamic Evaluation Results / Timeline (Rendered first if submitted!) */}
          {isSubmitted && (
            <DefaultView style={{ backgroundColor: 'transparent' }}>
              {isGraded ? (
                /* Dynamic Graded Results Card */
                <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 12 }]}>
                    EVALUATION RESULTS
                  </Text>

                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'transparent' }}>
                    {assignment.grade && (
                      <DefaultView style={[styles.glowingGradeCircle, { borderColor: course.color, backgroundColor: course.color + '12' }]}>
                        <Text variant="bold" style={{ fontSize: 22, color: course.color }}>
                          {assignment.grade}
                        </Text>
                      </DefaultView>
                    )}

                    <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary }}>GRADED SCORE</Text>
                      <DefaultView style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2, backgroundColor: 'transparent' }}>
                        <Text variant="bold" style={{ fontSize: 22, color: c.text }}>
                          {assignment.score}
                        </Text>
                        <Text variant="regular" style={{ fontSize: 14, color: c.textSecondary }}>
                          / {assignment.totalScore || '100'}
                        </Text>
                      </DefaultView>
                      <Text variant="medium" style={{ fontSize: 10, color: c.green, marginTop: 4 }}>
                        Grade officially committed in course book
                      </Text>
                    </DefaultView>
                  </DefaultView>
                </View>
              ) : (
                /* Un-graded pending evaluation screen */
                <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 8 }]}>
                    EVALUATION TIMELINE
                  </Text>
                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'transparent', paddingVertical: 4 }}>
                    <Ionicons name="hourglass-outline" size={16} color="#EBC063" />
                    <Text variant="medium" style={{ fontSize: 12, color: c.textSecondary, flex: 1, lineHeight: 17 }}>
                      Awaiting verification from instructor. Feedback and official grades will be available within 7 business days.
                    </Text>
                  </DefaultView>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.smallOutlineBtn, { borderColor: course.color, marginTop: 12 }]}
                    onPress={() => {
                      const currentFile = localSub?.fileName || `${assignment.title.replace(/\s+/g, '_')}_solution.pdf`;
                      setUploadingFile(currentFile);
                      assignmentStore.removeSubmission(assignment.title);
                    }}
                  >
                    <Ionicons name="create-outline" size={13} color={course.color} style={{ marginRight: 4 }} />
                    <Text variant="bold" style={{ fontSize: 12, color: course.color }}>Edit Submission</Text>
                  </TouchableOpacity>
                </View>
              )}
            </DefaultView>
          )}

          {/* Description Card */}
          <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
            <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
              ASSIGNMENT OVERVIEW
            </Text>
            <Text variant="regular" style={[styles.bodyText, { color: c.text }]}>
              {assignment.description}
            </Text>
          </View>

          {/* Reference Materials Section */}
          {assignment.resources && assignment.resources.length > 0 && (
            <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
              <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 8 }]}>
                REFERENCE RESOURCES
              </Text>
              <DefaultView style={{ gap: 10, backgroundColor: 'transparent' }}>
                {assignment.resources.map((res, idx) => renderResourceItem(res, idx))}
              </DefaultView>
            </View>
          )}

          {/* Interactive Submission Uploader Block */}
          {isSubmitted ? (
            /* Submission Completed Banner */
            <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
              <DefaultView style={[styles.feedbackSubmittedRow, { backgroundColor: c.green + '12', borderColor: c.green + '30', marginBottom: 12 }]}>
                <Ionicons name="checkmark-circle" size={20} color={c.green} style={{ marginRight: 10 }} />
                <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                  <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Solution Handed In</Text>
                  <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
                    {localSub 
                      ? `Submitted successfully on ${localSub.submittedAt}`
                      : 'Solution file has been successfully uploaded and processed by the system.'}
                  </Text>
                </DefaultView>
              </DefaultView>

              {/* Submitted File Details Row */}
              <DefaultView style={styles.attachedFileCard}>
                <Ionicons name="document-text" size={24} color={course.color} />
                <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                  <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                    {localSub ? localSub.fileName : `${assignment.title.replace(/\s+/g, '_')}_solution.pdf`}
                  </Text>
                  <Text variant="regular" style={{ fontSize: 10, color: c.textSecondary }}>
                    PDF Document • 1.4 MB
                  </Text>
                </DefaultView>
                <DefaultView style={[styles.scoreBadge, { backgroundColor: c.green + '15' }]}>
                  <Text variant="bold" style={{ fontSize: 9, color: c.green }}>SECURED</Text>
                </DefaultView>
              </DefaultView>
            </View>
          ) : (
            /* Open upload submission block */
            <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
              <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 12 }]}>
                SUBMIT SOLUTION
              </Text>

              {uploadingFile ? (
                /* Selected temporary file attachment */
                <DefaultView style={[styles.attachedFileCard, { borderColor: c.green + '50' }]}>
                  <Ionicons name="document-text" size={24} color={c.green} />
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                      {uploadingFile}
                    </Text>
                    <Text variant="regular" style={{ fontSize: 10, color: c.textSecondary }}>
                      PDF Document • 1.2 MB
                    </Text>
                  </DefaultView>
                  <TouchableOpacity 
                    onPress={() => setUploadingFile(null)}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF4A4A" />
                  </TouchableOpacity>
                </DefaultView>
              ) : (
                /* Empty Dashed simulated Zone */
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const formattedTitle = assignment.title.replace(/\s+/g, '_');
                    setUploadingFile(`${formattedTitle}_solution.pdf`);
                  }}
                  style={[
                    styles.uploaderDashedZone,
                    {
                      borderColor: course.color + '40',
                      backgroundColor: course.color + '05',
                    }
                  ]}
                >
                  <Ionicons name="cloud-upload-outline" size={32} color={course.color} />
                  <Text variant="bold" style={{ fontSize: 13, color: c.text, marginTop: 12 }}>
                    Upload Solution Document
                  </Text>
                  <Text variant="regular" style={{ fontSize: 10, color: c.textSecondary, marginTop: 4 }}>
                    Select PDF, ZIP, or DOCX from your device
                  </Text>
                </TouchableOpacity>
              )}

              {/* Action submission buttons */}
              <DefaultView style={{ marginTop: 20, gap: 12, backgroundColor: 'transparent' }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={!uploadingFile}
                  style={{
                    backgroundColor: uploadingFile ? c.green : c.border,
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: uploadingFile ? 1 : 0.6,
                  }}
                  onPress={() => {
                    if (uploadingFile) {
                      assignmentStore.submit(assignment.title, uploadingFile);
                      setUploadingFile(null); // Reset local upload
                    }
                  }}
                >
                  <Text variant="bold" style={{ color: uploadingFile ? '#fff' : c.textSecondary, fontSize: 14 }}>
                    Submit Solution
                  </Text>
                </TouchableOpacity>
              </DefaultView>
            </View>
          )}
        </View>

        {/* Space spacing */}
        <DefaultView style={{ height: 60 }} />
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
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  courseTitle: {
    fontSize: 24,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  panelContainer: {
    paddingHorizontal: 20,
    marginTop: 14,
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
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
  },
  instructionIndexBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    gap: 8,
  },
  materialItemText: {
    fontSize: 12,
    opacity: 0.9,
  },
  rubricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  feedbackSubmittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  attachedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    gap: 10,
  },
  uploaderDashedZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowingGradeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  smallOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  backBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  }
});
