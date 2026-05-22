import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickAccessIconProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function QuickAccessIcon({ name, icon, onPress }: QuickAccessIconProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={onPress}>
      <LinearGradient
        colors={[c.card, '#121212']}
        style={[styles.iconWrapper, { borderColor: c.border }]}
      >
        <Ionicons name={icon} size={24} color={c.gold} />
      </LinearGradient>
      <Text variant="medium" style={[styles.label, { color: c.textSecondary }]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 24,
    width: 80,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 24, // More squircle-like
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: -0.1,
    opacity: 0.8,
  },
});
