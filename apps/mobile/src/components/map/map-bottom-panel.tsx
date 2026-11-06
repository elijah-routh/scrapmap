import { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';

export function MapBottomPanel() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(
    () => ['18%', '50%', '85%'],
    []
  );

  const handleExpand = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>

        <Text style={styles.title}>
          Explore the World
        </Text>

        <Text style={styles.description}>
          Discover places, collect stamps, and share your memories.
        </Text>

        <Pressable
          style={styles.button}
          onPress={handleExpand}
        >
          <Text style={styles.buttonText}>
            Explore Places
          </Text>
        </Pressable>

      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  handle: {
    backgroundColor: '#C5C5C5',
    width: 40,
    height: 5,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#26352A',
  },

  description: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    lineHeight: 20,
  },

  button: {
    marginTop: 18,
    backgroundColor: '#537A5A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});