import { GeoJSONSource } from '@maplibre/maplibre-react-native';

import type { FeatureCollection } from 'geojson';

import { useMemo } from 'react';

import { SymbolLabelPair } from '@/components/map/layers/symbol-label-pair';
import { LABEL_TEXT_SIZE } from '@/constants/map-label-tiers';

import type { MapSelection } from '@/types/map-selection';

import {
  PHYSICAL_POINT_SORT_KEY,
  PHYSICAL_POINT_VISIBILITY,
  REGION_SORT_KEY,
  regionLabelVisibility,
} from '@/utils/map/label-expressions';

import {
  generateVisibleRegionLabels,
  type MapBounds,
  type RegionLabelData,
} from '@/utils/map/region-label-placement';

const geographyPoints =
  require('@/assets/GeoJSON/Physical/50m-physical-points_labels.json') as FeatureCollection;

const regionCandidates =
  require('@/assets/GeoJSON/Physical/region-label-candidates.json') as RegionLabelData[];

const POINT_STYLE = {
  color: '#5C4630',
  haloColor: '#F5E9D5',
  haloWidth: 1,
};

const REGION_STYLE = {
  color: '#806A50',
  haloColor: '#F5E9D5',
  haloWidth: 1.5,
};

type PhysicalLabelsProps = {
  showPoints?: boolean;
  showRegions?: boolean;
  visibleBounds: MapBounds | null;
  onLabelPress?: (selection: MapSelection) => void;
};

export function PhysicalLabels({
  showPoints = true,
  showRegions = true,
  visibleBounds,
  onLabelPress,
}: PhysicalLabelsProps) {
  const visibleRegionLabels = useMemo(() => {
    if (!visibleBounds || !showRegions) {
      return {
        type: 'FeatureCollection',
        features: [],
      } as FeatureCollection;
    }

    return generateVisibleRegionLabels(regionCandidates, visibleBounds);
  }, [visibleBounds, showRegions]);

  const regionVisibility = regionLabelVisibility();

  return (
    <>
      {showRegions && (
        <GeoJSONSource
          id="physical-region-labels-source"
          data={visibleRegionLabels}
          onPress={(event) => {
            const feature = event.nativeEvent.features?.[0];
            const name = feature?.properties?.displayName;
            const id = feature?.properties?.id ?? feature?.id;

            if (
              typeof name !== 'string' ||
              (typeof id !== 'number' && typeof id !== 'string')
            ) {
              return;
            }

            event.stopPropagation();

            onLabelPress?.({
              type: 'region',
              name,
              id,
            });
          }}
        >
          <SymbolLabelPair
            idPrefix="physical-region-labels"
            textField={['get', 'displayName']}
            textSize={LABEL_TEXT_SIZE.region}
            sortKey={REGION_SORT_KEY}
            filter={regionVisibility}
            textColor={REGION_STYLE.color}
            haloColor={REGION_STYLE.haloColor}
            haloWidth={REGION_STYLE.haloWidth}
            textPadding={8}
          />
        </GeoJSONSource>
      )}

      {showPoints && (
        <GeoJSONSource
          id="physical-points-source"
          data={geographyPoints}
          onPress={(event) => {
            const feature = event.nativeEvent.features?.[0];
            const name = feature?.properties?.name;

            if (typeof name !== 'string' || !name.trim()) {
              return;
            }

            event.stopPropagation();

            onLabelPress?.({
              type: 'point',
              name,
            });
          }}
        >
          <SymbolLabelPair
            idPrefix="physical-point-labels"
            textField={['get', 'name']}
            textSize={LABEL_TEXT_SIZE.point}
            sortKey={PHYSICAL_POINT_SORT_KEY}
            filter={PHYSICAL_POINT_VISIBILITY}
            textColor={POINT_STYLE.color}
            haloColor={POINT_STYLE.haloColor}
            haloWidth={POINT_STYLE.haloWidth}
          />
        </GeoJSONSource>
      )}
    </>
  );
}
