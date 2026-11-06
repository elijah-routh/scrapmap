export type MapFeatureType =
  | 'country'
  | 'state'
  | 'physical-region'
  | 'marine-region'
  | 'river'
  | 'place';

export interface SelectedMapFeature {
  id: string;
  name: string;
  type: MapFeatureType;
}