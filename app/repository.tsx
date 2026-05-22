import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View as DefaultView,
  Platform,
  TextInput,
  Animated,
  Linking,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// format: 'pdf' | 'doc' | 'link'
const MOCK_RESOURCES = [
  // Past Exams
  {
    id: '1',
    name: 'Microeconomics III — Midterm Exam Paper (Spring 2025)',
    type: 'exams',
    format: 'pdf',
    size: '1.8 MB',
    courseColor: '#EBC063',
    url: 'https://coach-lms.edu/pastpapers/econ302-midterm-s25.pdf',
  },
  {
    id: '2',
    name: 'Microeconomics III — Final Exam Solution Draft',
    type: 'exams',
    format: 'pdf',
    size: '2.4 MB',
    courseColor: '#EBC063',
    url: 'https://coach-lms.edu/pastpapers/econ302-final-sol-f25.pdf',
  },
  {
    id: '3',
    name: 'Business Administration — Midterm Examination (Spring 2025)',
    type: 'exams',
    format: 'doc',
    size: '1.2 MB',
    courseColor: '#4A90E2',
    url: 'https://coach-lms.edu/pastpapers/bus101-midterm-s25.docx',
  },
  {
    id: '4',
    name: 'HCI & User Experience — Final Exam Paper (Fall 2025)',
    type: 'exams',
    format: 'pdf',
    size: '2.1 MB',
    courseColor: '#FF9F0A',
    url: 'https://coach-lms.edu/pastpapers/hci201-final-f25.pdf',
  },
  {
    id: '5',
    name: 'React Native Practicals — Coding Midterm (Spring 2025)',
    type: 'exams',
    format: 'doc',
    size: '1.4 MB',
    courseColor: '#FFE500',
    url: 'https://coach-lms.edu/pastpapers/cs152-midterm-s25.docx',
  },
  // Textbooks
  {
    id: '6',
    name: 'Hal Varian: Intermediate Microeconomics (8th Ed.)',
    type: 'textbooks',
    format: 'pdf',
    size: '14.2 MB',
    courseColor: '#EBC063',
    url: 'https://coach-lms.edu/books/varian-micro-8th.pdf',
  },
  {
    id: '7',
    name: 'BUS-101 Final Case Presentation Guide',
    type: 'textbooks',
    format: 'doc',
    size: '950 KB',
    courseColor: '#4A90E2',
    url: 'https://coach-lms.edu/pastpapers/bus101-final-guide.docx',
  },
  {
    id: '8',
    name: 'Don Norman: The Design of Everyday Things',
    type: 'textbooks',
    format: 'pdf',
    size: '8.7 MB',
    courseColor: '#FF9F0A',
    url: 'https://coach-lms.edu/books/norman-design-everyday.pdf',
  },
  {
    id: '9',
    name: 'McKinsey: War for Talent — Strategic HR Whitepaper',
    type: 'textbooks',
    format: 'link',
    size: null,
    courseColor: '#4A90E2',
    url: 'https://coach-lms.edu/mckinsey-talent',
  },
  // Slides & Guides
  {
    id: '10',
    name: 'Game Theory & Information Economics — Lecture Deck',
    type: 'slides',
    format: 'pdf',
    size: '5.6 MB',
    courseColor: '#EBC063',
    url: 'https://coach-lms.edu/slides/econ302-game-theory.pdf',
  },
  {
    id: '11',
    name: 'Heuristic Evaluation UX — Cheat Sheet & Checklist',
    type: 'slides',
    format: 'pdf',
    size: '720 KB',
    courseColor: '#FF9F0A',
    url: 'https://coach-lms.edu/slides/hci201-heuristic.pdf',
  },
  {
    id: '12',
    name: 'React Native Lifecycle Hooks — Reference Sheet',
    type: 'slides',
    format: 'doc',
    size: '480 KB',
    courseColor: '#FFE500',
    url: 'https://coach-lms.edu/cheatsheets/cs152-hooks.docx',
  },
  {
    id: '13',
    name: 'Organizational Behavior — MIT OpenCourseWare Notes',
    type: 'slides',
    format: 'link',
    size: null,
    courseColor: '#4A90E2',
    url: 'https://ocw.mit.edu/organizational-behavior',
  },
];

