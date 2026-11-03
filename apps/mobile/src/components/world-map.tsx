import { Camera, Map } from '@maplibre/maplibre-react-native';
import { StyleSheet, View } from 'react-native';

import { WORLD_MAP_STYLE, WORLD_VIEW } from '@/constants/map';

export function WorldMap() {
  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={WORLD_MAP_STYLE}>
        <Camera initialViewState={WORLD_VIEW} />
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
