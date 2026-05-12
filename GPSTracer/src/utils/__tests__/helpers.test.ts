import { formatAltitude, formatCoordinate, makePointName } from '../helpers';

describe('tracking helpers', () => {
  it('creates zero-padded point names with the session prefix', () => {
    expect(makePointName('Route A', 1)).toBe('Route A_001');
    expect(makePointName('Route A', 42)).toBe('Route A_042');
    expect(makePointName('Route A', 1000)).toBe('Route A_1000');
  });

  it('falls back to a default prefix when user input is blank', () => {
    expect(makePointName('   ', 3)).toBe('Point_003');
  });

  it('formats coordinates and nullable altitude for export', () => {
    expect(formatCoordinate(39.904212345)).toBe('39.904212');
    expect(formatCoordinate(116.4074)).toBe('116.407400');
    expect(formatAltitude(52.234)).toBe('52.2');
    expect(formatAltitude(null)).toBe('');
  });
});
