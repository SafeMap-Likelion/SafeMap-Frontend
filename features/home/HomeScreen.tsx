import React from "react";
import { useRouter } from "expo-router"; // Import useRouter
import {
  Box,
  HStack,
  Button,
  ButtonText,
  View,
  VStack,
} from "@gluestack-ui/themed";
import KakaoMap from "@/components/KakaoMap";
import Geolocation from "@/components/Geolocation";
import MapControlPanel from "./components/MapControlPanel";
import { Image } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Box flex={1} position="relative">
      {/*지도 (바닥 레이어) */}
      <KakaoMap />

      {/* 지도 위에 떠 있는 패널*/}
      <Box
        position="absolute"
        zIndex={10}
        alignSelf="center"
        top={50}
        width="95%"
      >
        <Box flex={1} mb={15}>
          <MapControlPanel />
        </Box>
        <HStack space="sm" justifyContent="center" mb={10}>
          <Button
            action="secondary"
            bg="$white"
            borderWidth={1}
            borderColor="#e6e6e6"
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
            borderWidth={1}
            borderColor="#e6e6e6"
            rounded="$xl"
            px={10}
            py={10}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={2}
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

      {/* ③ Geolocation (필요 시 다른 위치에 오버레이) */}
      <Box position="absolute" bottom={40} right={20} zIndex={10}>
        <Geolocation />
      </Box>
    </Box>
  );
}
