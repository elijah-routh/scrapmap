export type MapSelection =
  | {
      type: 'wonder';
      id: string;
      name: string;
    }
  | {
      type: 'point';
      name: string;
    }
  | {
      type: 'region';
      name: string;
      id: number | string;
    };
