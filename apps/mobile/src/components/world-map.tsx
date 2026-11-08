import { useState, useRef } from 'react';

import {
  Camera,
  Map,
} from '@maplibre/maplibre-react-native';

import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

import { PhysicalLabels } from '@/components/map/layers/physical-labels';

import { SelectedRegionOutline } from
  '@/components/map/layers/selected-region-outline';

import type { MapSelection } from '@/types/map-selection';

import {
  WORLD_MAX_ZOOM,
  WORLD_MIN_ZOOM,
  WORLD_VIEW,
  createAtlasStyle,
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
// Atlas image
// --------------------------------------------------

const simpleAtlas = Image.resolveAssetSource(
  require('../../assets/maps/SimpleAtlasDraft.png'),
);

const detailedAtlas = Image.resolveAssetSource(
  require('../../assets/maps/AtlasZoomedDraft.png'),
);

if (!simpleAtlas?.uri) {
  throw new Error('Simple atlas image could not be resolved.');
}

if (!detailedAtlas?.uri) {
  throw new Error('Detailed atlas image could not be resolved.');
}

const mapStyle = createAtlasStyle({
  simpleUrl: simpleAtlas.uri,
  detailedUrl: detailedAtlas.uri,
});

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
        mapStyle={mapStyle}

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