import { useEffect, useMemo, useRef } from 'react';

import { Image } from 'expo-image';

import {
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { pointDescription, pointPhotoSource } from '@/data/point-content';
import { regionDescription, regionPhotoSource } from '@/data/region-content';
import {
  wonderDescription,
  wonderPhotoSource,
} from '@/data/wonder-content';

import type { MapSelection } from '@/types/map-selection';

type MapBottomPanelProps = {
  selection: MapSelection | null;
  onClearSelection: () => void;
  isPlacingPin: boolean;
};

export function MapBottomPanel({
  selection,
  onClearSelection,
  isPlacingPin,
}: MapBottomPanelProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(
    () => ['18%', '50%', '85%'],
    []
  );

  // Hide the sheet while placing a pin. Otherwise follow the selection.
  useEffect(() => {
    if (isPlacingPin) {
      bottomSheetRef.current?.close();
      return;
    }

    bottomSheetRef.current?.snapToIndex(selection ? 1 : 0);
  }, [isPlacingPin, selection]);

  const handleExpand = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleBack = () => {
    onClearSelection();

    bottomSheetRef.current?.snapToIndex(0);
  };

  const isRegion = selection?.type === 'region';
  const isWonder = selection?.type === 'wonder';

  const descriptionBody = useMemo(() => {
    if (!selection) {
      return undefined;
    }

    switch (selection.type) {
      case 'wonder':
        return (
          wonderDescription(selection.id) ??
          'Add a description for this wonder in assets/content/wonder-content.json.'
        );
      case 'region':
        return (
          regionDescription(selection.id) ??
          'Add a description for this region in assets/content/region-content.json.'
        );
      case 'point':
        return (
          pointDescription(selection.name) ??
          'Add a description for this feature in assets/content/point-content.json.'
        );
    }
  }, [selection]);

  const heroImage = useMemo(() => {
    if (!selection) {
      return null;
    }

    switch (selection.type) {
      case 'wonder':
        return wonderPhotoSource(selection.id);
      case 'region':
        return regionPhotoSource(selection.id);
      case 'point':
        return pointPhotoSource(selection.name);
      default:
        return null;
    }
  }, [selection]);

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
                : isWonder
                  ? 'WONDER'
                  : 'GEOGRAPHICAL FEATURE'}
            </Text>

            {heroImage ? (
              <Image
                source={heroImage}
                style={styles.heroImage}
                contentFit="cover"
                accessibilityLabel={selection.name}
              />
            ) : null}

            <Text style={styles.title}>
              {selection.name}
            </Text>

            <Text style={styles.description}>{descriptionBody}</Text>

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

  heroImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: '#E8E4DC',
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