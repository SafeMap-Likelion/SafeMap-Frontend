import React from "react";
import { HStack, Text, Box, Image } from "@gluestack-ui/themed";

export default function InfoBubble({ location }: { location: string }) {
  return (
    <HStack
      alignItems="center"
      justifyContent="flex-end"
      bg="$white"
      borderWidth={0}
      space="xs"
      mt={2}
      mb={5}
    >
      <Box
        alignContent="center"
        justifyContent="center"
        borderWidth={0}
        h={46}
        bg="#EEF6FF"
        rounded="$2xl"
        px="$2"
        py="$1"
        display="flex"
        alignItems="center"
      >
        <Text
          fontFamily="Pretendard"
          fontSize={14}
          fontWeight="$bold"
          color="#000000"
          textAlign="center"
        >
          지금{" "}
          <Text
            fontFamily="Pretendard"
            fontSize={14}
            fontWeight="$bold"
            color="#000000"
          >
            '{location}'
          </Text>
          에서 발생한 사고를 확인해보세요!
        </Text>
      </Box>

      <Image
        source={require("../../../assets/images/icon.png")}
        alt="icon"
        size="xs"
        mr={8}
      />
    </HStack>
  );
}
