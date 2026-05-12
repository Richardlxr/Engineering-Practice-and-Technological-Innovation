import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  isReady: boolean;
  isTracking: boolean;
  pointCount: number;
  onStart: () => void;
  onStop: () => void;
};

export function ControlBar({ isReady, isTracking, pointCount, onStart, onStop }: Props) {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.label}>{isTracking ? '正在记录' : '待命'}</Text>
        <Text style={styles.count}>已记录 {pointCount} 个点</Text>
      </View>
      <Pressable
        disabled={!isReady}
        onPress={isTracking ? onStop : onStart}
        style={[styles.button, isTracking ? styles.stop : styles.start, !isReady && styles.disabled]}
      >
        {!isReady ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isTracking ? '停止记录' : '开始记录'}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderColor: '#d9e2dc',
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: '#61736b',
    fontSize: 13,
    fontWeight: '700',
  },
  count: {
    color: '#17342a',
    fontSize: 22,
    fontWeight: '800',
  },
  button: {
    minWidth: 124,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  start: {
    backgroundColor: '#1f5f4a',
  },
  stop: {
    backgroundColor: '#b83232',
  },
  disabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