// ─── Format helpers ───────────────────────────────────────────────────────────
const FORMAT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  pdf:  { icon: 'document-text-outline', color: '#FF453A', label: 'PDF'  },
  doc:  { icon: 'document-outline',      color: '#0A84FF', label: 'DOC'  },
  link: { icon: 'link-outline',          color: '#34C759', label: 'LINK' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RepositoryScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('exams');

  // Download progress: id → 0-100 (active) | -1 (idle/done)
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadedFiles, setDownloadedFiles] = useState<Record<string, boolean>>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const toastY = useRef(new Animated.Value(-100)).current;

  const triggerToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastY, { toValue: Platform.OS === 'ios' ? 55 : 45, duration: 350, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastY, { toValue: -100, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleAction = (file: typeof MOCK_RESOURCES[0]) => {
    if (file.format === 'link') {
      Linking.openURL(file.url);
      return;
    }
    const fileId = file.id;
    if ((downloadProgress[fileId] ?? -1) >= 0) return;
    setDownloadProgress(prev => ({ ...prev, [fileId]: 0 }));
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setDownloadProgress(prev => ({ ...prev, [fileId]: -1 }));
        setDownloadedFiles(prev => ({ ...prev, [fileId]: true }));
        triggerToast(`Saved: ${file.name.split('—')[0].trim()} (${file.size})`);
      } else {
        setDownloadProgress(prev => ({ ...prev, [fileId]: current }));
      }
    }, 200);
  };

  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter(res => {
      const matchSearch =
        res.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = res.type === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCount = (type: string) =>
    MOCK_RESOURCES.filter(r => r.type === type).length;

  const TABS = [
    { id: 'exams',     label: 'Past Exams'     },
    { id: 'textbooks', label: 'Textbooks'       },
    { id: 'slides',    label: 'Slides & Guides' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <DefaultView style={styles.bgAccent} />

      {/* Toast */}
      <Animated.View
        style={[styles.toastBanner, { backgroundColor: '#34C759', transform: [{ translateY: toastY }] }]}
      >
        <Ionicons name="cloud-done" size={16} color="#FFF" style={{ marginRight: 8 }} />
        <Text variant="bold" style={styles.toastText} numberOfLines={2}>
          {toastMessage}
        </Text>
      </Animated.View>

      {/* Header */}
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
            Academic Repository
          </Text>
          <Text variant="bold" style={{ fontSize: 8, color: c.gold, marginTop: 2, letterSpacing: 0.5 }}>
            PAST PAPERS • TEXTBOOKS • RESOURCES
          </Text>
        </DefaultView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={16} color={c.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search resources..."
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

      {/* Category Tabs */}
      <DefaultView style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          {TABS.map(tab => {
            const isSelected = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(tab.id)}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: isSelected ? c.gold + '15' : c.card,
                    borderColor: isSelected ? c.gold : c.border,
                  },
                ]}
              >
                <Text variant="bold" style={{ fontSize: 11, color: isSelected ? c.gold : c.textSecondary }}>
                  {tab.label.toUpperCase()} ({getCount(tab.id)})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </DefaultView>

      {/* File List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredResources.length === 0 ? (
          <DefaultView style={styles.emptyView}>
            <Ionicons name="folder-open-outline" size={44} color={c.textSecondary} style={{ marginBottom: 12, opacity: 0.6 }} />
            <Text variant="bold" style={{ fontSize: 13, color: c.text, textAlign: 'center' }}>
              No matches found
            </Text>
            <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 4, textAlign: 'center', maxWidth: 220 }}>
              Try adjusting your search keyword.
            </Text>
          </DefaultView>
        ) : (
          <DefaultView style={{ gap: 10, backgroundColor: 'transparent' }}>
            {filteredResources.map(res => {
              const fmt = FORMAT_CONFIG[res.format] ?? FORMAT_CONFIG.pdf;
              const progress = downloadProgress[res.id] ?? -1;
              const isDownloading = progress >= 0;
              const isDownloaded = downloadedFiles[res.id];
              const isLink = res.format === 'link';

              return (
                <TouchableOpacity
                  key={res.id}
                  activeOpacity={0.85}
                  onPress={() => handleAction(res)}
                  style={[styles.resourceCard, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  {/* Domain color left stripe */}
                  <DefaultView style={[styles.domainStripe, { backgroundColor: res.courseColor }]} />

                  {/* Progress fill overlay */}
                  {isDownloading && (
                    <DefaultView
                      style={[styles.progressOverlay, { backgroundColor: c.gold + '08', width: `${progress}%` as any }]}
                    />
                  )}

                  <DefaultView style={styles.cardMain}>
                    {/* Format icon box */}
                    <DefaultView style={[styles.fileIconBox, { backgroundColor: fmt.color + '15' }]}>
                      <Ionicons name={fmt.icon as any} size={20} color={fmt.color} />
                      <DefaultView style={[styles.formatBadge, { backgroundColor: fmt.color }]}>
                        <Text style={styles.formatText}>{fmt.label}</Text>
                      </DefaultView>
                    </DefaultView>

                    {/* Name + size */}
                    <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <Text variant="bold" style={{ fontSize: 13, color: c.text }} numberOfLines={2}>
                        {res.name}
                      </Text>
                      {res.size && (
                        <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginTop: 4 }}>
                          {res.size}
                        </Text>
                      )}
                    </DefaultView>

                    {/* Action */}
                    <DefaultView style={styles.actionColumn}>
                      {isLink ? (
                        <DefaultView style={[styles.actionBtnBox, { backgroundColor: '#34C75915', borderColor: '#34C759' }]}>
                          <Ionicons name="open-outline" size={16} color="#34C759" />
                        </DefaultView>
                      ) : isDownloading ? (
                        <DefaultView style={styles.downloadSpinner}>
                          <Text variant="bold" style={{ fontSize: 9, color: c.gold }}>{progress}%</Text>
                        </DefaultView>
                      ) : isDownloaded ? (
                        <DefaultView style={[styles.actionBtnBox, { backgroundColor: '#34C75915', borderColor: '#34C759' }]}>
                          <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                        </DefaultView>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionBtnBox, { backgroundColor: c.border + '30', borderColor: c.border }]}
                          onPress={() => handleAction(res)}
                        >
                          <Ionicons name="cloud-download-outline" size={16} color={c.text} />
                        </TouchableOpacity>
                      )}
                    </DefaultView>
                  </DefaultView>
                </TouchableOpacity>
              );
            })}
          </DefaultView>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  bgAccent: {
    position: 'absolute',
    top: -100, right: -100,
    width: 300, height: 300,
    borderRadius: 150,
    backgroundColor: '#64D2FF',
    opacity: 0.02,
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
    width: 40, height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerLabelWrapper: { backgroundColor: 'transparent' },
  headerTitle: { fontSize: 20, lineHeight: 24 },

  searchSection: { paddingHorizontal: 20, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  clearSearchBtn: { padding: 4 },

  tabsWrapper: { marginBottom: 16 },
  tabsScrollContent: { paddingHorizontal: 20, gap: 8 },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyView: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  resourceCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  domainStripe: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: 4,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 4,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
    gap: 12,
  },
  fileIconBox: {
    width: 40, height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  formatBadge: {
    position: 'absolute',
    bottom: -3, right: -3,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
  },
  formatText: { fontSize: 6, fontWeight: 'bold', color: '#000' },

  actionColumn: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnBox: {
    width: 32, height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadSpinner: {
    width: 32, height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EBC063',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },

  toastBanner: {
    position: 'absolute',
    top: 0, left: 20, right: 20,
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
  toastText: { fontSize: 11, color: '#FFF', flex: 1 },
});
