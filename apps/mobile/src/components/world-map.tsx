import { useState, useRef } from 'react';

import {
  Camera,
  Map,
} from '@maplibre/maplibre-react-native';

import {
  StyleSheet,
  View,
} from 'react-native';

import { DetailedAtlas } from '@/components/map/layers/detailed-atlas';

import { PhysicalLabels } from '@/components/map/layers/physical-labels';
import { WonderLabels } from '@/components/map/layers/wonder-labels';

import { SelectedRegionOutline } from
  '@/components/map/layers/selected-region-outline';

import type { MapSelection } from '@/types/map-selection';

import {
  OFFLINE_MAP_STYLE,
  WORLD_MAX_ZOOM,
  WORLD_MIN_ZOOM,
  WORLD_VIEW,
} from '@/constants/map';

import {
  mapBoundsChanged,
  type MapBounds,
} from '@/utils/map/region-label-placement';

// --------------------------------------------------
// Props
// --------------------------------------------------

type WorldMapProps = {
  selection: MapSelection | null;
  onSelectFeature: (selection: MapSelection) => void;
};

// --------------------------------------------------
// Component
// --------------------------------------------------

export function WorldMap({
  selection,
  onSelectFeature,
}: WorldMapProps) {
  const [visibleBounds, setVisibleBounds] =
    useState<MapBounds | null>(null);

  const mapRef = useRef<React.ElementRef<typeof Map>>(null);

  function updateVisibleBounds(bounds: MapBounds) {
    setVisibleBounds((previous) => {
      if (
        previous &&
        !mapBoundsChanged(previous, bounds)
      ) {
        return previous;
      }

      return bounds;
    });
  }

  return (
    <View style={styles.container}>
      <Map
        ref={mapRef}
        style={styles.map}
        mapStyle={OFFLINE_MAP_STYLE}

        onDidFinishLoadingMap={async () => {
          const bounds = await mapRef.current?.getBounds();

          if (bounds) {
            updateVisibleBounds(bounds);
          }
        }}

        onRegionDidChange={(event) => {
          updateVisibleBounds(
            event.nativeEvent.bounds
          );
        }}
      >
        <Camera
          initialViewState={WORLD_VIEW}
          minZoom={WORLD_MIN_ZOOM}
          maxZoom={WORLD_MAX_ZOOM}
        />

        <DetailedAtlas />

        {/* Highlight selected geographical region */}
        <SelectedRegionOutline
          selection={selection}
        />

        {/* Interactive geographical labels */}
        <PhysicalLabels
          showPoints={true}
          showRegions={true}
          visibleBounds={visibleBounds}
          onLabelPress={onSelectFeature}
        />

        <WonderLabels onLabelPress={onSelectFeature} />
      </Map>
    </View>
  );
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});