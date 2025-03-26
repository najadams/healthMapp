import { Stack } from "expo-router";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout() {
  return (
    <UserProvider initialUser={null}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/auth" />
        <Stack.Screen name="(main)" />
      </Stack>
    </UserProvider>
  );
}
