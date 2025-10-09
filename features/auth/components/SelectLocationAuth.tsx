import SelectLocationWithCat from "@/components/SelectLocationWithCat";
import { Box, HStack, Text, Image } from "@gluestack-ui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

export default function SelectLocationAuth() {
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

      <Box width="90%" height="40%" rounded="$2xl">
        <SelectLocationWithCat />
      </Box>
    </SafeAreaView>
  );
}
