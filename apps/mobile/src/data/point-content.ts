import {
  POINT_PHOTO_ASSETS,
  resolveContentPhotoSource,
} from '@/data/wonder-photo-assets';

import type {
  PointContentCatalog,
  PointContentEntry,
} from '@/types/point-content';

const catalog =
  require('@/assets/content/point-content.json') as PointContentCatalog;

export function getPointContent(
  pointName: string
): PointContentEntry | undefined {
  return catalog[pointName];
}

export function pointDescription(
  pointName: string
): string | undefined {
  const entry = getPointContent(pointName);
  const text = entry?.description?.trim();
  return text || undefined;
}

export function pointPhotoSource(pointName: string) {
  const entry = getPointContent(pointName);
  if (!entry?.photo) {
    return null;
  }

  return resolveContentPhotoSource(entry.photo, POINT_PHOTO_ASSETS);
}
