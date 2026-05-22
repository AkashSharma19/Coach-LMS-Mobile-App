import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  View as DefaultView, 
  Platform, 
  Modal
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Course, MOCK_COURSES } from '@/constants/MockData';

export default function StandaloneCourseListScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState('');

  // Filter States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedClassType, setSelectedClassType] = useState('all');

  // Temp draft states for inside the Modal
  const [tempTerm, setTempTerm] = useState('all');
  const [tempClassType, setTempClassType] = useState('all');

  const handleOpenFilters = () => {
    setTempTerm(selectedTerm);
    setTempClassType(selectedClassType);
    setIsFilterVisible(true);
  };

  const handleCloseFilters = () => {
    setIsFilterVisible(false);
  };

  const handleApplyFilters = () => {
    setSelectedTerm(tempTerm);
    setSelectedClassType(tempClassType);
    setIsFilterVisible(false);
  };

  const handleResetFilters = () => {
    setSelectedTerm('all');
    setSelectedClassType('all');
    setIsFilterVisible(false);
  };

  const isAnyFilterActive = selectedTerm !== 'all' || selectedClassType !== 'all';

  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter(course => {
      // Term filter
      if (selectedTerm !== 'all' && course.term !== selectedTerm) {
        return false;
      }
      // Class type filter
      if (selectedClassType !== 'all' && course.classType !== selectedClassType) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() === '') return true;
      const query = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.topic.toLowerCase().includes(query) ||
        course.instructor.name.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedTerm, selectedClassType]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Dynamic Background Accent */}
      <DefaultView style={styles.bgAccent} />

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sleek Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <Ionicons name="arrow-back" size={20} color={c.text} />
          </TouchableOpacity>
          <View style={{ backgroundColor: 'transparent', flex: 1 }}>
            <Text variant="bold" style={[styles.headerTitle, { color: c.text }]}>
              Academics
            </Text>
            <Text variant="medium" style={[styles.headerSubtitle, { color: c.textSecondary }]}>
              Shenelle's Enrolled Courses
            </Text>
          </View>
        </View>

        {/* Search Bar & Filter Button */}
        <View style={styles.searchContainer}>
          <DefaultView style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border, flex: 1 }]}>
            <Ionicons name="search" size={18} color={c.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder="Search courses, professors..."
              placeholderTextColor={c.textSecondary + '70'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: c.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={c.textSecondary} style={styles.clearIcon} />
              </TouchableOpacity>
            )}
          </DefaultView>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={[
              styles.filterButton, 
              { 
                backgroundColor: isAnyFilterActive ? c.gold + '15' : c.card, 
                borderColor: isAnyFilterActive ? c.gold : c.border 
              }
            ]} 
            onPress={handleOpenFilters}
          >
            <Ionicons 
              name="funnel-outline" 
              size={18} 
              color={isAnyFilterActive ? c.gold : c.text} 
            />
            {isAnyFilterActive && (
              <DefaultView style={[styles.activeFilterIndicator, { backgroundColor: c.gold }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Courses List */}
        <View style={styles.listContainer}>
          {filteredCourses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={c.textSecondary} style={{ opacity: 0.5 }} />
              <Text variant="medium" style={[styles.emptyText, { color: c.textSecondary }]}>
                No courses found matching your criteria.
              </Text>
            </View>
          ) : (
            filteredCourses.map((course) => {
              return (
                <TouchableOpacity 
                  key={course.id} 
                  activeOpacity={0.9} 
                  onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
                  style={styles.cardWrapper}
                >
                  <LinearGradient
                    colors={[c.card, '#151515']}
                    style={[styles.card, { borderColor: c.border }]}
                  >
                    {/* Top Row: Code & Category Tag */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: course.color + '15' }]}>
                        <Text variant="bold" style={[styles.categoryText, { color: course.color }]}>
                          {course.category}
                        </Text>
                      </View>
                      <View style={[styles.codeBadge, { backgroundColor: c.border }]}>
                        <Text variant="bold" style={[styles.codeText, { color: c.text }]}>
                          {course.code}
                        </Text>
                      </View>
                    </View>

                    {/* Course Title */}
                    <Text variant="bold" style={[styles.title, { color: c.text, marginBottom: 18 }]}>
                      {course.title}
                    </Text>

                    {/* Progress Bar Section */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressLabels}>
                        <Text variant="semiBold" style={[styles.progressLabel, { color: c.textSecondary }]}>
                          Course Progress
                        </Text>
                        <Text variant="bold" style={[styles.progressValue, { color: course.color }]}>
                          {Math.round(course.progress * 100)}%
                        </Text>
                      </View>
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
                    </View>

                    {/* Instructor Row */}
                    <View style={[styles.detailsRow, { marginBottom: 0 }]}>
                      <View style={styles.instructorContainer}>
                        <View style={[styles.avatarCircle, { borderColor: c.border, backgroundColor: c.cardSecondary }]}>
                          <Text variant="bold" style={{ fontSize: 11, color: course.color }}>
                            {course.instructor.initials}
                          </Text>
                        </View>
                        <Text variant="medium" style={[styles.instructorName, { color: c.text }]}>
                          {course.instructor.name}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Space padding */}
        <DefaultView style={{ height: 40 }} />
      </ScrollView>

      {/* Premium Filter Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterVisible}
        onRequestClose={handleCloseFilters}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseFilters}
        >
          <DefaultView style={{ flex: 1 }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          {/* Drag Handle */}
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text variant="bold" style={[styles.modalTitle, { color: c.text }]}>
              Filter Courses
            </Text>
            <TouchableOpacity onPress={handleCloseFilters} style={styles.modalCloseBtn}>
              <Ionicons name="close-circle" size={24} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Filter Option 1: Academic Term */}
          <View style={styles.filterSection}>
            <Text variant="bold" style={[styles.filterLabel, { color: c.textSecondary }]}>
              ACADEMIC TERM
            </Text>
            <View style={styles.pillsRow}>
              {['all', 'Spring 2026', 'Fall 2025'].map((term) => {
                const isSelected = tempTerm === term;
                return (
                  <TouchableOpacity
                    key={term}
                    style={[
                      styles.pillButton,
                      { 
                        backgroundColor: isSelected ? c.gold + '15' : c.card, 
                        borderColor: isSelected ? c.gold : c.border 
                      }
                    ]}
                    onPress={() => setTempTerm(term)}
                  >
                    <Text 
                      variant="semiBold" 
                      style={[
                        styles.pillText, 
                        { color: isSelected ? c.gold : c.textSecondary }
                      ]}
                    >
                      {term === 'all' ? 'All Terms' : term}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Filter Option 2: Class Type */}
          <View style={styles.filterSection}>
            <Text variant="bold" style={[styles.filterLabel, { color: c.textSecondary }]}>
              CLASS TYPE
            </Text>
            <View style={styles.pillsRow}>
              {['all', 'InClass', 'OutClass'].map((type) => {
                const isSelected = tempClassType === type;
                let displayLabel = 'All Types';
                if (type === 'InClass') displayLabel = 'In-Class';
                if (type === 'OutClass') displayLabel = 'Out-Class';

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pillButton,
                      { 
                        backgroundColor: isSelected ? c.gold + '15' : c.card, 
                        borderColor: isSelected ? c.gold : c.border 
                      }
                    ]}
                    onPress={() => setTempClassType(type)}
                  >
                    <Text 
                      variant="semiBold" 
                      style={[
                        styles.pillText, 
                        { color: isSelected ? c.gold : c.textSecondary }
                      ]}
                    >
                      {displayLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Footer */}
          <View style={[styles.modalFooter, { borderTopColor: c.border }]}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.resetBtn, { borderColor: c.border }]} 
              onPress={handleResetFilters}
            >
              <Text variant="bold" style={[styles.actionBtnText, { color: c.text }]}>
                Reset
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.applyBtn, { backgroundColor: c.gold }]} 
              onPress={handleApplyFilters}
            >
              <Text variant="bold" style={[styles.actionBtnText, { color: '#000' }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
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
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#EBC063',
    opacity: 0.04,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeFilterIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    padding: 4,
  },
  filterSection: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  filterLabel: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'transparent',
  },
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
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
  resetBtn: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  applyBtn: {},
  actionBtnText: {
    fontSize: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    paddingVertical: 8,
  },
  clearIcon: {
    marginLeft: 10,
  },
  listContainer: {
    backgroundColor: 'transparent',
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  cardWrapper: {
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 10,
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.5,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  topic: {
    fontSize: 13,
    marginBottom: 18,
    backgroundColor: 'transparent',
  },
  progressSection: {
    marginBottom: 18,
    backgroundColor: 'transparent',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  progressLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  progressValue: {
    fontSize: 12,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    borderRadius: 3,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  instructorName: {
    fontSize: 13,
  },
});
