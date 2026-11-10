import {
  REGION_PHOTO_ASSETS,
  resolveContentPhotoSource,
} from '@/data/wonder-photo-assets';

import type {
  RegionContentCatalog,
  RegionContentEntry,
} from '@/types/region-content';

const catalog =
  require('@/assets/content/region-content.json') as RegionContentCatalog;

export function getRegionContent(
  regionId: number | string
): RegionContentEntry | undefined {
  return catalog[String(regionId)];
}

export function regionDescription(
  regionId: number | string
): string | undefined {
  const entry = getRegionContent(regionId);
  const text = entry?.description?.trim();
  return text || undefined;
}

export function regionPhotoSource(regionId: number | string) {
  const entry = getRegionContent(regionId);
  if (!entry?.photo) {
    return null;
  }

  return resolveContentPhotoSource(entry.photo, REGION_PHOTO_ASSETS);
}
