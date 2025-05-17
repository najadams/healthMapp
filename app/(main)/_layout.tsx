import { useUser } from "@/context/UserContext";
import { Stack, Redirect } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native";

function ProtectedLayout() {
  const user = useUser();

  if (!user) {
    return <Redirect href="/(auth)/auth" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen
          name="notifications"
          options={{ title: "Notifications" }}
        />
      </Stack>
    </SafeAreaView>
  );
}

export default function MainLayout() {
  return <ProtectedLayout />;
}
