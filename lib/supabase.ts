import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Replace these with your Supabase project credentials
const supabaseUrl = "https://xlqzodrfmofmhumqcpro.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXpvZHJmbW9mbWh1bXFjcHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTY5NTAsImV4cCI6MjA1NjM5Mjk1MH0.1GEmhreEfGGr5x2P40rEIgyCU438BXJNGnfftcafCDE";

console.log("Supabase Config:", {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      "Content-Type": "application/json"
    }
  }
});

export type AuthError = {
  message: string;
};

export type AuthResponse = {
  error: AuthError | null;
  data: any | null;
};

export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    console.log("Attempting signUp for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    console.log("SignUp response:", {
      hasData: !!data,
      hasError: !!error,
      error: error?.message
    });
    return { data, error };
  } catch (err) {
    console.error("SignUp network error:", err);
    return {
      data: null,
      error: { message: `Network error: ${err.message || "Connection failed"}` }
    };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    console.log("Attempting signIn for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log("SignIn response:", {
      hasData: !!data,
      hasError: !!error,
      error: error?.message
    });
    return { data, error };
  } catch (err) {
    console.error("SignIn network error:", err);
    return {
      data: null,
      error: { message: `Network error: ${err.message || "Connection failed"}` }
    };
  }
};

export const signOut = async (): Promise<void> => {
  try {
    console.log("Attempting signOut");
    await supabase.auth.signOut();
    console.log("SignOut successful");
  } catch (err) {
    console.error("SignOut error:", err);
    // Don't throw - allow local logout even if network fails
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("Getting current user");
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    console.log("Current user response:", {
      hasUser: !!user,
      error: error?.message
    });
    if (error) throw error;
    return user;
  } catch (err) {
    console.error("Get current user error:", err);
    throw err;
  }
};
