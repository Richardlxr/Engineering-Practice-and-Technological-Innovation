import JSZip from 'jszip';
import { buildWorkbook } from '../workbook';
import type { RecordPoint } from '../../types';

const points: RecordPoint[] = [
  {
    id: 1,
    name: '路线A_001',
    latitude: 39.904212,
    longitude: 116.4074,
    altitude: 52,
    sessionId: 'session-1',
    createdAt: '2026-05-12T11:00:00.000Z',
  },
  {
    id: 2,
    name: 'A&B_<002>',
    latitude: 39.908,
    longitude: 116.412,
    altitude: null,
    sessionId: 'session-1',
    createdAt: '2026-05-12T11:00:10.000Z',
  },
];

describe('buildWorkbook', () => {
  it('creates a valid xlsx zip with escaped worksheet values', async () => {
    const workbook = await buildWorkbook(points);
    const zip = await JSZip.loadAsync(workbook, { base64: true });
    const sheet = await zip.file('xl/worksheets/sheet1.xml')?.async('string');

    expect(sheet).toContain('<t>名称</t>');
    expect(sheet).toContain('<t>路线A_001</t>');
    expect(sheet).toContain('<t>A&amp;B_&lt;002&gt;</t>');
    expect(sheet).toContain('<v>39.904212</v>');
    expect(sheet).toContain('<v>116.407400</v>');
    expect(sheet).not.toContain('<v>null</v>');
  });
});
