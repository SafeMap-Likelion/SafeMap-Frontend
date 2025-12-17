import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { getDangerzoneList } from "@/api/apis";

const LOCATION_TASK_NAME = "background-location-task";

// Haversine 거리 계산
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 마지막 알림 시간 추적 (중복 방지)
let lastNotifiedZones: { [key: string]: number } = {};

// 백그라운드 태스크 정의
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error("백그라운드 위치 추적 오류:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    console.log("🌙 백그라운드 위치 업데이트:", {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      time: new Date().toLocaleTimeString(),
    });

    try {
      // 위험 구역 가져오기
      const dangerZones = await getDangerzoneList();
      console.log("🔍 백그라운드 위험 구역 체크:", dangerZones.length);

      // 위험 구역 체크
      for (const zone of dangerZones) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          parseFloat(zone.latitude),
          parseFloat(zone.longitude)
        );

        if (distance < zone.radius) {
          // 중복 알림 방지 (5분 내 한 번만)
          const now = Date.now();
          const lastNotified = lastNotifiedZones[zone.dz_id] || 0;

          if (now - lastNotified > 5 * 60 * 1000) {
            // 위험 구역 진입 알림
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "⚠️ 위험 구역 진입",
                body: `${zone.addr_a} ${zone.addr_b} ${zone.addr_c}\n${zone.addr_d}\n주의하세요!`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                vibrate: [0, 250, 250, 250],
              },
              trigger: null, // 즉시 알림
            });

            lastNotifiedZones[zone.dz_id] = now;
            console.log(`⚠️ 백그라운드 위험 구역 알림: ${zone.addr_d}`);
          }
        }
      }
    } catch (error) {
      console.error("백그라운드 위험 구역 체크 실패:", error);
    }
  }
});

// 백그라운드 위치 추적 시작
export async function startBackgroundLocationTracking() {
  try {
    // 이미 실행 중인지 확인
    const isTracking =
      await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (isTracking) {
      console.log("⚠️ 백그라운드 위치 추적이 이미 실행 중입니다");
      return;
    }

    // 백그라운드 권한 확인
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== "granted") {
      console.log("❌ 위치 권한이 없습니다");
      return;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== "granted") {
      console.log("❌ 백그라운드 위치 권한이 없습니다");
      return;
    }

    // 백그라운드 위치 추적 시작
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced, // 배터리 절약
      timeInterval: 60000, // 1분마다
      distanceInterval: 50, // 50미터 이동 시
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "SafeMap 위치 추적 중",
        notificationBody: "위험 구역 알림을 위해 위치를 모니터링합니다.",
        notificationColor: "#FF0000",
      },
    });

    console.log("✅ 백그라운드 위치 추적 시작 (1분 간격)");
  } catch (error) {
    console.error("백그라운드 위치 추적 시작 실패:", error);
  }
}

// 백그라운드 위치 추적 중지
export async function stopBackgroundLocationTracking() {
  try {
    const isTracking =
      await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("🛑 백그라운드 위치 추적 중지");
    }
  } catch (error) {
    console.error("백그라운드 위치 추적 중지 실패:", error);
  }
}
