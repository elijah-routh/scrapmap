import { Layer, RasterSource } from '@maplibre/maplibre-react-native';

import {
  ATLAS_PMTILES_URL,
  ATLAS_SOURCE_MAX_ZOOM,
  ATLAS_TILE_SIZE,
  BASEMAP_TOP_LAYER_ID,
} from '@/constants/map';

/**
 * Offline illustrated atlas.
 *
 * The source stops requesting new tiles at zoom 5. The camera may zoom
 * further and MapLibre enlarges those tiles. The layer is visible at every
 * zoom so this archive can be checked on its own.
 */
export function DetailedAtlas() {
  return (
    <RasterSource
      id="atlas-tiles"
      url={ATLAS_PMTILES_URL}
      tileSize={ATLAS_TILE_SIZE}
      minzoom={0}
      maxzoom={ATLAS_SOURCE_MAX_ZOOM}
    >
      <Layer
        id={BASEMAP_TOP_LAYER_ID}
        type="raster"
        source="atlas-tiles"
      />
    </RasterSource>
  );
}
