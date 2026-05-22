import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface TodoItemProps {
  label: string;
  category: string;
  isCompleted?: boolean;
}

export default function TodoItem({ label, category, isCompleted: initialCompleted = false }: TodoItemProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.background, borderColor: theme.tabIconDefault + '33' }]}
      onPress={() => setCompleted(!completed)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={[
          styles.checkbox, 
          { borderColor: theme.tint },
          completed && { backgroundColor: theme.tint }
        ]}>
          {completed && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.label, 
            { color: theme.text },
            completed && styles.completedText
          ]}>
            {label}
          </Text>
          <Text style={[styles.category, { color: theme.icon }]}>{category}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.tabIconDefault} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
});
