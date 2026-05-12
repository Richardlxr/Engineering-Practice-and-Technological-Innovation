import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { TRACKING_TASK } from '../utils/constants';

export type CapturedLocation = {
  latitude: number;
  longitude: number;
  altitude: number | null;
};

export async function requestLocationPermissions(): Promise<void> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    throw new Error('????????????? GPS?');
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== Location.PermissionStatus.GRANTED) {
    console.warn('????????????????????????');
  }
}

export async function getCurrentLocation(): Promise<CapturedLocation> {
  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude ?? null,
  };
}

export async function configureBackgroundLocation(intervalSeconds: number): Promise<void> {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK);
  if (hasStarted) await Location.stopLocationUpdatesAsync(TRACKING_TASK);
  await Location.startLocationUpdatesAsync(TRACKING_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: intervalSeconds * 1000,
    distanceInterval: 0,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: 'GPSTracer ????',
      notificationBody: '?????? GPS ???',
    },
  });
}

export async function stopBackgroundLocation(): Promise<void> {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(TRACKING_TASK);
  if (hasStarted) await Location.stopLocationUpdatesAsync(TRACKING_TASK);
}

TaskManager.defineTask(TRACKING_TASK, async ({ error }) => {
  if (error) console.warn('????????', error.message);
});
