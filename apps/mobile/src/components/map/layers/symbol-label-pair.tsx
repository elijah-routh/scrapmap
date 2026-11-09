import { Layer } from '@maplibre/maplibre-react-native';

import type {
  ExpressionSpecification,
  FilterSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec';

import { BASEMAP_TOP_LAYER_ID, MAP_LABEL_FONTS } from '@/constants/map';

type SymbolLabelPairProps = {
  idPrefix: string;
  textField: ExpressionSpecification | string;
  textSize: number;
  sortKey: ExpressionSpecification;
  filter: FilterSpecification;
  afterId?: string;
  textColor: string;
  haloColor: string;
  haloWidth: number;
  textPadding?: number;
};

export function SymbolLabelPair({
  idPrefix,
  textField,
  textSize,
  sortKey,
  filter,
  afterId = BASEMAP_TOP_LAYER_ID,
  textColor,
  haloColor,
  haloWidth,
  textPadding = 4,
}: SymbolLabelPairProps) {
  const layout: SymbolLayerSpecification['layout'] = {
    'text-field': textField,
    'text-font': MAP_LABEL_FONTS,
    'text-size': textSize,
    'text-anchor': 'center',
    'text-allow-overlap': false,
    'text-ignore-placement': false,
    'text-padding': textPadding,
    'symbol-sort-key': sortKey,
  };

  const paint: SymbolLayerSpecification['paint'] = {
    'text-color': textColor,
    'text-halo-color': haloColor,
    'text-halo-width': haloWidth,
  };

  return (
    <Layer
      id={idPrefix}
      type="symbol"
      afterId={afterId}
      filter={filter}
      layout={layout}
      paint={paint}
    />
  );
}
