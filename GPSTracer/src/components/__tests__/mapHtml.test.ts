import { MAP_HTML } from '../mapHtml';

describe('map viewport behavior', () => {
  it('follows the live location during active tracking', () => {
    expect(MAP_HTML).toContain('setLiveLocation(location, shouldFollow)');
    expect(MAP_HTML).toContain('if (shouldFollow) {');
    expect(MAP_HTML).toContain('map.panTo(latLng, { animate: true });');
  });
});
