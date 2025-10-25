//개별 사건 게시물 상세 화면
import React from 'react';
import PostView from '../../components/PostView';
import {
  Box,
  HStack,
  Text,
  Button,
  ButtonText,
  Image,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

/**
 * 개별 사건 게시물 상세 화면입니다.
 */
export default function PostDetailViewScreen() {
  const router = useRouter();

  return (
    <Box flex={1} bg="$white" pt={50}>
      {/* Header */}
      <HStack
        px="$4"
        pt="$4"
        pb="$2"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize={40} fontWeight="bold" color="black">집주변</Text>
        <Button
          action="secondary"
          bg="#F3F3F3"
          rounded="$xl"
          px={10}
          py={10}
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

      {/* Content */}
      <Box flex={1}>
        <PostView />
      </Box>
    </Box>
  );
}