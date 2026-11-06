import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import type { FeatureCollection } from 'geojson';

import { MAP_LABEL_FONTS } from '@/constants/map';

const geographyPoints =
  require('@/assets/GeoJSON/Physical/50m-physical-points_labels.json') as FeatureCollection;

const geographyRegions =
  require('@/assets/GeoJSON/Physical/50m-physical-regions_labels.json') as FeatureCollection;

const POINT_LABEL_TEXT = ['get', 'name'];

const REGION_LABEL_TEXT = ['get', 'NAME'];

function labelFromProperties(
  properties: GeoJSON.GeoJsonProperties | null | undefined,
  kind: 'point' | 'region',
): string | undefined {
  if (!properties) {
    return undefined;
  }

  if (kind === 'point') {
    const label = properties.label ?? properties.name;
    return typeof label === 'string' && label.length > 0 ? label : undefined;
  }

  const label = properties.LABEL ?? properties.NAME;
  return typeof label === 'string' && label.length > 0 ? label : undefined;
}

type PhysicalLabelsProps = {
  showPoints?: boolean;
  showRegions?: boolean;
  onLabelPress?: (name: string) => void;
};

const POINT_LABEL_STYLE = {
  fontSize: 12,
  color: '#5C4630',
  haloColor: '#F5E9D5',
  haloWidth: 1,
};

const REGION_LABEL_STYLE = {
  fontSize: 15,
  color: '#806A50',
  haloColor: '#F5E9D5',
  haloWidth: 1.5,
};

export function PhysicalLabels({
  showPoints = true,
  showRegions = true,
  onLabelPress,
}: PhysicalLabelsProps) {
  return (
    <>
      {showPoints && (
        <GeoJSONSource
          id="physical-points-source"
          data={geographyPoints}
          onPress={(event) => {
            const feature = event.nativeEvent.features?.[0];
            const name = labelFromProperties(feature?.properties, 'point');

            if (name) {
              event.stopPropagation();
              onLabelPress?.(name);
            }
          }}
        >
          <Layer
            id="physical-point-labels"
            type="symbol"
            afterId="simple-atlas"
            minzoom={2}
            filter={['has', 'name']}
            layout={{
              'text-field': ['get', 'name'],
              'text-font': MAP_LABEL_FONTS,
              'text-size': POINT_LABEL_STYLE.fontSize,
              'text-anchor': 'center',
              'text-allow-overlap': false,
              'text-padding': 4,
            }}
            paint={{
              'text-color': POINT_LABEL_STYLE.color,
              'text-halo-color': POINT_LABEL_STYLE.haloColor,
              'text-halo-width': POINT_LABEL_STYLE.haloWidth,
            }}
          />
        </GeoJSONSource>
      )}

      {showRegions && (
        <GeoJSONSource
          id="physical-regions-source"
          data={geographyRegions}
          onPress={(event) => {
            const feature = event.nativeEvent.features?.[0];
            const name = labelFromProperties(feature?.properties, 'region');

            if (name) {
              event.stopPropagation();
              onLabelPress?.(name);
            }
          }}
        >
          <Layer
            id="physical-region-labels"
            type="symbol"
            source="physical-regions-source"
            afterId="simple-atlas"
            minzoom={0}
            filter={[
                '==',
                ['get', 'NAME'],
                'COAST MOUNTAINS',
            ]}
            layout={{
                'text-field': 'COAST MOUNTAINS',
                'text-font': MAP_LABEL_FONTS,
                'text-size': 20,
                'text-anchor': 'center',
                'text-allow-overlap': true,
                'text-ignore-placement': true,
            }}
            paint={{
                'text-color': '#FF0000',
                'text-halo-color': '#FFFFFF',
                'text-halo-width': 2,
            }}
            />
        </GeoJSONSource>
      )}
    </>
  );
}
