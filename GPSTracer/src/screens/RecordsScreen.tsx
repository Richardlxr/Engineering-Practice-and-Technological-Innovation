import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { RecordItem } from '../components/RecordItem';
import { deleteSession, getSessions } from '../services/database';
import { exportSession } from '../services/export';
import type { TrackingSession } from '../types';
import { useTracking } from '../context/TrackingContext';

export function RecordsScreen() {
  const [sessions, setSessions] = useState<TrackingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { syncSessionPoints, isReady } = useTracking();

  const load = useCallback(async () => {
    if (!isReady) return;
    setRefreshing(true);
    try {
      setSessions(await getSessions());
    } finally {
      setRefreshing(false);
    }
  }, [isReady]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleExport(session: TrackingSession) {
    const points = await syncSessionPoints(session.id);
    if (!points.length) {
      Alert.alert('没有可导出的点位', '这条记录里还没有 GPS 点。');
      return;
    }
    await exportSession(session, points);
  }

  function handleDelete(session: TrackingSession) {
    Alert.alert('删除记录', `确定删除 ${session.prefix} 吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(session.id);
          await load();
        },
      },
    ]);
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={sessions.length ? styles.list : styles.emptyWrap}
      data={sessions}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      renderItem={({ item }) => (
        <RecordItem session={item} onExport={() => handleExport(item)} onDelete={() => handleDelete(item)} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>暂无记录</Text>
          <Text style={styles.emptyText}>完成一次路线记录后，会在这里导出 XLSX。</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f7f3',
  },
  list: {
    padding: 16,
  },
  emptyWrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  separator: {
    height: 12,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#17342a',
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    color: '#65766f',
    textAlign: 'center',
  },
});
