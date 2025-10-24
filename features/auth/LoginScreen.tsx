// LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, Image, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box, VStack, Button, ButtonText } from "@gluestack-ui/themed";
import { SignIn } from "@/features/auth/components/Sign-in";
import { SignUp } from "@/features/auth/components/Sign-up";

export default function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup" | null>(null);
  const { width } = useWindowDimensions();

  // 반응형 크기 계산
  const STAR = Math.min(width * 0.5, 200);
  const TITLE = Math.min(width * 0.11, 50);
  const LOGO_W = STAR * 1.3;
  const LOGO_H = STAR * 1.3;
  const TEXT_LEFT = STAR * 0.5;
  const TEXT_TOP = STAR * 0.1;

  if (mode === null) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#fff", alignItems: "center" }}
      >
        {/* ---------- 로고 영역 ---------- */}
        <Box position="relative" w={LOGO_W} h={LOGO_H} mt={LOGO_H * 0.8}>
          <Image
            source={require("@/assets/images/icon2.png")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: STAR,
              height: STAR,
              resizeMode: "contain",
              zIndex: 1,
            }}
          />

          {/* 겹쳐진 텍스트 */}
          <Box position="absolute" left={TEXT_LEFT} top={TEXT_TOP}>
            <Text
              style={{
                fontSize: TITLE,
                lineHeight: TITLE * 1.1,
                fontFamily: "Inter",
                fontWeight: "800",
                color: "#000",
              }}
            >
              Safety
            </Text>
            <Text
              style={{
                fontSize: TITLE,
                lineHeight: TITLE * 0.95,
                marginLeft: TITLE * 1.1,
                fontFamily: "Inter",
                fontWeight: "800",
                color: "#000",
              }}
            >
              Map
            </Text>
          </Box>
        </Box>

        {/* ---------- 버튼 영역 ---------- */}
        <VStack space="md" alignItems="center" justifyContent="center">
          {/* 로그인 버튼 */}
          <Button
            bg="#1C9DFF"
            borderWidth={1}
            borderColor="#ddd"
            borderRadius="$full"
            size="md"
            width={300}
            h={45}
            onPress={() => setMode("signin")}
          >
            <ButtonText color="$wihte" fontWeight="$semibold">
              로그인
            </ButtonText>
          </Button>

          {/* 회원가입 버튼 */}
          <Button
            bg="#AAC8D3"
            borderWidth={1}
            borderColor="#ddd"
            borderRadius="$full"
            size="md"
            width={300}
            h={45}
            onPress={() => setMode("signup")}
          >
            <ButtonText color="$white" fontWeight="$semibold">
              회원가입
            </ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  // ---------- 로그인 / 회원가입 모드 ----------
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {mode === "signin" ? (
        <>
          <SignIn onSignUpPress={() => setMode("signup")} />
        </>
      ) : (
        <>
          <SignUp onSignInPress={() => setMode("signin")} />
        </>
      )}
    </SafeAreaView>
  );
}
