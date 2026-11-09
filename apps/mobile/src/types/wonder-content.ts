/** One row in `assets/content/wonder-content.json` (keyed by wonder id, e.g. W001). */
export type WonderContentEntry = {
  /** Display label for editing the sidecar (same as the map name). */
  name: string;
  /** Body copy for the bottom sheet when this wonder is selected. */
  description: string;
  /**
   * `null` = no image.
   * `https://…` = remote image (expo-image).
   * `W001.jpg` = bundled file under `assets/places/wonders/` (register in `wonder-photo-assets.ts`).
   */
  photo: string | null;
};

export type WonderContentCatalog = Record<string, WonderContentEntry>;
