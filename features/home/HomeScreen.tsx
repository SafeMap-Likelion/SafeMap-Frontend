import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Box, Button, ButtonText, HStack, Image, Text } from "@gluestack-ui/themed";
import NewKakaoMap from "@/components/NewKakaoMap";
import MapControlPanel from "./components/MapControlPanel";
import Geolocation from "@/components/Geolocation";
import * as Location from "expo-location";
import KakaoMap from "@/components/MapWrapper";

export default function HomeScreen() {
  const [location, setLocation] = useState<{ 
    latitude: number; longitude: number 
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getCurrentLocation = async () => {
      // 현재 위치 가져오기
      try {
        const { coords } = await Location.getCurrentPositionAsync({})
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
      } catch (error) {
        console.error('위치 정보를 가져오는 데 실패했습니다:', error)
      }
    }

    getCurrentLocation()
  }, [])

  return (
    <Box flex={1} position="relative">
      {/*지도 (바닥 레이어) */}
        
      {location ? (
        <NewKakaoMap 
          latitude={location.latitude} 
          longitude={location.longitude} 
        />
      ) : (
        <Text>위치 정보를 불러오는 중...</Text>
      )}
      
      {/* 지도 위에 떠 있는 패널*/}
      <Box
        position="absolute"
        zIndex={10}
        alignSelf="center"
        top={60}
        width="95%"
      >
        <Box flex={1} mb={15}>
          <MapControlPanel />
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
                '봉천동' 뉴스 보러가기
              </ButtonText>
              <Image
                source={require("@/assets/images/icon3.png")}
                style={{ width: 24, height: 24 }}
              />
            </HStack>
          </Button>
        </HStack>
      </Box>

      {/* ③ Geolocation (필요 시 다른 위치에 오버레이)
      <Box position="absolute" bottom={40} right={20} zIndex={10}>
        <Geolocation />
      </Box> */}
    </Box>
  );
}
