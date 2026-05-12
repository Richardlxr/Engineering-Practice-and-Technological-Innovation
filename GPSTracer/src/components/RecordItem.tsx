import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TrackingSession } from '../types';
import { formatSessionDate } from '../utils/helpers';

type Props = {
  session: TrackingSession;
  onExport: () => void;
  onDelete: () => void;
};

export function RecordItem({ session, onExport, onDelete }: Props) {
  return (
    <View style={styles.item}>
      <View style={styles.meta}>
        <Text style={styles.date}>{formatSessionDate(session.createdAt)}</Text>
        <Text style={styles.title}>{session.prefix}</Text>
        <Text style={styles.sub}>{session.pointCount ?? 0} 点 · 每 {session.interval}s</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onExport} style={[styles.button, styles.export]}>
          <Text style={styles.exportText}>导出</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={[styles.button, styles.delete]}>
          <Text style={styles.deleteText}>删除</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbe4de',
    backgroundColor: '#fff',
    padding: 14,
    gap: 14,
  },
  meta: {
    gap: 4,
  },
  date: {
    color: '#63756d',
    fontWeight: '700',
  },
  title: {
    color: '#162f27',
    fontSize: 20,
    fontWeight: '800',
  },
  sub: {
    color: '#66766f',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  export: {
    backgroundColor: '#1f5f4a',
  },
  delete: {
    backgroundColor: '#f3eeee',
  },
  exportText: {
    color: '#fff',
    fontWeight: '800',
  },
  deleteText: {
    color: '#9a2424',
    fontWeight: '800',
  },
});
