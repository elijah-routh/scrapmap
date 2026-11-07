import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';

import type { FeatureCollection } from 'geojson';

import { useMemo } from 'react';

import { MAP_LABEL_FONTS } from '@/constants/map';

import {
  generateVisibleRegionLabels,
  type MapBounds,
  type RegionLabelData,
} from '@/utils/map/region-label-placement';

// --------------------------------------------------
// Data
// --------------------------------------------------

const geographyPoints =
  require('@/assets/GeoJSON/Physical/50m-physical-points_labels.json') as FeatureCollection;

const regionCandidates =
  require('@/assets/GeoJSON/Physical/region-label-candidates.json') as RegionLabelData[];

// --------------------------------------------------
// Props
// --------------------------------------------------

type PhysicalLabelsProps = {
  showPoints?: boolean;
  showRegions?: boolean;

  visibleBounds: MapBounds | null;

  onLabelPress?: (name: string) => void;
};

// --------------------------------------------------
// Styles
// --------------------------------------------------

const POINT_LABEL_STYLE = {
  fontSize: 12,
  color: '#5C4630',
  haloColor: '#F5E9D5',
  haloWidth: 1,
};

const REGION_LABEL_STYLE = {
  fontSize: 15,
  color: '#806A50',
  haloColor: '#F5E9D5',
  haloWidth: 1.5,
};

// --------------------------------------------------
// Component
// --------------------------------------------------

export function PhysicalLabels({
  showPoints = true,
  showRegions = true,
  visibleBounds,
  onLabelPress,
}: PhysicalLabelsProps) {

  // Recalculate only when the viewport changes.
  const visibleRegionLabels = useMemo(() => {
    if (!visibleBounds || !showRegions) {
      return {
        type: 'FeatureCollection',
        features: [],
      } as FeatureCollection;
    }

    return generateVisibleRegionLabels(
      regionCandidates,
      visibleBounds
    );

  }, [visibleBounds, showRegions]);

  return (
    <>
      {/* ========================================
          PHYSICAL POINT LABELS
      ======================================== */}

      {showPoints && (
        <GeoJSONSource
          id="physical-points-source"
          data={geographyPoints}
          onPress={(event) => {
            const feature =
              event.nativeEvent.features?.[0];

            const name = feature?.properties?.name;

            if (typeof name === 'string') {
              event.stopPropagation();
              onLabelPress?.(name);
            }
          }}
        >
          <Layer
            id="physical-point-labels"
            type="symbol"
            afterId="simple-atlas"
            minzoom={2}
            filter={['has', 'name']}
            layout={{
              'text-field': ['get', 'name'],
              'text-font': MAP_LABEL_FONTS,
              'text-size': POINT_LABEL_STYLE.fontSize,
              'text-anchor': 'center',
              'text-allow-overlap': false,
              'text-padding': 4,
            }}
            paint={{
              'text-color': POINT_LABEL_STYLE.color,
              'text-halo-color': POINT_LABEL_STYLE.haloColor,
              'text-halo-width': POINT_LABEL_STYLE.haloWidth,
            }}
          />
        </GeoJSONSource>
      )}

      {/* ========================================
          PHYSICAL REGION LABELS
      ======================================== */}

      {showRegions && (
        <GeoJSONSource
          id="physical-region-labels-source"
          data={visibleRegionLabels}
          onPress={(event) => {
            const feature =
              event.nativeEvent.features?.[0];

            const name =
              feature?.properties?.displayName;

            if (typeof name === 'string') {
              event.stopPropagation();
              onLabelPress?.(name);
            }
          }}
        >
          <Layer
            id="physical-region-labels"
            type="symbol"
            afterId="simple-atlas"
            minzoom={2}
            layout={{
              'symbol-placement': 'point',

              'text-field': [
                'get',
                'displayName',
              ],

              'text-font': MAP_LABEL_FONTS,

              'text-size':
                REGION_LABEL_STYLE.fontSize,

              'text-anchor': 'center',

              'text-allow-overlap': false,

              'text-ignore-placement': false,

              'text-padding': 8,
            }}
            paint={{
              'text-color':
                REGION_LABEL_STYLE.color,

              'text-halo-color':
                REGION_LABEL_STYLE.haloColor,

              'text-halo-width':
                REGION_LABEL_STYLE.haloWidth,
            }}
          />
        </GeoJSONSource>
      )}
    </>
  );
}