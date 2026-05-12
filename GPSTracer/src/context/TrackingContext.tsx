import 'react-native-get-random-values';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { LiveLocation, RecordPoint, TrackingSession } from '../types';
import { addPoint, getPoints, initDB, startSession } from '../services/database';
import { configureBackgroundLocation, getCurrentLocation, requestLocationPermissions, stopBackgroundLocation } from '../services/location';
import { makePointName } from '../utils/helpers';

type TrackingContextValue = {
  isReady: boolean;
  isTracking: boolean;
  currentSession: TrackingSession | null;
  currentPoints: RecordPoint[];
  liveLocation: LiveLocation | null;
  prefix: string;
  interval: number;
  setPrefix: (value: string) => void;
  setIntervalSeconds: (value: number) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  syncSessionPoints: (sessionId: string) => Promise<RecordPoint[]>;
};

const TrackingContext = createContext<TrackingContextValue | null>(null);

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function TrackingProvider({ children }: PropsWithChildren) {
  const [isReady, setReady] = useState(false);
  const [isTracking, setTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<TrackingSession | null>(null);
  const [currentPoints, setCurrentPoints] = useState<RecordPoint[]>([]);
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [prefix, setPrefix] = useState('路线A');
  const [intervalSeconds, setIntervalSeconds] = useState(10);
  const pointTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointsRef = useRef<RecordPoint[]>([]);
  const sessionRef = useRef<TrackingSession | null>(null);

  useEffect(() => {
    initDB().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    let active = true;
    requestLocationPermissions()
      .then(() => getCurrentLocation())
      .then((captured) => {
        if (active) {
          setLiveLocation(captured);
        }
      })
      .catch(() => {
        // Keep the Beijing fallback view when startup positioning is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    pointsRef.current = currentPoints;
  }, [currentPoints]);

  useEffect(() => {
    sessionRef.current = currentSession;
  }, [currentSession]);

  const refreshLiveLocation = useCallback(async () => {
    const captured = await getCurrentLocation();
    setLiveLocation(captured);
  }, []);

  const capturePoint = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    const captured = await getCurrentLocation();
    setLiveLocation(captured);
    const point = await addPoint({
      name: makePointName(session.prefix, pointsRef.current.length + 1),
      latitude: captured.latitude,
      longitude: captured.longitude,
      altitude: captured.altitude,
      sessionId: session.id,
      createdAt: new Date().toISOString(),
    });
    setCurrentPoints((value) => [...value, point]);
  }, []);

  const startTracking = useCallback(async () => {
    await requestLocationPermissions();
    const session = await startSession(createId(), prefix.trim() || 'Point', intervalSeconds);
    sessionRef.current = session;
    pointsRef.current = [];
    setCurrentSession(session);
    setCurrentPoints([]);
    setTracking(true);
    await configureBackgroundLocation(intervalSeconds);
    await refreshLiveLocation();
    await capturePoint();
    pointTimerRef.current = setInterval(capturePoint, intervalSeconds * 1000);
    liveTimerRef.current = setInterval(refreshLiveLocation, 1000);
  }, [capturePoint, intervalSeconds, prefix, refreshLiveLocation]);

  const stopTracking = useCallback(async () => {
    if (pointTimerRef.current) {
      clearInterval(pointTimerRef.current);
      pointTimerRef.current = null;
    }
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
    }
    await stopBackgroundLocation();
    setTracking(false);
    setCurrentSession(null);
    setCurrentPoints([]);
  }, []);

  const syncSessionPoints = useCallback(async (sessionId: string) => getPoints(sessionId), []);

  const value = useMemo(
    () => ({
      isReady,
      isTracking,
      currentSession,
      currentPoints,
      liveLocation,
      prefix,
      interval: intervalSeconds,
      setPrefix,
      setIntervalSeconds,
      startTracking,
      stopTracking,
      syncSessionPoints,
    }),
    [currentPoints, currentSession, intervalSeconds, isReady, isTracking, liveLocation, prefix, startTracking, stopTracking, syncSessionPoints],
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used inside TrackingProvider');
  }
  return context;
}
