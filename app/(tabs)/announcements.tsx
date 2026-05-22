import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  View as DefaultView, 
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Career' | 'Campus' | 'System';
  timestamp: string;
  isImportant?: boolean;
  author: {
    name: string;
    role: string;
    avatarInitials: string;
  };
  courseCode?: string;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'dean-scholarship',
    title: "Dean's Merit Scholarship Applications Open",
    content: "Applications for the Dean's Merit Scholarship for the 2026 academic year are now officially open. Eligible students with a cumulative GPA of 3.8 or above may apply. Please submit your application statement, transcript, and two faculty letters of recommendation to the Student Affairs office before June 15, 2026.",
    category: 'Academic',
    timestamp: '2 hours ago',
    isImportant: true,
    author: {
      name: "Dr. Angela Thorne",
      role: "Academic Dean",
      avatarInitials: "AT"
    }
  },
  {
    id: 'econ-guidelines',
    title: "ECON-302: Final Term Paper Guidelines Posted",
    content: "Dr. Robert Vance has uploaded the final term paper submission guidelines and grading rubric in the portal. The final paper is worth 40% of your overall grade and must be submitted digitally in PDF format. The deadline is June 20, 2026 at 11:59 PM. Late submissions will face an automatic 5% grade penalty per day.",
    category: 'Academic',
    timestamp: '5 hours ago',
    courseCode: 'ECON-302',
    author: {
      name: "Dr. Robert Vance",
      role: "Professor",
      avatarInitials: "RV"
    }
  },
  {
    id: 'google-pm',
    title: "Summer Cohort: Google PM Internship Prep Session",
    content: "The Career Excellence Center is hosting a specialized prep workshop for the Google Associate Product Manager (APM) internship. Learn interview techniques directly from Coach LMS alumni who are now PMs at Google. The session will cover product design, analytical thinking, and estimation questions. Registration is mandatory.",
    category: 'Career',
    timestamp: '1 day ago',
    author: {
      name: "Marcus Brody",
      role: "Career Director",
      avatarInitials: "MB"
    }
  },
  {
    id: 'spring-gala',
    title: "Annual Spring Cultural Gala & Concert",
    content: "Join us in the central campus courtyard for the annual Spring Cultural Gala and Concert. Enjoy live music, dance performances, and traditional food stalls curated by student cultural societies. Admission is free for all students, and you can bring up to two external guests. Gates open at 5:00 PM.",
    category: 'Campus',
    timestamp: '2 days ago',
    author: {
      name: "Student Affairs",
      role: "Student Council",
      avatarInitials: "SA"
    }
  },
  {
    id: 'system-upgrade',
    title: "Scheduled Portal Maintenance & Upgrades",
    content: "The Coach LMS student portal will undergo scheduled database maintenance this Saturday, May 24, from 2:00 AM to 4:00 AM EST. During this window, you may experience brief login disruptions or slow loading times when fetching course assignments. We recommend completing critical submissions prior to this time.",
    category: 'System',
    timestamp: '3 days ago',
    author: {
      name: "LMS Tech Team",
      role: "System Admin",
      avatarInitials: "TT"
    }
  },
  {
    id: 'career-fair',
    title: "Spring Quarter Virtual Career Expo",
    content: "Connect with over 40 hiring partners at our upcoming Spring Quarter Virtual Career Expo. Representatives from top firms in finance, consulting, and tech will be hosting virtual booths. Have your digital resume ready and wear professional attire. Booking slots for 1-on-1 chats opens this Friday.",
    category: 'Career',
    timestamp: '4 days ago',
    author: {
      name: "Marcus Brody",
      role: "Career Director",
      avatarInitials: "MB"
    }
  }
];

const CATEGORIES = ['All', 'Academic', 'Career', 'Campus', 'System'] as const;

