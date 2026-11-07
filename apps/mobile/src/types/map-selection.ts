export type MapSelection =
  | {
      type: 'point';
      name: string;
    }
  | {
      type: 'region';
      name: string;
      id: number | string;
    };