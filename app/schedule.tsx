import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as DefaultView, 
  Platform, 
  Modal,
  Dimensions,
  Linking
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { MOCK_COURSES } from '@/constants/MockData';

interface ScheduleEvent {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  color: string;
  topic: string;
  subtopic?: string;
  dateStr: string;
  dayNum: number;
  timeStr: string;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  type: 'Online' | 'Offline' | 'Hybrid';
  location: string;
  faculty: string;
  status: 'P' | 'A' | 'U';
  programAssociate?: string;
  preReads?: any[];
  inClassMaterial?: any[];
  postClassMaterial?: any[];
  recordingUrl?: string;
  objective?: string;
  feedbackStatus?: 'pending' | 'submitted';
}

export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  // States for Date Navigation
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(4); // 4 = May (0-indexed)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(10); // Default day
  
  // Weekly View Tracker (starts on Mon, May 4, 2026 by default)
  const [selectedWeekStartDay, setSelectedWeekStartDay] = useState<Date>(new Date(2026, 4, 4));

  // Modals visibility states
  const [activeView, setActiveView] = useState<'agenda' | 'day' | 'week' | 'month'>('agenda');
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Temporary Picker States
  const [tempMonth, setTempMonth] = useState(4);
  const [tempYear, setTempYear] = useState(2026);

  // Dynamic Session Interactive States for Parity
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<Record<string, 'pending' | 'submitted'>>({});
  const [userRating, setUserRating] = useState<number>(0);
  const [checkedInSessions, setCheckedInSessions] = useState<Record<string, boolean>>({});

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMonthName = (monthIdx: number) => monthNames[monthIdx];

  // Helpers to fetch weekday names
  const getDayName = (day: number) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(currentYear, currentMonth, day);
    return dayNames[date.getDay()];
  };

  const getDayNameForDate = (date: Date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
  };

  // Construct Weekly Column cells Mon-Sun dynamically based on selectedWeekStartDay
  const weekDaysList = useMemo(() => {
    const list: Array<{ dayNum: number; month: number; year: number; date: Date }> = [];
    
    // Find the Monday of the week for selectedWeekStartDay
    const tempDate = new Date(selectedWeekStartDay);
    const dayOfWeek = tempDate.getDay(); // 0 = Sunday, 1 = Monday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    tempDate.setDate(tempDate.getDate() + diffToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(tempDate);
      d.setDate(tempDate.getDate() + i);
      list.push({
        dayNum: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        date: d
      });
    }
    return list;
  }, [selectedWeekStartDay]);

  // Construct Calendar grid dynamically with mathematical padding cells
  const calendarGrid = useMemo(() => {
    const days: Array<{ dayNum: number; isCurrentMonth: boolean }> = [];
    
    // First of selected month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday
    
    // Pad previous month cells
    const paddingCellsNeeded = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastDayOfPrevMonth = new Date(prevYear, prevMonthIdx + 1, 0).getDate();
    
    for (let i = lastDayOfPrevMonth - paddingCellsNeeded + 1; i <= lastDayOfPrevMonth; i++) {
      days.push({ dayNum: i, isCurrentMonth: false });
    }

    // Selected month cells
    const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= lastDayOfCurrentMonth; i++) {
      days.push({ dayNum: i, isCurrentMonth: true });
    }

    // Pad next month cells
    const totalCellsNeeded = days.length <= 35 ? 35 : 42;
    const remainingCells = totalCellsNeeded - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Dynamic Header Title & Subtitle calculations based on active view and selected date
  const { headerTitle, headerSubtitle } = useMemo(() => {
    if (activeView === 'day') {
      return {
        headerTitle: `${getMonthName(currentMonth)} ${selectedDayNum}, ${currentYear}`,
        headerSubtitle: getDayName(selectedDayNum).toUpperCase()
      };
    }
    if (activeView === 'week') {
      const start = weekDaysList[0];
      const end = weekDaysList[6];
      let rangeStr = "";
      if (start.month === end.month) {
        rangeStr = `${getMonthName(start.month).slice(0, 3)} ${start.dayNum} - ${end.dayNum}`;
      } else {
        rangeStr = `${getMonthName(start.month).slice(0, 3)} ${start.dayNum} - ${getMonthName(end.month).slice(0, 3)} ${end.dayNum}`;
      }
      return {
        headerTitle: `${getMonthName(currentMonth)} ${currentYear}`,
        headerSubtitle: `WEEK RANGE: ${rangeStr.toUpperCase()}`
      };
    }
    // agenda and month
    return {
      headerTitle: `${getMonthName(currentMonth)} ${currentYear}`,
      headerSubtitle: activeView === 'month' ? 'MONTHLY OVERVIEW' : 'ACADEMIC AGENDA'
    };
  }, [activeView, currentMonth, currentYear, selectedDayNum, weekDaysList]);

  // DYNAMIC SCHEDULE EVENTS GENERATOR
  // Uses MOCK_COURSES exact session data if month is May 2026
  // Dynamically simulates classes for other months/years so the calendar is fully operational
  const events: ScheduleEvent[] = useMemo(() => {
    if (currentMonth === 4 && currentYear === 2026) {
      const parsedEvents: ScheduleEvent[] = [];
      MOCK_COURSES.forEach(course => {
        course.sessions.forEach((session, idx) => {
          const dayMatch = session.date.match(/\d+/);
          const dayNum = dayMatch ? parseInt(dayMatch[0], 10) : 1;

          const startTimePart = session.time.split(' - ')[0]; // "09:00 AM"
          const isPM = startTimePart.includes('PM');
          const timeClean = startTimePart.replace(' AM', '').replace(' PM', '');
          const [h, m] = timeClean.split(':').map(Number);
          
          let startHour = h;
          if (isPM && h !== 12) startHour += 12;
          if (!isPM && h === 12) startHour = 0;
          const startMinute = m || 0;

          parsedEvents.push({
            id: `${course.id}_session_${idx}`,
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            color: course.color,
            topic: session.topic,
            subtopic: session.subtopic,
            dateStr: session.date,
            dayNum,
            timeStr: session.time,
            startHour,
            startMinute,
            durationMinutes: 90,
            type: session.type,
            location: session.type === 'Online' ? 'Virtual Zoom Lobby' : course.location,
            faculty: session.faculty || course.instructor.name,
            status: session.status,
            programAssociate: session.programAssociate,
            // Copy missing fields for parity:
            preReads: session.preReads,
            inClassMaterial: session.inClassMaterial,
            postClassMaterial: session.postClassMaterial,
            recordingUrl: session.recordingUrl,
            objective: session.objective,
            feedbackStatus: session.feedbackStatus,
          });
        });
      });
      return parsedEvents.sort((a, b) => {
        if (a.dayNum !== b.dayNum) return a.dayNum - b.dayNum;
        return a.startHour - b.startHour;
      });
    }

    // Dynamic Generator for other months
    const generatedEvents: ScheduleEvent[] = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const courses = MOCK_COURSES.slice(0, 3);
    const topics = [
      "Introductory Lecture & Overview",
      "Systemic Foundations & Paradigms",
      "Midterm Evaluation Preparation",
      "Quantitative Modeling Seminar",
      "Strategic Solutions Showcase"
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon...
      
      // Monday class: Academics 1 (ECON-302)
      if (dayOfWeek === 1) {
        const c = courses[0];
        generatedEvents.push({
          id: `gen_${day}_0`,
          courseId: c.id,
          courseCode: c.code,
          courseTitle: c.title,
          color: c.color,
          topic: topics[day % topics.length],
          dateStr: `${getMonthName(currentMonth)} ${day}`,
          dayNum: day,
          timeStr: "09:00 AM - 10:30 AM",
          startHour: 9,
          startMinute: 0,
          durationMinutes: 90,
          type: "Offline",
          location: c.location,
          faculty: c.instructor.name,
          status: "U"
        });
      }
      // Wednesday class: Academics 2 (BUS-101)
      else if (dayOfWeek === 3) {
        const c = courses[1];
        generatedEvents.push({
          id: `gen_${day}_1`,
          courseId: c.id,
          courseCode: c.code,
          courseTitle: c.title,
          color: c.color,
          topic: topics[(day + 1) % topics.length],
          dateStr: `${getMonthName(currentMonth)} ${day}`,
          dayNum: day,
          timeStr: "11:15 AM - 12:45 PM",
          startHour: 11,
          startMinute: 15,
          durationMinutes: 90,
          type: "Online",
          location: "Virtual Zoom Lobby",
          faculty: c.instructor.name,
          status: "U"
        });
      }
      // Friday class: Academics 3 (HCI-402)
      else if (dayOfWeek === 5) {
        const c = courses[2];
        generatedEvents.push({
          id: `gen_${day}_2`,
          courseId: c.id,
          courseCode: c.code,
          courseTitle: c.title,
          color: c.color,
          topic: topics[(day + 2) % topics.length],
          dateStr: `${getMonthName(currentMonth)} ${day}`,
          dayNum: day,
          timeStr: "02:00 PM - 03:30 PM",
          startHour: 14,
          startMinute: 0,
          durationMinutes: 90,
          type: "Hybrid",
          location: c.location,
          faculty: c.instructor.name,
          status: "U"
        });
      }
    }
    return generatedEvents;
  }, [currentMonth, currentYear]);

  const selectedDayEvents = useMemo(() => {
    return events.filter(e => e.dayNum === selectedDayNum);
  }, [events, selectedDayNum]);

  // SIMULATED "LIVE NOW" DETECTOR
  // Simulates that the ECON-302 lecture on May 10, 2026 (9:00 AM - 10:30 AM) is currently active!
  const isEventLiveNow = (event: ScheduleEvent) => {
    return event.courseCode === 'ECON-302' && event.dayNum === 10 && currentMonth === 4 && currentYear === 2026;
  };

  // PERIOD NAVIGATION ARROW CLICK HANDLERS
  const handlePrevPeriod = () => {
    if (activeView === 'month' || activeView === 'agenda') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
      setSelectedDayNum(1);
    } else if (activeView === 'week') {
      const newWeekStart = new Date(selectedWeekStartDay);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      setSelectedWeekStartDay(newWeekStart);
      setCurrentMonth(newWeekStart.getMonth());
      setCurrentYear(newWeekStart.getFullYear());
      setSelectedDayNum(newWeekStart.getDate());
    } else if (activeView === 'day') {
      if (selectedDayNum === 1) {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastDayOfPrev = new Date(prevYear, prevMonth + 1, 0).getDate();
        setCurrentMonth(prevMonth);
        setCurrentYear(prevYear);
        setSelectedDayNum(lastDayOfPrev);
      } else {
        setSelectedDayNum(prev => prev - 1);
      }
    }
  };

  const handleNextPeriod = () => {
    if (activeView === 'month' || activeView === 'agenda') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
      setSelectedDayNum(1);
    } else if (activeView === 'week') {
      const newWeekStart = new Date(selectedWeekStartDay);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      setSelectedWeekStartDay(newWeekStart);
      setCurrentMonth(newWeekStart.getMonth());
      setCurrentYear(newWeekStart.getFullYear());
      setSelectedDayNum(newWeekStart.getDate());
    } else if (activeView === 'day') {
      const lastDayOfCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();
      if (selectedDayNum === lastDayOfCurrent) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        setCurrentMonth(nextMonth);
        setCurrentYear(nextYear);
        setSelectedDayNum(1);
      } else {
        setSelectedDayNum(prev => prev + 1);
      }
    }
  };

  const handleSnapToToday = () => {
    // Snap back to academic test core day May 10, 2026
    setCurrentMonth(4); // May
    setCurrentYear(2026);
    setSelectedDayNum(10);
    setSelectedWeekStartDay(new Date(2026, 4, 4)); // Monday, May 4
  };

  const handleOpenDatePicker = () => {
    setTempMonth(currentMonth);
    setTempYear(currentYear);
    setIsDatePickerVisible(true);
  };

  const handleApplyDatePicker = () => {
    setCurrentMonth(tempMonth);
    setCurrentYear(tempYear);
    setSelectedDayNum(1);
    
    // Set week start day aligned with the 1st of that month
    const newWeekStart = new Date(tempYear, tempMonth, 1);
    setSelectedWeekStartDay(newWeekStart);
    setIsDatePickerVisible(false);
  };

  const handleOpenEventModal = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setUserRating(0); // Reset interactive rating state for selected session
    setIsModalVisible(true);
  };

  // Helper to render individual pre-read or learning document links
  const renderMaterialItem = (mat: any, idx: number, defaultIcon: any, color: string) => {
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
          <Ionicons name="link-outline" size={12} color={color} />
          <Text
            variant="medium"
            style={[
              styles.materialItemText,
              { color: color, textDecorationLine: 'underline' }
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
      <DefaultView style={styles.bgAccent} />

      {/* Modern Calendar Header with Today control */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={c.text} />
        </TouchableOpacity>
        
        {/* Main Period switcher display */}
        <View style={styles.headerDateContainer}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handlePrevPeriod}
            style={[styles.arrowNavBtn, { borderColor: c.border }]}
          >
            <Ionicons name="chevron-back" size={16} color={c.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleOpenDatePicker}
            style={styles.headerLabelWrapper}
          >
            <DefaultView style={{ alignItems: 'center', backgroundColor: 'transparent' }}>
              <Text variant="bold" style={[styles.headerTitle, { color: c.text }]}>
                {headerTitle}
              </Text>
              {headerSubtitle ? (
                <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary, marginTop: 2, letterSpacing: 0.5 }}>
                  {headerSubtitle}
                </Text>
              ) : null}
            </DefaultView>
            <Ionicons name="caret-down" size={12} color={c.gold} style={{ marginLeft: 6, marginTop: headerSubtitle ? -4 : 4 }} />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleNextPeriod}
            style={[styles.arrowNavBtn, { borderColor: c.border }]}
          >
            <Ionicons name="chevron-forward" size={16} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Today trigger */}
        <DefaultView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', marginLeft: 8 }}>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={handleSnapToToday}
            style={[styles.todayBadgeBtn, { borderColor: c.gold, backgroundColor: c.card }]}
          >
            <Text variant="bold" style={{ fontSize: 8, color: c.gold, letterSpacing: 0.5 }}>TODAY</Text>
          </TouchableOpacity>
        </DefaultView>
      </View>

      {/* View Segmented Switcher */}
      <DefaultView style={[styles.tabBar, { backgroundColor: c.card, borderColor: c.border }]}>
        {(['agenda', 'day', 'week', 'month'] as const).map((view) => {
          const isActive = activeView === view;
          return (
            <TouchableOpacity
              key={view}
              activeOpacity={0.8}
              style={[
                styles.tabBtn,
                isActive && { backgroundColor: c.cardSecondary, borderColor: c.border }
              ]}
              onPress={() => setActiveView(view)}
            >
              <Text 
                variant="bold" 
                style={[
                  styles.tabBtnLabel,
                  { color: isActive ? c.gold : c.textSecondary }
                ]}
              >
                {view.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DefaultView>

      {/* Dynamic view screen container */}
      <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
        
        {/* Agenda View */}
        {activeView === 'agenda' && (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text variant="bold" style={[styles.viewTitle, { color: c.textSecondary }]}>
              UPCOMING EVENTS LIST
            </Text>
            
            {events.length === 0 ? (
              <View style={styles.emptyTimelineContainer}>
                <Ionicons name="calendar-outline" size={48} color={c.textSecondary} style={{ opacity: 0.3 }} />
                <Text variant="medium" style={{ color: c.textSecondary, marginTop: 12, fontSize: 13 }}>
                  No sessions scheduled.
                </Text>
              </View>
            ) : (
              events.map((event, idx) => {
                const showDateHeader = idx === 0 || events[idx - 1].dayNum !== event.dayNum;
                const isLive = isEventLiveNow(event);

                return (
                  <DefaultView key={event.id} style={{ backgroundColor: 'transparent' }}>
                    {showDateHeader && (
                      <Text variant="bold" style={[styles.dateHeaderLabel, { color: c.text, marginTop: idx === 0 ? 0 : 20 }]}>
                        {getDayName(event.dayNum)}, {event.dateStr}
                      </Text>
                    )}

                    <TouchableOpacity
                      key={event.id}
                      activeOpacity={0.8}
                      onPress={() => handleOpenEventModal(event)}
                      style={[
                        styles.agendaCard, 
                        { backgroundColor: c.card, borderColor: isLive ? '#30D158' : c.border },
                        isLive && { borderWidth: 1.5 }
                      ]}
                    >
                      <DefaultView style={[styles.colorIndicator, { backgroundColor: isLive ? '#30D158' : event.color }]} />
                      
                      <DefaultView style={styles.agendaCardBody}>
                        <View style={styles.agendaCardTop}>
                          <DefaultView style={[styles.badge, { backgroundColor: c.border }]}>
                            <Text variant="bold" style={[styles.badgeText, { color: c.text }]}>
                              {event.courseCode}
                            </Text>
                          </DefaultView>

                          {isLive ? (
                            <DefaultView style={[styles.badge, { backgroundColor: '#30D15815' }]}>
                              <DefaultView style={styles.livePulseDot} />
                              <Text variant="bold" style={[styles.badgeText, { color: '#30D158' }]}>LIVE NOW</Text>
                            </DefaultView>
                          ) : (
                            <DefaultView style={[styles.badge, { backgroundColor: event.color + '15' }]}>
                              <Ionicons 
                                name={event.type === 'Online' ? 'videocam-outline' : 'location-outline'} 
                                size={10} 
                                color={event.color} 
                              />
                              <Text variant="bold" style={[styles.badgeText, { color: event.color, marginLeft: 3 }]}>
                                {event.type}
                              </Text>
                            </DefaultView>
                          )}
                        </View>

                        <Text variant="bold" style={[styles.eventTopic, { color: c.text }]} numberOfLines={1}>
                          {event.topic}
                        </Text>

                        <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 4 }}>
                          <Ionicons name="time-outline" size={11} color={c.textSecondary} /> {event.timeStr}  •  {event.location}
                        </Text>

                        {isLive && (
                          <TouchableOpacity
                            style={[styles.cardQuickJoinBtn, { backgroundColor: '#30D158' }]}
                            activeOpacity={0.8}
                            onPress={() => {
                              Linking.openURL('https://zoom.us/join').catch(err => console.error("Link open failed", err));
                            }}
                          >
                            <Ionicons name="videocam-outline" size={12} color="#000000" style={{ marginRight: 4 }} />
                            <Text variant="bold" style={{ fontSize: 9, color: '#000000', letterSpacing: 0.5 }}>LAUNCH CLASSROOM</Text>
                          </TouchableOpacity>
                        )}
                      </DefaultView>
                      <Ionicons name="chevron-forward" size={16} color={isLive ? '#30D158' : event.color} style={{ marginRight: 8, opacity: 0.8 }} />
                    </TouchableOpacity>
                  </DefaultView>
                );
              })
            )}
            <DefaultView style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* Day View */}
        {activeView === 'day' && (
          <DefaultView style={{ flex: 1 }}>
            {/* Horizontal day pick scroll */}
            <DefaultView style={{ height: 64, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: 'transparent' }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalDaysScroll}
              >
                {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => i + 1).map((day) => {
                  const isSelected = selectedDayNum === day;
                  const dayEvents = events.filter(e => e.dayNum === day);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <TouchableOpacity
                      key={day}
                      activeOpacity={0.8}
                      onPress={() => setSelectedDayNum(day)}
                      style={[
                        styles.daySelectorBtn,
                        isSelected && { backgroundColor: c.gold + '15', borderColor: c.gold }
                      ]}
                    >
                      <Text variant="medium" style={{ fontSize: 9, color: isSelected ? c.gold : c.textSecondary }}>
                        {getDayName(day).slice(0, 3).toUpperCase()}
                      </Text>
                      <Text variant="bold" style={{ fontSize: 15, color: isSelected ? c.gold : c.text, marginTop: 2 }}>
                        {day}
                      </Text>
                      {hasEvents && (
                        <DefaultView style={[styles.dayDotIndicator, { backgroundColor: isSelected ? c.gold : c.textSecondary + '70' }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </DefaultView>

            {/* Timed scroll blocks */}
            <ScrollView 
              contentContainerStyle={{ paddingVertical: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <Text variant="bold" style={[styles.viewTitle, { color: c.textSecondary, marginHorizontal: 20 }]}>
                {getDayName(selectedDayNum).toUpperCase()}, {getMonthName(currentMonth).toUpperCase()} {selectedDayNum}
              </Text>

              {selectedDayEvents.length === 0 ? (
                <View style={styles.emptyTimelineContainer}>
                  <Ionicons name="calendar-outline" size={48} color={c.textSecondary} style={{ opacity: 0.3 }} />
                  <Text variant="medium" style={{ color: c.textSecondary, marginTop: 12, fontSize: 13 }}>
                    No sessions scheduled.
                  </Text>
                </View>
              ) : (
                <DefaultView style={styles.timelineWrapper}>
                  <DefaultView style={styles.timelineHoursCol}>
                    {Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => {
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour > 12 ? hour - 12 : hour;
                      return (
                        <DefaultView key={hour} style={styles.timeHourBlock}>
                          <Text variant="bold" style={{ fontSize: 10, color: c.textSecondary }}>
                            {displayHour}:00 {ampm}
                          </Text>
                        </DefaultView>
                      );
                    })}
                  </DefaultView>

                  <DefaultView style={[styles.timelineGridCol, { borderColor: c.border }]}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <DefaultView key={i} style={[styles.timelineGridHourLine, { borderBottomColor: c.border + '30' }]} />
                    ))}

                    {selectedDayEvents.map((event) => {
                      const topOffset = (event.startHour - 8) * 60 + (event.startMinute / 60) * 60;
                      const cardHeight = (event.durationMinutes / 60) * 60;
                      const isLive = isEventLiveNow(event);

                      return (
                        <TouchableOpacity
                          key={event.id}
                          activeOpacity={0.9}
                          onPress={() => handleOpenEventModal(event)}
                          style={[
                            styles.plottedDayCard,
                            { 
                              top: topOffset, 
                              height: cardHeight, 
                              backgroundColor: isLive ? '#30D15815' : event.color + '15',
                              borderColor: isLive ? '#30D158' : event.color,
                            },
                            isLive && { borderWidth: 1.5 }
                          ]}
                        >
                          <DefaultView style={[styles.plottedCardAccent, { backgroundColor: isLive ? '#30D158' : event.color }]} />
                          <DefaultView style={{ flex: 1, padding: 8, backgroundColor: 'transparent' }}>
                            <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' }}>
                              <Text variant="bold" style={{ fontSize: 10, color: isLive ? '#30D158' : event.color }}>
                                {event.courseCode}  •  {event.type}
                              </Text>
                              {isLive && (
                                <DefaultView style={[styles.badge, { backgroundColor: '#30D15825', paddingVertical: 1, paddingHorizontal: 4 }]}>
                                  <Text variant="bold" style={{ fontSize: 6, color: '#30D158' }}>🔴 LIVE</Text>
                                </DefaultView>
                              )}
                            </DefaultView>
                            <Text variant="bold" style={[styles.plottedCardTopic, { color: c.text }]} numberOfLines={1}>
                              {event.topic}
                            </Text>
                            <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                              {event.timeStr}
                            </Text>
                          </DefaultView>
                        </TouchableOpacity>
                      );
                    })}
                  </DefaultView>
                </DefaultView>
              )}
              <DefaultView style={{ height: 40 }} />
            </ScrollView>
          </DefaultView>
        )}

        {/* Week View */}
        {activeView === 'week' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
            <Text variant="bold" style={[styles.viewTitle, { color: c.textSecondary, marginHorizontal: 20 }]}>
              WEEKLY GRID MATRIX
            </Text>

            <DefaultView style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 10 }}>
              {/* Left Column: Fixed Time Ruler (Stays fixed horizontally, scrolls vertically with grid) */}
              <DefaultView style={styles.weekTimelineHoursCol}>
                {Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => {
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour > 12 ? hour - 12 : hour;
                  return (
                    <DefaultView key={hour} style={[styles.timeHourBlock, { height: 60 }]}>
                      <Text variant="bold" style={{ fontSize: 9, color: c.textSecondary }}>
                        {displayHour} {ampm}
                      </Text>
                    </DefaultView>
                  );
                })}
              </DefaultView>

              {/* Right Column: Horizontally Scrollable Days Grid */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                {weekDaysList.map((cell, idx) => {
                  const dayEvents = events.filter(e => e.dayNum === cell.dayNum && cell.month === currentMonth);
                  const isToday = cell.dayNum === selectedDayNum;

                  return (
                    <DefaultView key={idx} style={[styles.weekDayCol, { borderColor: c.border }, isToday && { backgroundColor: c.cardSecondary + '20' }]}>
                      <DefaultView style={[styles.weekColHeader, { borderBottomColor: c.border }]}>
                        <Text variant="bold" style={{ fontSize: 10, color: isToday ? c.gold : c.textSecondary }}>
                          {getDayNameForDate(cell.date).slice(0, 3).toUpperCase()}
                        </Text>
                        <DefaultView style={[styles.weekColHeaderCircle, isToday && { backgroundColor: c.gold }]}>
                          <Text variant="bold" style={{ fontSize: 12, color: isToday ? '#000' : c.text }}>
                            {cell.dayNum}
                          </Text>
                        </DefaultView>
                      </DefaultView>

                      <DefaultView style={{ flex: 1, position: 'relative' }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <DefaultView key={i} style={[styles.weekColGridLine, { borderBottomColor: c.border + '15', top: (i + 1) * 60 }]} />
                        ))}

                        {dayEvents.map((event) => {
                          const topOffset = (event.startHour - 8) * 60 + (event.startMinute / 60) * 60;
                          const cardHeight = (event.durationMinutes / 60) * 60;
                          const isLive = isEventLiveNow(event);

                          return (
                            <TouchableOpacity
                              key={event.id}
                              activeOpacity={0.9}
                              onPress={() => handleOpenEventModal(event)}
                              style={[
                                styles.plottedWeekCard,
                                {
                                  top: topOffset,
                                  height: cardHeight,
                                  backgroundColor: isLive ? '#30D158' : event.color,
                                },
                                isLive && { borderWidth: 1, borderColor: '#FFFFFF' }
                              ]}
                            >
                              <Text variant="bold" style={[styles.plottedWeekCardCode, isLive && { color: '#000000' }]} numberOfLines={1}>
                                {isLive ? '🔴 LIVE' : event.courseCode}
                              </Text>
                              <Text variant="medium" style={[styles.plottedWeekCardTopic, isLive && { color: '#000000', fontWeight: 'bold' }]} numberOfLines={1}>
                                {event.topic}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </DefaultView>
                    </DefaultView>
                  );
                })}
              </ScrollView>
            </DefaultView>
            <DefaultView style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* Month View */}
        {activeView === 'month' && (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <DefaultView style={styles.monthColHeadersRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <DefaultView key={idx} style={styles.monthHeaderCell}>
                  <Text variant="bold" style={{ fontSize: 11, color: c.textSecondary }}>
                    {day}
                  </Text>
                </DefaultView>
              ))}
            </DefaultView>

            <DefaultView style={[styles.monthGrid, { borderColor: c.border }]}>
              {calendarGrid.map((cell, idx) => {
                const isSelected = selectedDayNum === cell.dayNum && cell.isCurrentMonth;
                const cellEvents = cell.isCurrentMonth ? events.filter(e => e.dayNum === cell.dayNum) : [];
                const hasEvents = cellEvents.length > 0;
                const hasLive = cellEvents.some(isEventLiveNow);

                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDayNum(cell.dayNum);
                      }
                    }}
                    style={[
                      styles.monthCell,
                      { borderColor: c.border + '20' },
                      isSelected && { backgroundColor: c.gold + '12' },
                      hasLive && { borderColor: '#30D158', borderWidth: 0.8 }
                    ]}
                  >
                    <DefaultView style={[
                      styles.monthCellNumCircle, 
                      isSelected ? { backgroundColor: c.gold } : hasLive ? { backgroundColor: '#30D15815' } : null
                    ]}>
                      <Text 
                        variant="bold" 
                        style={[
                          styles.monthCellNumText,
                          { color: !cell.isCurrentMonth ? c.textSecondary + '40' : isSelected ? '#000' : hasLive ? '#30D158' : c.text }
                        ]}
                      >
                        {cell.dayNum}
                      </Text>
                    </DefaultView>

                    <DefaultView style={styles.monthCellDotsRow}>
                      {cellEvents.slice(0, 3).map((event) => (
                        <DefaultView 
                          key={event.id} 
                          style={[styles.monthCellDot, { backgroundColor: isEventLiveNow(event) ? '#30D158' : event.color }]} 
                        />
                      ))}
                    </DefaultView>
                  </TouchableOpacity>
                );
              })}
            </DefaultView>

            {/* Selected day drawer under calendar */}
            <View style={[styles.selectedDayDrawer, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text variant="bold" style={{ fontSize: 13, color: c.gold, letterSpacing: 0.5, marginBottom: 12 }}>
                {getDayName(selectedDayNum).toUpperCase()}, {getMonthName(currentMonth).toUpperCase()} {selectedDayNum} LECTURES
              </Text>

              {selectedDayEvents.length === 0 ? (
                <Text variant="medium" style={{ fontSize: 12, color: c.textSecondary }}>
                  No classes scheduled.
                </Text>
              ) : (
                selectedDayEvents.map((event) => {
                  const isLive = isEventLiveNow(event);
                  return (
                    <TouchableOpacity
                      key={event.id}
                      activeOpacity={0.7}
                      onPress={() => handleOpenEventModal(event)}
                      style={[styles.drawerItemRow, { borderBottomColor: c.border }]}
                    >
                      <DefaultView style={[styles.drawerDot, { backgroundColor: isLive ? '#30D158' : event.color }]} />
                      <DefaultView style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <DefaultView style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
                          <Text variant="bold" style={{ fontSize: 13, color: c.text }}>
                            {event.courseCode}  •  {event.topic}
                          </Text>
                          {isLive && (
                            <DefaultView style={[styles.badge, { backgroundColor: '#30D15815', paddingVertical: 1 }]}>
                              <Text variant="bold" style={{ fontSize: 6, color: '#30D158' }}>🔴 LIVE</Text>
                            </DefaultView>
                          )}
                        </DefaultView>
                        <Text variant="medium" style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>
                          {event.timeStr}
                        </Text>
                      </DefaultView>
                      <Ionicons name="arrow-forward" size={14} color={isLive ? '#30D158' : event.color} />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
            <DefaultView style={{ height: 40 }} />
          </ScrollView>
        )}
      </DefaultView>

      {/* DIRECT DATE SELECTOR POPUP DRAWER MODAL (Month, Year) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDatePickerVisible}
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsDatePickerVisible(false)}
        >
          <DefaultView style={{ flex: 1 }} />
        </TouchableOpacity>

        <View style={[styles.pickerModalContent, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          <Text variant="bold" style={[styles.pickerTitle, { color: c.text }]}>
            Jump to Date
          </Text>

          <DefaultView style={styles.pickerColumnsRow}>
            {/* Left Column: Months list */}
            <DefaultView style={{ flex: 1.2, backgroundColor: 'transparent' }}>
              <Text variant="bold" style={[styles.pickerColTitle, { color: c.textSecondary }]}>SELECT MONTH</Text>
              <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                {monthNames.map((name, idx) => {
                  const isSelected = tempMonth === idx;
                  return (
                    <TouchableOpacity
                      key={name}
                      style={[
                        styles.pickerPill,
                        { 
                          backgroundColor: isSelected ? c.gold + '15' : c.card, 
                          borderColor: isSelected ? c.gold : c.border 
                        }
                      ]}
                      onPress={() => setTempMonth(idx)}
                    >
                      <Text variant="bold" style={{ fontSize: 12, color: isSelected ? c.gold : c.text }}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </DefaultView>

            {/* Right Column: Years list */}
            <DefaultView style={{ flex: 0.8, backgroundColor: 'transparent' }}>
              <Text variant="bold" style={[styles.pickerColTitle, { color: c.textSecondary }]}>SELECT YEAR</Text>
              <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                {[2024, 2025, 2026, 2027, 2028].map((yr) => {
                  const isSelected = tempYear === yr;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[
                        styles.pickerPill,
                        { 
                          backgroundColor: isSelected ? c.gold + '15' : c.card, 
                          borderColor: isSelected ? c.gold : c.border 
                        }
                      ]}
                      onPress={() => setTempYear(yr)}
                    >
                      <Text variant="bold" style={{ fontSize: 12, color: isSelected ? c.gold : c.text }}>
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </DefaultView>
          </DefaultView>

          {/* Action Row */}
          <DefaultView style={[styles.pickerFooterRow, { borderTopColor: c.border }]}>
            <TouchableOpacity 
              style={[styles.pickerActionBtn, styles.pickerCancelBtn, { borderColor: c.border }]}
              onPress={() => setIsDatePickerVisible(false)}
            >
              <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.pickerActionBtn, styles.pickerApplyBtn, { backgroundColor: c.gold }]}
              onPress={handleApplyDatePicker}
            >
              <Text variant="bold" style={{ fontSize: 13, color: '#000' }}>Apply Date</Text>
            </TouchableOpacity>
          </DefaultView>
        </View>
      </Modal>

      {/* LECTURE DETAILS SLEEK MODAL - FULLY ALIGNED WITH INTERNAL COURSE SESSIONS SCREEN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible && selectedEvent !== null}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsModalVisible(false)}
        >
          <DefaultView style={{ flex: 1 }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: c.cardSecondary, borderColor: c.border }]}>
          <DefaultView style={[styles.dragHandle, { backgroundColor: c.border }]} />
          
          <TouchableOpacity style={styles.closeIconBtn} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </TouchableOpacity>

          {selectedEvent && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sessionModalScroll}>
              <DefaultView style={styles.sessionModalHeader}>
                <DefaultView style={styles.sessionModalBadgeRow}>
                  <DefaultView style={[styles.badge, { backgroundColor: selectedEvent.color + '15' }]}>
                    <Text variant="bold" style={[styles.badgeText, { color: selectedEvent.color }]}>
                      {selectedEvent.courseCode}
                    </Text>
                  </DefaultView>
                  <DefaultView style={[
                    styles.sessionStatusCircle, 
                    { 
                      backgroundColor: selectedEvent.status === 'P' ? c.green : selectedEvent.status === 'A' ? '#FF4A4A' : '#8E8E93',
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                    }
                  ]}>
                    <Text variant="bold" style={{ fontSize: 10, color: '#000' }}>
                      {selectedEvent.status}
                    </Text>
                  </DefaultView>
                </DefaultView>
                
                <Text variant="bold" style={[styles.sessionModalTitle, { color: c.text }]}>
                  {selectedEvent.courseTitle}
                </Text>
                
                <Text variant="medium" style={[styles.sessionModalSubtopic, { color: c.textSecondary, marginTop: 4 }]}>
                  {selectedEvent.topic}
                </Text>

                {selectedEvent.subtopic && (
                  <Text variant="medium" style={[styles.sessionModalSubtopic, { color: c.textSecondary, opacity: 0.8, marginTop: 2 }]}>
                    {selectedEvent.subtopic}
                  </Text>
                )}

                <DefaultView style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6, backgroundColor: 'transparent' }}>
                  <Ionicons name="time-outline" size={14} color={selectedEvent.color} />
                  <Text variant="semiBold" style={{ fontSize: 12, color: c.textSecondary }}>
                    {selectedEvent.dateStr}  •  {selectedEvent.timeStr}
                  </Text>
                </DefaultView>
              </DefaultView>

              <DefaultView style={styles.peopleGrid}>
                <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <DefaultView style={[styles.peopleAvatar, { backgroundColor: selectedEvent.color + '15' }]}>
                    <Ionicons name="school-outline" size={15} color={selectedEvent.color} />
                  </DefaultView>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                      {selectedEvent.faculty}
                    </Text>
                    <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                      Faculty Instructor
                    </Text>
                  </DefaultView>
                </View>

                <View style={[styles.peopleCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <DefaultView style={[styles.peopleAvatar, { backgroundColor: selectedEvent.color + '15' }]}>
                    <Ionicons name="people-outline" size={15} color={selectedEvent.color} />
                  </DefaultView>
                  <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                    <Text variant="bold" style={{ fontSize: 12, color: c.text }} numberOfLines={1}>
                      {selectedEvent.programAssociate || 'Sarah Jenkins'}
                    </Text>
                    <Text variant="medium" style={{ fontSize: 9, color: c.textSecondary }}>
                      Program Associate
                    </Text>
                  </DefaultView>
                </View>
              </DefaultView>

              {/* Custom Delivery Mode Widget - Fully Synchronized */}
              {selectedEvent.type === 'Online' && (
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

                  {selectedEvent.status === 'U' ? (
                    <DefaultView style={{ marginTop: 12, backgroundColor: 'transparent' }}>
                      <Text variant="regular" style={{ fontSize: 12, color: c.textSecondary, lineHeight: 17, marginBottom: 12 }}>
                        This lecture is scheduled online via Zoom. Click the action button below to join the virtual classroom lobby.
                      </Text>
                      <TouchableOpacity 
                        style={[styles.joinClassBtn, { backgroundColor: '#4A90E2' }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          Linking.openURL('https://zoom.us/join').catch(err => console.error("Failed to open link", err));
                        }}
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

              {selectedEvent.type === 'Offline' && (
                <View style={[styles.customDeliveryCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <DefaultView style={styles.deliveryHeaderRow}>
                    <DefaultView style={[styles.deliveryIconBox, { backgroundColor: '#EBC06315' }]}>
                      <Ionicons name="location" size={16} color="#EBC063" />
                    </DefaultView>
                    <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Offline Campus Details</Text>
                      <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                        Location: {selectedEvent.location}
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

                      {selectedEvent.status === 'U' && (
                        <TouchableOpacity 
                          style={[
                            styles.smallSolidBtn, 
                            { 
                              backgroundColor: checkedInSessions[selectedEvent.topic] ? c.green + '20' : selectedEvent.color,
                              borderColor: checkedInSessions[selectedEvent.topic] ? c.green : 'transparent',
                              borderWidth: checkedInSessions[selectedEvent.topic] ? 1 : 0
                            }
                          ]}
                          activeOpacity={0.7}
                          onPress={() => setCheckedInSessions(prev => ({ ...prev, [selectedEvent.topic]: true }))}
                        >
                          <Ionicons 
                            name={checkedInSessions[selectedEvent.topic] ? "checkmark-circle" : "checkbox-outline"} 
                            size={13} 
                            color={checkedInSessions[selectedEvent.topic] ? c.green : '#000'} 
                            style={{ marginRight: 4 }} 
                          />
                          <Text variant="bold" style={{ fontSize: 12, color: checkedInSessions[selectedEvent.topic] ? c.green : '#000' }}>
                            {checkedInSessions[selectedEvent.topic] ? "Checked In" : "Check In"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </DefaultView>
                  </DefaultView>
                </View>
              )}

              {selectedEvent.type === 'Hybrid' && (
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
                        {selectedEvent.location.split(',')[0]}
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

              {/* Session Objective */}
              {selectedEvent.objective && (
                <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                    SESSION OBJECTIVE
                  </Text>
                  <Text variant="regular" style={[styles.bodyText, { color: c.text }]}>
                    {selectedEvent.objective}
                  </Text>
                </View>
              )}

              {/* Recording Action Card */}
              {selectedEvent.recordingUrl && (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={[styles.recordingCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}
                  onPress={() => {
                    Linking.openURL(selectedEvent.recordingUrl!).catch(err => console.error("Failed to open recordingUrl", err));
                  }}
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

              {/* Learning Materials Container */}
              {((selectedEvent.preReads && selectedEvent.preReads.length > 0) || 
                (selectedEvent.inClassMaterial && selectedEvent.inClassMaterial.length > 0) || 
                (selectedEvent.postClassMaterial && selectedEvent.postClassMaterial.length > 0)) && (
                <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary, marginBottom: 8 }]}>
                    LEARNING MATERIALS
                  </Text>

                  {/* Pre-Reads */}
                  {selectedEvent.preReads && selectedEvent.preReads.length > 0 && (
                    <DefaultView style={styles.materialSubGroup}>
                      <DefaultView style={styles.materialSubHeader}>
                        <Ionicons name="book-outline" size={13} color={selectedEvent.color} />
                        <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Pre-Reads Material</Text>
                      </DefaultView>
                      {selectedEvent.preReads.map((mat, idx) => renderMaterialItem(mat, idx, 'document-text-outline', selectedEvent.color))}
                    </DefaultView>
                  )}

                  {/* In-Class */}
                  {selectedEvent.inClassMaterial && selectedEvent.inClassMaterial.length > 0 && (
                    <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                      <DefaultView style={styles.materialSubHeader}>
                        <Ionicons name="easel-outline" size={13} color={selectedEvent.color} />
                        <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>In-Class Material</Text>
                      </DefaultView>
                      {selectedEvent.inClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'document-attach-outline', selectedEvent.color))}
                    </DefaultView>
                  )}

                  {/* Post-Class */}
                  {selectedEvent.postClassMaterial && selectedEvent.postClassMaterial.length > 0 && (
                    <DefaultView style={[styles.materialSubGroup, { marginTop: 14 }]}>
                      <DefaultView style={styles.materialSubHeader}>
                        <Ionicons name="checkbox-outline" size={13} color={selectedEvent.color} />
                        <Text variant="bold" style={[styles.materialSubTitle, { color: c.text }]}>Post-Class Material</Text>
                      </DefaultView>
                      {selectedEvent.postClassMaterial.map((mat, idx) => renderMaterialItem(mat, idx, 'clipboard-outline', selectedEvent.color))}
                    </DefaultView>
                  )}
                </View>
              )}

              {/* Interactive Rating & Feedback Widget for past sessions */}
              {selectedEvent.status !== 'U' && (
                <View style={[styles.detailSectionCard, { backgroundColor: c.card, borderColor: c.border, marginTop: 16 }]}>
                  <Text variant="bold" style={[styles.sectionHeading, { color: c.textSecondary }]}>
                    SESSION RATING & FEEDBACK
                  </Text>

                  {(() => {
                    const feedbackState = feedbackSubmissions[selectedEvent.topic] || selectedEvent.feedbackStatus || 'pending';
                    
                    if (feedbackState === 'submitted') {
                      return (
                        <DefaultView style={[styles.feedbackSubmittedRow, { backgroundColor: c.green + '12', borderColor: c.green + '30' }]}>
                          <Ionicons name="checkmark-circle" size={20} color={c.green} style={{ marginRight: 10 }} />
                          <DefaultView style={{ backgroundColor: 'transparent', flex: 1 }}>
                            <Text variant="bold" style={{ fontSize: 13, color: c.text }}>Feedback Submitted</Text>
                            <Text variant="medium" style={{ fontSize: 10, color: c.textSecondary, marginTop: 1 }}>
                              Thank you! Your ratings have been logged directly with the course faculty.
                            </Text>
                          </DefaultView>
                        </DefaultView>
                      );
                    }

                    return (
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
                              onPress={() => setUserRating(star)}
                            >
                              <Ionicons
                                name={userRating >= star ? "star" : "star-outline"}
                                size={26}
                                color={userRating >= star ? selectedEvent.color : c.textSecondary}
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
                              backgroundColor: userRating > 0 ? selectedEvent.color : c.border,
                            }
                          ]}
                          disabled={userRating === 0}
                          activeOpacity={0.8}
                          onPress={() => {
                            if (userRating > 0) {
                              setFeedbackSubmissions(prev => ({
                                ...prev,
                                [selectedEvent.topic]: 'submitted'
                              }));
                            }
                          }}
                        >
                          <Text variant="bold" style={{ fontSize: 13, color: userRating > 0 ? '#000' : c.textSecondary }}>
                            Submit Feedback
                          </Text>
                        </TouchableOpacity>
                      </DefaultView>
                    );
                  })()}
                </View>
              )}

              {/* Spacer at the bottom of the ScrollView */}
              <DefaultView style={{ height: 20 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const cellWidth = Math.floor((screenWidth - 40) / 7);

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
    backgroundColor: '#4A90E2',
    opacity: 0.04,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'transparent',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  arrowNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  todayBadgeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
  },
  headerLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 4,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    letterSpacing: -0.4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    height: 44,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnLabel: {
    fontSize: 10,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  viewTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 14,
    marginTop: 6,
  },
  dateHeaderLabel: {
    fontSize: 15,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  agendaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  colorIndicator: {
    width: 5,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  agendaCardBody: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  agendaCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
    marginRight: 4,
  },
  cardQuickJoinBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  eventTopic: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  horizontalDaysScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  daySelectorBtn: {
    width: 44,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayDotIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  emptyTimelineContainer: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineWrapper: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  timelineHoursCol: {
    width: 64,
    backgroundColor: 'transparent',
  },
  timeHourBlock: {
    height: 60,
    justifyContent: 'flex-start',
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  timelineGridCol: {
    flex: 1,
    borderLeftWidth: 1,
    height: 660, // 11 slots * 60px
    position: 'relative',
    backgroundColor: 'transparent',
  },
  timelineGridHourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    top: 60,
  },
  plottedDayCard: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  plottedCardAccent: {
    width: 4,
    height: '100%',
  },
  plottedCardTopic: {
    fontSize: 12,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  weekTimelineHoursCol: {
    width: 44,
    backgroundColor: 'transparent',
    paddingTop: 50,
  },
  weekDayCol: {
    width: 100,
    borderLeftWidth: 1,
    height: 710, // 50px header + 11 slots * 60px
    backgroundColor: 'transparent',
  },
  weekColHeader: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
    gap: 2,
  },
  weekColHeaderCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekColGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  plottedWeekCard: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 8,
    padding: 6,
    overflow: 'hidden',
  },
  plottedWeekCardCode: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Outfit-Bold',
  },
  plottedWeekCardTopic: {
    fontSize: 8,
    color: '#000000',
    marginTop: 1,
  },
  monthColHeadersRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 8,
    width: cellWidth * 7,
  },
  monthHeaderCell: {
    width: cellWidth,
    alignItems: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    width: cellWidth * 7,
  },
  monthCell: {
    width: cellWidth,
    height: 60,
    borderWidth: 0.5,
    alignItems: 'center',
    paddingTop: 8,
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  monthCellNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCellNumText: {
    fontSize: 11,
  },
  monthCellDotsRow: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: 'transparent',
  },
  monthCellDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDayDrawer: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
    gap: 12,
  },
  drawerDot: {
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
    maxHeight: '85%',
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
  closeIconBtn: {
    position: 'absolute',
    top: 14,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
  sessionModalTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 26,
    backgroundColor: 'transparent',
  },
  sessionModalSubtopic: {
    fontSize: 13,
    lineHeight: 18,
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
    padding: 18,
  },
  deliveryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  deliveryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinClassBtn: {
    height: 44,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  smallOutlineBtn: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  smallSolidBtn: {
    height: 38,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  sessionStatusCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 24,
    maxHeight: 420,
  },
  pickerTitle: {
    fontSize: 18,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  pickerColumnsRow: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  pickerColTitle: {
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 10,
  },
  pickerPill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
    backgroundColor: 'transparent',
  },
  pickerActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCancelBtn: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  pickerApplyBtn: {},
  // Parity styles added
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 6,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
    backgroundColor: 'transparent',
  },
  feedbackSubmitBtn: {
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
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
});
