import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  ScrollView,
  Input,
  InputField,
  Icon,
  CloseIcon,
} from "@gluestack-ui/themed";
import {
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import SelectLocationWithCat from "../../components/SelectLocationWithCat";
import { FavoriteRegion } from "../../api/types";
import { getUserInfo, postPoiList } from "../../api/apis";

type InterestArea = {
  category: string;
  location: string;
};

const SettingScreen = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [snsAccount, setSnsAccount] = useState("");
  const [interestAreas, setInterestAreas] = useState<InterestArea[]>([]);
  const [savedFavorites, setSavedFavorites] = useState<FavoriteRegion[]>([]);

  const horizontalPadding = 20;
  const inputWidth = width - horizontalPadding * 2;
  const categoryBoxWidth = 60;
  const locationBoxWidth = isEditing
    ? inputWidth - categoryBoxWidth - 5 - 30 - 10 // category box - gap - delete icon space
    : inputWidth - categoryBoxWidth - 5;

  const favoriteKey = ({ type, addr_a, addr_b, addr_c }: FavoriteRegion) =>
    `${type?.trim()}|${addr_a?.trim()}|${addr_b?.trim()}|${addr_c?.trim()}`;

  const buildFavoriteRegions = (): FavoriteRegion[] => {
    const seen = new Set<string>();
    return interestAreas
      .map(({ category, location }) => {
        const tokens = location.trim().split(/\s+/);
        const [addr_a = "", addr_b = "", ...rest] = tokens;
        const addr_c = rest.join(" ");
        const type = category.trim();
        return { type, addr_a, addr_b, addr_c };
      })
      .filter(({ type, addr_a, addr_b, addr_c }) => {
        if (!type || !addr_a || !addr_b || !addr_c) return false;
        const key = favoriteKey({ type, addr_a, addr_b, addr_c });
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  const normalizeFavoriteRegions = (
    favorites: FavoriteRegion[]
  ): FavoriteRegion[] => {
    const seen = new Set<string>();
    return favorites
      .map(({ type, addr_a, addr_b, addr_c }) => ({
        type: type?.trim() ?? "",
        addr_a: addr_a?.trim() ?? "",
        addr_b: addr_b?.trim() ?? "",
        addr_c: addr_c?.trim() ?? "",
      }))
      .filter(({ type, addr_a, addr_b, addr_c }) => {
        if (!type || !addr_a || !addr_b || !addr_c) return false;
        const key = favoriteKey({ type, addr_a, addr_b, addr_c });
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  const loadUserInfo = async () => {
    try {
      setIsLoading(true);
      const info = await getUserInfo();
      setNickname(info.username ?? "");
      setSnsAccount(info.sns ?? "");
      const normalizedFavorites = normalizeFavoriteRegions(
        info.favorite_regions ?? []
      );
      const favoritesForView = normalizedFavorites.map(
        ({ type, addr_a, addr_b, addr_c }) => ({
          category: type,
          location: [addr_a, addr_b, addr_c].filter(Boolean).join(" "),
        })
      );
      setSavedFavorites(normalizedFavorites);
      setInterestAreas(favoritesForView);
    } catch (error: any) {
      console.error("Failed to load user info:", {
        status: error?.response?.status,
        data: error?.response?.data,
        error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const favoriteRegions: FavoriteRegion[] = buildFavoriteRegions();
        const existingKeys = new Set(savedFavorites.map(favoriteKey));
        const newFavorites = favoriteRegions.filter(
          (region) => !existingKeys.has(favoriteKey(region))
        );

        if (newFavorites.length > 0) {
          await postPoiList(newFavorites);
        }
        await loadUserInfo();
        setIsEditing(false);
      } catch (error: any) {
        console.error("Failed to save favorite regions:", {
          status: error?.response?.status,
          data: error?.response?.data,
          error,
        });
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleDeleteInterest = (index: number) => {
    setInterestAreas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddInterest = (category: string, location: string) => {
    if (category.trim() && location.trim()) {
      setInterestAreas((prev) => [...prev, { category, location }]);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("회원탈퇴 실패", error);
    }
  };

  return (
    <Box flex={1} bg="$white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {isLoading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color="#1C9DFF" />
            <Text mt={10} color="#565656">
              사용자 정보 로딩 중...
            </Text>
          </Box>
        ) : (
          <ScrollView
            scrollEnabled={isEditing}
            contentContainerStyle={{
              paddingHorizontal: horizontalPadding,
              paddingTop: 40,
              paddingBottom: 100,
            }}
          >
            <VStack gap={26}>
              <VStack>
                <Text fontSize={18} fontWeight="$bold" mb={5}>
                  닉네임
                </Text>
                {isEditing ? (
                  <Input
                    bg="#F3F3F3"
                    w={inputWidth}
                    h={32}
                    borderRadius={15}
                    borderColor="transparent"
                  >
                    <InputField
                      value={nickname}
                      onChangeText={setNickname}
                      textAlign="center"
                      color="#565656"
                      fontSize={12}
                      fontWeight="$semibold"
                    />
                  </Input>
                ) : (
                  <Box
                    bg="#F3F3F3"
                    w={inputWidth}
                    h={32}
                    borderRadius={15}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text color="#565656" fontSize={12} fontWeight="$semibold">
                      {nickname}
                    </Text>
                  </Box>
                )}
              </VStack>

              <VStack>
                <Text fontSize={18} fontWeight="$bold" mb={5}>
                  관심지역
                </Text>
                {interestAreas.map((area, index) => (
                  <HStack
                    key={`${area.category}-${area.location}-${index}`}
                    gap={5}
                    alignItems="center"
                    mb={10}
                  >
                    <Box
                      bg="#2FA5FF"
                      w={categoryBoxWidth}
                      h={32}
                      borderRadius={15}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text color="$white" fontSize={12} fontWeight="$semibold">
                        {area.category}
                      </Text>
                    </Box>
                    <Box
                      bg="#F3F3F3"
                      w={locationBoxWidth}
                      h={32}
                      borderRadius={15}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text
                        color="#565656"
                        fontSize={12}
                        fontWeight="$semibold"
                      >
                        {area.location}
                      </Text>
                    </Box>
                    {isEditing && (
                      <Pressable
                        onPress={() => handleDeleteInterest(index)}
                        ml={5}
                      >
                        <Icon as={CloseIcon} size="md" color="#000000" />
                      </Pressable>
                    )}
                  </HStack>
                ))}

                {isEditing && (
                  <VStack w="100%" mt={26}>
                    <Text fontSize={18} fontWeight="$bold" mb={5}>
                      지역 추가
                    </Text>
                    <Box w="100%">
                      <SelectLocationWithCat onAdd={handleAddInterest} />
                    </Box>
                  </VStack>
                )}
              </VStack>

              <VStack>
                <Text fontSize={18} fontWeight="$bold" mb={5}>
                  SNS 연동 계정
                </Text>
                {isEditing ? (
                  <Input
                    bg="#F3F3F3"
                    w={inputWidth}
                    h={32}
                    borderRadius={15}
                    borderColor="transparent"
                  >
                    <InputField
                      value={snsAccount}
                      onChangeText={setSnsAccount}
                      textAlign="center"
                      color="#565656"
                      fontSize={12}
                      fontWeight="$semibold"
                    />
                  </Input>
                ) : (
                  <Box
                    bg="#F3F3F3"
                    w={inputWidth}
                    h={32}
                    borderRadius={15}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text color="#565656" fontSize={12} fontWeight="$semibold">
                      {snsAccount}
                    </Text>
                  </Box>
                )}
              </VStack>
            </VStack>

            <Pressable
              bg="#1C9DFF"
              w={inputWidth}
              h={32}
              borderRadius={20}
              justifyContent="center"
              alignItems="center"
              mt={35}
              onPress={handleEdit}
            >
              <Text color="$white" fontSize={16} fontWeight="$bold">
                {isEditing ? "저장" : "수정"}
              </Text>
            </Pressable>

            <HStack gap={10} mt={10}>
              <Pressable
                bg="#BEBEBE"
                flex={1}
                h={32}
                borderRadius={20}
                justifyContent="center"
                alignItems="center"
                onPress={handleLogout}
              >
                <Text color="$white" fontSize={16} fontWeight="$bold">
                  로그아웃
                </Text>
              </Pressable>

              <Pressable
                bg="#BEBEBE"
                flex={1}
                h={32}
                borderRadius={20}
                justifyContent="center"
                alignItems="center"
                onPress={handleWithdraw}
              >
                <Text color="$white" fontSize={16} fontWeight="$bold">
                  회원탈퇴
                </Text>
              </Pressable>
            </HStack>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Box>
  );
};

export default SettingScreen;
