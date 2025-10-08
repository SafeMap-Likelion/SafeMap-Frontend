import React, { useState } from "react";
import { Box, VStack, HStack, Text, Pressable, ScrollView, Input, InputField, Icon, CloseIcon } from "@gluestack-ui/themed";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import SelectLocationWithCat from "../../components/SelectLocationWithCat";

// 설정 화면
const SettingScreen = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("사용자123");
  const [snsAccount, setSnsAccount] = useState("example@gmail.com");
  const [interestCategory, setInterestCategory] = useState("학교");
  const [interestLocation, setInterestLocation] = useState("서울특별시 관악구 관악로 1");

  const handleEdit = () => {
    if (isEditing) {
      // 저장 로직
      console.log("저장 버튼 클릭");
      setIsEditing(false);
      // TODO: 저장 API 호출
    } else {
      // 수정 모드로 전환
      console.log("수정 버튼 클릭");
      setIsEditing(true);
    }
  };

  const handleDeleteInterest = () => {
    console.log("관심지역 삭제");
    // TODO: 삭제 로직 구현
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // 로그아웃 후 로그인 화면으로 이동
      router.replace("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleWithdraw = () => {
    console.log("회원탈퇴 버튼 클릭");
    // TODO: 회원탈퇴 기능 구현
  };

  return (
    <Box flex={1} bg="$white">
      <ScrollView
        scrollEnabled={isEditing}
        contentContainerStyle={{
          paddingHorizontal: 20,
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
                w={353}
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
                w={353}
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
            <HStack gap={5} alignItems="center" mb={35}>
              <Box
                bg="#2FA5FF"
                w={60}
                h={32}
                borderRadius={15}
                justifyContent="center"
                alignItems="center"
              >
                <Text color="$white" fontSize={12} fontWeight="$semibold">
                  {interestCategory}
                </Text>
              </Box>
              <Box
                bg="#F3F3F3"
                w={isEditing ? 258 : 288}
                h={32}
                borderRadius={15}
                justifyContent="center"
                alignItems="center"
              >
                <Text color="#565656" fontSize={12} fontWeight="$semibold">
                  {interestLocation}
                </Text>
              </Box>
              {isEditing && (
                <Pressable onPress={handleDeleteInterest} ml={5}>
                  <Icon as={CloseIcon} size="md" color="#000000" />
                </Pressable>
              )}
            </HStack>

            {/* 지역 추가 */}
            {isEditing && (
              <VStack w="100%">
                <Text fontSize={16} fontWeight="$bold" mb={5}>
                  지역 추가
                </Text>
                <Box w="100%">
                  <SelectLocationWithCat />
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
                w={353}
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
                w={353}
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
          w={355}
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
    </Box>
  );
};

export default SettingScreen;
