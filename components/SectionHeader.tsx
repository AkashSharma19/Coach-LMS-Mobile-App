import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({ title, actionText, onActionPress }: SectionHeaderProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text variant="semiBold" style={[styles.title, { color: c.textSecondary }]}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text variant="semiBold" style={[styles.action, { color: c.gold }]}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  action: {
    fontSize: 13,
  },
});
