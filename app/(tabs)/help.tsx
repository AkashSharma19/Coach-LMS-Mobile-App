import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View as DefaultView,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConcernStatus = 'Active' | 'Escalated' | 'Resolved';
type ConcernPriority = 'High' | 'Medium' | 'Low';

interface ThreadMessage {
  from: 'admin' | 'student';
  sender: string;
  message: string;
  time: string;
}

interface Concern {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  status: ConcernStatus;
  priority: ConcernPriority;
  category: string;
  submittedDate: string;
  lastUpdated: string;
  assignedTo?: string;
  /** If true, admin has sent a message and is waiting for the student to reply */
  awaitingStudentReply?: boolean;
  thread?: ThreadMessage[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONCERNS: Concern[] = [
  {
    id: 'c1',
    ticketId: 'TKT-0041',
    title: 'Attendance record shows absent for May 15 session',
    description:
      'I was present in the ECON-302 class on May 15 but my attendance is marked as Absent. I have the entry record from the gate.',
    status: 'Active',
    priority: 'High',
    category: 'Attendance',
    submittedDate: '2 hours ago',
    lastUpdated: '1 hour ago',
    assignedTo: 'Academic Office',
    awaitingStudentReply: true,
    thread: [
      {
        from: 'admin',
        sender: 'Academic Office',
        message:
          'Hi Shenelle, thank you for raising this. Could you please share a photo or scan of the gate entry record you mentioned? This will help us verify and correct the attendance mark promptly.',
        time: '1 hour ago',
      },
    ],
  },
  {
    id: 'c2',
    ticketId: 'TKT-0038',
    title: 'Fee payment portal not loading for invoice #INV-224',
    description:
      'The fee management module keeps timing out when I try to view or pay my pending invoice. I have tried multiple browsers.',
    status: 'Escalated',
    priority: 'High',
    category: 'Finance',
    submittedDate: '1 day ago',
    lastUpdated: '3 hours ago',
    assignedTo: 'Tech Support → Finance Dept.',
    thread: [
      {
        from: 'admin',
        sender: 'LMS Tech Team',
        message:
          'We have identified a database timeout issue affecting fee invoice retrieval. The fix is being tested and will be deployed within 6 hours. We will notify you once it is resolved.',
        time: '3 hours ago',
      },
    ],
  },
  {
    id: 'c3',
    ticketId: 'TKT-0034',
    title: 'Grade for BUS-101 Case Study shows incorrect score',
    description:
      'My Case Study submission received 72/100 but the rubric and feedback from Prof. Sterling indicate 88/100 as the final score.',
    status: 'Active',
    priority: 'Medium',
    category: 'Grades',
    submittedDate: '3 days ago',
    lastUpdated: '1 day ago',
    assignedTo: 'Prof. Evelyn Sterling',
    awaitingStudentReply: true,
    thread: [
      {
        from: 'admin',
        sender: 'Prof. Evelyn Sterling',
        message:
          'Hello Shenelle. I have reviewed your submission. There was a data entry error on our end. Before I push the correction, can you confirm your submission timestamp and filename so I can cross-reference it with our grading log?',
        time: '1 day ago',
      },
    ],
  },
  {
    id: 'c4',
    ticketId: 'TKT-0029',
    title: 'Cannot access HCI-402 recorded session from May 16',
    description:
      'The recording link for the May 16 Motion Design lecture returns a 403 error. Other recordings from the same course are accessible.',
    status: 'Resolved',
    priority: 'Low',
    category: 'Access',
    submittedDate: '5 days ago',
    lastUpdated: '2 days ago',
    assignedTo: 'LMS Tech Team',
    thread: [
      {
        from: 'admin',
        sender: 'LMS Tech Team',
        message:
          'This has been resolved. The recording had an incorrect permission setting. You should now have full access to the May 16 session.',
        time: '2 days ago',
      },
    ],
  },
  {
    id: 'c5',
    ticketId: 'TKT-0025',
    title: 'Scholarship application form submission failed',
    description:
      "I attempted to submit the Dean's Merit Scholarship application but received a server error at the final submission step.",
    status: 'Resolved',
    priority: 'High',
    category: 'Academics',
    submittedDate: '1 week ago',
    lastUpdated: '4 days ago',
    assignedTo: 'Student Affairs',
  },
];

const STATUS_TABS = ['All', 'Active', 'Escalated', 'Resolved'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (status: ConcernStatus) => {
  switch (status) {
    case 'Active':    return '#4A90E2';
    case 'Escalated': return '#FF453A';
    case 'Resolved':  return '#30D158';
  }
};

const priorityColor = (p: ConcernPriority) => {
  switch (p) {
    case 'High':   return '#FF453A';
    case 'Medium': return '#EBC063';
    case 'Low':    return '#30D158';
  }
};

const statusIcon = (status: ConcernStatus): keyof typeof Ionicons.glyphMap => {
  switch (status) {
    case 'Active':    return 'time-outline';
    case 'Escalated': return 'alert-circle-outline';
    case 'Resolved':  return 'checkmark-circle-outline';
  }
};

// ─── Raise-a-Concern Modal ────────────────────────────────────────────────────

interface RaiseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (c: Concern) => void;
  c: typeof Colors['dark'];
}

function RaiseConcernModal({ visible, onClose, onSubmit, c }: RaiseModalProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('General');
  const [priority] = useState<ConcernPriority>('Medium');

  const canSubmit = title.trim().length > 0 && desc.trim().length > 0;
  const CATEGORIES = ['Attendance', 'Grades', 'Finance', 'Access', 'Academics', 'General'];

  const handleSubmit = () => {
    if (!canSubmit) return;
    const newId = `TKT-${String(Math.floor(1000 + Math.random() * 9000))}`;
    onSubmit({
      id: Date.now().toString(),
      ticketId: newId,
      title: title.trim(),
      description: desc.trim(),
      status: 'Active',
      priority,
      category,
      submittedDate: 'Just now',
      lastUpdated: 'Just now',
      assignedTo: 'Support Team',
    });
    setTitle('');
    setDesc('');
    setCategory('General');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <DefaultView style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <DefaultView style={[styles.modalSheet, { backgroundColor: c.card, borderColor: c.border }]}>
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />

          <DefaultView style={styles.modalHeader}>
            <Text variant="bold" style={[styles.modalTitle, { color: c.text }]}>
              Raise a Concern
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={c.textSecondary} />
            </TouchableOpacity>
          </DefaultView>

          <Text variant="bold" style={[styles.fieldLabel, { color: c.textSecondary }]}>SUBJECT</Text>
          <DefaultView style={[styles.inputWrap, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Briefly describe your concern"
              placeholderTextColor={c.textSecondary + '60'}
              style={[styles.input, { color: c.text }]}
              autoCapitalize="sentences"
            />
          </DefaultView>

          <Text variant="bold" style={[styles.fieldLabel, { color: c.textSecondary, marginTop: 14 }]}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATEGORIES.map(cat => {
              const sel = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.pill, { backgroundColor: sel ? c.gold : c.cardSecondary, borderColor: sel ? c.gold : c.border }]}
                >
                  <Text variant="bold" style={{ fontSize: 12, color: sel ? '#000' : c.textSecondary }}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text variant="bold" style={[styles.fieldLabel, { color: c.textSecondary, marginTop: 14 }]}>DESCRIPTION</Text>
          <DefaultView style={[styles.inputWrap, styles.textareaWrap, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholder="Provide details about the issue..."
              placeholderTextColor={c.textSecondary + '60'}
              style={[styles.input, styles.textarea, { color: c.text }]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
          </DefaultView>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            style={[styles.submitBtn, { backgroundColor: canSubmit ? '#EBC063' : c.cardSecondary }]}
          >
            <Ionicons name="send" size={14} color={canSubmit ? '#000' : c.textSecondary} />
            <Text variant="bold" style={{ fontSize: 14, color: canSubmit ? '#000' : c.textSecondary }}>
              Submit Concern
            </Text>
          </TouchableOpacity>

          <DefaultView style={{ height: Platform.OS === 'ios' ? 24 : 12 }} />
        </DefaultView>
      </DefaultView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HelpScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('All');
  const [concerns, setConcerns] = useState<Concern[]>(MOCK_CONCERNS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Track reply text keyed by concern id
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const tabCount = (tab: typeof STATUS_TABS[number]) =>
    tab === 'All' ? concerns.length : concerns.filter(c => c.status === tab).length;

  // "Action Required" badge count — concerns awaiting student reply
  const actionRequiredCount = concerns.filter(c => c.awaitingStudentReply).length;

  const filtered = useMemo(() =>
    activeTab === 'All' ? concerns : concerns.filter(c => c.status === activeTab),
    [concerns, activeTab]
  );

  const handleNewConcern = (newC: Concern) => {
    setConcerns(prev => [newC, ...prev]);
    setActiveTab('All');
  };

  const handleSendReply = (concernId: string) => {
    const text = (replyTexts[concernId] ?? '').trim();
    if (!text) return;

    setConcerns(prev => prev.map(concern => {
      if (concern.id !== concernId) return concern;
      const newMsg: ThreadMessage = {
        from: 'student',
        sender: 'Shenelle',
        message: text,
        time: 'Just now',
      };
      return {
        ...concern,
        awaitingStudentReply: false,
        lastUpdated: 'Just now',
        thread: [...(concern.thread ?? []), newMsg],
      };
    }));
    setReplyTexts(prev => ({ ...prev, [concernId]: '' }));
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <DefaultView style={styles.bgAccent} />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <DefaultView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'transparent' }}>
            <DefaultView style={{ backgroundColor: 'transparent' }}>
              <Text variant="bold" style={[styles.headerTitle, { color: c.text }]}>
                Support
              </Text>
              <Text variant="medium" style={[styles.headerSubtitle, { color: c.textSecondary }]}>
                Shenelle's Concern Tracker
              </Text>
            </DefaultView>
            {/* Action required banner */}
            {actionRequiredCount > 0 && (
              <DefaultView style={[styles.actionRequiredPill, { backgroundColor: '#EBC06318', borderColor: '#EBC06340' }]}>
                <DefaultView style={[styles.actionDot]} />
                <Text variant="bold" style={{ fontSize: 11, color: '#EBC063' }}>
                  {actionRequiredCount} Reply Needed
                </Text>
              </DefaultView>
            )}
          </DefaultView>
        </View>

        {/* ── Status Tabs ── */}
        <DefaultView style={[styles.tabRow, { backgroundColor: c.card, borderColor: c.border }]}>
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab;
            const count = tabCount(tab);
            const col = tab === 'All' ? c.gold : statusColor(tab as ConcernStatus);
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && { borderBottomWidth: 2, borderBottomColor: col }]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text
                  variant={isActive ? 'bold' : 'medium'}
                  style={[styles.tabLabel, { color: isActive ? col : c.textSecondary }]}
                >
                  {tab}
                </Text>
                <DefaultView style={[styles.tabBadge, { backgroundColor: isActive ? col + '20' : c.cardSecondary }]}>
                  <Text variant="bold" style={{ fontSize: 10, color: isActive ? col : c.textSecondary }}>
                    {count}
                  </Text>
                </DefaultView>
              </TouchableOpacity>
            );
          })}
        </DefaultView>

        {/* ── Section label ── */}
        <DefaultView style={styles.sectionRow}>
          <Text variant="bold" style={[styles.sectionLabel, { color: c.textSecondary }]}>
            {activeTab === 'All' ? 'RECENT CONCERNS' : `${activeTab.toUpperCase()} CONCERNS`}
          </Text>
          <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary }}>
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </Text>
        </DefaultView>

        {/* ── Concern cards ── */}
        {filtered.length === 0 ? (
          <DefaultView style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={c.textSecondary + '40'} />
            <Text variant="bold" style={{ fontSize: 14, color: c.text, marginTop: 12 }}>
              No Concerns Here
            </Text>
            <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4, textAlign: 'center' }}>
              You have no {activeTab !== 'All' ? activeTab.toLowerCase() + ' ' : ''}tickets at this time.
            </Text>
          </DefaultView>
        ) : (
          filtered.map(item => {
            const isOpen = expandedId === item.id;
            const sColor = statusColor(item.status);
            const needsReply = !!item.awaitingStudentReply;
            const replyText = replyTexts[item.id] ?? '';

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                style={[
                  styles.concernCard,
                  {
                    backgroundColor: c.card,
                    borderColor: needsReply ? '#EBC06350' : isOpen ? sColor + '40' : c.border,
                    borderWidth: needsReply ? 1.5 : 1,
                  },
                ]}
              >
                {/* Card top row */}
                <DefaultView style={styles.cardTop}>
                  <DefaultView style={[styles.statusIcon, { backgroundColor: needsReply ? '#EBC06318' : sColor + '15' }]}>
                    <Ionicons
                      name={needsReply ? 'chatbubble-ellipses-outline' : statusIcon(item.status)}
                      size={16}
                      color={needsReply ? '#EBC063' : sColor}
                    />
                  </DefaultView>
                  <DefaultView style={{ flex: 1, marginLeft: 10 }}>
                    <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary }}>
                        {item.ticketId}
                      </Text>
                      {/* Status badge */}
                      <DefaultView style={[styles.badge, { backgroundColor: sColor + '15', borderColor: sColor + '30' }]}>
                        <Text variant="bold" style={{ fontSize: 8, color: sColor, textTransform: 'uppercase' }}>
                          {item.status}
                        </Text>
                      </DefaultView>
                      {/* Action required badge */}
                      {needsReply && (
                        <DefaultView style={[styles.badge, { backgroundColor: '#EBC06318', borderColor: '#EBC06340', flexDirection: 'row', gap: 3 }]}>
                          <DefaultView style={styles.actionDot} />
                          <Text variant="bold" style={{ fontSize: 8, color: '#EBC063' }}>
                            REPLY NEEDED
                          </Text>
                        </DefaultView>
                      )}
                    </DefaultView>
                    <Text
                      variant="bold"
                      numberOfLines={isOpen ? undefined : 1}
                      style={[styles.concernTitle, { color: c.text }]}
                    >
                      {item.title}
                    </Text>
                  </DefaultView>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={c.textSecondary}
                  />
                </DefaultView>

                {/* Expanded content */}
                {isOpen && (
                  <DefaultView style={[styles.expandedSection, { borderTopColor: c.border }]}>
                    {/* Student's original description */}
                    <Text variant="medium" style={[styles.descText, { color: c.textSecondary }]}>
                      {item.description}
                    </Text>

                    {/* Meta row */}
                    <DefaultView style={[styles.metaGrid, { marginBottom: 14 }]}>
                      <DefaultView style={styles.metaItem}>
                        <Ionicons name="folder-outline" size={12} color={c.textSecondary} />
                        <Text variant="medium" style={[styles.metaText, { color: c.textSecondary }]}>
                          {item.category}
                        </Text>
                      </DefaultView>
                      <DefaultView style={styles.metaItem}>
                        <Ionicons name="person-outline" size={12} color={c.textSecondary} />
                        <Text variant="medium" style={[styles.metaText, { color: c.textSecondary }]}>
                          {item.assignedTo ?? 'Unassigned'}
                        </Text>
                      </DefaultView>
                      <DefaultView style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color={c.textSecondary} />
                        <Text variant="medium" style={[styles.metaText, { color: c.textSecondary }]}>
                          Submitted {item.submittedDate} • Updated {item.lastUpdated}
                        </Text>
                      </DefaultView>
                    </DefaultView>

                    {/* ── Conversation Thread ── */}
                    {item.thread && item.thread.length > 0 && (
                      <DefaultView style={[styles.threadContainer, { borderColor: c.border }]}>
                        <Text variant="bold" style={[styles.threadLabel, { color: c.textSecondary }]}>
                          CONVERSATION
                        </Text>
                        {item.thread.map((msg, idx) => {
                          const isAdmin = msg.from === 'admin';
                          return (
                            <DefaultView
                              key={idx}
                              style={[
                                styles.threadBubble,
                                isAdmin
                                  ? [styles.adminBubble, { backgroundColor: c.cardSecondary, borderColor: c.border }]
                                  : [styles.studentBubble, { backgroundColor: '#EBC06318', borderColor: '#EBC06330' }],
                              ]}
                            >
                              <DefaultView style={styles.bubbleHeader}>
                                <DefaultView style={[
                                  styles.senderAvatar,
                                  { backgroundColor: isAdmin ? '#4A90E218' : '#EBC06318' }
                                ]}>
                                  <Ionicons
                                    name={isAdmin ? 'person-circle' : 'person'}
                                    size={12}
                                    color={isAdmin ? '#4A90E2' : '#EBC063'}
                                  />
                                </DefaultView>
                                <Text variant="bold" style={{ fontSize: 11, color: isAdmin ? '#4A90E2' : '#EBC063' }}>
                                  {msg.sender}
                                </Text>
                                <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary, marginLeft: 'auto' }}>
                                  {msg.time}
                                </Text>
                              </DefaultView>
                              <Text variant="medium" style={[styles.bubbleText, { color: c.text }]}>
                                {msg.message}
                              </Text>
                            </DefaultView>
                          );
                        })}
                      </DefaultView>
                    )}

                    {/* ── Reply Input (only if admin is waiting for reply) ── */}
                    {needsReply && (
                      <DefaultView style={[styles.replyBox, { borderColor: '#EBC06340', backgroundColor: '#EBC06308' }]}>
                        <DefaultView style={styles.replyHeader}>
                          <Ionicons name="chatbubble-ellipses" size={13} color="#EBC063" />
                          <Text variant="bold" style={{ fontSize: 11, color: '#EBC063', marginLeft: 6 }}>
                            Admin is awaiting your reply
                          </Text>
                        </DefaultView>
                        <DefaultView style={[styles.replyInputRow, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
                          <TextInput
                            value={replyText}
                            onChangeText={text => setReplyTexts(prev => ({ ...prev, [item.id]: text }))}
                            placeholder="Type your reply..."
                            placeholderTextColor={c.textSecondary + '60'}
                            style={[styles.replyInput, { color: c.text }]}
                            autoCapitalize="sentences"
                            multiline
                          />
                          <TouchableOpacity
                            onPress={() => handleSendReply(item.id)}
                            style={[styles.sendBtn, { backgroundColor: replyText.trim() ? '#EBC063' : c.border }]}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="send" size={14} color={replyText.trim() ? '#000' : c.textSecondary} />
                          </TouchableOpacity>
                        </DefaultView>
                      </DefaultView>
                    )}
                  </DefaultView>
                )}

                {/* Footer timestamp (collapsed only) */}
                {!isOpen && (
                  <DefaultView style={styles.cardFooter}>
                    <Ionicons name="time-outline" size={11} color={c.textSecondary} />
                    <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginLeft: 4 }}>
                      Submitted {item.submittedDate} • Updated {item.lastUpdated}
                    </Text>
                  </DefaultView>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <DefaultView style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky "Raise a Concern" button ── */}
      <DefaultView style={[styles.stickyBar, { backgroundColor: c.background }]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setModalVisible(true)}
          style={styles.raiseBtn}
        >
          <Ionicons name="add-circle" size={18} color="#000" />
          <Text variant="bold" style={{ fontSize: 15, color: '#000', marginLeft: 8 }}>
            Raise a Concern
          </Text>
        </TouchableOpacity>
      </DefaultView>

      <RaiseConcernModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleNewConcern}
        c={c}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  actionRequiredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBC063',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabLabel: { fontSize: 11 },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 50,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  concernCard: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  concernTitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  descText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaGrid: { gap: 6 },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: { fontSize: 11 },

  // Thread
  threadContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  threadLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  threadBubble: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  adminBubble: {},
  studentBubble: {},
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  senderAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Reply box
  replyBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Outfit-Medium',
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sticky bar
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 110 : 100,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  raiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBC063',
    borderRadius: 18,
    paddingVertical: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  closeBtn: { padding: 4 },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textareaWrap: {
    minHeight: 80,
    paddingVertical: 10,
  },
  input: {
    fontSize: 14,
    fontFamily: 'Outfit-Medium',
  },
  textarea: { minHeight: 60 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 16,
  },
});
