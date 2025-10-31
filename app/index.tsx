//app/index.tsx
//로그인 여부에 따라 라우팅그룹 분기
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null; // 아무것도 안 보여줌
  }

  if (isSignedIn) {
    return <Redirect href="/(main)" />;
    //rn-map webview를 테스트해보고 싶으시다면 위 코드를 아래 코드로 임시로 교체해 주세요!
    //return <Redirect href="/(main)/map-interaction-test-page" />;
  }

  return <Redirect href="/(auth)" />;
}
