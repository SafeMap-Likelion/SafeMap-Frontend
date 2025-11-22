import React, { useEffect, useState } from "react";
import { ScrollView } from "@gluestack-ui/themed";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  SafeAreaView,
} from "@gluestack-ui/themed";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import InfoBubble from "./components/InfoBubble";
import Header from "./components/Header";
import { getNewsDetail } from "@/api/apis";
import { NewsDetail } from "@/api/types";

export default function NewsDetailViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [newsData, setNewsData] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const newsId = params.id as string;
        const data = await getNewsDetail(newsId);
        setNewsData(data);
      } catch (error) {
        console.error("Failed to fetch news detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchNewsDetail();
    }
  }, [params.id]);

  if (loading || !newsData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <Box flex={1} bg="$white" justifyContent="center" alignItems="center">
          <Text>로딩 중...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Box flex={1} bg="$white">
        <Header title="'봉천동' 뉴스" />
        <InfoBubble location="봉천동" />

        {/* 스크롤 가능한 컨텐츠 */}
        <ScrollView mt={5} showsVerticalScrollIndicator={false}>
          <VStack px="$4" py="$4" space="md">
            {/* 메타 정보 */}
            <VStack space="xs">
              <Text fontFamily="Pretendard" fontSize={12} color="$textDark600">
                {newsData.press}
              </Text>

              {/* 제목 */}
              <Text
                fontFamily="Pretendard"
                fontSize={20}
                fontWeight="$bold"
                color="#000000"
                lineHeight={28}
              >
                {newsData.title}
              </Text>

              {/* 날짜 */}
              <Text fontFamily="Pretendard" fontSize={12} color="$textDark600">
                {new Date(newsData.uploaded_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}
              </Text>
            </VStack>

            {/* 본문 내용 */}
            <Box mt="$4">
              <Text
                fontFamily="Pretendard"
                fontSize={14}
                color="#000000"
                lineHeight={22}
              >
                {newsData.content}
              </Text>
            </Box>
          </VStack>

          {/* 하단 여백 (네비게이션 바를 위한) */}
          <Box height={100} />
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
