import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { Box, ScrollView, SafeAreaView } from "@gluestack-ui/themed";
import Header from "./components/Header";
import InfoBubble from "./components/InfoBubble";
import NewsCard from "./components/NewsCard";
import { getNewsList } from "@/api/apis";
import { NewsAbstract } from "@/api/types";
import { useLocalSearchParams } from "expo-router";

export default function NewsScreen() {
  const params = useLocalSearchParams();
  const dongName = (params.dongName as string) || "봉천동";
  const [newsData, setNewsData] = useState<NewsAbstract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getNewsList("서울특별시", "관악구", "봉천동");
        setNewsData(data);
      } catch (error) {
        console.error("Failed to fetch news list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Box flex={1} bg="$white">
        <Header title={`'${dongName}' 뉴스`} />
        <InfoBubble location={dongName} />
        <ScrollView
          mt={5}
          mx={5}
          bg="$white"
          showsVerticalScrollIndicator={false}
        >
          <FlatList
            data={newsData}
            keyExtractor={(item) => item.news_id}
            renderItem={({ item }) => <NewsCard item={item} />}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
