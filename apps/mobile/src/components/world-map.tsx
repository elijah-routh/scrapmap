import { useState, useRef, useMemo } from 'react';

import {
  Camera,
  Map,
  Marker,
} from '@maplibre/maplibre-react-native';

import { Ionicons } from '@expo/vector-icons';

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

import { emptyPointCollection } from '@/utils/map/label-offset-placement';
import { buildPlacedLabelLayers } from '@/utils/map/label-placement-sources';

import {
  mapBoundsChanged,
  type MapBounds,
  type RegionLabelData,
} from '@/utils/map/region-label-placement';

const regionCandidates =
  require('@/assets/GeoJSON/Physical/region-label-candidates.json') as RegionLabelData[];

const EMPTY_LABELS = emptyPointCollection();

// --------------------------------------------------
// Props
// --------------------------------------------------

type WorldMapProps = {
  selection: MapSelection | null;
  onSelectFeature: (selection: MapSelection) => void;
  isPlacingPin: boolean;
  draftPin: [number, number] | null;
  onPlacePin: (lngLat: [number, number]) => void;
};

type MapViewport = {
  bounds: MapBounds;
  zoom: number;
};

// --------------------------------------------------
// Component
// --------------------------------------------------

export function WorldMap({
  selection,
  onSelectFeature,
  isPlacingPin,
  draftPin,
  onPlacePin,
}: WorldMapProps) {
  const [viewport, setViewport] =
    useState<MapViewport | null>(null);

  const mapRef = useRef<React.ElementRef<typeof Map>>(null);

  function updateViewport(next: MapViewport) {
    setViewport((previous) => {
      if (
        previous &&
        !mapBoundsChanged(previous.bounds, next.bounds) &&
        Math.abs(previous.zoom - next.zoom) < 0.0001
      ) {
        return previous;
      }

      return next;
    });
  }

  async function syncViewportFromMap(
    bounds?: MapBounds
  ) {
    const resolvedBounds =
      bounds ?? (await mapRef.current?.getBounds());

    const zoom = await mapRef.current?.getZoom();

    if (!resolvedBounds || zoom == null) {
      return;
    }

    updateViewport({ bounds: resolvedBounds, zoom });
  }

  const placedLabels = useMemo(() => {
    if (!viewport) {
      return {
        regionLabels: EMPTY_LABELS,
        physicalPoints: EMPTY_LABELS,
        wonderPoints: EMPTY_LABELS,
      };
    }

    return buildPlacedLabelLayers(
      viewport.bounds,
      viewport.zoom,
      {
        regionCandidates,
        showRegions: true,
        showPoints: true,
        showWonders: true,
      }
    );
  }, [viewport]);

  return (
    <View style={styles.container}>
      <Map
        ref={mapRef}
        style={styles.map}
        mapStyle={OFFLINE_MAP_STYLE}
        androidView="texture"

        onDidFinishLoadingMap={() => {
          void syncViewportFromMap();
        }}

        onRegionDidChange={(event) => {
          const native = event.nativeEvent as {
            bounds?: MapBounds;
            zoom?: number;
            zoomLevel?: number;
          };

          const zoom =
            native.zoom ??
            native.zoomLevel ??
            viewport?.zoom ??
            WORLD_VIEW.zoom;

          if (native.bounds) {
            updateViewport({ bounds: native.bounds, zoom });
            return;
          }

          void syncViewportFromMap();
        }}

        onPress={(event) => {
          if (!isPlacingPin) return;
          onPlacePin(event.nativeEvent.lngLat);
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
          interactive={!isPlacingPin}
          regionLabels={placedLabels.regionLabels}
          pointLabels={placedLabels.physicalPoints}
          onLabelPress={onSelectFeature}
        />

        <WonderLabels
          interactive={!isPlacingPin}
          wonderLabels={placedLabels.wonderPoints}
          onLabelPress={onSelectFeature}
        />

        {draftPin && (
          <Marker lngLat={draftPin} anchor="bottom">
            <Ionicons name="location" size={36} color="#537A5A" />
          </Marker>
        )}
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
