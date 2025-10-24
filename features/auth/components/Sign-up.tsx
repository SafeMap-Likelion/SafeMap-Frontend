// SignUp.tsx
import * as React from "react";
import { Text } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Box,
  VStack,
  Input,
  InputField,
  Button,
  ButtonText,
} from "@gluestack-ui/themed";

export function SignUp({ onSignInPress }: { onSignInPress: () => void }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // 회원가입 처리
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // 이메일 인증 처리
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(main)/select-location-page-auth");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // --------------------------------------
  // 이메일 인증 단계 (verification UI)
  // --------------------------------------
  if (pendingVerification) {
    return (
      <VStack
        flex={1}
        justifyContent="center"
        w="70%"
        maxWidth={340}
        space="md"
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 10,
            alignSelf: "center",
          }}
        >
          이메일 인증
        </Text>

        <Input bg="#f5f5f5" borderWidth={0} borderRadius="$full" px="$4">
          <InputField
            placeholder="인증 코드 입력"
            autoCapitalize="none"
            value={code}
            onChangeText={(text) => setCode(text)}
            color="#555"
            placeholderTextColor="#999"
          />
        </Input>

        <Button
          bg="#0095ff"
          borderRadius="$full"
          h={45}
          mt="$2"
          onPress={onVerifyPress}
          $active-bg="#007ae0"
        >
          <ButtonText color="$white" fontWeight="$semibold">
            인증하기
          </ButtonText>
        </Button>
      </VStack>
    );
  }

  // --------------------------------------
  // 기본 회원가입 단계 (입력창 + 버튼 UI)
  // --------------------------------------
  return (
    <VStack flex={1} justifyContent="center" w="70%" maxWidth={340} space="md">
      {/* 이메일 입력 */}
      <Input bg="#f5f5f5" borderWidth={0} borderRadius="$full" px="$4">
        <InputField
          placeholder="ID"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={(text) => setEmailAddress(text)}
          color="#555"
          placeholderTextColor="#999"
        />
      </Input>

      {/* 비밀번호 입력 */}
      <Input bg="#f5f5f5" borderWidth={0} borderRadius="$full" h={45} px="$4">
        <InputField
          placeholder="PW"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
          color="#555"
          placeholderTextColor="#999"
        />
      </Input>

      {/* 회원가입 버튼 */}
      <Button
        bg="#0095ff"
        borderRadius="$full"
        h={45}
        mt="$2"
        onPress={onSignUpPress}
        $active-bg="#007ae0"
      >
        <ButtonText color="$white" fontWeight="$semibold">
          회원가입
        </ButtonText>
      </Button>

      {/* 로그인 안내 */}
      <Box
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        mt="$3"
      >
        <Text style={{ color: "#666" }}>이미 계정이 있으신가요? </Text>
        <Text
          style={{ color: "#0095ff", fontWeight: "600" }}
          onPress={onSignInPress}
        >
          로그인
        </Text>
      </Box>
    </VStack>
  );
}
