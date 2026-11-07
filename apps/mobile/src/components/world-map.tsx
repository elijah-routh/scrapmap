import {
  Camera,
  Map,
} from '@maplibre/maplibre-react-native';

import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

import {
  useState,
  useRef,
} from 'react';

import { PhysicalLabels } from '@/components/map/layers/physical-labels';

import {
  WORLD_MAX_ZOOM,
  WORLD_MIN_ZOOM,
  WORLD_VIEW,
  createSimpleAtlasStyle,
} from '@/constants/map';

import {
  mapBoundsChanged,
  type MapBounds,
} from '@/utils/map/region-label-placement';

// --------------------------------------------------
// Atlas image
// --------------------------------------------------

const atlas = Image.resolveAssetSource(
  require('../../assets/maps/SimpleAtlasDraft.png')
);

if (!atlas?.uri) {
  throw new Error(
    'Simple atlas image could not be resolved.'
  );
}

const atlasUri = atlas.uri;

// --------------------------------------------------
// Component
// --------------------------------------------------

export function WorldMap() {
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
        mapStyle={createSimpleAtlasStyle(atlasUri)}

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

        <PhysicalLabels
          showPoints={true}
          showRegions={true}
          visibleBounds={visibleBounds}
          onLabelPress={(name) => {
            console.log(
              'Selected physical feature:',
              name
            );
          }}
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