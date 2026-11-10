import type { Feature, FeatureCollection, Point } from 'geojson';

import { LABEL_PLACEMENT } from '@/constants/map-label-tiers';

export type LabelCoordinates = [number, number];

export type TextOffset = [number, number];

export interface LabelPlacementItem {
  id: string;
  coordinates: LabelCoordinates;
  text: string;
  textSize: number;
  labelMinZoom: number;
  sortKey: number;
  textPaddingPx: number;
}

type TextBoxHalfExtents = {
  halfWidthLng: number;
  halfHeightLat: number;
};

type PlacedTextBox = {
  center: LabelCoordinates;
  halfWidthLng: number;
  halfHeightLat: number;
};

type TextBoxPixels = {
  widthPx: number;
  heightPx: number;
};

/** Same priority = same min-zoom tier and symbol sort key. */
export function placementPriorityKey(
  item: Pick<LabelPlacementItem, 'labelMinZoom' | 'sortKey'>
): string {
  return `${item.labelMinZoom}:${item.sortKey}`;
}

const EARTH_RADIUS_M = 6_378_137;

function metersPerPixel(zoom: number, latitude: number): number {
  const latRad = (latitude * Math.PI) / 180;
  const scale = 256 * 2 ** zoom;
  return (Math.cos(latRad) * 2 * Math.PI * EARTH_RADIUS_M) / scale;
}

function pixelToDegreeExtents(
  widthPx: number,
  heightPx: number,
  zoom: number,
  latitude: number
): TextBoxHalfExtents {
  const mpp = metersPerPixel(zoom, latitude);
  const widthM = widthPx * mpp;
  const heightM = heightPx * mpp;

  const latRad = (latitude * Math.PI) / 180;
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = Math.max(
    metersPerDegreeLat * Math.cos(latRad),
    1
  );

  return {
    halfWidthLng: widthM / 2 / metersPerDegreeLng,
    halfHeightLat: heightM / 2 / metersPerDegreeLat,
  };
}

function estimateTextBoxPixels(
  text: string,
  textSize: number,
  textPaddingPx: number
): TextBoxPixels {
  const { charWidthRatio, lineHeightRatio } = LABEL_PLACEMENT;

  const widthPx =
    text.length * textSize * charWidthRatio + textPaddingPx * 2;
  const heightPx = textSize * lineHeightRatio + textPaddingPx * 2;

  return { widthPx, heightPx };
}

export function estimateTextBoxHalfExtents(
  text: string,
  textSize: number,
  zoom: number,
  latitude: number,
  textPaddingPx: number
): TextBoxHalfExtents {
  const { widthPx, heightPx } = estimateTextBoxPixels(
    text,
    textSize,
    textPaddingPx
  );

  return pixelToDegreeExtents(widthPx, heightPx, zoom, latitude);
}

function offsetEmToDegrees(
  offsetEm: TextOffset,
  textSize: number,
  zoom: number,
  latitude: number
): { deltaLng: number; deltaLat: number } {
  const shiftXPx = offsetEm[0] * textSize;
  const shiftYPx = offsetEm[1] * textSize;

  const mpp = metersPerPixel(zoom, latitude);
  const latRad = (latitude * Math.PI) / 180;
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = Math.max(
    metersPerDegreeLat * Math.cos(latRad),
    1
  );

  return {
    deltaLng: (shiftXPx * mpp) / metersPerDegreeLng,
    deltaLat: (shiftYPx * mpp) / metersPerDegreeLat,
  };
}

function placedTextBoxForCandidate(
  item: LabelPlacementItem,
  offsetEm: TextOffset,
  zoom: number
): PlacedTextBox {
  const [anchorLng, anchorLat] = item.coordinates;
  const halfExtents = estimateTextBoxHalfExtents(
    item.text,
    item.textSize,
    zoom,
    anchorLat,
    item.textPaddingPx
  );

  const { deltaLng, deltaLat } = offsetEmToDegrees(
    offsetEm,
    item.textSize,
    zoom,
    anchorLat
  );

  return {
    center: [anchorLng + deltaLng, anchorLat - deltaLat],
    halfWidthLng: halfExtents.halfWidthLng,
    halfHeightLat: halfExtents.halfHeightLat,
  };
}

