import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  View as DefaultView,
  Platform
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

interface ModuleItem {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: 'Academics' | 'Utilities' | 'Community';
}

const MODULES: ModuleItem[] = [
  { id: 'course', name: 'Course', description: 'Enrolled syllabi & materials', icon: 'book', color: '#EBC063', category: 'Academics' },
  { id: 'schedule', name: 'Schedule', description: 'Timeline & lecture times', icon: 'calendar', color: '#4A90E2', category: 'Academics' },
  { id: 'attendance', name: 'Attendance', description: 'Class presence tracker', icon: 'checkmark-done-circle', color: '#4CAF50', category: 'Academics' },
  { id: 'grades', name: 'Grades', description: 'Performance & GPA metrics', icon: 'school', color: '#FF453A', category: 'Academics' },
  { id: 'assignments', name: 'Assignments', description: 'Project briefs & submissions', icon: 'document-text', color: '#FF9F0A', category: 'Academics' },
  { id: 'messages', name: 'Messages', description: 'Student-faculty chat', icon: 'chatbubbles', color: '#30D158', category: 'Community' },
  { id: 'academic-summary', name: 'Academic Summary', description: 'Term progress reports', icon: 'stats-chart', color: '#BF5AF2', category: 'Academics' },
  { id: 'help-support', name: 'Help & Support', description: 'Support desk & ticketing', icon: 'help-buoy', color: '#8E8E93', category: 'Utilities' },
  { id: 'outclass', name: 'Outclass', description: 'Extra-curricular student clubs', icon: 'trophy', color: '#FFD60A', category: 'Community' },
  { id: 'repository', name: 'Repository', description: 'Past papers & resources', icon: 'folder-open', color: '#64D2FF', category: 'Academics' },
  { id: 'nps', name: 'NPS', description: 'Net promoter score survey', icon: 'heart', color: '#FF375F', category: 'Community' },
  { id: 'fee-management', name: 'Fee Management', description: 'Tuition dues & invoicing', icon: 'card', color: '#34C759', category: 'Utilities' },
  { id: 'news', name: 'News', description: 'Daily campus bulletins', icon: 'newspaper', color: '#5E5CE6', category: 'Community' },
  { id: 'photos', name: 'Photos', description: 'Events & gallery archives', icon: 'images', color: '#0A84FF', category: 'Community' },
  { id: 'downloads', name: 'Downloads', description: 'Syllabus files & offline PDFs', icon: 'download', color: '#BF5AF2', category: 'Utilities' },
  { id: 'sticky-notes', name: 'Sticky Notes', description: 'Personal study memos', icon: 'pencil', color: '#FFD60A', category: 'Utilities' },
  { id: 'mentorunion', name: 'Mentorunion', description: 'Alumni mentorship networks', icon: 'people', color: '#30D158', category: 'Community' },
  { id: 'events', name: 'Events', description: 'Forums, webinars & summits', icon: 'megaphone', color: '#FF453A', category: 'Community' },
];

const CATEGORY_ICONS: Record<'Academics' | 'Utilities' | 'Community', keyof typeof Ionicons.glyphMap> = {
  'Academics': 'school-outline',
  'Utilities': 'construct-outline',
  'Community': 'people-outline',
};

