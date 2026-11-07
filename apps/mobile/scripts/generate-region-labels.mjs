import fs from 'node:fs';
import path from 'node:path';

import { area } from '@turf/area';
import { pointOnFeature } from '@turf/point-on-feature';

// Run this script from apps/mobile.

const INPUT_PATH = path.resolve(
  'assets/GeoJSON/Physical/50m-physical-regions_labels.json'
);

const OUTPUT_PATH = path.resolve(
  'assets/GeoJSON/Physical/region-label-candidates.json'
);

const regions = JSON.parse(
  fs.readFileSync(INPUT_PATH, 'utf8')
);

const output = [];

for (const feature of regions.features) {
  const geometry = feature.geometry;

  if (
    !geometry ||
    (geometry.type !== 'Polygon' &&
      geometry.type !== 'MultiPolygon')
  ) {
    continue;
  }

  const properties = feature.properties ?? {};

  const name = properties.LABEL || properties.NAME;

  if (typeof name !== 'string' || !name.trim()) {
    continue;
  }

  // A Polygon has one polygon part.
  // A MultiPolygon contains multiple polygon parts.
  const polygonParts =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.coordinates;

  const candidates = [];

  for (const coordinates of polygonParts) {
    const polygonFeature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates,
      },
    };

    const polygonArea = area(polygonFeature);

    if (polygonArea <= 0) {
      continue;
    }

    const labelPoint = pointOnFeature(polygonFeature);

    candidates.push({
      area: polygonArea,
      coordinates: labelPoint.geometry.coordinates,
    });
  }

  // Largest polygons first.
  candidates.sort((a, b) => b.area - a.area);

  if (candidates.length === 0) {
    continue;
  }

  output.push({
    id: properties.NE_ID,
    name,
    featureClass: properties.FEATURECLA,
    minLabel: properties.MIN_LABEL ?? null,
    maxLabel: properties.MAX_LABEL ?? null,
    scalerank: properties.SCALERANK ?? null,
    candidates,
  });
}

fs.writeFileSync(
  OUTPUT_PATH,
  JSON.stringify(output, null, 2)
);

console.log(`Generated candidates for ${output.length} regions.`);
console.log(`Saved to ${OUTPUT_PATH}`);