import { readFileSync } from 'fs';
import { join } from 'path';

describe('MapView WebView source', () => {
  it('does not use localhost as the base URL for inline map HTML', () => {
    const source = readFileSync(join(__dirname, '..', 'MapView.tsx'), 'utf8');

    expect(source).not.toContain("baseUrl: 'https://localhost/'");
  });

  it('shows a retry control when the map webview fails to load', () => {
    const source = readFileSync(join(__dirname, '..', 'MapView.tsx'), 'utf8');

    expect(source).toContain('const [loadError, setLoadError]');
    expect(source).toContain('onError={() => setLoadError(true)}');
    expect(source).toContain('重试地图');
    expect(source).toContain('setReloadKey((value) => value + 1)');
  });
});