const CATEGORY_COLORS: Record<'Academics' | 'Utilities' | 'Community', string> = {
  'Academics': '#EBC063',
  'Utilities': '#4A90E2',
  'Community': '#30D158',
};

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // States
  const [searchQuery, setSearchQuery] = useState('');

  // Main filtered module list
  const filteredModules = useMemo(() => {
    return MODULES.filter(item => {
      // Search Box Filter
      if (searchQuery.trim() === '') return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Get active categories to display
  const activeCategories = ['Academics', 'Utilities', 'Community'] as const;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Background Accent overlay */}
      <DefaultView style={styles.bgAccent} />

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sleek Header */}
        <View style={styles.header}>
          <Text variant="bold" style={[styles.headerTitle, { color: c.text }]}>
            Explore Services
          </Text>
          <Text variant="medium" style={[styles.headerSubtitle, { color: c.textSecondary }]}>
            Shenelle's Utility Hub • {MODULES.length} active modules
          </Text>
        </View>

        {/* Search Bar Container */}
        <View style={styles.searchContainer}>
          <DefaultView style={[styles.searchBarWrapper, { backgroundColor: c.card + '80', borderColor: c.border }]}>
            <Ionicons name="search" size={18} color={c.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search courses, invoicing, events..."
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



        {/* Module responsive 2-column Grid divided by Category */}
        {filteredModules.length === 0 ? (
          <DefaultView style={[styles.emptyCard, { backgroundColor: c.card + '60', borderColor: c.border }]}>
            <Ionicons name="search-outline" size={40} color={c.textSecondary + '40'} />
            <Text variant="bold" style={{ fontSize: 14, color: c.text, marginTop: 12 }}>
              No Modules Found
            </Text>
            <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
              Try searching different keywords.
            </Text>
          </DefaultView>
        ) : (
          activeCategories.map((category) => {
            const categoryModules = filteredModules.filter(m => m.category === category);
            if (categoryModules.length === 0) return null;

            return (
              <DefaultView key={category} style={styles.sectionContainer}>
                {/* Category Header */}
                <DefaultView style={styles.categoryHeader}>
                  <DefaultView style={styles.categoryHeaderLeft}>
                    <DefaultView style={[styles.categoryIconCircle, { backgroundColor: CATEGORY_COLORS[category] + '12' }]}>
                      <Ionicons 
                        name={CATEGORY_ICONS[category]} 
                        size={15} 
                        color={CATEGORY_COLORS[category]} 
                      />
                    </DefaultView>
                    <Text variant="bold" style={[styles.categoryTitle, { color: c.text }]}>
                      {category}
                    </Text>
                  </DefaultView>
                  <DefaultView style={[styles.categoryCountBadge, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
                    <Text variant="bold" style={[styles.categoryCountText, { color: c.textSecondary }]}>
                      {categoryModules.length} {categoryModules.length === 1 ? 'module' : 'modules'}
                    </Text>
                  </DefaultView>
                </DefaultView>

                {/* Module responsive 2-column Grid for this category */}
                <DefaultView style={styles.gridContainer}>
                  {categoryModules.map((item) => {
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (item.id === 'course') {
                            router.push('/courses');
                          } else if (item.id === 'schedule') {
                            router.push('/schedule');
                          } else if (item.id === 'attendance') {
                            router.push('/attendance');
                          } else if (item.id === 'grades' || item.id === 'academic-summary') {
                            router.push('/grades');
                          } else if (item.id === 'assignments') {
                            router.push('/assignments');
                          } else if (item.id === 'repository') {
                            router.push('/repository');
                          }
                        }}
                        style={[
                          styles.moduleCard,
                          { 
                            backgroundColor: c.card, 
                            borderColor: c.border,
                            borderWidth: 1
                          }
                        ]}
                      >
                        {/* Top card row */}
                        <DefaultView style={styles.cardHeaderRow}>
                          <DefaultView style={[styles.iconCircle, { backgroundColor: item.color + '12' }]}>
                            <Ionicons name={item.icon} size={18} color={item.color} />
                          </DefaultView>
                        </DefaultView>

                        {/* Body description */}
                        <DefaultView style={{ marginTop: 14, backgroundColor: 'transparent' }}>
                          <Text variant="bold" style={[styles.moduleName, { color: c.text }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text variant="medium" style={[styles.moduleDesc, { color: c.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                            {item.description}
                          </Text>
                        </DefaultView>

                        {/* Category mini-badge */}
                        <DefaultView style={{ flexDirection: 'row', marginTop: 10, backgroundColor: 'transparent' }}>
                          <DefaultView style={[styles.catBadge, { backgroundColor: c.cardSecondary, borderColor: c.border, borderWidth: 1 }]}>
                            <Text variant="bold" style={{ fontSize: 7, color: c.textSecondary, textTransform: 'uppercase' }}>
                              {item.category}
                            </Text>
                          </DefaultView>
                        </DefaultView>
                      </TouchableOpacity>
                    );
                  })}
                </DefaultView>
              </DefaultView>
            );
          })
        )}

        {/* Space Bottom */}
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

  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    backgroundColor: 'transparent',
  },

  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  moduleCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moduleName: {
    fontSize: 13,
  },
  moduleDesc: {
    fontSize: 10,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.3,
  },
  categoryCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCountText: {
    fontSize: 9,
    fontFamily: 'Outfit-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
