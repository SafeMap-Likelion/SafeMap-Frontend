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
  Pressable, // Import Pressable
} from "@gluestack-ui/themed";
import { Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { getLocationSearch } from "../api/apis";
import { LocationSearchResult } from "../api/types";
import autocomplete_dummy from "../dummy/autocomplete_dummy.json";

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
  onSelect?: (selectedLocation: string) => void; // New prop for handling selection
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
  onSelect, // Destructure new prop
}: SelectLocationProps) {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      search: "",
    },
  });
  const searchText = watch("search");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    []
  );
  const [isUserTyping, setIsUserTyping] = useState(false);

  // dongName이 변경될 때 isUserTyping을 false로 리셋
  useEffect(() => {
    setIsUserTyping(false);
  }, [dongName]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText && isUserTyping) {
        getLocationSearch(searchText).then(setSearchResults);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, isUserTyping]);

  const handleSelectLocation = (selectedLocation: string) => {
    setValue("search", selectedLocation);
    setSearchResults([]); // Clear search results after selection
    setIsUserTyping(false);
    if (onSelect) {
      onSelect(selectedLocation);
    }
  };

  // 직접 입력 후 제출 시 유효성 검사
  const handleSubmitEditing = () => {
    const currentValue = searchText.trim();
    if (!currentValue) return;

    // autocomplete_dummy에 있는 값인지 확인
    const isValidLocation = autocomplete_dummy.some(
      (item) => item.result === currentValue
    );

    if (isValidLocation) {
      handleSelectLocation(currentValue);
    } else {
      Alert.alert(
        "올바르지 않은 입력",
        "자동완성된 항목 중에서 선택해주세요.\n\n예: 서울시 관악구 청룡동",
        [{ text: "확인", style: "default" }]
      );
      // 입력값 초기화
      setValue("search", "");
      setIsUserTyping(false);
    }
  };

  const shouldShowList =
    !showListOnInput ||
    (showListOnInput && searchText.trim().length > 0 && isUserTyping);

  return (
    <Box width="100%" bg={containerBg} py={5} rounded="$2xl" alignSelf="center">
      <VStack flex={1}>
        {/* 검색창 영역 */}
        <HStack alignItems="center">
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
              <Controller
                control={control}
                name="search"
                render={({ field: { onChange, onBlur, value } }) => {
                  return (
                    <InputField
                      key={dongName} // dongName 변경 시 리렌더링 강제
                      h="100%"
                      flex={1}
                      fontSize={12}
                      textAlign="center"
                      fontWeight="500"
                      placeholder={dongName || placeholder}
                      placeholderTextColor="#999"
                      color="#565656"
                      value={value}
                      onChangeText={(text) => {
                        setIsUserTyping(true);
                        onChange(text);
                      }}
                      onBlur={() => {
                        onBlur();
                        if ((value ?? "").trim().length === 0) {
                          setIsUserTyping(false);
                        }
                      }}
                      onSubmitEditing={handleSubmitEditing}
                      returnKeyType="search"
                    />
                  );
                }}
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
          <Box bg={listBg} rounded="$2xl" flex={1} minHeight={100} p={5} mt={2}>
            {searchResults.length > 0 ? (
              <ScrollView keyboardShouldPersistTaps="handled">
                <VStack space="xs">
                  {searchResults.map((r, i) => (
                    <Pressable
                      key={i}
                      onPress={() => handleSelectLocation(r.result)}
                    >
                      <Text
                        textAlign="center"
                        fontFamily="Pretendard"
                        fontSize={12}
                        fontWeight="500"
                        color="#565656"
                        py={2.5}
                      >
                        {r.result}
                      </Text>
                    </Pressable>
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
