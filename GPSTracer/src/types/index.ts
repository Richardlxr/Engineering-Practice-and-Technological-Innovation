export type TrackingSession = {
  id: string;
  prefix: string;
  interval: number;
  createdAt: string;
  pointCount?: number;
};

export type RecordPoint = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  sessionId: string;
  createdAt: string;
};

export type NewRecordPoint = Omit<RecordPoint, 'id'>;

export type LiveLocation = {
  latitude: number;
  longitude: number;
  altitude: number | null;
};
