import { WORLD_MAX_ZOOM } from '@/constants/map';

/** Atlas / camera zoom ceiling used for label max bounds. */
export const LABEL_ZOOM = {
  MAP_MAX: WORLD_MAX_ZOOM,

  continent: { min: 0, max: 2 },
  largeRegion: { min: 1, max: 3 },
  mediumRegion: { min: 2, max: 4 },
  smallRegion: { min: 4, max: 5 },
  point: { min: 3, max: 5 },
  wonder: { min: 4, max: 5 },
} as const;

export const LABEL_TEXT_SIZE = {
  region: 15,
  point: 12,
  wonder: 12,
} as const;

export type RegionLabelKind =
  | 'continent'
  | 'large'
  | 'medium'
  | 'small';

const SMALL_REGION_CLASSES = new Set([
  'Island',
  'Island group',
  'Pen/cape',
  'Peninsula',
  'Geoarea',
  'Isthmus',
]);

export function classifyRegionLabelKind(
  featureClass: string | undefined,
  scalerank: number | null | undefined
): RegionLabelKind {
  if (featureClass === 'Continent') {
    return 'continent';
  }

  if (scalerank != null && scalerank <= 1) {
    return 'large';
  }

  if (featureClass && SMALL_REGION_CLASSES.has(featureClass)) {
    return 'small';
  }

  return 'medium';
}

export function regionZoomRangeForKind(
  kind: RegionLabelKind
): { min: number; max: number } {
  switch (kind) {
    case 'continent':
      return LABEL_ZOOM.continent;
    case 'large':
      return LABEL_ZOOM.largeRegion;
    case 'medium':
      return LABEL_ZOOM.mediumRegion;
    case 'small':
      return LABEL_ZOOM.smallRegion;
  }
}
