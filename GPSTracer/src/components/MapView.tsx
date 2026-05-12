import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebView as WebViewType } from 'react-native-webview';
import type { LiveLocation, RecordPoint } from '../types';
import { MAP_HTML } from './mapHtml';

type Props = {
  points: RecordPoint[];
  liveLocation: LiveLocation | null;
};

export function MapView({ points, liveLocation }: Props) {
  const ref = useRef<WebViewType>(null);

  useEffect(() => {
    const payload = JSON.stringify(
      points.map((point) => ({
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
      })),
    );
    ref.current?.injectJavaScript(`window.GPSTracer && window.GPSTracer.setPoints(${payload}); true;`);
  }, [points]);

  useEffect(() => {
    const payload = liveLocation ? JSON.stringify(liveLocation) : 'null';
    ref.current?.injectJavaScript(`window.GPSTracer && window.GPSTracer.setLiveLocation(${payload}); true;`);
  }, [liveLocation]);

  return (
    <View style={styles.wrap}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html: MAP_HTML, baseUrl: 'https://localhost/' }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess={false}
        mixedContentMode="always"
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
    backgroundColor: '#dce7df',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
