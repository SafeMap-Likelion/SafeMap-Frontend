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

// 서울대입구역 좌표 (초기 지도 중심)
const INITIAL_LOCATION = {
  latitude: 37.48482459,
  longitude: 126.95063877,
};

export default function HomeScreen() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(INITIAL_LOCATION);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [nearEvents, setNearEvents] = useState<NearEvent[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [addrA, setAddrA] = useState<string>("");
  const [addrB, setAddrB] = useState<string>("");
  const [addrC, setAddrC] = useState<string>(""); // 법정동
  const [addrCAdmin, setAddrCAdmin] = useState<string>(""); // 행정동
  const router = useRouter();

  const mapRef = useRef<MapRef>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null
  );
  const dangerZonesRef = useRef<DangerZone[]>([]);
  const insideZonesRef = useRef<{ [key: string]: boolean }>({});
  // AppState 중복 호출 방지를 위한 ref
  const appStateRef = useRef<string>(AppState.currentState);
  const isBackgroundTrackingRef = useRef<boolean>(false);

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
      // 1. coord2address API로 전체 주소 가져오기
      const addressResponse = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const addressData = await addressResponse.json();

      // 2. coord2regioncode API로 행정동/법정동 정확히 가져오기
      const regionResponse = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const regionData = await regionResponse.json();

      // 행정동 (region_type: "H") 찾기
      let adminDong = ""; // 행정동
      let legalDong = ""; // 법정동
      if (regionData.documents && regionData.documents.length > 0) {
        for (const region of regionData.documents) {
          if (region.region_type === "H") {
            // 행정동
            adminDong = region.region_3depth_name;
            console.log("📍 행정동:", adminDong);
          } else if (region.region_type === "B") {
            // 법정동
            legalDong = region.region_3depth_name;
            console.log("📍 법정동:", legalDong);
          }
        }
      }

      if (addressData.documents && addressData.documents.length > 0) {
        const doc = addressData.documents[0];
        const fetchedAddress = doc.address?.address_name || "";
        setAddress(fetchedAddress);

        // 주소 3단계 정보 추출 (법정동 기준)
        const addrInfo = doc.address || {};
        const roadAddrInfo = doc.road_address || {};

        const addr1 =
          addrInfo.region_1depth_name || roadAddrInfo.region_1depth_name || "";
        const addr2 =
          addrInfo.region_2depth_name || roadAddrInfo.region_2depth_name || "";
        const addr3 =
          addrInfo.region_3depth_name || roadAddrInfo.region_3depth_name || "";

        console.log("📍 원본 주소:", { addr1, addr2, addr3 });

        // 시/도 이름 변환 (백엔드 API 형식에 맞춤)
        // "서울특별시" -> "서울시", "부산광역시" -> "부산시", "서울" -> "서울시"
        let formattedAddr1 = addr1;
        if (addr1.includes("특별시") || addr1.includes("광역시")) {
          formattedAddr1 = addr1
            .replace("특별시", "시")
            .replace("광역시", "시");
        } else if (
          addr1 === "서울" ||
          addr1 === "부산" ||
          addr1 === "대구" ||
          addr1 === "인천" ||
          addr1 === "광주" ||
          addr1 === "대전" ||
          addr1 === "울산"
        ) {
          formattedAddr1 = addr1 + "시";
        }
        // 세종, 경기도, 강원도 등은 그대로 유지

        console.log("📍 변환된 addr_a:", formattedAddr1);

        setAddrA(formattedAddr1);
        setAddrB(addr2);
        setAddrC(addr3); // 법정동
        setAddrCAdmin(adminDong || addr3); // 행정동 (없으면 법정동 사용)

        // 행정동 우선 사용 (coord2regioncode API에서 가져온 정확한 행정동)
        const dong = adminDong || legalDong || addr3;
        if (dong) {
          setDongName(dong);
          console.log("📍 표시할 동:", dong, "(행정동 우선)");
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
      // 이전 상태와 동일하면 무시 (중복 호출 방지)
      if (appStateRef.current === nextAppState) {
        return;
      }

      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (nextAppState === "background" && !isBackgroundTrackingRef.current) {
        console.log("📱 앞이 백그라운드로 전환 - 백그라운드 추적 시작");
        isBackgroundTrackingRef.current = true;
        startBackgroundLocationTracking();
      } else if (nextAppState === "active" && previousState === "background") {
        console.log("📱 앞이 포그라운드로 전환 - 백그라운드 추적 중지");
        isBackgroundTrackingRef.current = false;
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
        // 초기 위치 가져오기 (지도 중심은 이동하지 않고 마커만 표시)
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // 더 빠른 위치 수신
        });
        console.log("Current location fetched:", coords);

        // 사용자 위치 마커만 업데이트 (지도 중심은 서울대입구역 유지)
        if (mapRef.current) {
          mapRef.current.updateUserMarker(coords.latitude, coords.longitude);
        }

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
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "🚗 교통",
    "🌪️ 자연 재해",
    "🔥 화재/폭발",
    "🏗️ 시설/인프라",
    "🚓 범죄/치안",
    "⚙️ 기타/특수",
  ]);
  const [showDangerZones, setShowDangerZones] = useState(false);

  // 주소 검색으로 지도 이동 (카카오맵 주소 검색 API 사용)
  const handleLocationSelect = async (selectedAddress: string) => {
    try {
      console.log("📍 주소 검색:", selectedAddress);

      // 카카오맵 주소 검색 API
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(selectedAddress)}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        const { x, y } = data.documents[0]; // x: 경도, y: 위도
        const latitude = parseFloat(y);
        const longitude = parseFloat(x);

        console.log("📍 검색 결과 좌표:", { latitude, longitude });

        // 지도 중심 이동
        setLocation({ latitude, longitude });
        if (mapRef.current) {
          mapRef.current.recenter(latitude, longitude);
        }

        // 주소 정보 및 주변 이벤트 갱신
        getAddress(latitude, longitude);
        await loadNearEvents(latitude, longitude);
      } else {
        console.error("주소 검색 결과 없음");
        Alert.alert(
          "검색 실패",
          "해당 주소를 찾을 수 없습니다. 자동완성된 항목 중에서 선택해주세요."
        );
      }
    } catch (error) {
      console.error("주소 검색 실패:", error);
      Alert.alert("오류", "주소 검색 중 오류가 발생했습니다.");
    }
  };

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
      setSelectedReportId(reportId); // report_id 저장
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
            onLocationSelect={handleLocationSelect}
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
                params: {
                  dongName: dongName,
                  addr_a: addrA,
                  addr_b: addrB,
                  addr_c: addrCAdmin, // 행정동으로 전달
                },
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
      {isDetailVisible && reportDetail && selectedReportId && (
        <PostDetailViewScreen
          reportDetail={reportDetail}
          reportId={selectedReportId}
          onClose={() => {
            setDetailVisible(false);
            setSelectedReportId(null);
          }}
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
