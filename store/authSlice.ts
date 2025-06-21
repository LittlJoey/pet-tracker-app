import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  validateAndRefreshSession
} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  lastError?: string;
  sessionValid: boolean;
  lastValidationTime?: number;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  lastError: undefined,
  sessionValid: false,
  lastValidationTime: undefined
};

// Enhanced error handling for network issues
const handleAuthError = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("Network request failed")) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }
  if (errorMessage.includes("AuthRetryableFetchError")) {
    return "Connection timeout. Please check your network and try again.";
  }
  if (errorMessage.includes("Invalid login credentials")) {
    return "Invalid email or password. Please check your credentials.";
  }
  if (errorMessage.includes("User already registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (errorMessage.includes("Email not confirmed")) {
    return "Please check your email and click the confirmation link.";
  }
  return errorMessage || "An unexpected error occurred. Please try again.";
};

// Helper function to check if error is expected "no session" case
const isNoSessionError = (error: unknown): boolean => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes("Auth session missing") ||
    errorMessage.includes("No active session") ||
    errorMessage.includes("session not found") ||
    errorMessage.includes("No user found")
  );
};

// Enhanced initialization with token validation
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Initializing auth with session validation...");

      // First try to validate and refresh existing session
      const { user, session } = await validateAndRefreshSession();

      if (user && session) {
        const userData: User = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        return { user: userData, sessionValid: true };
      }

      // If no valid session, try to get stored user data
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Validate that the stored user data is still valid
          const currentUser = await getCurrentUser();
          if (currentUser && currentUser.id === userData.id) {
            return { user: userData, sessionValid: true };
          }
        } catch (parseError) {
          console.log("Invalid stored user data, clearing...");
          await AsyncStorage.removeItem("user");
        }
      }

      return { user: null, sessionValid: false };
    } catch (error: unknown) {
      console.error("Auth initialization error:", error);

      // If it's just a "no session" error, return null instead of rejecting
      if (isNoSessionError(error)) {
        return { user: null, sessionValid: false };
      }

      // Only reject for actual errors
      return rejectWithValue(handleAuthError(error));
    }
  }
);

// Enhanced session validation thunk
export const validateSession = createAsyncThunk(
  "auth/validateSession",
  async (_, { rejectWithValue }) => {
    try {
      const { user, session } = await validateAndRefreshSession();

      if (user && session) {
        const userData: User = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        return {
          user: userData,
          sessionValid: true,
          validationTime: Date.now()
        };
      }

      // Session is invalid, clear stored data
      await AsyncStorage.removeItem("user");
      return { user: null, sessionValid: false, validationTime: Date.now() };
    } catch (error: unknown) {
      console.error("Session validation error:", error);
      await AsyncStorage.removeItem("user");
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await signIn(email, password);
      if (response.error) {
        throw response.error;
      }

      if (!response.data) {
        throw new Error("Login failed - no data returned");
      }

      const userData: User = {
        id: response.data.user.id,
        email: response.data.user.email || "",
        name: response.data.user.user_metadata?.name
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      return { user: userData, sessionValid: true };
    } catch (error: unknown) {
      console.error("Login error:", error);
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await signUp(email, password);
      if (response.error) {
        throw response.error;
      }

      if (!response.data) {
        throw new Error("Registration failed - no data returned");
      }

      // For sign up, user might need email confirmation
      if (response.data.user && !response.data.session) {
        return rejectWithValue(
          "Please check your email and click the confirmation link to complete registration."
        );
      }

      const userData: User = {
        id: response.data.user.id,
        email: response.data.user.email || "",
        name: response.data.user.user_metadata?.name
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      return { user: userData, sessionValid: true };
    } catch (error: unknown) {
      console.error("Registration error:", error);
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await signOut();
      await AsyncStorage.removeItem("user");
      return null;
    } catch (error: unknown) {
      console.error("Logout error:", error);
      return rejectWithValue(handleAuthError(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.lastError = undefined;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.sessionValid = !!action.payload;
    },
    setSessionValid: (state, action: PayloadAction<boolean>) => {
      state.sessionValid = action.payload;
      state.lastValidationTime = Date.now();
    },
    HYDRATE: (state, action: PayloadAction<{ auth: AuthState }>) => {
      return { ...state, ...action.payload.auth };
    }
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.sessionValid = action.payload.sessionValid;
        state.error = null;
        state.lastValidationTime = Date.now();
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionValid = false;
      });

    // Session Validation
    builder
      .addCase(validateSession.pending, () => {
        // Don't set loading for background validation
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.sessionValid = action.payload.sessionValid;
        state.lastValidationTime = action.payload.validationTime;
        state.error = null;
      })
      .addCase(validateSession.rejected, (state, action) => {
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionValid = false;
        state.lastValidationTime = Date.now();
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.sessionValid = action.payload.sessionValid;
        state.error = null;
        state.lastValidationTime = Date.now();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionValid = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.sessionValid = action.payload.sessionValid;
        state.error = null;
        state.lastValidationTime = Date.now();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionValid = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionValid = false;
        state.error = null;
        state.lastValidationTime = undefined;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        // Still log out locally even if server request fails
        state.user = null;
        state.isAuthenticated = false;
        state.sessionValid = false;
      });
  }
});

export const { clearError, setUser, setSessionValid } = authSlice.actions;
export default authSlice.reducer;
