import React from "react";
import { FlatList } from "react-native";
import { Box, ScrollView, SafeAreaView } from "@gluestack-ui/themed";
import Header from "./components/Header";
import InfoBubble from "./components/InfoBubble";
import NewsCard from "./components/NewsCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dummyData = [
  {
    id: "1",
    source: "헤럴드경제",
    title: "관악구 봉천동 현대시장 인근 ‘안심가로등’ 확대…주민 밤길 밝힌다",
    date: "2025. 9. 7.",
    image:
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "2",
    source: "연합뉴스",
    title: "봉천동 현대시장 화재 발생…상인·소방 긴급 대응",
    date: "2025. 9. 7.",
    image:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "3",
    source: "헤럴드경제",
    title: "관악구 봉천동 현대시장 인근 ‘안심가로등’ 확대…주민 밤길 밝힌다",
    date: "2025. 9. 7.",
    image:
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "4",
    source: "연합뉴스",
    title: "봉천동 현대시장 화재 발생…상인·소방 긴급 대응",
    date: "2025. 9. 7.",
    image:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "5",
    source: "헤럴드경제",
    title: "관악구 봉천동 현대시장 인근 ‘안심가로등’ 확대…주민 밤길 밝힌다",
    date: "2025. 9. 7.",
    image:
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "6",
    source: "연합뉴스",
    title: "봉천동 현대시장 화재 발생…상인·소방 긴급 대응",
    date: "2025. 9. 7.",
    image:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=60",
  },
];

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} bg="$white" pt={insets.top}>
        <Header title="'봉천동' 뉴스" />
        <InfoBubble location="봉천동" />
        <ScrollView
          mt={5}
          mx={5}
          bg="$white"
          showsVerticalScrollIndicator={false}
        >
          <FlatList
            data={dummyData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NewsCard item={item} />}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
