import { Camera, Map } from '@maplibre/maplibre-react-native';
import { Image, StyleSheet, View } from 'react-native';

import { PhysicalLabels } from '@/components/map/layers/physical-labels';

import {
  WORLD_BOUNDS,
  WORLD_MAX_ZOOM,
  WORLD_MIN_ZOOM,
  WORLD_VIEW,
  createSimpleAtlasStyle,
} from '@/constants/map';

const atlas = Image.resolveAssetSource(
  require('../../assets/maps/SimpleAtlasDraft.png'),
);

if (!atlas?.uri) {
  throw new Error('Simple atlas image could not be resolved.');
}

const atlasUri = atlas.uri;

export function WorldMap() {
  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={createSimpleAtlasStyle(atlasUri)}>
        <Camera
          initialViewState={WORLD_VIEW}
          minZoom={WORLD_MIN_ZOOM}
          maxZoom={WORLD_MAX_ZOOM}
        />

        <PhysicalLabels 
          showPoints={true}
          showRegions={true}
        />

      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
