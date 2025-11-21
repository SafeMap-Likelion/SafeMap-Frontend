import React, { useState } from "react";
import { Box, VStack, HStack, Text, Pressable } from "@gluestack-ui/themed";
import { MaterialIcons } from "@expo/vector-icons";
import { MapPin, Search } from "lucide-react-native";
import SelectLocation from "@/components/SelectLocation";
import { LayoutAnimation, Platform, UIManager, ScrollView } from "react-native";

// Android에서 LayoutAnimation 활성화
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface MapControlPanelProps {
  dongName?: string;
  onCategoryChange?: (categories: string[]) => void;
}

export default function MapControlPanel({
  dongName,
  onCategoryChange,
}: MapControlPanelProps) {
  const categories = [
    "🚗 교통",
    "🌪️ 자연 재해",
    "🔥 화재/폭발",
    "🏗️ 시설/인프라",
    "🚓 범죄/치안",
    "⚙️ 기타/특수",
  ];

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(categories);

  // 토글 애니메이션
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // 카테고리 선택 / 해제
  const handleCategoryPress = (category: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      if (onCategoryChange) {
        onCategoryChange(newCategories);
      }
      return newCategories;
    });
  };

  //  펼쳤을 때는 전체, 닫혔을 때도 전체 (스크롤로)
  const visibleCategories = categories;

  return (
    <Box
      width="95%"
      alignSelf="center"
      bg="$white"
      pt={2}
      pb={10}
      px={10}
      rounded="$2xl"
    >
      <VStack space="xs">
        {/* 지역 선택창 */}
        <SelectLocation
          dongName={dongName}
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
        <Box bg="#f3f3f3" rounded="$2xl" p="$3" width="100%" alignSelf="center">
          <HStack
            justifyContent="space-between"
            alignItems="flex-start"
            space="sm"
          >
            {/* 카테고리 영역 - 닫혔을 때 가로 스크롤, 펼쳤을 때 여러 줄 */}
            {!isExpanded ? (
              // 닫혔을 때: 가로 스크롤
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  alignItems: "center",
                  paddingRight: 10,
                }}
                style={{ flex: 1 }}
              >
                <HStack space="sm" alignItems="center">
                  {visibleCategories.map((cat, i) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <Pressable
                        key={i}
                        onPress={() => handleCategoryPress(cat)}
                      >
                        <Box
                          bg={isSelected ? "#FFE6E6" : "$white"}
                          px={10}
                          py={7}
                          rounded="$2xl"
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
              </ScrollView>
            ) : (
              // 펼쳤을 때: 여러 줄로 표시
              <HStack flexWrap="wrap" space="sm" alignItems="center" flex={1}>
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
            )}

            {/* 화살표 - 오른쪽 상단에 위치 */}
            <Pressable onPress={toggleExpanded}>
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