/** MapLibre `text-offset` in ems from pixel shifts along each axis. */
function offsetCandidatesForItem(
  item: LabelPlacementItem
): TextOffset[] {
  const { widthPx, heightPx } = estimateTextBoxPixels(
    item.text,
    item.textSize,
    item.textPaddingPx
  );

  const fullHeightEm = heightPx / item.textSize;
  const halfHeightEm = fullHeightEm / 2;

  const fullWidthShiftEm = widthPx / 2 / item.textSize;
  const halfWidthShiftEm = fullWidthShiftEm / 2;

  return [
    [0, 0],
    [0, -halfHeightEm],
    [0, halfHeightEm],
    [-halfWidthShiftEm, 0],
    [halfWidthShiftEm, 0],
    [0, -fullHeightEm],
    [0, fullHeightEm],
    [-fullWidthShiftEm, 0],
    [fullWidthShiftEm, 0],
  ];
}

function pointInsideAxisAlignedBox(
  point: LabelCoordinates,
  center: LabelCoordinates,
  halfWidthLng: number,
  halfHeightLat: number
): boolean {
  const [lng, lat] = point;
  const [centerLng, centerLat] = center;

  return (
    lng >= centerLng - halfWidthLng &&
    lng <= centerLng + halfWidthLng &&
    lat >= centerLat - halfHeightLat &&
    lat <= centerLat + halfHeightLat
  );
}

function textBoxesOverlap(
  a: PlacedTextBox,
  b: PlacedTextBox
): boolean {
  const lngGap = Math.abs(a.center[0] - b.center[0]);
  const latGap = Math.abs(a.center[1] - b.center[1]);

  return (
    lngGap < a.halfWidthLng + b.halfWidthLng &&
    latGap < a.halfHeightLat + b.halfHeightLat
  );
}

function placementConflicts(
  item: LabelPlacementItem,
  offsetEm: TextOffset,
  peers: LabelPlacementItem[],
  placedBoxes: PlacedTextBox[],
  zoom: number
): boolean {
  const candidateBox = placedTextBoxForCandidate(item, offsetEm, zoom);
  const ownPriority = placementPriorityKey(item);

  for (const peer of peers) {
    if (peer.id === item.id) {
      continue;
    }

    if (placementPriorityKey(peer) !== ownPriority) {
      continue;
    }

    if (
      pointInsideAxisAlignedBox(
        peer.coordinates,
        candidateBox.center,
        candidateBox.halfWidthLng,
        candidateBox.halfHeightLat
      )
    ) {
      return true;
    }
  }

  for (const placed of placedBoxes) {
    if (textBoxesOverlap(candidateBox, placed)) {
      return true;
    }
  }

  return false;
}

function sortPlacementItems(
  items: LabelPlacementItem[]
): LabelPlacementItem[] {
  return [...items].sort((a, b) => {
    if (a.labelMinZoom !== b.labelMinZoom) {
      return a.labelMinZoom - b.labelMinZoom;
    }

    if (a.sortKey !== b.sortKey) {
      return a.sortKey - b.sortKey;
    }

    return a.id.localeCompare(b.id);
  });
}

export function resolveLabelOffsets(
  items: LabelPlacementItem[],
  zoom: number
): Map<string, TextOffset> {
  const sorted = sortPlacementItems(items);
  const offsets = new Map<string, TextOffset>();
  const placedBoxes: PlacedTextBox[] = [];

  for (const item of sorted) {
    let chosen: TextOffset = [0, 0];
    const candidates = offsetCandidatesForItem(item);

    for (const candidate of candidates) {
      if (
        !placementConflicts(
          item,
          candidate,
          sorted,
          placedBoxes,
          zoom
        )
      ) {
        chosen = candidate;
        break;
      }
    }

    placedBoxes.push(
      placedTextBoxForCandidate(item, chosen, zoom)
    );
    offsets.set(item.id, chosen);
  }

  return offsets;
}

export function attachTextOffsets(
  features: Feature<Point>[],
  offsetMap: Map<string, TextOffset>,
  placementId: (feature: Feature<Point>, index: number) => string
): Feature<Point>[] {
  return features.map((feature, index) => {
    const id = placementId(feature, index);
    const textOffset = offsetMap.get(id) ?? [0, 0];

    return {
      ...feature,
      properties: {
        ...feature.properties,
        textOffset,
        placementId: id,
      },
    };
  });
}

export function emptyPointCollection(): FeatureCollection<Point> {
  return { type: 'FeatureCollection', features: [] };
}
