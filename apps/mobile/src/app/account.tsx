import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';

export default function AccountScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={{
        paddingTop: safeAreaInsets.top + Spacing.four,
        paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        paddingHorizontal: Spacing.four,
      }}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Account</ThemedText>
        <ThemedText themeColor="textSecondary">Signed out</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.three,
  },
});