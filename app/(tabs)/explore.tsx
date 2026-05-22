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

const CATEGORIES = ['All', 'Academics', 'Utilities', 'Community'] as const;

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('All');

  // Main filtered module list
  const filteredModules = useMemo(() => {
    return MODULES.filter(item => {
      // Category Chip Filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      
      // Search Box Filter
      if (searchQuery.trim() === '') return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

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
                ? MODULES.length 
                : MODULES.filter(m => m.category === category).length;

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

        {/* Regular Modules Grid Heading */}
        <DefaultView style={styles.sectionTitleRow}>
          <Text variant="bold" style={{ fontSize: 12, color: c.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {searchQuery ? 'SEARCH RESULTS' : 'AVAILABLE UTILITIES'}
          </Text>
          <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary }}>
            Showing {filteredModules.length} modules
          </Text>
        </DefaultView>

        {/* Module responsive 2-column Grid */}
        {filteredModules.length === 0 ? (
          <DefaultView style={[styles.emptyCard, { backgroundColor: c.card + '60', borderColor: c.border }]}>
            <Ionicons name="search-outline" size={40} color={c.textSecondary + '40'} />
            <Text variant="bold" style={{ fontSize: 14, color: c.text, marginTop: 12 }}>
              No Modules Found
            </Text>
            <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
              Try searching different keywords or selecting other categories chips.
            </Text>
          </DefaultView>
        ) : (
          <DefaultView style={styles.gridContainer}>
            {filteredModules.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
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
});
