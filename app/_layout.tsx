import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Provider } from "react-redux";

import { useColorScheme } from "@/hooks/useColorScheme";
import { PetSyncService } from "@/lib/services/petSyncService";
import { store, useAppDispatch } from "@/store";
import { checkUser } from "@/store/authSlice";
import { fetchPets } from "@/store/petSlice";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf")
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const initializeApp = async () => {
      await dispatch(checkUser());
      const user = store.getState().auth.user;
      if (user?.aud !== "authenticated") {
        router.push("/auth");
      } else {
        // Initialize PetSyncService for network monitoring and data sync
        PetSyncService.initialize();
        await dispatch(fetchPets());
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          initialRouteName="(tabs)"
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="pet"
            options={{
              presentation: "card",
              headerShown: true,
              headerBackVisible: true,
              headerBackTitle: "Back",
              headerTintColor: "#4CAF50",
              headerTitle: ""
            }}
          />
          {/* <Stack.Screen name="(pet)" /> */}
          <Stack.Screen
            name="+not-found"
            options={{
              title: "Oops!"
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
