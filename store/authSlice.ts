import { getCurrentUser, signIn, signOut, signUp } from "@/lib/supabase";
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
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  lastError: undefined
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

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const userData: User = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error: unknown) {
      console.error("Auth initialization error:", error);

      // If it's just a "no session" error, return null instead of rejecting
      if (isNoSessionError(error)) {
        return null;
      }

      // Only reject for actual errors
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

      const userData: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.user_metadata?.name
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      return userData;
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

      // For sign up, user might need email confirmation
      if (response.data.user && !response.data.session) {
        return rejectWithValue(
          "Please check your email and click the confirmation link to complete registration."
        );
      }

      if (response.data.user) {
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.user_metadata?.name
        };

        await AsyncStorage.setItem("user", JSON.stringify(userData));
        return userData;
      }

      throw new Error("Registration failed");
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
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
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
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.lastError = action.payload as string;
        // Still log out locally even if server request fails
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
