import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
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
import { getReportDetail } from "@/api/apis";
import PostDetailViewScreen from "@/features/post/PostDetailViewScreen";
import { ReportDetail } from "@/api/types";

import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

// NewKakaoMap 컴포넌트의 ref 타입을 정의합니다.
interface MapRef {
  recenter: (lat: number, lon: number) => void;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<{ 
    latitude: number; longitude: number 
  } | null>(null);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const router = useRouter();

  const mapRef = useRef<MapRef>(null);

  const getAddress = async (latitude: number, longitude: number) => {
    console.log('getAddress called with:', { latitude, longitude });
    console.log('Kakao REST API Key:', process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY);
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
      console.log('Kakao Geocoding API response:', data);
      if (data.documents && data.documents.length > 0) {
        const fetchedAddress = data.documents[0].address.address_name;
        setAddress(fetchedAddress);
        console.log('Address set to:', fetchedAddress);
      }
    } catch (error) {
      console.error('주소를 가져오는 데 실패했습니다:', error);
    }
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      // 현재 위치 가져오기
      try {
        const { coords } = await Location.getCurrentPositionAsync({});
        console.log('Current location fetched:', coords);
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        getAddress(coords.latitude, coords.longitude);
      } catch (error) {
        console.error('위치 정보를 가져오는 데 실패했습니다:', error);
      }
    };

    getCurrentLocation();
  }, []);

  const handleRecenter = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      console.log('Recenter location fetched:', coords);
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
      console.error('현재 위치를 가져오는 데 실패했습니다:', error);
    }
  };


  const [dongName, setDongName] = useState("");
  const [isDetailVisible, setDetailVisible] = useState(false);
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null);

  const handleCenterChange = (newDong: string) => {
    setDongName(newDong);
  };

  const handleMarkerPress = async () => {
    try {
      const detail = await getReportDetail("1"); // 더미 ID
      setReportDetail(detail);
      setDetailVisible(true);
    } catch (e) {
      console.error("report detail fetch error", e);
    }
  };

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
          <MapControlPanel dongName={dongName} />
        </Box>
        <HStack space="sm" justifyContent="center" mb={10}>
          <Button
            action="secondary"
            bg="$white"
            rounded="$xl"
            px={10}
            py={10}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={2}
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
            shadowOpacity={0.05}
            shadowRadius={2}
            onPress={() => router.push("/(main)/news-page")}
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

      {/* ✅ 중앙 좌측 마커 */}
      <Pressable
        onPress={handleMarkerPress}
        position="absolute"
        top="45%"
        left="25%"
        zIndex={20}
      >
        <Image
          source={require("@/assets/images/orangeMarker.png")}
          style={{ width: 40, height: 40 }}
          alt="marker"
        />
      </Pressable>

      {/* ✅ 상세 뷰 (슬라이드 업) */}
      {isDetailVisible && reportDetail && (
        <PostDetailViewScreen
          reportDetail={reportDetail}
          onClose={() => setDetailVisible(false)}
        />
      )}

      {/* 내 위치 버튼 */}
      <MyLocationButton onPress={handleRecenter} />
    </Box>
  );
}
