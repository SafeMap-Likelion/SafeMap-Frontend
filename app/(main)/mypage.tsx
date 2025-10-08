import React, { useState } from "react";
import {
  Box,
  HStack,
  Heading,
  Pressable,
  Text,
} from "@gluestack-ui/themed";
import MyPostScreen from '@/features/mypage/MyPostScreen';
import SettingScreen from '@/features/mypage/SettingScreen';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "settings">("posts");

  return (
    <Box flex={1} bg="$white">
      {/* 헤더 */}
      <Box pt="$12" px="$4" pb="$4" bg="$white">
        <Heading size="2xl" fontWeight="$bold" textAlign="center">
          👤마이페이지
        </Heading>
      </Box>

      {/* 탭 버튼 */}
      <HStack px="$4" gap="$2" mb="$4">
        <Pressable
          h={32}
          w={173.5}
          bg={activeTab === "posts" ? "#1C9DFF" : "#BEBEBE"}
          borderRadius={20}
          onPress={() => setActiveTab("posts")}
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontSize={16}
            fontWeight="$bold"
            color="$white"
          >
            내가 알린 사건/사고
          </Text>
        </Pressable>

        <Pressable
          h={32}
          w={173.5}
          bg={activeTab === "settings" ? "#1C9DFF" : "#BEBEBE"}
          borderRadius={20}
          onPress={() => setActiveTab("settings")}
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontSize={16}
            fontWeight="$bold"
            color="$white"
          >
            설정
          </Text>
        </Pressable>
      </HStack>

      {/* 탭 콘텐츠 */}
      <Box flex={1}>
        {activeTab === "posts" ? <MyPostScreen /> : <SettingScreen />}
      </Box>
    </Box>
  );
};

export default MyPage;
