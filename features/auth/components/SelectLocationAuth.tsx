import SelectLocationWithCat from "@/components/SelectLocationWithCat";
import {
  Box,
  HStack,
  VStack,
  Text,
  Image,
  Button,
  ButtonText,
  Pressable,
  CloseIcon,
  Icon,
} from "@gluestack-ui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { postPoiList } from "@/api/apis";
import { FavoriteRegion } from "@/api/types";
import { useRouter } from "expo-router";

type AddedRegion = {
  category: string;
  location: string;
};

// 위치 문자열을 addr_a, addr_b, addr_c로 파싱
function parseLocation(location: string): {
  addr_a: string;
  addr_b: string;
  addr_c: string;
} {
  const parts = location.split(" ").filter((p) => p.trim());
  return {
    addr_a: parts[0] || "",
    addr_b: parts[1] || "",
    addr_c: parts[2] || "",
  };
}

export default function SelectLocationAuth() {
  const router = useRouter();
  const [regions, setRegions] = useState<AddedRegion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRegion = (category: string, location: string) => {
    setRegions((prev) => [...prev, { category, location }]);
  };

  const handleRemoveRegion = (index: number) => {
    setRegions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (regions.length === 0) {
      Alert.alert("알림", "최소 1개 이상의 관심 지역을 등록해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const favoriteRegions: FavoriteRegion[] = regions.map((r) => {
        const { addr_a, addr_b, addr_c } = parseLocation(r.location);
        return {
          type: r.category,
          addr_a,
          addr_b,
          addr_c,
        };
      });

      await postPoiList(favoriteRegions);
      Alert.alert("완료", "관심 지역이 등록되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(main)"),
        },
      ]);
    } catch (error) {
      console.error("관심지역 등록 실패:", error);
      Alert.alert("오류", "관심 지역 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <HStack
        alignItems="center"
        justifyContent="center"
        space="md"
        style={{ position: "absolute", top: 90 }}
      >
        <Box
          bg="#EEF6FF"
          p="$3"
          rounded="$xl"
          shadowColor="#000"
          shadowOpacity={0.05}
          shadowRadius={2}
          maxWidth="80%"
          marginRight={-40}
        >
          <Text
            style={{
              fontSize: 13,
              color: "#000",
              fontWeight: "600",
              lineHeight: 18,
            }}
          >
            관심 지역을 등록해{"\n"}
            지역에서 발생한 사건/사고를 한눈에 확인하세요!
          </Text>
        </Box>

        <Image
          source={require("@/assets/images/icon3.png")}
          style={{
            width: 130,
            height: 130,
            resizeMode: "contain",
          }}
        />
      </HStack>

      <VStack width="90%" space="md" style={{ marginTop: 100 }}>
        {/* 추가된 관심지역 목록 */}
        {regions.length > 0 && (
          <Box bg="#f9f9f9" rounded="$xl" p="$3" maxHeight={150}>
            <ScrollView>
              <VStack space="sm">
                {regions.map((region, index) => (
                  <HStack
                    key={index}
                    bg="white"
                    p="$2"
                    rounded="$lg"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <VStack flex={1}>
                      <Text fontSize={12} fontWeight="600" color="#333">
                        {region.category}
                      </Text>
                      <Text fontSize={11} color="#666">
                        {region.location}
                      </Text>
                    </VStack>
                    <Pressable onPress={() => handleRemoveRegion(index)} p="$1">
                      <Icon as={CloseIcon} size="sm" color="#999" />
                    </Pressable>
                  </HStack>
                ))}
              </VStack>
            </ScrollView>
          </Box>
        )}

        {/* 관심지역 입력 폼 */}
        <Box height="40%" rounded="$2xl">
          <SelectLocationWithCat onAdd={handleAddRegion} />
        </Box>

        {/* 등록 완료 버튼 */}
        <Button
          bg={regions.length > 0 ? "#4A90D9" : "#ccc"}
          rounded="$2xl"
          onPress={handleSubmit}
          disabled={isSubmitting || regions.length === 0}
          opacity={isSubmitting ? 0.7 : 1}
        >
          <ButtonText fontSize={14} fontWeight="600">
            {isSubmitting ? "등록 중..." : `등록 완료 (${regions.length}개)`}
          </ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
