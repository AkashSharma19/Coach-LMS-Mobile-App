import React, { useState, useMemo, useRef } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform,
  Modal,
  TextInput,
  Animated,
  Linking
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

// Premium interactive mock events dataset
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Hand Shake Annual Tech Summit 2026',
    speaker: 'Dr. Elena Rostova & Guest Panel',
    dateStr: 'May 28, 2026',
    timeStr: '10:00 AM - 3:00 PM',
    location: 'Campus Grand Seminar Hall',
    type: 'In-Person',
    format: 'Summit',
    description: 'An interactive keynotes panel on the future of generative models, cross-platform apps, and building user-first product systems.',
    color: '#FF453A',
  },
  {
    id: '2',
    title: 'React Native Advanced Performance Workshop',
    speaker: 'Gautam Kumar (Lead Architect)',
    dateStr: 'June 02, 2026',
    timeStr: '4:00 PM - 5:30 PM',
    location: 'Zoom Virtual Webinar',
    type: 'Online',
    format: 'Webinar',
    description: 'A deep-dive tutorial focusing on custom reanimated nodes, main thread performance optimizations, and bridge-free architectures.',
    color: '#34C759',
  },
  {
    id: '3',
    title: 'Creative UX Design Sprint & Ideation Hack',
    speaker: 'Sophia Chen (VP UX Outclass)',
    dateStr: 'June 10, 2026',
    timeStr: '9:00 AM - 6:00 PM',
    location: 'Design Studio A, Building 3',
    type: 'In-Person',
    format: 'Hackathon',
    description: 'Collaborative UI design challenge brainstorming smart LMS widgets and gamified outline layouts.',
    color: '#FF9F0A',
  },
  {
    id: '4',
    title: 'Global Inflation & Central Bank Policy Panel',
    speaker: 'Prof. Richard Finch (Economics)',
    dateStr: 'June 15, 2026',
    timeStr: '2:00 PM - 3:30 PM',
    location: 'Zoom Virtual Panel',
    type: 'Online',
    format: 'Webinar',
    description: 'Macroeconomics expert outline investigating post-pandemic interest rates, green tax systems, and public treasury inflation impacts.',
    color: '#EBC063',
  },
  // Past events
  {
    id: '5',
    title: 'Behavioral Psychology in Design Forums',
    speaker: 'Dr. Marcus Vance',
    dateStr: 'May 12, 2026',
    timeStr: '11:00 AM - 12:30 PM',
    location: 'Campus Aud. 4',
    type: 'In-Person',
    format: 'Forum',
    description: 'Investigating core attention patterns, psychological hooks, and visual hierarchies that improve user retention.',
    color: '#8E8E93',
    recordingUrl: 'https://youtube.com/watch?v=event5-rec',
    slidesUrl: 'https://coach-lms.edu/slides/psych-design.pdf'
  },
  {
    id: '6',
    title: 'Intro to High-Growth Startup Financing',
    speaker: 'Alumni Capital Group Partners',
    dateStr: 'May 08, 2026',
    timeStr: '3:00 PM - 5:00 PM',
    location: 'Virtual Zoom Stream',
    type: 'Online',
    format: 'Webinar',
    description: 'Understanding pre-seed dilution metrics, investor term outlines, cap table math, and preparing pitch presentations.',
    color: '#8E8E93',
    recordingUrl: 'https://youtube.com/watch?v=event6-rec'
  }
];

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'rsvps' | 'past'>('upcoming');

  // Simulated registration states
  const [rsvpedEventIds, setRsvpedEventIds] = useState<Record<string, boolean>>({
    // Pre-registered mock item to demonstrate 'My RSVPs' tab immediately if needed
  });
  const [registeringIds, setRegisteringIds] = useState<Record<string, boolean>>({});
  const [seatAssignments, setSeatAssignments] = useState<Record<string, string>>({});

  // Ticket Pass details modal overlay
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<typeof MOCK_EVENTS[0] | null>(null);
  const [isTicketModalVisible, setIsTicketModalVisible] = useState<boolean>(false);

  // Floating Toast success banner animation
  const [toastMessage, setToastMessage] = useState<string>('');
  const toastY = useRef(new Animated.Value(-100)).current;

  // Handle Dynamic Toast Trigger
  const triggerToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastY, {
        toValue: Platform.OS === 'ios' ? 55 : 45,
        duration: 350,
        useNativeDriver: true
      }),
      Animated.delay(2200),
      Animated.timing(toastY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  // Simulated active RSVP registration action
  const handleRsvpPress = (event: typeof MOCK_EVENTS[0]) => {
    const eventId = event.id;
    if (rsvpedEventIds[eventId] || registeringIds[eventId]) return;

    setRegisteringIds(prev => ({ ...prev, [eventId]: true }));

    // Simulate server call
    setTimeout(() => {
      // Assign seat number or access passcode
      const randSeat = event.type === 'Online' 
        ? `ZOOM-PASS-${Math.floor(Math.random() * 8999) + 1000}`
        : `SEAT-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 120) + 1}`;

      setSeatAssignments(prev => ({ ...prev, [eventId]: randSeat }));
      setRsvpedEventIds(prev => ({ ...prev, [eventId]: true }));
      setRegisteringIds(prev => ({ ...prev, [eventId]: false }));

      triggerToast(`Successfully registered for ${event.title.split('—')[0].trim()}!`);
    }, 1200);
  };

  // Compile feeds
  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => {
      const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isPast = event.hasOwnProperty('recordingUrl');
      
      if (activeTab === 'past') {
        return matchSearch && isPast;
      }
      if (activeTab === 'rsvps') {
        return matchSearch && !isPast && rsvpedEventIds[event.id];
      }
      // 'upcoming' tab
      return matchSearch && !isPast;
    });
  }, [searchQuery, activeTab, rsvpedEventIds]);

  const getTabLabelCount = (tab: 'upcoming' | 'rsvps' | 'past') => {
    if (tab === 'past') {
      return MOCK_EVENTS.filter(e => e.hasOwnProperty('recordingUrl')).length;
    }
    if (tab === 'rsvps') {
      return Object.keys(rsvpedEventIds).filter(key => rsvpedEventIds[key]).length;
    }
    return MOCK_EVENTS.filter(e => !e.hasOwnProperty('recordingUrl')).length;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top visual accent blur */}
      <DefaultView style={styles.bgAccent} />

      {/* FLOATING SUCCESS TOAST ALERTS BANNER */}
      <Animated.View 
        style={[
          styles.toastBanner, 
          { 
            backgroundColor: '#34C759', 
            transform: [{ translateY: toastY }] 
          }
        ]}
      >
        <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
        <Text variant="bold" style={styles.toastText} numberOfLines={2}>
          {toastMessage}
        </Text>
      </Animated.View>

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
            Campus Events
          </Text>
          <Text variant="bold" style={{ fontSize: 8, color: c.gold, marginTop: 2, letterSpacing: 0.5 }}>
            FORUMS • WEBINARS • SUMMITS
          </Text>
        </DefaultView>
      </View>

      {/* Interactive Search Bar Section */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={16} color={c.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search seminars, guest panels..."
            placeholderTextColor={c.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: c.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={16} color={c.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CLICKABLE TIMELINE SEGMENT TABS */}
      <DefaultView style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsScrollContent}
        >
          {(['upcoming', 'rsvps', 'past'] as const).map(tab => {
            const isSelected = activeTab === tab;
            const count = getTabLabelCount(tab);
            const label = tab === 'upcoming' ? 'Upcoming' : tab === 'rsvps' ? 'My RSVPs' : 'Past Archives';
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
                  { 
                    backgroundColor: isSelected ? c.gold + '15' : c.card,
                    borderColor: isSelected ? c.gold : c.border
                  }
                ]}
              >
                <Text 
                  variant="bold" 
                  style={{ 
                    fontSize: 11, 
                    color: isSelected ? c.gold : c.textSecondary 
                  }}
                >
                  {label.toUpperCase()} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </DefaultView>

      {/* EVENTS CARD GRID FEED */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredEvents.length === 0 ? (
          <DefaultView style={styles.emptyView}>
            <Ionicons name="calendar-outline" size={44} color={c.textSecondary} style={{ marginBottom: 12, opacity: 0.6 }} />
            <Text variant="bold" style={{ fontSize: 13, color: c.text, textAlign: 'center' }}>
              No campus events found
            </Text>
            <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 4, textAlign: 'center', maxWidth: 220 }}>
              Try searching different keywords or checking alternative tabs.
            </Text>
          </DefaultView>
        ) : (
          <DefaultView style={{ gap: 12, backgroundColor: 'transparent' }}>
            {filteredEvents.map(event => {
              const isRsvped = rsvpedEventIds[event.id];
              const isRegistering = registeringIds[event.id];
              const isPast = event.hasOwnProperty('recordingUrl');

              return (
                <View 
                  key={event.id} 
                  style={[styles.eventCard, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  {/* Subject Domain left stripe indicator */}
                  <DefaultView style={[styles.domainStripe, { backgroundColor: event.color }]} />

                  {/* Card main contents */}
                  <DefaultView style={styles.cardHeader}>
                    <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, backgroundColor: 'transparent' }}>
                        <Ionicons 
                          name={event.type === 'Online' ? 'videocam' : 'location'} 
                          size={12} 
                          color={event.color} 
                        />
                        <Text variant="bold" style={{ fontSize: 9, color: event.color, letterSpacing: 0.4 }}>
                          {event.type.toUpperCase()} • {event.format.toUpperCase()}
                        </Text>
                      </DefaultView>
                      
                      <Text variant="bold" style={[styles.eventTitle, { color: c.text }]}>
                        {event.title}
                      </Text>
                    </DefaultView>
                  </DefaultView>

                  <DefaultView style={styles.cardBody}>
                    <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, lineHeight: 15 }} numberOfLines={3}>
                      {event.description}
                    </Text>

                    <DefaultView style={styles.divider} />

                    {/* Metadata lines */}
                    <DefaultView style={styles.metadataBlock}>
                      <DefaultView style={styles.metaRow}>
                        <Ionicons name="person-outline" size={12} color={c.textSecondary} />
                        <Text variant="medium" style={[styles.metaText, { color: c.textSecondary }]}>
                          Host: {event.speaker}
                        </Text>
                      </DefaultView>

                      <DefaultView style={styles.metaRow}>
                        <Ionicons name="time-outline" size={12} color={c.textSecondary} />
                        <Text variant="medium" style={[styles.metaText, { color: c.textSecondary }]}>
                          {event.dateStr} • {event.timeStr}
                        </Text>
                      </DefaultView>

                      <DefaultView style={styles.metaRow}>
                        <Ionicons name="pin-outline" size={12} color={c.textSecondary} />
                        <Text variant="medium" style={[styles.metaText, { color: c.textSecondary }]} numberOfLines={1}>
                          Venue: {event.location}
                        </Text>
                      </DefaultView>
                    </DefaultView>

                    {/* Interactive state action bars */}
                    <DefaultView style={[styles.actionRow, { marginTop: 14 }]}>
                      {isPast ? (
                        <DefaultView style={{ flexDirection: 'row', gap: 8, flex: 1, backgroundColor: 'transparent' }}>
                          <TouchableOpacity 
                            style={[styles.actionBtn, { flex: 1, backgroundColor: c.border + '30', borderColor: c.border }]} 
                            onPress={() => Linking.openURL(event.recordingUrl || '')}
                          >
                            <Ionicons name="play-circle-outline" size={15} color={c.text} style={{ marginRight: 6 }} />
                            <Text variant="bold" style={{ fontSize: 11, color: c.text }}>
                              Watch Stream
                            </Text>
                          </TouchableOpacity>
                          {event.slidesUrl && (
                            <TouchableOpacity 
                              style={[styles.actionBtn, { flex: 1, backgroundColor: c.border + '30', borderColor: c.border }]} 
                              onPress={() => Linking.openURL(event.slidesUrl || '')}
                            >
                              <Ionicons name="document-text-outline" size={15} color={c.text} style={{ marginRight: 6 }} />
                              <Text variant="bold" style={{ fontSize: 11, color: c.text }}>
                                Study Deck
                              </Text>
                            </TouchableOpacity>
                          )}
                        </DefaultView>
                      ) : isRsvped ? (
                        <DefaultView style={{ flexDirection: 'row', gap: 8, flex: 1, backgroundColor: 'transparent' }}>
                          <DefaultView style={[styles.actionBtn, { flex: 1.2, backgroundColor: '#34C75915', borderColor: '#34C759' }]}>
                            <Ionicons name="checkmark-circle" size={15} color="#34C759" style={{ marginRight: 6 }} />
                            <Text variant="bold" style={{ fontSize: 11, color: '#34C759' }}>
                              RSVP REGISTERED
                            </Text>
                          </DefaultView>

                          <TouchableOpacity 
                            style={[styles.actionBtn, { flex: 0.8, backgroundColor: c.gold + '15', borderColor: c.gold }]}
                            onPress={() => {
                              setSelectedTicketEvent(event);
                              setIsTicketModalVisible(true);
                            }}
                          >
                            <Ionicons name="qr-code-outline" size={14} color={c.gold} style={{ marginRight: 6 }} />
                            <Text variant="bold" style={{ fontSize: 11, color: c.gold }}>
                              VIEW PASS
                            </Text>
                          </TouchableOpacity>
                        </DefaultView>
                      ) : (
                        <TouchableOpacity 
                          style={[styles.actionBtn, { flex: 1, backgroundColor: c.gold }]}
                          activeOpacity={0.8}
                          onPress={() => handleRsvpPress(event)}
                        >
                          {isRegistering ? (
                            <Text variant="bold" style={{ fontSize: 11, color: '#000' }}>
                              Securing Seat...
                            </Text>
                          ) : (
                            <>
                              <Ionicons name="calendar-outline" size={14} color="#000" style={{ marginRight: 6 }} />
                              <Text variant="bold" style={{ fontSize: 11, color: '#000' }}>
                                Register RSVP Pass
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </DefaultView>
                  </DefaultView>
                </View>
              );
            })}
          </DefaultView>
        )}
      </ScrollView>

      {/* GLASSMORPHIC DIGITAL TICKET PASS OVERLAY MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTicketModalVisible}
        onRequestClose={() => setIsTicketModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsTicketModalVisible(false)}
        >
          <DefaultView style={{ flex: 1 }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />
          
          <TouchableOpacity style={styles.closeIconBtn} onPress={() => setIsTicketModalVisible(false)}>
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </TouchableOpacity>

          {selectedTicketEvent && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <DefaultView style={styles.modalHeader}>
                <Text variant="bold" style={{ fontSize: 8, color: c.gold, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Hand Shake Official Campus Pass
                </Text>
                <Text variant="bold" style={[styles.modalTitle, { color: c.text, fontSize: 18, marginTop: 4 }]}>
                  Entry Ticket Secured
                </Text>
              </DefaultView>

              {/* Ticket Passcard Outline */}
              <View style={[styles.ticketBodyCard, { backgroundColor: c.card, borderColor: c.border }]}>
                {/* Domain stripe */}
                <DefaultView style={[styles.ticketDomainStripe, { backgroundColor: selectedTicketEvent.color }]} />

                <Text variant="bold" style={{ fontSize: 14, color: c.text, marginBottom: 4 }}>
                  {selectedTicketEvent.title}
                </Text>
                
                <Text variant="medium" style={{ fontSize: 11, color: selectedTicketEvent.color, marginBottom: 12 }}>
                  {selectedTicketEvent.type} {selectedTicketEvent.format} Pass
                </Text>

                <DefaultView style={styles.ticketGrid}>
                  <DefaultView style={styles.ticketGridCol}>
                    <Text variant="regular" style={styles.ticketLabel}>SEAT / ACCESS</Text>
                    <Text variant="bold" style={[styles.ticketValue, { color: c.text }]}>
                      {seatAssignments[selectedTicketEvent.id] || 'ZOOM-ACCESS'}
                    </Text>
                  </DefaultView>

                  <DefaultView style={styles.ticketGridCol}>
                    <Text variant="regular" style={styles.ticketLabel}>STATUS</Text>
                    <Text variant="bold" style={[styles.ticketValue, { color: '#34C759' }]}>CONFIRMED</Text>
                  </DefaultView>
                </DefaultView>

                <DefaultView style={[styles.ticketGrid, { marginTop: 12 }]}>
                  <DefaultView style={styles.ticketGridCol}>
                    <Text variant="regular" style={styles.ticketLabel}>DATE</Text>
                    <Text variant="bold" style={[styles.ticketValue, { color: c.text }]}>
                      {selectedTicketEvent.dateStr}
                    </Text>
                  </DefaultView>

                  <DefaultView style={styles.ticketGridCol}>
                    <Text variant="regular" style={styles.ticketLabel}>TIME</Text>
                    <Text variant="bold" style={[styles.ticketValue, { color: c.text }]} numberOfLines={1}>
                      {selectedTicketEvent.timeStr.split(' ')[0]} {selectedTicketEvent.timeStr.split(' ').slice(1).join(' ')}
                    </Text>
                  </DefaultView>
                </DefaultView>

                <DefaultView style={styles.divider} />

                {/* Simulated Premium QR Code Pass graphic box */}
                <DefaultView style={styles.qrCodeContainer}>
                  <DefaultView style={[styles.qrWrapper, { borderColor: c.border }]}>
                    {/* Visual QR Code outline grid */}
                    <DefaultView style={[styles.qrSquareBlock, { backgroundColor: c.text }]} />
                    <DefaultView style={[styles.qrSquareBlock, { backgroundColor: c.text, position: 'absolute', top: 12, right: 12 }]} />
                    <DefaultView style={[styles.qrSquareBlock, { backgroundColor: c.text, position: 'absolute', bottom: 12, left: 12 }]} />
                    <DefaultView style={[styles.qrCenterDot, { backgroundColor: c.gold }]} />
                    
                    {/* Scanner line indicator */}
                    <DefaultView style={[styles.qrScannerLine, { backgroundColor: c.gold }]} />
                  </DefaultView>

                  <Text variant="regular" style={{ fontSize: 9, color: c.textSecondary, marginTop: 8 }}>
                    SCAN PASS AT SEMINAR DOOR
                  </Text>
                </DefaultView>
              </View>

              {/* Close controls button */}
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: c.gold, marginTop: 20 }]}
                activeOpacity={0.8}
                onPress={() => setIsTicketModalVisible(false)}
              >
                <Text variant="bold" style={{ fontSize: 13, color: '#000' }}>
                  Got It, Thanks!
                </Text>
              </TouchableOpacity>
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
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FF453A',
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
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  clearSearchBtn: {
    padding: 4,
  },
  tabsWrapper: {
    marginBottom: 16,
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyView: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    paddingLeft: 4,
  },
  domainStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 14,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  eventTitle: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    opacity: 0.15,
    marginVertical: 10,
  },
  metadataBlock: {
    gap: 6,
    backgroundColor: 'transparent',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  metaText: {
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
  },

  // DIGITAL TICKET MODAL OVERLAY
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
  ticketBodyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    paddingLeft: 20,
  },
  ticketDomainStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
  },
  ticketGrid: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    gap: 20,
  },
  ticketGridCol: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  ticketLabel: {
    fontSize: 8,
    color: '#8E8E93',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  ticketValue: {
    fontSize: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  qrWrapper: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  qrSquareBlock: {
    width: 32,
    height: 32,
    borderWidth: 5,
    borderColor: 'transparent',
    borderRadius: 6,
    opacity: 0.8,
  },
  qrCenterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  qrScannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    top: '48%',
    opacity: 0.6,
  },
  applyBtn: {
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // TOAST ALERTS BANNER FLOATING
  toastBanner: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    fontSize: 11,
    color: '#FFF',
    flex: 1,
  },
});
