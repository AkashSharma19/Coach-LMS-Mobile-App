/**
 * Gainbase Premium Design System - Colors
 * A sophisticated dark-mode palette using true-blacks and Apple-style elevated greys.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#EBC063'; // Premium Gold from Coach LMS screenshots

export default {
  light: {
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    background: '#F2F2F7',
    card: '#FFFFFF',
    cardSecondary: '#F2F2F7',
    border: '#E5E5EA',
    tint: tintColorLight,
    tabIconDefault: '#C7C7CC',
    tabIconSelected: tintColorLight,
    gold: tintColorDark,
    blue: '#4A90E2',
    green: '#4CAF50',
    yellow: '#FFE500',
    icon: '#8E8E93',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    background: '#000000',
    card: '#1C1C1E',
    cardSecondary: '#2C2C2E',
    border: '#2C2C2E',
    tint: tintColorDark,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    gold: tintColorDark,
    blue: '#4A90E2',
    green: '#4CAF50',
    yellow: '#FFE500',
    icon: '#8E8E93',
  },
};
