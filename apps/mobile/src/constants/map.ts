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

/** World overview image: visible while zoom < SIMPLE_ATLAS_MAX_ZOOM. */
export const SIMPLE_ATLAS_MAX_ZOOM = 3;

/** Zoomed artwork: visible from this level up (replaced by raster tiles later). */
export const DETAILED_ATLAS_MIN_ZOOM = 3;

/** Allow extra pinch on the detailed image until tile pyramid exists. */
export const WORLD_MAX_ZOOM = 6;

/** Top basemap raster layer id — overlays should use `afterId` with this. */
export const BASEMAP_TOP_LAYER_ID = 'detailed-atlas';

/** West, south, east, north. Keeps the camera center on the atlas. */
export const WORLD_BOUNDS = [
  -180,
  -MERCATOR_LATITUDE_LIMIT,
  180,
  MERCATOR_LATITUDE_LIMIT,
] as [number, number, number, number];

/** Font stacks must match a face served by `glyphs` in the map style. */
export const MAP_LABEL_FONTS = ['Open Sans Regular', 'Arial Unicode MS Regular'];

export type AtlasStyleUrls = {
  simpleUrl: string;
  detailedUrl: string;
};

/** Local phone-map style with overview + zoomed image sources (tile-ready breakpoints). */
export function createAtlasStyle({
  simpleUrl,
  detailedUrl,
}: AtlasStyleUrls): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'simple-atlas': {
        type: 'image',
        url: simpleUrl,
        coordinates: WORLD_IMAGE_COORDINATES,
      },
      'detailed-atlas': {
        type: 'image',
        url: detailedUrl,
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
        maxzoom: SIMPLE_ATLAS_MAX_ZOOM,
      },
      {
        id: BASEMAP_TOP_LAYER_ID,
        type: 'raster',
        source: 'detailed-atlas',
        minzoom: DETAILED_ATLAS_MIN_ZOOM,
      },
    ],
  };
}
