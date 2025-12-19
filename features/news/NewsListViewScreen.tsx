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
  const addrA = (params.addr_a as string) || "서울특별시";
  const addrB = (params.addr_b as string) || "관악구";
  const addrC = (params.addr_c as string) || "봉천동";
  const [newsData, setNewsData] = useState<NewsAbstract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await getNewsList(addrA, addrB, addrC);
        setNewsData(data);
      } catch (error) {
        console.error("Failed to fetch news list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [addrA, addrB, addrC]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Box flex={1} bg="$white" pt={50}>
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
