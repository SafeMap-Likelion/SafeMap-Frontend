import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
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
  );
}
