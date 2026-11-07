import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { WorldMap } from '../world-map';
import { MapFilterBar } from './map-filter-bar';
import { MapControls } from './map-controls';
import { MapBottomPanel } from './map-bottom-panel';

import type { MapSelection } from '@/types/map-selection';

export function MapScreen() {
  const [selectedFeature, setSelectedFeature] =
    useState<MapSelection | null>(null);

  return (
    <View style={styles.container}>

      {/* Background Map */}
      <WorldMap
        selection={selectedFeature}
        onSelectFeature={setSelectedFeature}
      />

      {/* Floating UI */}
      <View style={styles.topContainer}>
        <MapFilterBar />
      </View>

      <View style={styles.controlsContainer}>
        <MapControls />
      </View>

      {/* Gorhom bottom sheet */}
      <MapBottomPanel
        selection={selectedFeature}
        onClearSelection={() => setSelectedFeature(null)}
      />

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
});