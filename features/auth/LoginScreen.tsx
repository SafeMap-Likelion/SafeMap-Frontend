//시작화면/회원가입
import React, { useState } from "react";
import { View, Button } from "react-native";
import { SignIn } from "@features/auth/components/sign-in";
import { SignUp } from "@features/auth/components/sign-up";

export default function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup" | null>(null);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* 아직 아무 것도 선택 안 했을 때 */}
      {mode === null && (
        <>
          <Button title="로그인" onPress={() => setMode("signin")} />
          <Button title="회원가입" onPress={() => setMode("signup")} />
        </>
      )}

      {/* 로그인 모드 */}
      {mode === "signin" && (
        <>
          <SignIn
            onSignUpPress={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
          <Button title="뒤로가기" onPress={() => setMode(null)} />
        </>
      )}

      {/* 회원가입 모드 */}
      {mode === "signup" && (
        <>
          <SignUp
            onSignInPress={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
          <Button title="뒤로가기" onPress={() => setMode(null)} />
        </>
      )}
    </View>
  );
}
