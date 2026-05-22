import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, withSpring, withTiming, useSharedValue } from 'react-native-reanimated';
import { Text } from '../Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AttendanceGaugeProps {
  percentage: number;
}

export default function AttendanceGauge({ percentage }: AttendanceGaugeProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];
  
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedScore = useSharedValue(0);

  useEffect(() => {
    animatedScore.value = withTiming(percentage, { duration: 1500 });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedScore.value / 100);
    return {
      strokeDashoffset,
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper}>
      <ExpoLinearGradient
        colors={[c.card, '#151515']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { borderColor: c.border }]}
      >
        <View style={styles.leftContent}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: c.gold + '15' }]}>
              <Ionicons name="bar-chart-outline" size={16} color={c.gold} />
            </View>
            <Text variant="bold" style={[styles.sectionLabel, { color: c.textSecondary }]}>ATTENDANCE</Text>
          </View>
          
          <Text variant="bold" style={[styles.statusMain, { color: c.text }]}>You're on track!</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: c.gold + '20' }]}>
              <Text variant="bold" style={[styles.badgeText, { color: c.gold }]}>
                KEEP GOING
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightContent}>
          <View style={styles.gaugeWrapper}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Defs>
                <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={c.gold} stopOpacity={0.8} />
                  <Stop offset="100%" stopColor={c.gold} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={c.border}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.2}
              />
              
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#gaugeGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            
            <View style={styles.textOverlay}>
              <Text variant="bold" style={styles.percentageText}>{percentage}%</Text>
              <Text variant="bold" style={styles.overallText}>OVERALL</Text>
            </View>
          </View>
        </View>
      </ExpoLinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  container: {
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    overflow: 'hidden',
  },
  leftContent: {
    flex: 1,
    paddingRight: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1,
    opacity: 0.6,
  },
  statusMain: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  rightContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 24,
    letterSpacing: -1,
  },
  overallText: {
    fontSize: 7,
    opacity: 0.5,
    letterSpacing: 1,
    marginTop: -2,
  },
});
