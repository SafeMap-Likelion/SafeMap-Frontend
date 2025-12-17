import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, AppState, TouchableOpacity, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/services/backgroundLocation";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Image,
  Pressable,
  Text,
} from "@gluestack-ui/themed";
import KakaoMap from "@/components/KakaoMap";
import NewKakaoMap from "@/components/NewKakaoMap";
import MapControlPanel from "./components/MapControlPanel";
import MyLocationButton from "./components/MyLocationButton";
import Geolocation from "@/components/Geolocation";
import {
  getReportDetail,
  getNearEventList,
  getDangerzoneList,
} from "@/api/apis";
import PostDetailViewScreen from "@/features/post/PostDetailViewScreen";
import { ReportDetail, NearEvent, DangerZone } from "@/api/types";

import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

// 알림 핸들러 설정 (Expo Go 호환)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// NewKakaoMap 컴포넌트의 ref 타입을 정의합니다.
interface MapRef {
  recenter: (lat: number, lon: number) => void;
  updateUserMarker: (lat: number, lon: number) => void;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [nearEvents, setNearEvents] = useState<NearEvent[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const router = useRouter();

  const mapRef = useRef<MapRef>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null
  );
  const dangerZonesRef = useRef<DangerZone[]>([]);
  const insideZonesRef = useRef<{ [key: string]: boolean }>({});

  // 거리 계산 (Haversine 공식)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // 지구 반지름 (미터)
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

