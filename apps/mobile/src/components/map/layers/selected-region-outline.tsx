import { useMemo } from 'react';

import {
  GeoJSONSource,
  Layer,
} from '@maplibre/maplibre-react-native';

import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson';

import { BASEMAP_TOP_LAYER_ID } from '@/constants/map';
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

function appendPolygonCoords(
  target: MultiPolygon['coordinates'],
  geometry: RegionGeometry
) {
  if (geometry.type === 'Polygon') {
    target.push(geometry.coordinates);
    return;
  }

  for (const polygon of geometry.coordinates) {
    target.push(polygon);
  }
}

function mergeRegionParts(
  features: Feature<RegionGeometry>[]
): Feature<RegionGeometry> {
  const coordinates: MultiPolygon['coordinates'] = [];

  for (const feature of features) {
    appendPolygonCoords(coordinates, feature.geometry);
  }

  return {
    type: 'Feature',
    properties: features[0].properties,
    geometry: {
      type: 'MultiPolygon',
      coordinates,
    },
  };
}

/** Natural Earth may ship several features with the same NE_ID (disjoint parts). */
const regionPartsById = new Map<string, Feature<RegionGeometry>[]>();

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

  const key = String(id);
  const parts = regionPartsById.get(key) ?? [];
  parts.push(feature as Feature<RegionGeometry>);
  regionPartsById.set(key, parts);
}

export function SelectedRegionOutline({
  selection,
}: SelectedRegionOutlineProps) {
  const selectedGeometry = useMemo(() => {
    if (!selection || selection.type !== 'region') {
      return EMPTY_REGIONS;
    }

    const parts = regionPartsById.get(String(selection.id));

    if (!parts?.length) {
      console.warn(
        'Region geometry not found:',
        selection.name,
        selection.id
      );

      return EMPTY_REGIONS;
    }

    const region =
      parts.length === 1
        ? parts[0]
        : mergeRegionParts(parts);

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
      <Layer
        id="selected-region-fill"
        type="fill"
        afterId={BASEMAP_TOP_LAYER_ID}
        paint={{
          'fill-color': '#F4C76A',
          'fill-opacity': 0.18,
        }}
      />

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
