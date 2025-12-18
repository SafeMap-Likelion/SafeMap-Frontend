import React, { useState, useEffect } from "react";
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
import { getUserInfo, patchUserInfo } from "@/api/apis";
import { FavoriteRegion, UserInfo } from "@/api/types";

// 관심지역 표시용 타입
interface InterestArea {
  category: string;
  location: string;
}

// FavoriteRegion을 InterestArea로 변환
const convertToInterestArea = (region: FavoriteRegion): InterestArea => ({
  category: region.type,
  location: `${region.addr_a} ${region.addr_b} ${region.addr_c}`.trim(),
});

// InterestArea를 FavoriteRegion으로 변환
const convertToFavoriteRegion = (area: InterestArea): FavoriteRegion => {
  const parts = area.location.split(" ");
  return {
    type: area.category,
    addr_a: parts[0] || "",
    addr_b: parts[1] || "",
    addr_c: parts[2] || "",
  };
};

// 설정 화면
const SettingScreen = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [snsAccount, setSnsAccount] = useState("");
  const [interestAreas, setInterestAreas] = useState<InterestArea[]>([]);

  const horizontalPadding = 20;
  const inputWidth = width - horizontalPadding * 2;
  const categoryBoxWidth = 60;
  const locationBoxWidth = isEditing
    ? inputWidth - categoryBoxWidth - 5 - 30 - 10 // 카테고리 박스 - 간격 - 삭제 아이콘 - 여유공간
    : inputWidth - categoryBoxWidth - 5;

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const userInfo = await getUserInfo();
        setNickname(userInfo.username);
        setSnsAccount(userInfo.sns);
        setInterestAreas(userInfo.favorite_regions.map(convertToInterestArea));
        console.log("사용자 정보 로드 완료:", userInfo);
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const handleEdit = async () => {
    if (isEditing) {
      // 저장 로직
      console.log("저장 버튼 클릭");
      try {
        const userInfo: UserInfo = {
          username: nickname,
          sns: snsAccount,
          favorite_regions: interestAreas.map(convertToFavoriteRegion),
        };
        await patchUserInfo(userInfo);
        console.log("사용자 정보 저장 완료");
        setIsEditing(false);
      } catch (error) {
        console.error("사용자 정보 저장 실패:", error);
      }
    } else {
      // 수정 모드로 전환
      console.log("수정 버튼 클릭");
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
      // 로그아웃 후 로그인 화면으로 이동
      router.replace("/(auth)");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      console.log("회원탈퇴 버튼 클릭");
      // TODO: 회원탈퇴 API 호출
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("회원탈퇴 실패:", error);
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
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: horizontalPadding,
              paddingTop: 40,
              paddingBottom: 100,
            }}
          >
            <VStack gap={26}>
              {/* 닉네임 */}
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

              {/* 관심지역 */}
              <VStack>
                <Text fontSize={18} fontWeight="$bold" mb={5}>
                  관심지역
                </Text>
                {interestAreas.map((area, index) => (
                  <HStack key={index} gap={5} alignItems="center" mb={10}>
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

                {/* 지역 추가 */}
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

              {/* SNS 연동 계정 */}
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

            {/* 수정/저장 버튼 */}
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

            {/* 로그아웃 / 회원탈퇴 버튼 */}
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
