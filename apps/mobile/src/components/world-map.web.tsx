import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { WORLD_MAP_STYLE, WORLD_VIEW } from '@/constants/map';

// Metro does not bundle MapLibre's module worker, so point at the copy in public/.
setWorkerUrl('/maplibre-gl-worker.mjs');

export function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const map = new MapLibreMap({
      container,
      style: WORLD_MAP_STYLE,
      center: WORLD_VIEW.center,
      zoom: WORLD_VIEW.zoom,
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={mapStyle} />
    </View>
  );
}

const mapStyle = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
