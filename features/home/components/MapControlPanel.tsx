import React, { useState } from "react";
import { Box, VStack, HStack, Text, Pressable } from "@gluestack-ui/themed";
import { MaterialIcons } from "@expo/vector-icons";
import { MapPin, Search } from "lucide-react-native";
import SelectLocation from "@/components/SelectLocation";

export default function MapControlPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    "🚗 교통",
    "🌪️ 자연 재해",
    "🔥 화재/폭발",
    "🏗️ 시설/인프라",
    "🚓 범죄/치안",
    "⚙️ 기타/특수",
  ];

  // 카테고리 선택 / 해제
  const handleCategoryPress = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  //  닫혔을 때: 선택된 것만 보이기
  const visibleCategories = isExpanded
    ? categories
    : selectedCategories.length > 0
      ? selectedCategories
      : [];

  //선택된 게 없을 때: 박스 배경 + 화살표만 표시
  const isEmpty = selectedCategories.length === 0 && !isExpanded;

  return (
    <Box
      width="95%"
      alignSelf="center"
      bg="$white"
      pt={3}
      pb={10}
      rounded="$2xl"
    >
      <VStack>
        {/* 지역 선택창 */}
        <SelectLocation
          containerBg="$white"
          inputBg="#F3F3F3"
          listBg="#F3F3F3"
          leftIcon={MapPin}
          rightIcon={Search}
          showLeftIcon
          showRightIcon
          showListOnInput
        />

        {/* 카테고리 선택 영역 */}
        <Box
          bg={isExpanded ? "#f3f3f3" : "$white"}
          rounded="$2xl"
          p="$3"
          width="90%"
          alignSelf="center"
          mt={isExpanded ? 0 : -15}
        >
          <HStack
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="flex-start"
            space="sm"
          >
            {/* 카테고리 영역 */}
            <HStack
              flexWrap="wrap"
              space="sm"
              justifyContent={isEmpty ? "center" : "flex-start"}
              alignItems="center"
              flex={1}
            >
              {visibleCategories.map((cat, i) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <Pressable key={i} onPress={() => handleCategoryPress(cat)}>
                    <Box
                      bg={isSelected ? "#FFE6E6" : "$white"}
                      px={10}
                      py={7}
                      rounded="$2xl"
                      mb={5}
                    >
                      <Text
                        fontSize={12}
                        fontWeight="600"
                        color="#555"
                        textAlign="center"
                      >
                        {cat}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>

            {/* 화살표 - 오른쪽 상단에 위치 */}
            <Pressable onPress={() => setIsExpanded(!isExpanded)}>
              <MaterialIcons
                name={isExpanded ? "arrow-drop-up" : "arrow-drop-down"}
                size={30}
                color="#555"
              />
            </Pressable>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
