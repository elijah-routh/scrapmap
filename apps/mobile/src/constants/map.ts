import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';

/** Latitude where Web Mercator cuts off. */
const MERCATOR_LATITUDE_LIMIT = 85.0511287798066;

/** Roughly the whole world, centered on the equator. */
export const WORLD_VIEW = {
  center: [0, 0] as [number, number],
  zoom: 2,
};

export const WORLD_MIN_ZOOM = 0;

/**
 * Camera may zoom past the archive so MapLibre enlarges the zoom-5 tiles
 * instead of requesting tiles that were never exported.
 */
export const WORLD_MAX_ZOOM = 8;

/**
 * Bundled archive. `pmtiles://` selects the PMTiles reader; `asset://` reads
 * the file from the native app bundle. No network request is made for tiles.
 */
export const ATLAS_PMTILES_URL = 'pmtiles://asset://atlas.pmtiles';

export const ATLAS_TILE_SIZE = 256;

/** QGIS export contains tiles through this zoom. */
export const ATLAS_SOURCE_MAX_ZOOM = 5;

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

/**
 * Prevents MapLibre from loading a hosted basemap. Atlas imagery is added
 * as a RasterSource. Glyphs remain so symbol layers can draw labels.
 */
export const OFFLINE_MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#c5d5e4',
      },
    },
  ],
};
