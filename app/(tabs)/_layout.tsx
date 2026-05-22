import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.icon,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color }) => <Ionicons name="megaphone" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Support',
          tabBarIcon: ({ color }) => <Ionicons name="help-buoy" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