export default function AnnouncementsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // States
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');
  
  // Interactive state lists (persisted in component state for demonstration)
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>(['system-upgrade']); // prepopulate one read item
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Toggle Pinned status
  const togglePin = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPinnedIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Toggle Read status
  const toggleRead = (id: string) => {
    setReadIds(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  // Toggle Accordion Expansion
  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
    // Mark as read automatically when expanded
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allIds = announcements.map(a => a.id);
    setReadIds(allIds);
  };

  // Filter & Sort Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter(a => {
        // Category chip filter
        if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
        
        // Search filter
        if (searchQuery.trim() === '') return true;
        const query = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.author.name.toLowerCase().includes(query) ||
          (a.courseCode && a.courseCode.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        // Pinned items float to the top
        const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
        const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
        return bPinned - aPinned;
      });
  }, [announcements, pinnedIds, selectedCategory, searchQuery]);

  // Unread count
  const unreadCount = useMemo(() => {
    return announcements.filter(a => !readIds.includes(a.id)).length;
  }, [announcements, readIds]);

  // Helper for category colors
  const getCategoryColor = (cat: Announcement['category']) => {
    switch (cat) {
      case 'Academic': return c.gold;
      case 'Career': return c.blue;
      case 'Campus': return c.green;
      case 'System': return '#AF52DE'; // Purple accent
      default: return c.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Background Glow */}
      <DefaultView style={styles.bgAccent} />

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Header */}
        <View style={styles.header}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
            <DefaultView style={{ backgroundColor: 'transparent' }}>
              <Text variant="bold" style={[styles.headerTitle, { color: c.text }]}>
                Announcements
              </Text>
              <Text variant="medium" style={[styles.headerSubtitle, { color: c.textSecondary }]}>
                Shenelle's Inbox • {unreadCount} unread notices
              </Text>
            </DefaultView>

            {unreadCount > 0 && (
              <TouchableOpacity 
                style={[styles.markAllBtn, { borderColor: c.border, backgroundColor: c.card + '50' }]}
                onPress={markAllAsRead}
              >
                <Ionicons name="mail-open-outline" size={14} color={c.gold} />
                <Text variant="bold" style={{ fontSize: 10, color: c.gold, marginLeft: 4 }}>
                  Mark All Read
                </Text>
              </TouchableOpacity>
            )}
          </DefaultView>
        </View>

        {/* Search Bar Wrapper */}
        <View style={styles.searchContainer}>
          <DefaultView style={[styles.searchBarWrapper, { backgroundColor: c.card + '80', borderColor: c.border }]}>
            <Ionicons name="search" size={18} color={c.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search announcements, tags, authors..."
              placeholderTextColor={c.textSecondary + '70'}
              style={[styles.searchInput, { color: c.text }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={c.textSecondary} />
              </TouchableOpacity>
            )}
          </DefaultView>
        </View>

        {/* Horizontal Category Chips */}
        <DefaultView style={{ backgroundColor: 'transparent', marginBottom: 18 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.chipsContent}
          >
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              const count = category === 'All' 
                ? announcements.length 
                : announcements.filter(a => a.category === category).length;

              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: isSelected ? c.gold : c.card + '80', 
                      borderColor: isSelected ? c.gold : c.border 
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text 
                    variant={isSelected ? "bold" : "medium"} 
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#000000' : c.textSecondary }
                    ]}
                  >
                    {category} <Text style={{ fontSize: 9, color: isSelected ? 'rgba(0,0,0,0.6)' : c.textSecondary + '70' }}>({count})</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </DefaultView>

        {/* High-Priority Featured Scholarship Announcement */}
        {selectedCategory === 'All' && searchQuery.trim() === '' && (
          <LinearGradient
            colors={['#2A2315', '#161410']}
            style={[styles.featuredCard, { borderColor: c.gold + '25', borderWidth: 1 }]}
          >
            <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
              <DefaultView style={[styles.featuredTag, { backgroundColor: c.gold + '15' }]}>
                <Ionicons name="sparkles" size={12} color={c.gold} />
                <Text variant="bold" style={{ fontSize: 10, color: c.gold, marginLeft: 4, letterSpacing: 0.5 }}>
                  FEATURED NOTICE
                </Text>
              </DefaultView>

              <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
                <Ionicons name="alert-circle" size={14} color={c.gold} />
                <Text variant="bold" style={{ fontSize: 10, color: c.gold }}>IMPORTANT</Text>
              </DefaultView>
            </DefaultView>

            <Text variant="bold" style={[styles.featuredTitle, { color: c.text }]}>
              Dean's Merit Scholarship 2026
            </Text>

            <Text variant="regular" style={[styles.featuredBody, { color: c.textSecondary }]} numberOfLines={3}>
              Applications for the Dean's Merit Scholarship for the upcoming academic year are officially open. Eligible students with a cumulative GPA of 3.8 or above may submit their portfolios, transcripts, and faculty recommendation letters.
            </Text>

            <DefaultView style={styles.featuredDivider} />

            <DefaultView style={styles.featuredFooter}>
              <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'transparent' }}>
                <DefaultView style={[styles.avatarCircle, { backgroundColor: c.gold + '30', width: 28, height: 28, borderRadius: 14 }]}>
                  <Text variant="bold" style={{ fontSize: 10, color: c.gold }}>AT</Text>
                </DefaultView>
                <DefaultView style={{ backgroundColor: 'transparent' }}>
                  <Text variant="bold" style={{ fontSize: 11, color: c.text }}>Dr. Angela Thorne</Text>
                  <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>Academic Dean</Text>
                </DefaultView>
              </DefaultView>

              <TouchableOpacity 
                style={[styles.featuredActionBtn, { backgroundColor: c.gold }]}
                onPress={() => toggleExpand('dean-scholarship')}
              >
                <Text variant="bold" style={{ fontSize: 11, color: '#000000' }}>
                  {expandedIds.includes('dean-scholarship') ? 'Collapse Details' : 'View Guidelines'}
                </Text>
                <Ionicons 
                  name={expandedIds.includes('dean-scholarship') ? 'chevron-up' : 'chevron-forward'} 
                  size={12} 
                  color="#000000" 
                  style={{ marginLeft: 4 }} 
                />
              </TouchableOpacity>
            </DefaultView>

            {/* Collapsible Guidelines expansion inside featured card */}
            {expandedIds.includes('dean-scholarship') && (
              <DefaultView style={styles.expandedContent}>
                <DefaultView style={[styles.guidelineBox, { borderColor: c.border, backgroundColor: c.card + '40' }]}>
                  <Text variant="bold" style={{ fontSize: 12, color: c.text, marginBottom: 6 }}>
                    Submission Requirements:
                  </Text>
                  <Text variant="regular" style={{ fontSize: 11, color: c.textSecondary, lineHeight: 16 }}>
                    • Cumulative GPA must be 3.80 or higher as of Spring 2026.{"\n"}
                    • Submit a 1,000-word academic statement detailing personal achievements and contributions.{"\n"}
                    • Obtain two sealed letters of recommendation from faculty members in your department.{"\n"}
                    • Submit all physical portfolios directly to the Student Affairs office before June 15, 2026 at 5:00 PM.
                  </Text>
                </DefaultView>
              </DefaultView>
            )}
          </LinearGradient>
        )}

        {/* Regular Announcements Header */}
        <DefaultView style={[styles.sectionTitleRow, { backgroundColor: 'transparent' }]}>
          <Text variant="bold" style={{ fontSize: 12, color: c.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {searchQuery ? 'SEARCH RESULTS' : 'GENERAL LEDGER'}
          </Text>
          <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary }}>
            Showing {filteredAnnouncements.length} notices
          </Text>
        </DefaultView>

        {/* Announcements List Container */}
        {filteredAnnouncements.length === 0 ? (
          <DefaultView style={[styles.emptyCard, { backgroundColor: c.card + '60', borderColor: c.border }]}>
            <Ionicons name="notifications-off-outline" size={40} color={c.textSecondary + '40'} />
            <Text variant="bold" style={{ fontSize: 14, color: c.text, marginTop: 12 }}>
              No Announcements Found
            </Text>
            <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
              Try adjusting your category filter chips or refining your search queries.
            </Text>
          </DefaultView>
        ) : (
          filteredAnnouncements.map((item) => {
            const isPinned = pinnedIds.includes(item.id);
            const isRead = readIds.includes(item.id);
            const isExpanded = expandedIds.includes(item.id);
            const themeColor = getCategoryColor(item.category);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => toggleExpand(item.id)}
                style={[
                  styles.announcementCard,
                  { 
                    backgroundColor: c.card, 
                    borderColor: isPinned ? c.gold + '40' : c.border,
                    borderWidth: 1
                  }
                ]}
              >
                {/* Top action row */}
                <DefaultView style={styles.cardHeader}>
                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'transparent' }}>
                    <DefaultView style={[styles.avatarCircle, { backgroundColor: themeColor + '20', width: 34, height: 34, borderRadius: 17 }]}>
                      <Text variant="bold" style={{ fontSize: 11, color: themeColor }}>
                        {item.author.avatarInitials}
                      </Text>
                    </DefaultView>
                    
                    <DefaultView style={{ backgroundColor: 'transparent' }}>
                      <Text variant="bold" style={{ fontSize: 12, color: c.text }}>
                        {item.author.name}
                      </Text>
                      <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                        {item.author.role} • {item.timestamp}
                      </Text>
                    </DefaultView>
                  </DefaultView>

                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'transparent' }}>
                    {/* Pin button */}
                    <TouchableOpacity 
                      style={styles.actionIconTouch}
                      onPress={() => togglePin(item.id)}
                    >
                      <Ionicons 
                        name={isPinned ? "pin" : "pin-outline"} 
                        size={16} 
                        color={isPinned ? c.gold : c.textSecondary + '70'} 
                      />
                    </TouchableOpacity>

                    {/* Unread indicator */}
                    {!isRead ? (
                      <DefaultView style={[styles.unreadDot, { backgroundColor: c.blue }]} />
                    ) : (
                      <Ionicons name="checkmark-circle-outline" size={14} color={c.green + '80'} />
                    )}
                  </DefaultView>
                </DefaultView>

                {/* Card Title & Content */}
                <DefaultView style={[styles.cardBody, { backgroundColor: 'transparent' }]}>
                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap', backgroundColor: 'transparent' }}>
                    {/* Category tag badge */}
                    <DefaultView style={[styles.catBadge, { backgroundColor: themeColor + '12', borderColor: themeColor + '30', borderWidth: 1 }]}>
                      <Text variant="bold" style={{ fontSize: 8, color: themeColor, textTransform: 'uppercase' }}>
                        {item.category}
                      </Text>
                    </DefaultView>
                    
                    {/* Course Code Tag */}
                    {item.courseCode && (
                      <DefaultView style={[styles.catBadge, { backgroundColor: c.gold + '10', borderColor: c.gold + '25', borderWidth: 1 }]}>
                        <Text variant="bold" style={{ fontSize: 8, color: c.gold }}>
                          {item.courseCode}
                        </Text>
                      </DefaultView>
                    )}

                    {/* Pinned Tag indicator */}
                    {isPinned && (
                      <DefaultView style={[styles.catBadge, { backgroundColor: c.gold + '15', borderColor: c.gold + '30', borderWidth: 1, flexDirection: 'row', gap: 3 }]}>
                        <Ionicons name="pin" size={8} color={c.gold} />
                        <Text variant="bold" style={{ fontSize: 8, color: c.gold }}>PINNED</Text>
                      </DefaultView>
                    )}
                  </DefaultView>

                  <Text 
                    variant="bold" 
                    style={[
                      styles.cardTitle, 
                      { color: isRead ? c.text + '80' : c.text }
                    ]}
                  >
                    {item.title}
                  </Text>

                  <Text 
                    variant="regular" 
                    style={[
                      styles.cardContentText, 
                      { color: c.textSecondary, marginTop: 4 }
                    ]}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {item.content}
                  </Text>
                </DefaultView>

                {/* Inline Action Drawer for expanded state */}
                {isExpanded ? (
                  <DefaultView style={[styles.expandedDrawer, { borderTopColor: c.border }]}>
                    <TouchableOpacity 
                      style={[styles.drawerBtn, { borderColor: c.border, backgroundColor: c.cardSecondary }]}
                      onPress={() => toggleRead(item.id)}
                    >
                      <Ionicons 
                        name={isRead ? "mail-outline" : "mail-open-outline"} 
                        size={14} 
                        color={c.textSecondary} 
                      />
                      <Text variant="bold" style={{ fontSize: 11, color: c.textSecondary, marginLeft: 5 }}>
                        {isRead ? 'Mark as Unread' : 'Mark as Read'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.drawerBtn, { borderColor: c.border, backgroundColor: c.cardSecondary }]}
                      onPress={() => toggleExpand(item.id)}
                    >
                      <Ionicons name="chevron-up" size={14} color={c.textSecondary} />
                      <Text variant="bold" style={{ fontSize: 11, color: c.textSecondary, marginLeft: 5 }}>
                        Collapse Row
                      </Text>
                    </TouchableOpacity>
                  </DefaultView>
                ) : (
                  <DefaultView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: 'transparent' }}>
                    <Text variant="bold" style={{ fontSize: 11, color: c.gold }}>Read full announcement</Text>
                    <Ionicons name="chevron-down" size={12} color={c.gold} style={{ marginLeft: 3 }} />
                  </DefaultView>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* Spacing bottom */}
        <DefaultView style={{ height: 110 }} />
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
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#EBC063',
    opacity: 0.03,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 28,
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
  },
  chipsContent: {
    paddingRight: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
  },
  featuredCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#EBC063',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredTitle: {
    fontSize: 18,
    marginTop: 12,
  },
  featuredBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  featuredDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatarCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
  },
  expandedContent: {
    marginTop: 14,
    backgroundColor: 'transparent',
  },
  guidelineBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  actionIconTouch: {
    padding: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardBody: {
    marginBottom: 2,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  cardContentText: {
    fontSize: 12,
    lineHeight: 17,
  },
  expandedDrawer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  drawerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 28,
  },
});
