import fs from 'node:fs';
import path from 'node:path';

// Run from apps/mobile: node scripts/generate-geo-content.mjs

const regionCandidates = JSON.parse(
  fs.readFileSync(
    path.resolve('assets/GeoJSON/Physical/region-label-candidates.json'),
    'utf8'
  )
);

const physicalPoints = JSON.parse(
  fs.readFileSync(
    path.resolve(
      'assets/GeoJSON/Physical/50m-physical-points_labels.json'
    ),
    'utf8'
  )
);

/** @type {Record<string, { name: string; description: string; photo: null }>} */
const regionCatalog = {};

for (const region of regionCandidates) {
  const id = region.id;
  const name = region.name;

  if (id == null || typeof name !== 'string' || !name.trim()) {
    continue;
  }

  regionCatalog[String(id)] = {
    name: name.trim(),
    description: '',
    photo: null,
  };
}

/** @type {Record<string, { name: string; description: string; photo: null }>} */
const pointCatalog = {};

for (const feature of physicalPoints.features ?? []) {
  const name = feature.properties?.name;

  if (typeof name !== 'string' || !name.trim()) {
    continue;
  }

  const key = name.trim();

  if (pointCatalog[key]) {
    continue;
  }

  pointCatalog[key] = {
    name: key,
    description: '',
    photo: null,
  };
}

const regionOut = path.resolve('assets/content/region-content.json');
const pointOut = path.resolve('assets/content/point-content.json');

fs.writeFileSync(
  regionOut,
  `${JSON.stringify(regionCatalog, null, 2)}\n`,
  'utf8'
);

fs.writeFileSync(
  pointOut,
  `${JSON.stringify(pointCatalog, null, 2)}\n`,
  'utf8'
);

console.log(
  `Wrote ${Object.keys(regionCatalog).length} regions -> ${regionOut}`
);
console.log(
  `Wrote ${Object.keys(pointCatalog).length} points -> ${pointOut}`
);
