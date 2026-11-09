/**
 * Safe dedupe: never edits region polygon GeoJSON.
 * - Drops physical points that wonder landmarks replace.
 * - Disambiguates point homonyms (same name, different places).
 *
 * Region text suppressed for wonder conflicts is handled in
 * `wonder-region-label-suppressions.ts`. Rebuild candidates with:
 *   node scripts/generate-region-labels.mjs
 *
 * Run from apps/mobile: node scripts/dedupe-map-labels.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const POINTS_PATH = path.resolve(
  'assets/GeoJSON/Physical/50m-physical-points_labels.json'
);

const REMOVE_POINT_NE_IDS = new Set([
  1159105019, // Niagara Falls
  1159105053, // Iguazu Falls
  1159105051, // Salto Angel (Angel Falls)
  1159104887, // Victoria Falls
]);

const norm = (s) =>
  (s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');

const HOMONYM_NAMES = new Set(
  ['Cape York', 'Cape Sable', 'Cabo Corrientes', 'Cape Lopatka'].map(norm)
);

function disambiguatePointName(feature) {
  const props = feature.properties ?? {};
  const name = props.name;
  const subregion = props.subregion;
  const region = props.region;

  const suffix =
    subregion && typeof subregion === 'string' && subregion.trim()
      ? subregion.trim()
      : region && typeof region === 'string'
        ? region.trim()
        : null;

  if (!suffix || !name) {
    return feature;
  }

  const disambiguated = `${name} (${suffix})`;

  return {
    ...feature,
    properties: {
      ...props,
      name: disambiguated,
      label: props.label ? disambiguated : props.label,
    },
  };
}

const geo = JSON.parse(fs.readFileSync(POINTS_PATH, 'utf8'));
const before = geo.features.length;

geo.features = geo.features
  .filter((f) => !REMOVE_POINT_NE_IDS.has(f.properties?.ne_id))
  .map((f) => {
    const key = norm(f.properties?.name);
    if (HOMONYM_NAMES.has(key)) {
      return disambiguatePointName(f);
    }
    return f;
  });

fs.writeFileSync(POINTS_PATH, `${JSON.stringify(geo, null, 2)}\n`);
console.log(`physical-points: ${before} -> ${geo.features.length}`);
console.log('Region polygons untouched. Regenerate candidates if polygons changed.');
