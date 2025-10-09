import React from "react";
import {
  HStack,
  VStack,
  Text,
  Image,
  Box,
  Pressable,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";

export default function NewsCard({ item }: any) {
  const router = useRouter();

  const handlePress = () => {
    // 뉴스 세부 페이지로 이동
    router.push({
      pathname: "/(main)/news-detail",
      params: { id: item.id },
    });
  };

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
        <VStack flex={1} space="xs">
          <Text fontFamily="Pretendard" fontSize={11} color="$textDark600">
            {item.source}
          </Text>
          <Text
            fontFamily="Pretendard"
            fontSize={16}
            fontWeight="$bold"
            color="#000000"
          >
            {item.title}
          </Text>
          <Text fontFamily="Pretendard" fontSize={11} color="$textDark600">
            {item.date}
          </Text>
        </VStack>
        <Box ml="$3">
          <Image
            source={{ uri: item.image }}
            alt="thumbnail"
            width={68}
            height={91}
            rounded="$lg"
          />
        </Box>
      </HStack>
    </Pressable>
  );
}
