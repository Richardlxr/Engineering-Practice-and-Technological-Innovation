# GPSTracker 手机端 GPS 定位记录与导出应用

**日期**: 2026-05-12
**状态**: 已批准 / 第一版实现中

**实现更新（2026-05-12）**:
- 实际工程目录沿用仓库中已有目录名 `GPSTracer/`，不再另建 `GPSTracker/`。
- 第一版前台采样采用 `setInterval + Location.getCurrentPositionAsync()`，避免同时使用前台 `startLocationUpdatesAsync` 和定时器造成重复采点。
- 后台定位任务已注册和启停，但后台期间可靠写入 SQLite、前台恢复同步仍需真机验证后补齐。
- XLSX 生成拆成纯逻辑 `workbook.ts` 和平台分享 `export.ts`，纯逻辑由 Jest 覆盖。
- 当前可运行形态是 Expo 开发应用，不是独立 APK/IPA 安装包。

---

## 1. 产品概述

一款跨平台（Android/iOS）的 GPS 定位记录手机应用，用于在户外实地行走时记录地理坐标点，支持 xlsx 格式导出。主要用途：采集路线关键点位的经纬度和海拔信息。

---

## 2. 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React Native + Expo (managed workflow) |
| GPS 定位 | `expo-location` + `expo-task-manager`（前后台定位） |
| 地图 | WebView + Leaflet.js + 高德瓦片 |
| 本地存储 | `expo-sqlite` |
| 导出与分享 | `expo-file-system/legacy` + `expo-sharing` + `jszip`（XLSX 手动拼接 OOXML 并打包） |
| 状态管理 | React Context |
| 测试 | Jest + ts-jest（覆盖点位命名、坐标格式化、XLSX XML 转义与文件结构） |

---

## 3. 数据模型

```typescript
type TrackingSession = {
  id: string;           // UUID
  prefix: string;       // 用户设置的名称前缀
  interval: number;     // 记录间隔（秒）
  createdAt: string;    // 创建时间
  pointCount?: number;  // 历史列表展示用点位数量
};

type RecordPoint = {
  id: number;           // 自增主键
  name: string;         // 点位名称（自动生成，如 "路线A_001"）
  latitude: number;     // 纬度
  longitude: number;    // 经度
  altitude: number | null; // 海拔（米，设备未返回时为空）
  sessionId: string;    // 所属会话 ID
  createdAt: string;    // 采集时间
};
```

### 数据库表结构

**sessions 表：**
| 列名 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | UUID |
| prefix | TEXT | 名称前缀 |
| interval | INTEGER | 记录间隔（秒） |
| created_at | TEXT | 创建时间 |

**points 表：**
| 列名 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | 自增主键 |
| name | TEXT | 点位名称 |
| latitude | REAL | 纬度 |
| longitude | REAL | 经度 |
| altitude | REAL | 海拔 |
| session_id | TEXT | 外键关联 sessions.id |
| created_at | TEXT | 采集时间 |

---

## 4. 页面与交互

### 页面结构（底部 Tab）

| Tab | 名称 | 功能 |
|-----|------|------|
| 1 | 地图页 | 主页面：地图展示 + 录制控制 |
| 2 | 记录页 | 历史会话列表 + 导出 |

### 地图页

```
┌────────────────────────────┐
│ ┌────────┐  ┌────────────┐ │
│ │前缀输入 │  │ 间隔选择 ▼ │ │
│ └────────┘  └────────────┘ │  ← 设置栏（录制开始后隐藏）
│ ┌────────────────────────┐ │
│ │                        │ │
│ │     WebView 地图        │ │  ← Leaflet + 高德瓦片
│ │     ● 标记点            │ │
│ │     ─ 轨迹线            │ │
│ │                        │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ ● 已记录: 15个点        │ │  ← 状态栏
│ │ [🔴 开始记录]           │ │  ← 操作按钮
│ └────────────────────────┘ │
└────────────────────────────┘
```

**交互流程：**
1. 用户输入前缀，选择记录间隔（5s / 10s / 30s / 60s / 120s）
2. 点击「开始记录」→ 按钮变为「停止记录」（红色），设置栏隐藏
3. 每隔 N 秒自动获取 GPS 坐标，地图实时刷新标记点和轨迹线
4. 点击「停止记录」→ 会话存档，设置栏重新显示

### 记录页

