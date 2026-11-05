import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';

/** Latitude where Web Mercator cuts off. */
const MERCATOR_LATITUDE_LIMIT = 85.0511287798066;

/**
 * Corners of a full-world image, in MapLibre order:
 * top-left, top-right, bottom-right, bottom-left.
 */
const WORLD_IMAGE_COORDINATES: [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] = [
  [-180, MERCATOR_LATITUDE_LIMIT],
  [180, MERCATOR_LATITUDE_LIMIT],
  [180, -MERCATOR_LATITUDE_LIMIT],
  [-180, -MERCATOR_LATITUDE_LIMIT],
];

/** Roughly the whole world, centered on the equator. */
export const WORLD_VIEW = {
  center: [0, 0] as [number, number],
  zoom: 1,
};

export const WORLD_MIN_ZOOM = 0;

/** Stand-in ceiling until regional and detailed atlas images exist. */
export const WORLD_MAX_ZOOM = 5;

/** West, south, east, north. Keeps the camera center on the atlas. */
export const WORLD_BOUNDS = [
  -180,
  -MERCATOR_LATITUDE_LIMIT,
  180,
  MERCATOR_LATITUDE_LIMIT,
] as [number, number, number, number];

/** Local phone-map style. One image covers the Web Mercator world. */
export function createSimpleAtlasStyle(imageUrl: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      'simple-atlas': {
        type: 'image',
        url: imageUrl,
        coordinates: WORLD_IMAGE_COORDINATES,
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#c5d5e4',
        },
      },
      {
        id: 'simple-atlas',
        type: 'raster',
        source: 'simple-atlas',
        minzoom: 0,
      },
    ],
  };
}
