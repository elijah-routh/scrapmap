import { GeoJSONSource } from '@maplibre/maplibre-react-native';

import type { FeatureCollection, Point } from 'geojson';

import { SymbolLabelPair } from '@/components/map/layers/symbol-label-pair';
import { LABEL_TEXT_SIZE } from '@/constants/map-label-tiers';

import type { MapSelection } from '@/types/map-selection';

import {
  WONDER_LABEL_VISIBILITY,
  WONDER_SORT_KEY,
} from '@/utils/map/label-expressions';

import { emptyPointCollection } from '@/utils/map/label-offset-placement';

const WONDER_STYLE = {
  color: '#3D5C44',
  haloColor: '#F5E9D5',
  haloWidth: 1,
};

const EMPTY_COLLECTION = emptyPointCollection();

type WonderLabelsProps = {
  visible?: boolean;
  wonderLabels?: FeatureCollection<Point>;
  onLabelPress?: (selection: MapSelection) => void;
};

export function WonderLabels({
  visible = true,
  wonderLabels = EMPTY_COLLECTION,
  onLabelPress,
}: WonderLabelsProps) {
  if (!visible) {
    return null;
  }

  return (
    <GeoJSONSource
      id="wonder-points-source"
      data={wonderLabels}
      onPress={(event) => {
        const feature = event.nativeEvent.features?.[0];
        const name = feature?.properties?.name;
        const id = feature?.properties?.id ?? feature?.id;

        if (
          typeof name !== 'string' ||
          !name.trim() ||
          typeof id !== 'string' ||
          !id.trim()
        ) {
          return;
        }

        event.stopPropagation();

        onLabelPress?.({
          type: 'wonder',
          id,
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
