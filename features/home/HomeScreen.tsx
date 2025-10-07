import React from 'react';
import { useRouter } from 'expo-router'; // Import useRouter
import {
  Box,
  HStack,
  Button,
  ButtonText,
  View,
} from '@gluestack-ui/themed';
import KakaoMap from "@/components/KakaoMap";
import Geolocation from '@/components/Geolocation';

export default function HomeScreen() {
  const router = useRouter(); // Get router instance

  return (
    <Box flex={1}>
      {/* Header */}
      <HStack
        p="$4"
        pt="$10"
        justifyContent="space-between"
        alignItems="center"
        position="absolute"
        top={0}
        left={0}
        right={0}
        zIndex={1} // 헤더가 지도 위에 오도록 설정
      >
        <Button
          size="sm"
          action="secondary"
          onPress={() => router.push('/(main)/interest-areas-page')} // Add onPress handler
        >
          <ButtonText>관심지역 모아보기</ButtonText>
        </Button>
        <Button size="sm" action="secondary">
          <ButtonText>'봉천동' 뉴스보러가기</ButtonText>
        </Button>
      </HStack>

      {/* Map and other components */}
      <View style={{ flex: 1 }}>
        <KakaoMap />
        <Box
          position="absolute"
          top={120} // 헤더 높이를 고려하여 조정
          width="100%"
          padding={10}
        >
          <Geolocation />
        </Box>
      </View>
    </Box>
  );
}