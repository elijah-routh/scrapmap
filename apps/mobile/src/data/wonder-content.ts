import type { WonderContentCatalog, WonderContentEntry } from '@/types/wonder-content';

import { resolveWonderPhotoSource } from '@/data/wonder-photo-assets';

const catalog =
  require('@/assets/content/wonder-content.json') as WonderContentCatalog;

export function getWonderContent(
  wonderId: string
): WonderContentEntry | undefined {
  return catalog[wonderId];
}

export function wonderDescription(wonderId: string): string | undefined {
  const entry = getWonderContent(wonderId);
  const text = entry?.description?.trim();
  return text || undefined;
}

export function wonderPhotoSource(wonderId: string) {
  const entry = getWonderContent(wonderId);
  if (!entry?.photo) {
    return null;
  }

  return resolveWonderPhotoSource(entry.photo);
}
