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
import { router, useLocalSearchParams } from 'expo-router';
import { MOCK_COURSES } from '@/constants/MockData';

export default function SessionDetailsScreen() {
  const { courseId, sessionIndex } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // Retrieve matching mock database parameters
  const course = MOCK_COURSES.find(item => item.id === courseId);
  const idx = parseInt(sessionIndex as string, 10);
  const session = course && !isNaN(idx) ? course.sessions[idx] : null;

  // Local interactive states matched to internal page states
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState<boolean>(false);

  if (!course || !session) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={60} color={c.textSecondary} />
        <Text variant="bold" style={{ fontSize: 16, color: c.text, marginTop: 12 }}>
          Session details not found
        </Text>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.back()}
        >
          <Text variant="bold" style={{ color: c.text, fontSize: 12 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Background Accent glow */}
      <DefaultView style={[styles.bgAccent, { backgroundColor: course.color }]} />

      {/* Header Bar */}
      <View style={[styles.headerBar, { borderBottomWidth: 1, borderColor: c.border }]}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.circleBackBtn, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>
        <DefaultView style={{ flex: 1, marginLeft: 12, backgroundColor: 'transparent' }}>
          <Text variant="bold" style={{ fontSize: 8, color: course.color, letterSpacing: 1 }}>
            {course.code} — ACTIVE SESSION
          </Text>
          <Text variant="bold" style={{ fontSize: 13, color: c.text, marginTop: 2 }} numberOfLines={1}>
            {course.title}
          </Text>
        </DefaultView>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.sessionModalScroll}
      >
        <DefaultView style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {/* 1. Header Bar: Session Index and attendance badge row */}
          <DefaultView style={styles.sessionModalHeader}>
            <DefaultView style={styles.sessionModalBadgeRow}>
              <DefaultView style={[styles.badge, { backgroundColor: course.color + '15' }]}>
                <Text variant="bold" style={[styles.badgeText, { color: course.color }]}>
                  Session {idx + 1}
                </Text>
              </DefaultView>
              <DefaultView style={[
                styles.sessionStatusCircle, 
                { 
                  backgroundColor: session.status === 'P' ? c.green : session.status === 'A' ? '#FF4A4A' : '#8E8E93',
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              ]}>
                <Text variant="bold" style={{ fontSize: 10, color: '#000', textAlign: 'center' }}>
                  {session.status}
                </Text>
              </DefaultView>
            </DefaultView>
            
            <Text variant="bold" style={[styles.sessionModalTitle, { color: c.text }]}>
              {session.topic}
            </Text>
            
            {session.subtopic && (
              <Text variant="medium" style={[styles.sessionModalSubtopic, { color: c.textSecondary }]}>
                {session.subtopic}
              </Text>
            )}

            <DefaultView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6, backgroundColor: 'transparent' }}>
              <Ionicons name="time-outline" size={14} color={course.color} />
              <Text variant="semiBold" style={{ fontSize: 12, color: c.textSecondary }}>
                {session.date}  •  {session.time}
              </Text>
            </DefaultView>
          </DefaultView>

          {/* 2. Faculty & PA Information Row */}
          <DefaultView style={styles.peopleGrid}>
            <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <DefaultView style={[styles.peopleAvatar, { backgroundColor: course.color + '15' }]}>
                <Ionicons name="school-outline" size={15} color={course.color} />
              </DefaultView>
              <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                  {session.faculty || course.instructor.name}
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
                  {session.programAssociate || 'Marcus Chen'}
                </Text>
                <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 1 }}>
                  Program Associate
                </Text>
              </DefaultView>
            </View>
          </DefaultView>

          {/* 3. Custom Delivery Mode Widget */}
          {session.type === 'Online' && (
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

              {session.status === 'U' ? (
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

          {session.type === 'Offline' && (
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

                  {session.status === 'U' && (
                    <TouchableOpacity 
                      style={[
                        styles.smallSolidBtn, 
                        { 
                          backgroundColor: isCheckedIn ? c.green + '20' : course.color,
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

          {session.type === 'Hybrid' && (
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

          {/* 4. Session Objective */}
          {session.objective && (
            <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
              <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                SESSION OBJECTIVE
              </Text>
              <Text variant="regular" style={[styles.bodyText, { color: c.text }]}>
                {session.objective}
              </Text>
            </View>
          )}

          {/* 5. Recording Action Card */}
          {session.recordingUrl && (
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

          {/* 6. Learning Materials Container */}
          <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
            <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 8 }]}>
              LEARNING MATERIALS
            </Text>

            {/* Pre-Reads */}
            {session.preReads && session.preReads.length > 0 && (
              <DefaultView style={styles.materialSubGroup}>
                <DefaultView style={styles.materialSubHeader}>
                  <Ionicons name="book-outline" size={13} color={course.color} />
                  <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Pre-Reads Material</Text>
                </DefaultView>
                {session.preReads.map((mat, idx) => renderMaterialItem(mat, idx, 'document-text-outline'))}
              </DefaultView>
            )}

            {/* In-Class */}
            {session.inClassMaterial && session.inClassMaterial.length > 0 && (
              <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                <DefaultView style={styles.materialSubHeader}>
                  <Ionicons name="easel-outline" size={13} color={course.color} />
                  <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>In-Class Material</Text>
                </DefaultView>
                {session.inClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'document-attach-outline'))}
              </DefaultView>
            )}

            {/* Post-Class */}
            {session.postClassMaterial && session.postClassMaterial.length > 0 && (
              <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                <DefaultView style={styles.materialSubHeader}>
                  <Ionicons name="checkbox-outline" size={13} color={course.color} />
                  <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Post-Class Material</Text>
                </DefaultView>
                {session.postClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'clipboard-outline'))}
              </DefaultView>
            )}
          </View>

          {/* 7. Interactive Rating & Feedback Widget for past sessions */}
          {session.status !== 'U' && (
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
                          color={rating >= star ? course.color : c.textSecondary}
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
                        backgroundColor: rating > 0 ? course.color : c.border,
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

        </DefaultView>
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
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.05,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
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
});
