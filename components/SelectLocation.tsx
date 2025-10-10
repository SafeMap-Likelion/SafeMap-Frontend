import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  ScrollView,
} from "@gluestack-ui/themed";

export default function SelectLocationWithCat() {
  const [searchText, setSearchText] = useState("");
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

  const filteredRegions = regions.filter((region) =>
    region.includes(searchText)
  );

  return (
    <Box
      width="90%"
      bg="#f3f3f3"
      py={15}
      px={30}
      rounded="$2xl"
      alignSelf="center"
    >
      <VStack flex={1}>
        <VStack flex={1} mb={15}>
          <HStack alignItems="center" mb="$3">
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
                fontWeight={"500"}
                placeholder="지역 검색..."
                color="#565656"
                value={searchText}
                onChangeText={setSearchText}
              />
            </Input>
          </HStack>
          <HStack maxHeight={113}>
            {/* 수정: minHeight를 추가하고, 검색 결과 유무에 따라 다른 UI를 보여줍니다. */}
            <Box bg="$white" rounded="$2xl" flex={1} minHeight={100} p={5}>
              {filteredRegions.length > 0 ? (
                <ScrollView>
                  <VStack space="xs">
                    {filteredRegions.map((r, i) => (
                      <Text
                        textAlign="center"
                        fontFamily="Pretendard"
                        key={i}
                        fontSize={12}
                        fontWeight={"500"}
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
                  <Text fontSize={12} fontWeight={"500"} color="#a3a3a3">
                    검색 결과가 없습니다.
                  </Text>
                </Box>
              )}
            </Box>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
