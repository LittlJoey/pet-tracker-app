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
import { initializeAuth } from "@/store/authSlice";
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
      try {
        console.log("Starting app initialization...");

        // Try to initialize auth with timeout and error handling
        const authResult = await Promise.race([
          dispatch(initializeAuth()),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Auth timeout")), 10000)
          )
        ]);

        console.log("Auth initialization result:", authResult);

        const state = store.getState();
        const user = state.auth.user;
        const isAuthenticated = state.auth.isAuthenticated;

        console.log("Current auth state:", {
          hasUser: !!user,
          isAuthenticated
        });

        if (!user || !isAuthenticated) {
          console.log("No authenticated user, redirecting to auth");
          router.push("/auth");
        } else {
          console.log("User authenticated, initializing app services");
          // Initialize PetSyncService for network monitoring and data sync
          PetSyncService.initialize();

          // Try to fetch pets with error handling
          try {
            await dispatch(fetchPets());
            console.log("Pets fetched successfully");
          } catch (petError) {
            console.warn("Failed to fetch pets:", petError);
            // Continue anyway - the app will show empty state
          }
        }
      } catch (error) {
        console.error("App initialization error:", error);

        // If initialization fails, still try to continue with offline mode
        console.log("Falling back to offline mode");

        // Check if we have any stored auth state
        const state = store.getState();
        if (state.auth.user) {
          console.log("Found stored user, continuing with offline mode");
          // User might be logged in locally, continue to main app
        } else {
          console.log("No stored user, going to auth screen");
          router.push("/auth");
        }
      }
    };

    initializeApp();
  }, [dispatch]);

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
