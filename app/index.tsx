//app/index.tsx
//로그인 여부에 따라 라우팅그룹 분기
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (isSignedIn) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)" />;
}
