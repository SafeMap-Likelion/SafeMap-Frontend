import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Button,
  ButtonText,
  ScrollView,
} from "@gluestack-ui/themed";
import { Animated, Easing } from "react-native";
import debounce from "lodash.debounce";

export default function SelectLocationWithCat() {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchText, setSearchText] = useState(""); // 위치 검색 입력필드 값
  const [debouncedSearchText, setDebouncedSearchText] = useState(""); //디바운싱 후 위치 검색 입력필드 값
  const [animatedHeight] = useState(new Animated.Value(200)); // 기본 높이 (Animated)

  const regions = [
    "서울특별시 종로구 부암동",
    "서울특별시 종로구 평창동",
    "서울특별시 종로구 송인동",
    "서울특별시 종로구 창신동",
    "서울특별시 종로구 삼청동",
    "서울특별시 종로구 청운동",
  ];

  //디바운스 함수
  //useMemo으로 메모이제이션하여 debounce함수 인스턴스를 재생성하지 않도록 함
  const debouncedUpdate = useMemo(
    () =>
      debounce((text: string) => {
        setDebouncedSearchText(text);
      }, 1000),
    []
  );
  // searchText가 바뀔 때마다 debounce함수 실행
  useEffect(() => {
    debouncedUpdate(searchText);
    // cleanup: 언마운트 시 debounce 취소
    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchText, debouncedUpdate]);

  // 입력된 글자 포함하는 지역만 필터링 (디바운스된 검색어로 필터링)
  const filteredRegions = regions.filter((r) =>
    r.includes(debouncedSearchText)
  );

  //검색 결과 콘텐츠의 크기에 따라 동적으로 전체 박스 높이 계산
  const baseHeight = 200; //기본 높이
  const contentHeight =
    debouncedSearchText === ""
      ? 0 //아무것도 안 쳤을 때
      : filteredRegions.length > 0
        ? Math.min(filteredRegions.length * 30, 113) // 결과 많으면 제한
        : 30; // "검색 결과가 없습니다" 높이

  const targetHeight = baseHeight + contentHeight;

  //Animated height 변경 효과 (부드러운 높이 전환)
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [targetHeight]);

  return (
    <Animated.View
      style={{
        height: animatedHeight,
        backgroundColor: "#f3f3f3",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 16,
        width: "100%",
      }}
    >
      <VStack flex={1}>
        {/* 지역 분류 */}
        <HStack alignItems="center" mb={15}>
          <Text
            w={55}
            textAlign="right"
            fontFamily="Pretendard"
            fontWeight={500}
            fontSize={13}
            p={0}
            mr={11}
            color="#000000"
          >
            지역 분류
          </Text>
          <Input
            borderColor="transparent"
            h={32}
            flex={1}
            bg="$white"
            rounded="$2xl"
          >
            <InputField
              h="100%"
              fontSize={12}
              textAlign="center"
              fontWeight={500}
              placeholder="추가하려는 지역의 분류를 입력하세요"
              color="#565656"
            />
          </Input>
        </HStack>

        {/* 위치 */}
        <VStack flex={1} mb={15}>
          <HStack alignItems="center" mb="$3">
            <Text
              w={55}
              textAlign="right"
              fontFamily="Pretendard"
              fontSize={13}
              fontWeight={500}
              mr={11}
              color="#000000"
            >
              위치
            </Text>
            <Input
              borderColor="transparent"
              h={32}
              flex={1}
              bg="$white"
              rounded="$2xl"
            >
              <InputField
                h="100%"
                fontSize={12}
                textAlign="center"
                fontWeight={500}
                placeholder="추가하려는 지역을 입력하세요"
                color="#565656"
                value={searchText}
                onChangeText={setSearchText} // 🔹 입력값 상태 업데이트
              />
            </Input>
          </HStack>

          {/*  검색어가 있을 때만 ScrollView 보이기 */}
          {debouncedSearchText !== "" && (
            <HStack maxHeight={113}>
              <Text
                w={55}
                textAlign="right"
                fontFamily="Pretendard"
                fontSize={13}
                fontWeight={500}
                mr={11}
              ></Text>
              <Box bg="$white" rounded="$2xl" flex={1}>
                <ScrollView py={5}>
                  <VStack space="xs">
                    {filteredRegions.length > 0 ? (
                      filteredRegions.map((r, i) => (
                        <Text
                          textAlign="center"
                          fontFamily="Pretendard"
                          key={i}
                          fontSize={12}
                          fontWeight={500}
                          color="#565656"
                          py={2.5}
                        >
                          {r}
                        </Text>
                      ))
                    ) : (
                      <Text
                        textAlign="center"
                        fontFamily="Pretendard"
                        fontSize={12}
                        fontWeight={500}
                        color="#999"
                        py={2.5}
                      >
                        검색 결과가 없습니다
                      </Text>
                    )}
                  </VStack>
                </ScrollView>
              </Box>
            </HStack>
          )}
        </VStack>

        {/* 추가 버튼 */}
        <Button
          bg={isPressed || isHovered ? "#9e9e9e" : "#bebebe"}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onHoverIn={() => setIsHovered(true)}
          onHoverOut={() => setIsHovered(false)}
          rounded="$2xl"
          px={6}
          py={3}
          m={0}
          h="auto"
          alignSelf="center"
        >
          <ButtonText fontSize={12} color="$white" px={8} py={4}>
            추가하기
          </ButtonText>
        </Button>
      </VStack>
    </Animated.View>
  );
}
