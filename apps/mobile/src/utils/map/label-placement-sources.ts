import type { Feature, FeatureCollection, Point } from 'geojson';

import {
  LABEL_TEXT_SIZE,
  LABEL_ZOOM,
  LABEL_PLACEMENT,
} from '@/constants/map-label-tiers';

import {
  attachTextOffsets,
  emptyPointCollection,
  type LabelPlacementItem,
  resolveLabelOffsets,
} from '@/utils/map/label-offset-placement';

import {
  generateVisibleRegionLabels,
  isPointVisible,
  type MapBounds,
  type RegionLabelData,
} from '@/utils/map/region-label-placement';

const geographyPoints =
  require('@/assets/GeoJSON/Physical/50m-physical-points_labels.json') as FeatureCollection;

const wonderPoints =
  require('@/assets/GeoJSON/Wonders/map_wonders_336.json') as FeatureCollection;

export function wonderSortKeyFromPriority(priority: unknown): number {
  switch (priority) {
    case 'Global':
      return 0;
    case 'Regional':
      return 100;
    case 'Supplemental':
      return 200;
    default:
      return 150;
  }
}

function isZoomInRange(
  zoom: number,
  min: number,
  max: number
): boolean {
  return zoom >= min && zoom <= max;
}

function visiblePhysicalPoints(
  bounds: MapBounds,
  zoom: number
): Feature<Point>[] {
  const { min, max } = LABEL_ZOOM.point;

  if (!isZoomInRange(zoom, min, max)) {
    return [];
  }

  const features: Feature<Point>[] = [];

  for (const feature of geographyPoints.features) {
    if (feature.geometry?.type !== 'Point') {
      continue;
    }

    const name = feature.properties?.name;

    if (typeof name !== 'string' || !name.trim()) {
      continue;
    }

    const coordinates = feature.geometry.coordinates as [number, number];

    if (!isPointVisible(coordinates, bounds)) {
      continue;
    }

    features.push(feature as Feature<Point>);
  }

  return features;
}

function visibleWonders(
  bounds: MapBounds,
  zoom: number
): Feature<Point>[] {
  const { min, max } = LABEL_ZOOM.wonder;

  if (!isZoomInRange(zoom, min, max)) {
    return [];
  }

  const features: Feature<Point>[] = [];

  for (const feature of wonderPoints.features) {
    if (feature.geometry?.type !== 'Point') {
      continue;
    }

    const name = feature.properties?.name;

    if (typeof name !== 'string' || !name.trim()) {
      continue;
    }

    const coordinates = feature.geometry.coordinates as [number, number];

    if (!isPointVisible(coordinates, bounds)) {
      continue;
    }

    features.push(feature as Feature<Point>);
  }

  return features;
}

function regionItems(
  features: Feature<Point>[]
): LabelPlacementItem[] {
  const items: LabelPlacementItem[] = [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const displayName = props.displayName;

    if (typeof displayName !== 'string' || !displayName.trim()) {
      continue;
    }

    const id = props.id ?? feature.id;

    if (id == null) {
      continue;
    }

    const sortKey =
      typeof props.scalerank === 'number' ? props.scalerank : 5;
    const labelMinZoom =
      typeof props.labelMinZoom === 'number'
        ? props.labelMinZoom
        : LABEL_ZOOM.mediumRegion.min;

    items.push({
      id: `region:${id}`,
      coordinates: feature.geometry.coordinates as [number, number],
      text: displayName,
      textSize: LABEL_TEXT_SIZE.region,
      labelMinZoom,
      sortKey,
      textPaddingPx: 8,
    });
  }

  return items;
}

