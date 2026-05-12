import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { ControlBar } from '../components/ControlBar';
import { IntervalPicker } from '../components/IntervalPicker';
import { MapView } from '../components/MapView';
import { useTracking } from '../context/TrackingContext';

export function HomeScreen() {
  const tracking = useTracking();

  async function start() {
    try {
      await tracking.startTracking();
    } catch (error) {
      Alert.alert('无法开始记录', error instanceof Error ? error.message : '请检查定位权限和设备 GPS。');
    }
  }

  async function stop() {
    try {
      await tracking.stopTracking();
    } catch (error) {
      Alert.alert('无法停止记录', error instanceof Error ? error.message : '请稍后重试。');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      {!tracking.isTracking && (
        <View style={styles.settings}>
          <View style={styles.field}>
            <Text style={styles.label}>点名前缀</Text>
            <TextInput
              value={tracking.prefix}
              onChangeText={tracking.setPrefix}
              placeholder="例如 路线A"
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>记录间隔</Text>
            <IntervalPicker value={tracking.interval} onChange={tracking.setIntervalSeconds} />
          </View>
        </View>
      )}
      <MapView points={tracking.currentPoints} liveLocation={tracking.liveLocation} />
      <ControlBar
        isReady={tracking.isReady}
        isTracking={tracking.isTracking}
        pointCount={tracking.currentPoints.length}
        onStart={start}
        onStop={stop}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f7f3',
  },
  settings: {
    padding: 16,
    gap: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#dbe4de',
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#52665d',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd8d0',
    paddingHorizontal: 12,
    backgroundColor: '#fbfcfa',
    color: '#17342a',
    fontSize: 16,
    fontWeight: '700',
  },
});
