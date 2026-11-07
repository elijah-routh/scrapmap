import { useMemo } from 'react';

import {
  GeoJSONSource,
  Layer,
} from '@maplibre/maplibre-react-native';

import type {
  Feature,
  FeatureCollection,
  Polygon,
  MultiPolygon,
} from 'geojson';

import type { MapSelection } from '@/types/map-selection';

const geographyRegions =
  require('@/assets/GeoJSON/Physical/50m-physical-regions_labels.json') as FeatureCollection;

type RegionGeometry = Polygon | MultiPolygon;

type SelectedRegionOutlineProps = {
  selection: MapSelection | null;
};

const EMPTY_REGIONS: FeatureCollection<RegionGeometry> = {
  type: 'FeatureCollection',
  features: [],
};

// Build a lookup once rather than searching the entire
// GeoJSON dataset whenever the user selects a region.
const regionsById = new Map<string, Feature<RegionGeometry>>();

for (const feature of geographyRegions.features) {
  if (
    feature.geometry?.type !== 'Polygon' &&
    feature.geometry?.type !== 'MultiPolygon'
  ) {
    continue;
  }

  const id = feature.properties?.NE_ID;

  if (id === undefined || id === null) {
    continue;
  }

  regionsById.set(
    String(id),
    feature as Feature<RegionGeometry>,
  );
}

export function SelectedRegionOutline({
  selection,
}: SelectedRegionOutlineProps) {
  const selectedGeometry = useMemo(() => {
    if (!selection || selection.type !== 'region') {
      return EMPTY_REGIONS;
    }

    const region = regionsById.get(String(selection.id));

    if (!region) {
      console.warn(
        'Region geometry not found:',
        selection.name,
        selection.id,
      );

      return EMPTY_REGIONS;
    }

    return {
      type: 'FeatureCollection',
      features: [region],
    } as FeatureCollection<RegionGeometry>;
  }, [selection]);

  return (
    <GeoJSONSource
      id="selected-region-source"
      data={selectedGeometry}
    >
      {/* Subtle transparent region highlight */}
      <Layer
        id="selected-region-fill"
        type="fill"
        afterId="simple-atlas"
        paint={{
          'fill-color': '#F4C76A',
          'fill-opacity': 0.18,
        }}
      />

      {/* Region boundary */}
      <Layer
        id="selected-region-outline"
        type="line"
        afterId="selected-region-fill"
        paint={{
          'line-color': '#D18B35',
          'line-width': 3,
          'line-opacity': 0.95,
        }}
      />
    </GeoJSONSource>
  );
}