```
┌────────────────────────────┐
│ ┌────────────────────────┐ │
│ │ 2026-05-12              │ │
│ │ 路线A · 15点            │ │
│ │ [导出XLSX] [删除]       │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 2026-05-11              │ │
│ │ 路线B · 8点             │ │
│ │ [导出XLSX] [删除]       │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

---

## 5. XLSX 导出格式

| 名称 | 纬度 | 经度 | 海拔 |
|------|------|------|------|
| 路线A_001 | 39.9042 | 116.4074 | 52 |
| 路线A_002 | 39.9080 | 116.4120 | 55 |

导出后触发系统分享面板（发送到微信/邮件/文件管理器等）。

---

## 6. 项目结构

```
GPSTracer/
├── App.tsx                      # 入口，底部 Tab 导航
├── app.json                     # Expo 配置
├── package.json                 # Expo/Jest/TypeScript 脚本与依赖
├── jest.config.js               # Jest 配置
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # 地图页
│   │   └── RecordsScreen.tsx    # 记录页
│   ├── components/
│   │   ├── MapView.tsx          # WebView 封装的地图组件
│   │   ├── ControlBar.tsx       # 开始/停止按钮 + 状态
│   │   ├── IntervalPicker.tsx   # 记录间隔选择器
│   │   └── RecordItem.tsx       # 单条记录行
│   ├── services/
│   │   ├── location.ts          # GPS 定位服务（前后台）
│   │   ├── database.ts          # SQLite 数据库操作
│   │   ├── workbook.ts          # XLSX OOXML + zip 生成（可单测）
│   │   ├── export.ts            # XLSX 写入临时文件 + 分享
│   │   └── __tests__/export.test.ts
│   ├── context/
│   │   └── TrackingContext.tsx   # 记录状态全局管理
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   └── utils/
│       ├── constants.ts         # 常量（高德瓦片 URL、间隔选项等）
│       ├── helpers.ts           # 工具函数
│       └── __tests__/helpers.test.ts
├── assets/
│   └── map.html                 # Leaflet 地图 HTML（WebView 加载用）
```

---

## 7. 核心服务逻辑

### 7.1 GPS 定位服务 (`location.ts`)

- 使用 `expo-location` 获取当前位置（`Accuracy.BestForNavigation`）
- 前台：第一版使用 `setInterval + getCurrentPositionAsync` 按用户选择间隔采样，写入 SQLite 并更新 Context
- 后台：通过 `TaskManager.defineTask` 注册后台任务，并在开始/停止记录时启停 `startLocationUpdatesAsync`
- 当前限制：后台任务第一版只完成注册与启停，后台写入 SQLite 和前台恢复同步需真机验证后补齐，避免桌面环境误判

**权限要求：**
- Android: `ACCESS_FINE_LOCATION`, `FOREGROUND_SERVICE`, `BACKGROUND_LOCATION`
- iOS: `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`

### 7.2 数据库服务 (`database.ts`)

- `initDB()` — 创建 sessions 和 points 表
- `startSession(id, prefix, interval)` — 插入新会话
- `addPoint(point)` — 插入记录点
- `getSessions()` — 查询所有会话（含点位数量）
- `getPoints(sessionId)` — 按会话查询点位
- `deleteSession(sessionId)` — 删除会话及其点位

### 7.3 XLSX 导出 (`export.ts`)

- 不依赖完整 xlsx 库，手动拼接 Office Open XML (OOXML) 内容
- 使用 `jszip` 生成 `.xlsx` 所需 zip 包，避免手写 zip 二进制结构
- `workbook.ts` 负责生成 workbook base64，`export.ts` 负责写入临时文件并调用 `expo-sharing.shareAsync`
- 单元测试覆盖 XML 转义、表头、数值格式和空海拔处理

### 7.4 地图组件 (`MapView.tsx`)

- WebView 加载 `assets/map.html`（内置 Leaflet.js + 高德瓦片配置）
- 地图图源：`https://webrd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn`
- React Native → WebView：`injectJavaScript` 推送 points 数组（JSON）
- WebView → React Native：`postMessage` 回传事件（地图就绪、点击等）
- 用 `L.marker()` 渲染点标记，`L.polyline()` 渲染轨迹线
- 每次新增点位后自动 `fitBounds` 调整视口

### 7.5 状态管理 (`TrackingContext.tsx`)

Context 提供：
- `isTracking: boolean` — 是否正在录制
- `currentPoints: RecordPoint[]` — 当前会话的点位列表
- `prefix: string` — 名称前缀
- `interval: number` — 记录间隔（秒）
- `startTracking()` — 使用 Context 中的 `prefix` 和 `interval` 开始录制
- `stopTracking()` — 停止录制
- 内部使用 `setInterval` 按间隔调用定位服务

---

## 8. 运行与验证

### 开发运行

当前移动端应用是 Expo 工程，入口位于：
- `GPSTracer/index.ts`
- `GPSTracer/App.tsx`

本地启动命令：

```bash
cd GPSTracer
npm start
```

启动后使用 Expo Go 扫码，或运行：

```bash
npm run android
npm run ios
```

### 当前验证

```bash
npm test -- --runInBand
npm run typecheck
```

### 构建安装包

当前仓库尚未生成独立 APK/IPA 文件。若需要可安装文件，需要后续使用 EAS Build 或 Expo prebuild/native build 流程生成：
- Android: `.apk` 或 `.aab`
- iOS: `.ipa`（需要 Apple 开发者签名配置）

---

## 9. 权限与平台配置

| 平台 | 权限 | 配置位置 |
|------|------|----------|
| Android | `ACCESS_FINE_LOCATION` | `app.json` → `android.permissions` |
| Android | `BACKGROUND_LOCATION` | 同上（需运行时申请） |
| iOS | `NSLocationWhenInUseUsageDescription` | `app.json` → `ios.infoPlist` |
| iOS | `NSLocationAlwaysAndWhenInUseUsageDescription` | 同上（需运行时申请） |
| iOS | `UIBackgroundModes: ["location"]` | `app.json` → `ios.infoPlist` |
