/**
 * Gainbase-inspired Themed Components
 * Integrates premium typography and theme colors.
 */

import { Text as DefaultText, View as DefaultView, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'] & {
  variant?: keyof typeof Typography.fontFamily;
  opacity?: number;
};
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, variant = 'regular', opacity, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  const fontFamily = Typography.fontFamily[variant];

  return (
    <DefaultText 
      style={[
        { color, fontFamily }, 
        opacity !== undefined && { opacity },
        style
      ]} 
      {...otherProps} 
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({});
