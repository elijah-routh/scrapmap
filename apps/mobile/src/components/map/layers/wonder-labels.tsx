import { GeoJSONSource } from '@maplibre/maplibre-react-native';

import type { FeatureCollection } from 'geojson';

import { SymbolLabelPair } from '@/components/map/layers/symbol-label-pair';
import { LABEL_TEXT_SIZE } from '@/constants/map-label-tiers';

import type { MapSelection } from '@/types/map-selection';

import {
  WONDER_LABEL_VISIBILITY,
  WONDER_SORT_KEY,
} from '@/utils/map/label-expressions';

const wonderPoints =
  require('@/assets/GeoJSON/Wonders/map_wonders_336.json') as FeatureCollection;

const WONDER_STYLE = {
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
      <SymbolLabelPair
        idPrefix="wonder-point-labels"
        textField={['get', 'name']}
        textSize={LABEL_TEXT_SIZE.wonder}
        sortKey={WONDER_SORT_KEY}
        filter={WONDER_LABEL_VISIBILITY}
        textColor={WONDER_STYLE.color}
        haloColor={WONDER_STYLE.haloColor}
        haloWidth={WONDER_STYLE.haloWidth}
      />
    </GeoJSONSource>
  );
}