  // 위험 구역 알림 트리거 (Alert + 로컬 알림)
  const triggerDangerAlert = async (zone: DangerZone) => {
    // 1. Alert 다이얼로그 표시
    Alert.alert(
      "⚠️ 위험 구역 진입",
      `현재 위치가 위험 구역입니다.\n\n` +
        `지역: ${zone.addr_a} ${zone.addr_b} ${zone.addr_c}\n` +
        `상세: ${zone.addr_d}\n` +
        `주의하세요!`,
      [{ text: "확인", style: "default" }]
    );

    // 2. 로컬 알림 표시 (상태 표시줄, Expo Go 호환)
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ 위험 구역 진입",
          body: `${zone.addr_a} ${zone.addr_b} ${zone.addr_c}\n${zone.addr_d}\n주의하세요!`,
          sound: true,
          data: { zoneId: zone.dz_id },
        },
        trigger: null, // 즉시 알림
      });
      console.log(`🔔 로컬 알림 전송 성공: ${zone.addr_d}`);
    } catch (error) {
      console.error("로컬 알림 전송 실패:", error);
    }
  };

  const getAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        const fetchedAddress = doc.address.address_name;
        setAddress(fetchedAddress);

        const dong =
          (doc.road_address && doc.road_address.region_3depth_h_name) ||
          (doc.address && doc.address.region_3depth_h_name) ||
          (doc.road_address && doc.road_address.region_3depth_name) ||
          (doc.address && doc.address.region_3depth_name);
        if (dong) {
          setDongName(dong);
        }
      }
    } catch (error) {
      console.error("주소를 가져오는 데 실패했습니다:", error);
    }
  };

  // 알림 권한 요청
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "알림 권한 필요",
          "위험 구역 알림을 받으려면 알림 권한이 필요합니다."
        );
      } else {
        console.log("✅ 알림 권한 허용됨");
      }
    };

    requestNotificationPermissions();
  }, []);

  // 앱 상태 감지 (Foreground/Background)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        console.log("📱 앱이 백그라운드로 전환 - 백그라운드 추적 시작");
        startBackgroundLocationTracking();
      } else if (nextAppState === "active") {
        console.log("📱 앱이 포그라운드로 전환 - 백그라운드 추적 중지");
        stopBackgroundLocationTracking();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 위험 구역 리스트 초기 로드 및 주기적 갱신 (1분마다)
  useEffect(() => {
    const loadDangerZones = async () => {
      try {
        const zones = await getDangerzoneList();
        setDangerZones(zones);
        dangerZonesRef.current = zones; // ref도 업데이트
        console.log("위험 구역 로드 완료:", zones.length);
      } catch (error) {
        console.error("위험 구역 로드 실패:", error);
      }
    };

    // 초기 로드
    loadDangerZones();

    // 1분(60초)마다 갱신
    const interval = setInterval(() => {
      loadDangerZones();
    }, 60 * 1000);

    // 언마운트 시 인터벌 정리
    return () => {
      clearInterval(interval);
      console.log("위험 구역 갱신 중지");
    };
  }, []);

  // 실시간 위치 추적 시작
  useEffect(() => {
    const startLocationTracking = async () => {
      try {
        // 초기 위치 가져오기
        const { coords } = await Location.getCurrentPositionAsync({});
        console.log("Current location fetched:", coords);
        const initialLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setLocation(initialLocation);
        getAddress(coords.latitude, coords.longitude);
        await loadNearEvents(coords.latitude, coords.longitude);

        // 실시간 위치 추적 시작 (3초마다)
        console.log("🚀 실시간 위치 추적 시작 (3초 간격)");
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000, // 3초마다 업데이트
            distanceInterval: 0, // 거리 제한 없음 (시간만으로 업데이트)
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            console.log("📍 위치 업데이트:", {
              latitude,
              longitude,
              timestamp: new Date().toLocaleTimeString(),
            });

            // 사용자 마커만 업데이트 (지도 중심은 유지)
            if (mapRef.current) {
              mapRef.current.updateUserMarker(latitude, longitude);
            }

            // 위험 구역 진입 체크 (ref 사용)
            const currentDangerZones = dangerZonesRef.current;
            console.log(
              "🔍 위험 구역 체크 중... (총 구역 수:",
              currentDangerZones.length + ")"
            );

            // ref의 dangerZones로 체크
            currentDangerZones.forEach((zone) => {
              const distance = calculateDistance(
                latitude,
                longitude,
                parseFloat(zone.latitude),
                parseFloat(zone.longitude)
              );

              const isInside = distance < zone.radius;
              const wasInside = insideZonesRef.current[zone.dz_id];

              console.log(
                `[디버그] 구역: ${zone.dz_id}, 거리: ${distance.toFixed(1)}m, 반경: ${zone.radius}m, isInside: ${isInside}, wasInside: ${wasInside}`
              );

              if (isInside && wasInside !== true) {
                // 밖에서 안으로 진입 (최초 진입)
                console.log(`⚠️ 위험 구역 진입: ${zone.addr_d}`);
                insideZonesRef.current[zone.dz_id] = true;
                triggerDangerAlert(zone);
              } else if (!isInside && wasInside === true) {
                // 안에서 밖으로 나감
                console.log(`✅ 위험 구역 이탈: ${zone.addr_d}`);
                insideZonesRef.current[zone.dz_id] = false;
              }
            });
          }
        );

        locationSubscriptionRef.current = subscription;
        console.log("✅ 위치 추적 구독 완료");
      } catch (error) {
        console.error("위치 추적 시작 실패:", error);
      }
    };

    startLocationTracking();

    // 언마운트 시 구독 해제
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        console.log("위치 추적 중지");
      }
    };
  }, []); // 한 번만 실행

  const handleRecenter = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      // console.log('Recenter location fetched:', coords);
      const newLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      setLocation(newLocation);
      getAddress(newLocation.latitude, newLocation.longitude);
      if (mapRef.current) {
        mapRef.current.recenter(newLocation.latitude, newLocation.longitude);
      }
    } catch (error) {
      console.error("현재 위치를 가져오는 데 실패했습니다:", error);
    }
  };

  const [dongName, setDongName] = useState("");
  const [isDetailVisible, setDetailVisible] = useState(false);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "🚗 교통",
    "🌪️ 자연 재해",
    "🔥 화재/폭발",
    "🏗️ 시설/인프라",
    "🚓 범죄/치안",
    "⚙️ 기타/특수",
  ]);
  const [showDangerZones, setShowDangerZones] = useState(false);

  const handleCenterChangeCoordinates = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    getAddress(coords.latitude, coords.longitude);
    // 지도 중심이 변경될 때마다 주변 신고 내용 로드
    await loadNearEvents(coords.latitude, coords.longitude);
  };

  // 주변 신고 내용 로드 함수
  const loadNearEvents = async (lat: number, lon: number) => {
    try {
      const events = await getNearEventList(
        lat,
        lon,
        3, // map_level
        0 // code (전체 카테고리)
      );
      setNearEvents(events);
    } catch (error) {
      console.error("주변 신고 내용 로드 실패:", error);
      setNearEvents([]); // 오류 시 빈 배열로 설정
    }
  };

  const handleMarkerPress = async (reportId: string) => {
    try {
      const detail = await getReportDetail(reportId);
      setReportDetail(detail);
      setDetailVisible(true);
    } catch (e) {
      console.error("report detail fetch error", e);
    }
  };

  // 선택된 카테고리에 따라 이벤트 필터링
  const filteredEvents = nearEvents.filter((event) => {
    const categoryMap: { [key: string]: string } = {
      교통: "🚗 교통",
      "범죄/치안": "🚓 범죄/치안",
      "시설/인프라": "🏗️ 시설/인프라",
      "화재/폭발": "🔥 화재/폭발",
      "자연 재해": "🌪️ 자연 재해",
      "기타/특수": "⚙️ 기타/특수",
    };
    const mappedCategory = categoryMap[event.type];
    return mappedCategory && selectedCategories.includes(mappedCategory);
  });

  return (
    <Box flex={1} position="relative">
      {/* 지도 */}
      {/* <KakaoMap onCenterChange={handleCenterChange} /> */}
      {/* 지도 (바닥 레이어) */}
      {location ? (
        <NewKakaoMap
          ref={mapRef}
          latitude={location.latitude}
          longitude={location.longitude}
          nearEvents={filteredEvents}
          dangerZones={showDangerZones ? dangerZones : []}
          onCenterChangeCoordinates={handleCenterChangeCoordinates}
          onMarkerClick={handleMarkerPress}
        />
      ) : (
        <Text>위치 정보를 불러오는 중...</Text>
      )}

      {/* 지도 위 패널 */}
      <Box
        position="absolute"
        zIndex={10}
        alignSelf="center"
        top={60}
        width="95%"
      >
        <Box flex={1} mb={15}>
          <MapControlPanel
            dongName={dongName}
            onCategoryChange={setSelectedCategories}
          />
        </Box>
        <HStack space="sm" justifyContent="center" mb={10}>
          <Button
            action="secondary"
            bg="$white"
            rounded="$xl"
            px={10}
            py={10}
            shadowColor="#000"
            shadowOpacity={0.1}
            shadowRadius={3}
            sx={{
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
            onPress={() => router.push("/(main)/interest-areas-page")}
          >
            <ButtonText fontSize={15} color="#333" fontWeight="800">
              📍 관심 지역 모아보기
            </ButtonText>
          </Button>

          <Button
            action="secondary"
            bg="$white"
            rounded="$xl"
            px={10}
            py={10}
            shadowColor="#000"
            shadowOpacity={0.1}
            shadowRadius={3}
            sx={{
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
            onPress={() =>
              router.push({
                pathname: "/(main)/news-page",
                params: { dongName: dongName },
              })
            }
          >
            <HStack alignItems="center" space="xs">
              <ButtonText fontSize={15} color="#333" fontWeight="800">
                "{dongName}" 뉴스 보러가기
              </ButtonText>
              <Image
                source={require("@/assets/images/icon3.png")}
                style={{ width: 24, height: 24 }}
              />
            </HStack>
          </Button>
        </HStack>
      </Box>

      {/* ✅ 상세 뷰 (슬라이드 업) */}
      {isDetailVisible && reportDetail && (
        <PostDetailViewScreen
          reportDetail={reportDetail}
          onClose={() => setDetailVisible(false)}
        />
      )}

      {/* 위험 구역 토글 */}
      <TouchableOpacity
        onPress={() => setShowDangerZones(!showDangerZones)}
        style={[
          styles.dangerButton,
          { backgroundColor: showDangerZones ? "#FF4444" : "#fff" },
        ]}
        activeOpacity={0.7}
      >
        <MaterialIcons name="warning" size={24} color="#333" />
      </TouchableOpacity>

      {/* 내 위치 버튼 */}
      <MyLocationButton onPress={handleRecenter} />
    </Box>
  );
}

const styles = StyleSheet.create({
  dangerButton: {
    position: "absolute",
    bottom: 160,
    right: 20,
    zIndex: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
