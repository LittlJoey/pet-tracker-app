import { supabase, validateAndRefreshSession } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  initializeAuth,
  loginUser,
  logoutUser,
  setUser
} from "@/store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

interface UseAuthReturn {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced session validation that also refreshes tokens
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { user: validUser, session } = await validateAndRefreshSession();

      if (validUser && session) {
        // Update the Redux state with the validated user
        const userData = {
          id: validUser.id,
          email: validUser.email || "",
          name: validUser.user_metadata?.name
        };

        dispatch(setUser(userData));
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        return true;
      } else {
        // Clear invalid session
        dispatch(setUser(null));
        await AsyncStorage.removeItem("user");
        return false;
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      dispatch(setUser(null));
      await AsyncStorage.removeItem("user");
      return false;
    }
  }, [dispatch]);

  // Refresh authentication state
  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      await validateSession();
    } catch (error) {
      console.error("Auth refresh failed:", error);
    }
  }, [validateSession]);

  // Enhanced login function
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const result = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(result)) {
        // Login successful, session is automatically stored by Supabase
        console.log("Login successful");
      } else {
        // Login failed, error is handled by the slice
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  // Enhanced logout function
  const logout = useCallback(async (): Promise<void> => {
    await dispatch(logoutUser());
  }, [dispatch]);

  // Set up auth state listener for real-time session changes
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, { hasSession: !!session });

      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          if (session?.user) {
            const userData = {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.name
            };
            dispatch(setUser(userData));
            await AsyncStorage.setItem("user", JSON.stringify(userData));
          }
          break;

        case "SIGNED_OUT":
          dispatch(setUser(null));
          await AsyncStorage.removeItem("user");
          break;

        default:
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      if (isInitialized) return;

      try {
        console.log("Initializing auth...");

        // First, try to validate existing session
        const isValid = await validateSession();

        if (!isValid) {
          // If no valid session, try to initialize auth from storage
          await dispatch(initializeAuth());
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [dispatch, validateSession, isInitialized]);

  // Set up periodic session validation (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;

    const interval = setInterval(async () => {
      console.log("Performing periodic session validation...");
      await validateSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, isInitialized, validateSession]);

  // Set up app state change listener for validation on app resume
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === "active" && isAuthenticated) {
        console.log("App resumed, validating session...");
        await validateSession();
      }
    };

    // Note: In a real React Native app, you would use AppState from 'react-native'
    // For now, we'll skip this part as it requires native modules
    // import { AppState } from 'react-native';
    // const subscription = AppState.addEventListener('change', handleAppStateChange);
    // return () => subscription?.remove();
  }, [isAuthenticated, validateSession]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refreshAuth,
    validateSession
  };
};
