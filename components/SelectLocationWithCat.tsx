import React, { useState } from "react";
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
  InputSlot,
  InputIcon,
  SearchIcon,
  Pressable,
} from "@gluestack-ui/themed";
import * as Font from "expo-font";

type SelectLocationWithCatProps = {
  onAdd?: (category: string, location: string) => void;
};

export default function SelectLocationWithCat({
  onAdd,
}: SelectLocationWithCatProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [category, setCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const regions = [
    "서울특별시 종로구 부암동",
    "서울특별시 종로구 평창동",
    "서울특별시 종로구 송인동",
    "서울특별시 종로구 창신동",
    "서울특별시 종로구 부암동",
    "서울특별시 종로구 평창동",
    "서울특별시 종로구 송인동",
    "서울특별시 종로구 창신동",
    "서울특별시 종로구 부암동",
    "서울특별시 종로구 평창동",
    "서울특별시 종로구 송인동",
    "서울특별시 종로구 창신동",
  ];

  return (
    <Box flex={1} bg="#f3f3f3" py={15} px={30} rounded="$2xl" w="100%">
      <VStack flex={1}>
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
              placeholder="회사"
              color="#565656"
              value={category}
              onChangeText={setCategory}
            />
          </Input>
        </HStack>

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
                placeholder="서울특별시"
                color="#565656"
                value={selectedLocation}
                onChangeText={setSelectedLocation}
              />
            </Input>
          </HStack>
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
                  {regions.map((r, i) => (
                    <Pressable key={i} onPress={() => setSelectedLocation(r)}>
                      <Text
                        textAlign="center"
                        fontFamily="Pretendard"
                        fontSize={12}
                        fontWeight={500}
                        color="#565656"
                        py={2.5}
                      >
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </VStack>
              </ScrollView>
            </Box>
          </HStack>
        </VStack>

        <Button
          bg={isPressed || isHovered ? "#9e9e9e" : "#bebebe"}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onHoverIn={() => setIsHovered(true)}
          onHoverOut={() => setIsHovered(false)}
          onPress={() => {
            if (onAdd && category.trim() && selectedLocation.trim()) {
              onAdd(category, selectedLocation);
              setCategory("");
              setSelectedLocation("");
            }
          }}
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
    </Box>
  );
}
