import type {
  Feature,
  FeatureCollection,
  Point,
} from 'geojson';

// [west, south, east, north]
export type MapBounds = [
  number,
  number,
  number,
  number,
];

export type LabelCoordinates = [
  number,
  number,
];

export interface RegionLabelCandidate {
  area: number;
  coordinates: LabelCoordinates;
}

export interface RegionLabelData {
  id: number;
  name: string;
  featureClass?: string;
  minLabel?: number | null;
  maxLabel?: number | null;
  scalerank?: number | null;

  // Sorted largest polygon first.
  candidates: RegionLabelCandidate[];
}

const EMPTY_FEATURE_COLLECTION: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [],
};

/**
 * Determines whether a point is inside the viewport.
 *
 * Supports horizontally wrapping maps by considering
 * equivalent longitudes separated by 360 degrees.
 */
export function isPointVisible(
  coordinates: LabelCoordinates,
  bounds: MapBounds
): boolean {
  const [longitude, latitude] = coordinates;

  let [west, south, east, north] = bounds;

  if (latitude < south || latitude > north) {
    return false;
  }

  // Handle viewports that cross the antimeridian.
  if (east < west) {
    east += 360;
  }

  // A viewport covering the whole world includes
  // every longitude.
  if (east - west >= 360) {
    return true;
  }

  // Longitude values repeat every 360 degrees.
  // Find the first equivalent longitude >= west.
  const wrappedLongitude =
    longitude +
    360 * Math.ceil((west - longitude) / 360);

  return (
    wrappedLongitude >= west &&
    wrappedLongitude <= east
  );
}

/**
 * Checks whether the camera bounds have changed
 * enough to justify updating label positions.
 */
export function mapBoundsChanged(
  previous: MapBounds,
  next: MapBounds,
  epsilon = 0.00001
): boolean {
  return next.some(
    (value, index) =>
      Math.abs(value - previous[index]) > epsilon
  );
}

/**
 * Returns the largest polygon candidate whose
 * label point is currently visible.
 *
 * Candidates must already be sorted by area.
 */
export function chooseRegionLabel(
  region: RegionLabelData,
  bounds: MapBounds
): RegionLabelCandidate | null {
  for (const candidate of region.candidates) {
    if (isPointVisible(candidate.coordinates, bounds)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Generates at most one label feature per region.
 *
 * No Turf calculations occur here.
 * Only coordinate comparisons.
 */
export function generateVisibleRegionLabels(
  regions: RegionLabelData[],
  bounds: MapBounds
): FeatureCollection<Point> {
  if (!regions.length) {
    return EMPTY_FEATURE_COLLECTION;
  }

  const features: Feature<Point>[] = [];

  for (const region of regions) {
    const candidate = chooseRegionLabel(
      region,
      bounds
    );

    if (!candidate) {
      continue;
    }

    features.push({
      type: 'Feature',

      id: region.id,

      properties: {
        id: region.id,
        displayName: region.name,
        featureClass: region.featureClass,
        scalerank: region.scalerank,
      },

      geometry: {
        type: 'Point',
        coordinates: candidate.coordinates,
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}