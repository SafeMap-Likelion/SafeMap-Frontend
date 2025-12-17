import React from "react";
import { HStack, Text, Pressable, Box } from "@gluestack-ui/themed";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Header({ title }: { title: string }) {
  const router = useRouter();

  return (
    <HStack alignItems="center" px="$4" py="$3" bg="$white">
      <Pressable
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="chevron-left" size={18} color="#374151" />
      </Pressable>
      <Box flex={1} alignItems="center" mr="$6">
        <Text fontSize={24} fontWeight="$bold" color="$textDark900">
          {title}
        </Text>
      </Box>
    </HStack>
  );
}
