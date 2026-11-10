/** One row in `assets/content/point-content.json` (keyed by physical point `name` as on the map). */
export type PointContentEntry = {
  name: string;
  description: string;
  /**
   * `null` = no image.
   * `https://…` = remote image (expo-image).
   * Filename = bundled asset under `assets/places/points/` when wired.
   */
  photo: string | null;
};

export type PointContentCatalog = Record<string, PointContentEntry>;
