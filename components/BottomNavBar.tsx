import { Box, HStack, VStack, Pressable, Text } from "@gluestack-ui/themed";
import { FontAwesome } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import React from "react";

// 요청에 따라 3개의 탭으로 재구성
const navItems = [
  {
    href: "/(main)/",
    iconSet: FontAwesome,
    iconName: "home",
    label: "홈",
  },
  {
    href: "/(main)/event-alarm-page",
    iconSet: FontAwesome,
    iconName: "plus-square",
    label: "사건/사고 알리기",
  },
  {
    href: "/(main)/mypage",
    iconSet: FontAwesome,
    iconName: "user",
    label: "마이페이지",
  },
];

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      bg="$backgroundLight0"
      borderTopWidth={1}
      borderTopColor="$borderLight200"
      // Safe area for bottom notch
      pb="$4"
    >
      <HStack justifyContent="space-around" alignItems="center" height={60}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link href={item.href as any} asChild key={item.href}>
              <Pressable flex={1}>
                <VStack alignItems="center" gap="$1">
                  <FontAwesome
                    name={item.iconName as any}
                    size={24}
                    color={isActive ? "#3897DF" : "#9ca3af"}
                  />
                  <Text
                    size="xs"
                    color={isActive ? "#3897DF" : "#9ca3af"}
                    fontWeight={isActive ? "$bold" : "$normal"}
                  >
                    {item.label}
                  </Text>
                </VStack>
              </Pressable>
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
};

export default BottomNavBar;
