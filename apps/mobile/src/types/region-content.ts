/** One row in `assets/content/region-content.json` (keyed by Natural Earth id, e.g. "1159104261"). */
export type RegionContentEntry = {
  name: string;
  description: string;
  /**
   * `null` = no image.
   * `https://…` = remote image (expo-image).
   * Filename = bundled asset under `assets/places/regions/` when wired.
   */
  photo: string | null;
};

export type RegionContentCatalog = Record<string, RegionContentEntry>;
