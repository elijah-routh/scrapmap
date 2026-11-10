import type { ImageSource } from 'expo-image';

/**
 * Register bundled wonder photos here after adding files under
 * `assets/places/wonders/` and setting `photo` in wonder-content.json
 * (e.g. `"W001.jpg"`).
 */
export const WONDER_PHOTO_ASSETS: Record<string, number> = {
  // 'W001.jpg': require('@/assets/places/wonders/W001.jpg'),
};

export const REGION_PHOTO_ASSETS: Record<string, number> = {};

export const POINT_PHOTO_ASSETS: Record<string, number> = {};

export function resolveContentPhotoSource(
  photo: string,
  bundledAssets: Record<string, number>
): ImageSource | number | null {
  if (/^https?:\/\//i.test(photo)) {
    return { uri: photo };
  }

  const moduleId = bundledAssets[photo];

  if (moduleId == null) {
    return null;
  }

  return moduleId;
}

export function resolveWonderPhotoSource(
  photo: string
): ImageSource | number | null {
  return resolveContentPhotoSource(photo, WONDER_PHOTO_ASSETS);
}
