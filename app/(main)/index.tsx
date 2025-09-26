import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import KakaoMap from "@/components/KakaoMap";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function Page() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      {/* 로그인된 경우 */}
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        {/* 지도 */}
        <KakaoMap />
        {/* 로그아웃 버튼 */}
        <SignOutButton />
      </SignedIn>

      {/* 로그아웃된 경우 */}
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
    </View>
  );
}
