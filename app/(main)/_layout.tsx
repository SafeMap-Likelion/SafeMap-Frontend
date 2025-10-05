import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
    <GluestackUIProvider config={config}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerTitle: "Home",
            headerRight: () => <SignOutButton />,
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
