import * as SQLite from 'expo-sqlite';
import type { NewRecordPoint, RecordPoint, TrackingSession } from '../types';

const db = SQLite.openDatabaseSync('gpstracer.db');

type SessionRow = {
  id: string;
  prefix: string;
  interval: number;
  created_at: string;
  point_count: number;
};

type PointRow = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  session_id: string;
  created_at: string;
};

function mapSession(row: SessionRow): TrackingSession {
  return {
    id: row.id,
    prefix: row.prefix,
    interval: row.interval,
    createdAt: row.created_at,
    pointCount: row.point_count,
  };
}

function mapPoint(row: PointRow): RecordPoint {
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    altitude: row.altitude,
    sessionId: row.session_id,
    createdAt: row.created_at,
  };
}

export async function initDB(): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      prefix TEXT NOT NULL,
      interval INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude REAL,
      session_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );
  `);
}

export async function startSession(
  id: string,
  prefix: string,
  interval: number,
): Promise<TrackingSession> {
  const createdAt = new Date().toISOString();
  await db.runAsync('INSERT INTO sessions (id, prefix, interval, created_at) VALUES (?, ?, ?, ?)', [
    id,
    prefix,
    interval,
    createdAt,
  ]);
  return { id, prefix, interval, createdAt, pointCount: 0 };
}

export async function addPoint(point: NewRecordPoint): Promise<RecordPoint> {
  const result = await db.runAsync(
    'INSERT INTO points (name, latitude, longitude, altitude, session_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [point.name, point.latitude, point.longitude, point.altitude, point.sessionId, point.createdAt],
  );
  return { ...point, id: result.lastInsertRowId };
}

export async function getSessions(): Promise<TrackingSession[]> {
  const rows = await db.getAllAsync<SessionRow>(`
    SELECT sessions.id, sessions.prefix, sessions.interval, sessions.created_at, COUNT(points.id) AS point_count
    FROM sessions
    LEFT JOIN points ON points.session_id = sessions.id
    GROUP BY sessions.id
    ORDER BY sessions.created_at DESC
  `);
  return rows.map(mapSession);
}

export async function getPoints(sessionId: string): Promise<RecordPoint[]> {
  const rows = await db.getAllAsync<PointRow>(
    'SELECT * FROM points WHERE session_id = ? ORDER BY id ASC',
    [sessionId],
  );
  return rows.map(mapPoint);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.runAsync('DELETE FROM sessions WHERE id = ?', [sessionId]);
}
