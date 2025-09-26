// When you sign a user out with
// signOut()
// , Clerk will remove the user's session JWT from the token cache.

import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      {/* 현재 활성화된 route가 slot에 들어옴 */}
      <Slot />
    </ClerkProvider>
  );
}
