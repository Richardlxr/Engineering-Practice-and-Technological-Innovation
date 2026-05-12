import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { RecordPoint, TrackingSession } from '../types';
import { sanitizeFileName } from '../utils/helpers';
import { buildWorkbook } from './workbook';

export { buildWorkbook } from './workbook';

export async function exportSession(session: TrackingSession, points: RecordPoint[]): Promise<void> {
  const base64 = await buildWorkbook(points);
  const fileName = `${sanitizeFileName(session.prefix)}-${session.createdAt.slice(0, 10)}.xlsx`;
  const uri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: '导出 GPS 记录',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }
}
