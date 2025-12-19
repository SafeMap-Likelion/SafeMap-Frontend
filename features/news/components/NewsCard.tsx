import React from "react";
import { HStack, VStack, Text, Box, Pressable } from "@gluestack-ui/themed";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

// 기본 이미지 (photo가 없을 경우)
const defaultImage = require("@/assets/images/icon.png");

export default function NewsCard({ item }: any) {
  const router = useRouter();

  const handlePress = () => {
    // 뉴스 세부 페이지로 이동
    router.push({
      pathname: "/(main)/news-detail",
      params: { id: item.news_id },
    });
  };

  // photo가 URL인 경우 그대로 사용, 없으면 기본 이미지
  const imageSource = item.photo ? { uri: item.photo } : defaultImage;

  return (
    <Pressable onPress={handlePress}>
      <HStack
        mx="$4"
        my="$2"
        bg="$backgroundLight0"
        rounded="$2xl"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.12}
        shadowRadius={6}
        elevation={6}
        p="$3"
        alignItems="center"
      >
        <VStack flex={1}>
          <Text fontFamily="Pretendard" fontSize={11} color="$textDark600">
            {item.press}
          </Text>
          <Text
            fontFamily="Pretendard"
            fontSize={16}
            fontWeight="$bold"
            color="#000000"
            numberOfLines={2}
            my={1}
          >
            {item.title}
          </Text>
          <Text fontFamily="Pretendard" fontSize={11} color="$textDark600">
            {new Date(item.uploaded_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })}
          </Text>
        </VStack>
        <Box ml="$3">
          <Image
            source={imageSource}
            style={{ width: 91, height: 68, borderRadius: 8 }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </Box>
      </HStack>
    </Pressable>
  );
}
