import type {
  ExpressionSpecification,
  FilterSpecification,
} from '@maplibre/maplibre-gl-style-spec';

import { LABEL_ZOOM } from '@/constants/map-label-tiers';

const { min: pointMin, max: pointMax } = LABEL_ZOOM.point;
const { min: wonderMin, max: wonderMax } = LABEL_ZOOM.wonder;

/** Per-feature {@link labelMinZoom} / {@link labelMaxZoom} from region generation. */
export function regionLabelVisibility(): FilterSpecification {
  return [
    'all',
    ['has', 'displayName'],
    ['>=', ['zoom'], ['get', 'labelMinZoom']],
    ['<=', ['zoom'], ['get', 'labelMaxZoom']],
  ];
}

/** Natural Earth physical points — fixed 3 → 5. */
export const PHYSICAL_POINT_VISIBILITY: FilterSpecification = [
  'all',
  ['has', 'name'],
  ['>=', ['zoom'], pointMin],
  ['<=', ['zoom'], pointMax],
];

/** Wonder landmarks — fixed 4 → 5. */
export const WONDER_LABEL_VISIBILITY: FilterSpecification = [
  'all',
  ['has', 'name'],
  ['>=', ['zoom'], wonderMin],
  ['<=', ['zoom'], wonderMax],
];

export const REGION_SORT_KEY: ExpressionSpecification = [
  'coalesce',
  ['get', 'scalerank'],
  5,
];

export const PHYSICAL_POINT_SORT_KEY: ExpressionSpecification = [
  'coalesce',
  ['get', 'scalerank'],
  5,
];

export const WONDER_SORT_KEY: ExpressionSpecification = [
  'match',
  ['get', 'priority'],
  'Global',
  0,
  'Regional',
  100,
  'Supplemental',
  200,
  150,
];
