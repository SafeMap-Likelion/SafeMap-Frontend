import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Icon,
} from "@gluestack-ui/themed";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import SelectLocation from "@/components/SelectLocation";

export default function MapControlPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    "🚗 교통",
    "🌪️ 자연 재해",
    "🔥 화재/폭발",
    "🏗️ 시설/인프라",
    "🚓 범죄/치안",
    "⚙️ 기타/특수",
  ];

  const collapsedCount = 3;
  const visibleCategories = isExpanded
    ? categories
    : categories.slice(0, collapsedCount);

  return (
    <Box
      width="95%"
      alignSelf="center"
      bg="$white"
      px={10}
      pt={15}
      pb={10}
      rounded="$2xl"
    >
      <VStack space="md">
        {/* 지역 선택창 */}
        <SelectLocation />

        {/* 카테고리 선택 영역 */}
        <Box
          bg={isExpanded ? "#f8f8f8" : "$white"} // 상태에 따라 배경색 변경
          rounded="$2xl"
          p="$3"
          width="90%"
          alignSelf="center"
        >
          <HStack
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            space="sm"
          >
            {/* 왼쪽: 카테고리들 */}
            <HStack flexWrap="wrap" space="sm" alignItems="center" flex={1}>
              {visibleCategories.map((cat, i) => (
                <Box key={i} bg="#FFE6E6" px={10} py={7} rounded="$2xl" mb={5}>
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color="#555"
                    textAlign="center"
                  >
                    {cat}
                  </Text>
                </Box>
              ))}
            </HStack>

            {/* 오른쪽: 화살표 아이콘 */}
            <Pressable onPress={() => setIsExpanded(!isExpanded)}>
              <Icon
                as={isExpanded ? ChevronDown : ChevronUp}
                color="#555"
                size="md"
              />
            </Pressable>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
