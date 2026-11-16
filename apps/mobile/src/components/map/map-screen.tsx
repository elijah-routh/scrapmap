import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { WorldMap } from '../world-map';
import { MapFilterBar } from './map-filter-bar';
import { MapControls } from './map-controls';
import { MapBottomPanel } from './map-bottom-panel';

import { BottomTabInset, Spacing } from '@/constants/theme';
import type { MapSelection } from '@/types/map-selection';

export function MapScreen() {
  const [selectedFeature, setSelectedFeature] =
    useState<MapSelection | null>(null);

  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [draftPin, setDraftPin] = useState<[number, number] | null>(null);

  function handlePlacePin(lngLat: [number, number]) {
    setDraftPin(lngLat);
    setIsPlacingPin(false);
  }

  return (
    <View style={styles.container}>

      {/* Background Map */}
      <WorldMap
        selection={selectedFeature}
        onSelectFeature={setSelectedFeature}
        isPlacingPin={isPlacingPin}
        draftPin={draftPin}
        onPlacePin={handlePlacePin}
      />

      {/* Floating UI */}
      <View style={styles.topContainer}>
        <MapFilterBar />
      </View>

      <View style={styles.controlsContainer}>
        <MapControls onCreatePress={() => setIsPlacingPin(true)} />
      </View>

      {/* Gorhom bottom sheet */}
      <MapBottomPanel
        selection={selectedFeature}
        isPlacingPin={isPlacingPin}
        onClearSelection={() => setSelectedFeature(null)}
      />

      {/* place pin message */}
      {isPlacingPin && (
        <View style={styles.placeHint}>
          <Text>Tap the map to place a pin</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
  },

  controlsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    zIndex: 10,
    elevation: 10,
  },

  placeHint: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: BottomTabInset + Spacing.three,
    zIndex: 20,
    elevation: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
});