function physicalPointItems(
  features: Feature<Point>[]
): LabelPlacementItem[] {
  const items: LabelPlacementItem[] = [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const name = props.name;

    if (typeof name !== 'string' || !name.trim()) {
      continue;
    }

    const coordinates = feature.geometry.coordinates as [number, number];
    const sortKey =
      typeof props.scalerank === 'number' ? props.scalerank : 5;

    items.push({
      id: `point:${coordinates[0]},${coordinates[1]},${name}`,
      coordinates,
      text: name,
      textSize: LABEL_TEXT_SIZE.point,
      labelMinZoom: LABEL_ZOOM.point.min,
      sortKey,
      textPaddingPx: LABEL_PLACEMENT.paddingPx,
    });
  }

  return items;
}

function wonderItems(features: Feature<Point>[]): LabelPlacementItem[] {
  const items: LabelPlacementItem[] = [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const name = props.name;
    const wonderId = props.id ?? feature.id;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      (typeof wonderId !== 'string' && typeof wonderId !== 'number')
    ) {
      continue;
    }

    const coordinates = feature.geometry.coordinates as [number, number];
    const sortKey = wonderSortKeyFromPriority(props.priority);

    items.push({
      id: `wonder:${wonderId}`,
      coordinates,
      text: name,
      textSize: LABEL_TEXT_SIZE.wonder,
      labelMinZoom: LABEL_ZOOM.wonder.min,
      sortKey,
      textPaddingPx: LABEL_PLACEMENT.paddingPx,
    });
  }

  return items;
}

function filterRegionFeaturesByZoom(
  features: Feature<Point>[],
  zoom: number
): Feature<Point>[] {
  return features.filter((feature) => {
    const props = feature.properties ?? {};
    const min =
      typeof props.labelMinZoom === 'number' ? props.labelMinZoom : 0;
    const max =
      typeof props.labelMaxZoom === 'number'
        ? props.labelMaxZoom
        : LABEL_ZOOM.MAP_MAX;

    return isZoomInRange(zoom, min, max);
  });
}

export type PlacedLabelLayers = {
  regionLabels: FeatureCollection<Point>;
  physicalPoints: FeatureCollection<Point>;
  wonderPoints: FeatureCollection<Point>;
};

export function buildPlacedLabelLayers(
  bounds: MapBounds | null,
  zoom: number | null,
  options: {
    regionCandidates: RegionLabelData[];
    showRegions: boolean;
    showPoints: boolean;
    showWonders: boolean;
  }
): PlacedLabelLayers {
  const empty = emptyPointCollection();

  if (bounds == null || zoom == null) {
    return {
      regionLabels: empty,
      physicalPoints: empty,
      wonderPoints: empty,
    };
  }

  const regionFeatures = options.showRegions
    ? filterRegionFeaturesByZoom(
        generateVisibleRegionLabels(
          options.regionCandidates,
          bounds
        ).features as Feature<Point>[],
        zoom
      )
    : [];

  const pointFeatures = options.showPoints
    ? visiblePhysicalPoints(bounds, zoom)
    : [];

  const wonderFeatures = options.showWonders
    ? visibleWonders(bounds, zoom)
    : [];

  const placementItems = [
    ...regionItems(regionFeatures),
    ...physicalPointItems(pointFeatures),
    ...wonderItems(wonderFeatures),
  ];

  const offsetMap = resolveLabelOffsets(placementItems, zoom);

  return {
    regionLabels: {
      type: 'FeatureCollection',
      features: attachTextOffsets(
        regionFeatures,
        offsetMap,
        (feature) => `region:${feature.properties?.id ?? feature.id}`
      ),
    },
    physicalPoints: {
      type: 'FeatureCollection',
      features: options.showPoints
        ? attachTextOffsets(pointFeatures, offsetMap, (feature, index) => {
            const props = feature.properties ?? {};
            const name = String(props.name ?? index);
            const [lng, lat] = feature.geometry.coordinates;
            return `point:${lng},${lat},${name}`;
          })
        : [],
    },
    wonderPoints: {
      type: 'FeatureCollection',
      features: attachTextOffsets(
        wonderFeatures,
        offsetMap,
        (feature) =>
          `wonder:${feature.properties?.id ?? feature.id}`
      ),
    },
  };
}
