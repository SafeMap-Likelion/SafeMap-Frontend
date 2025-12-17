// When you sign a user out with
// signOut()
// , Clerk will remove the user's session JWT from the token cache.

import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <GluestackUIProvider config={config}>
        <Slot />
      </GluestackUIProvider>
    </ClerkProvider>
  );
}
