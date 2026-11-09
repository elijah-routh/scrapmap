import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';

import type { FeatureCollection } from 'geojson';

import { BASEMAP_TOP_LAYER_ID, MAP_LABEL_FONTS } from '@/constants/map';

import type { MapSelection } from '@/types/map-selection';

const wonderPoints =
  require('@/assets/GeoJSON/Wonders/map_wonders_336.json') as FeatureCollection;

const WONDER_LABEL_STYLE = {
  fontSize: 12,
  color: '#3D5C44',
  haloColor: '#F5E9D5',
  haloWidth: 1,
};

type WonderLabelsProps = {
  visible?: boolean;
  onLabelPress?: (selection: MapSelection) => void;
};

export function WonderLabels({
  visible = true,
  onLabelPress,
}: WonderLabelsProps) {
  if (!visible) {
    return null;
  }

  return (
    <GeoJSONSource
      id="wonder-points-source"
      data={wonderPoints}
      onPress={(event) => {
        const feature = event.nativeEvent.features?.[0];
        const name = feature?.properties?.name;

        if (typeof name !== 'string' || !name.trim()) {
          return;
        }

        event.stopPropagation();

        onLabelPress?.({
          type: 'point',
          name,
        });
      }}
    >
      <Layer
        id="wonder-point-labels"
        type="symbol"
        afterId={BASEMAP_TOP_LAYER_ID}
        minzoom={2}
        filter={['has', 'name']}
        layout={{
          'text-field': ['get', 'name'],
          'text-font': MAP_LABEL_FONTS,
          'text-size': WONDER_LABEL_STYLE.fontSize,
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-padding': 4,
        }}
        paint={{
          'text-color': WONDER_LABEL_STYLE.color,
          'text-halo-color': WONDER_LABEL_STYLE.haloColor,
          'text-halo-width': WONDER_LABEL_STYLE.haloWidth,
          'text-opacity': [
            'case',
            ['>=', ['zoom'], ['coalesce', ['get', 'minZoom'], 2]],
            1,
            0,
          ],
        }}
      />
    </GeoJSONSource>
  );
}
