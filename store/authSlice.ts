import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCurrentUser, signIn, signOut, signUp } from "../lib/supabase";

type AuthState = {
  user: any | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await signIn(email, password);
    if (response.error) throw new Error(response.error.message);
    return response.data;
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await signUp(email, password);
    if (response.error) throw new Error(response.error.message);
    return response.data;
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await signOut();
});

export const checkUser = createAsyncThunk("auth/check", async () => {
  const user = await getCurrentUser();
  return user;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Registration failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(checkUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
