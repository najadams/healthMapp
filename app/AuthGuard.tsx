import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router";
import { UserProvider } from "@/context/UserContext";
import { Redirect } from "expo-router";
import AuthScreen from "./(auth)/auth";
export default function AuthGuard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  // useEffect(() => {
  //   if (!rootNavigationState?.mounted) return;

  //   // Simulate initial loading
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [rootNavigationState?.mounted]);

  // if (isLoading) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: "center",
  //         alignItems: "center",
  //         backgroundColor: "#fff",
  //       }}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //     </View>
  //   );
  // }

  return (
    <UserProvider initialUser={null}>
      <AuthScreen />
    </UserProvider>
  );
}
