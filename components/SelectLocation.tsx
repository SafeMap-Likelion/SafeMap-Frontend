import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  ScrollView,
  Icon,
} from "@gluestack-ui/themed";

interface SelectLocationProps {
  dongName?: string;
  containerBg?: string;
  inputBg?: string;
  listBg?: string;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  placeholder?: string;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  showListOnInput?: boolean; // ✅ 새 props: 입력이 있을 때만 리스트 보이기 기능 (기본값: 리스트 보이기)
}

export default function SelectLocation({
  dongName = "",
  containerBg = "#f3f3f3",
  inputBg = "$white",
  listBg = "$white",
  leftIcon,
  rightIcon,
  placeholder = "지역 검색...",
  showLeftIcon = false,
  showRightIcon = false,
  showListOnInput = false, // 기본은 항상 표시
}: SelectLocationProps) {
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (dongName) {
      setSearchText(dongName);
    }
  }, [dongName]);

  const regions = [
    "서울특별시 종로구 부암동",
    "서울특별시 종로구 평창동",
    "서울특별시 종로구 송인동",
    "서울특별시 종로구 창신동",
    "서울특별시 종로구 청운동",
    "서울특별시 종로구 누하동",
  ];

  const filteredRegions = regions.filter((region) =>
    region.includes(searchText)
  );

  const shouldShowList =
    !showListOnInput || (showListOnInput && searchText.trim().length > 0);

  return (
    <Box
      width="100%"
      bg={containerBg}
      py={10}
      px={15}
      rounded="$2xl"
      alignSelf="center"
    >
      <VStack flex={1} space="md">
        {/* 검색창 영역 */}
        <HStack alignItems="center" mb="$3">
          <Input
            borderColor="transparent"
            h={36}
            flex={1}
            bg={inputBg}
            rounded="$2xl"
            px={7}
            justifyContent="center"
          >
            <HStack
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              {/* 왼쪽 아이콘 */}
              {showLeftIcon && leftIcon && (
                <Icon as={leftIcon} color="#777" size="sm" />
              )}

              {/* 입력 필드 */}
              <InputField
                h="100%"
                flex={1}
                fontSize={12}
                textAlign="center"
                fontWeight="500"
                placeholder={placeholder}
                color="#565656"
                value={searchText}
                onChangeText={setSearchText}
              />

              {/* 오른쪽 아이콘 */}
              {showRightIcon && rightIcon && (
                <Icon as={rightIcon} color="#777" size="sm" />
              )}
            </HStack>
          </Input>
        </HStack>

        {/* 결과 리스트 — 입력이 있을 때만 표시할 수 있음 */}
        {shouldShowList && (
          <Box bg={listBg} rounded="$2xl" flex={1} minHeight={100} p={5}>
            {filteredRegions.length > 0 ? (
              <ScrollView>
                <VStack space="xs">
                  {filteredRegions.map((r, i) => (
                    <Text
                      textAlign="center"
                      fontFamily="Pretendard"
                      key={i}
                      fontSize={12}
                      fontWeight="500"
                      color="#565656"
                      py={2.5}
                    >
                      {r}
                    </Text>
                  ))}
                </VStack>
              </ScrollView>
            ) : (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Text fontSize={12} fontWeight="500" color="#a3a3a3">
                  검색 결과가 없습니다.
                </Text>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
