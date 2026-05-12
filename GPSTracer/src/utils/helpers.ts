export function makePointName(prefix: string, sequence: number): string {
  const safePrefix = prefix.trim() || 'Point';
  const suffix = sequence.toString().padStart(3, '0');
  return `${safePrefix}_${suffix}`;
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function formatAltitude(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toFixed(1) : '';
}

export function formatSessionDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

export function sanitizeFileName(value: string): string {
  return (value.trim() || 'gps-track').replace(/[\\/:*?"<>|]/g, '_');
}
