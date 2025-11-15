import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Image,
  Pressable,
} from "@gluestack-ui/themed";
import KakaoMap from "@/components/KakaoMap";
import MapControlPanel from "./components/MapControlPanel";
import Geolocation from "@/components/Geolocation";
import { getReportDetail } from "@/api/apis";
import PostDetailViewScreen from "@/features/post/PostDetailViewScreen";
import { ReportDetail } from "@/api/types";

export default function HomeScreen() {
  const router = useRouter();
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
      <KakaoMap onCenterChange={handleCenterChange} />

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

      
    </Box>
  );
}
