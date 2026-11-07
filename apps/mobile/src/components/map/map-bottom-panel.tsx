import { useEffect, useMemo, useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import type { MapSelection } from '@/types/map-selection';

type MapBottomPanelProps = {
  selection: MapSelection | null;
  onClearSelection: () => void;
};

export function MapBottomPanel({
  selection,
  onClearSelection,
}: MapBottomPanelProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(
    () => ['18%', '50%', '85%'],
    []
  );

  // Expand the bottom sheet when a feature is selected.
  useEffect(() => {
    if (selection) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [selection]);

  const handleExpand = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleBack = () => {
    onClearSelection();

    bottomSheetRef.current?.snapToIndex(0);
  };

  const isRegion = selection?.type === 'region';

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

        {selection ? (
          <>
            {/* Selected geographical feature */}

            <Text style={styles.category}>
              {isRegion
                ? 'GEOGRAPHICAL REGION'
                : 'GEOGRAPHICAL FEATURE'}
            </Text>

            <Text style={styles.title}>
              {selection.name}
            </Text>

            <Text style={styles.description}>
              {isRegion
                ? 'Explore this geographical region.'
                : 'Explore this geographical feature.'}
            </Text>

            <Pressable
              style={styles.button}
              onPress={handleBack}
            >
              <Text style={styles.buttonText}>
                Back to Explore
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Default panel */}

            <Text style={styles.title}>
              Explore the World
            </Text>

            <Text style={styles.description}>
              Discover places, collect stamps,
              and share your memories.
            </Text>

            <Pressable
              style={styles.button}
              onPress={handleExpand}
            >
              <Text style={styles.buttonText}>
                Explore Places
              </Text>
            </Pressable>
          </>
        )}

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

  category: {
    fontSize: 11,
    fontWeight: '700',
    color: '#537A5A',
    letterSpacing: 1.5,
    marginBottom: 8,
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