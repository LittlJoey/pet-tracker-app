import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session, User } from "@supabase/supabase-js";

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

export type AuthData = {
  user: User;
  session: Session;
};

export type AuthResponse = {
  error: AuthError | null;
  data: AuthData | null;
};

// Helper function to handle unknown errors
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
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

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    if (data.user && data.session) {
      return {
        data: { user: data.user, session: data.session },
        error: null
      };
    }

    return { data: null, error: { message: "Registration failed" } };
  } catch (err) {
    console.error("SignUp network error:", err);
    return {
      data: null,
      error: { message: `Network error: ${getErrorMessage(err)}` }
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

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    if (data.user && data.session) {
      return {
        data: { user: data.user, session: data.session },
        error: null
      };
    }

    return { data: null, error: { message: "Login failed" } };
  } catch (err) {
    console.error("SignIn network error:", err);
    return {
      data: null,
      error: { message: `Network error: ${getErrorMessage(err)}` }
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

// New helper functions for improved token management
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) throw error;
    return session;
  } catch (err) {
    console.error("Get current session error:", err);
    return null;
  }
};

export const refreshSession = async (): Promise<Session | null> => {
  try {
    console.log("Refreshing session");
    const {
      data: { session },
      error
    } = await supabase.auth.refreshSession();

    console.log("Session refresh response:", {
      hasSession: !!session,
      error: error?.message
    });

    if (error) throw error;
    return session;
  } catch (err) {
    console.error("Session refresh error:", err);
    return null;
  }
};

// Check if current session is valid and refresh if needed
export const validateAndRefreshSession = async (): Promise<{
  user: User | null;
  session: Session | null;
}> => {
  try {
    // First try to get current session
    let session = await getCurrentSession();

    if (!session) {
      console.log("No session found");
      return { user: null, session: null };
    }

    // Check if session is expired or close to expiring (within 5 minutes)
    const now = Date.now() / 1000;
    const expiresAt = session.expires_at || 0;
    const isExpired = expiresAt < now;
    const isCloseToExpiry = expiresAt < now + 300; // 5 minutes

    if (isExpired || isCloseToExpiry) {
      console.log("Session expired or close to expiry, refreshing...");
      session = await refreshSession();

      if (!session) {
        console.log("Failed to refresh session");
        return { user: null, session: null };
      }
    }

    // Get current user
    const user = await getCurrentUser();
    return { user, session };
  } catch (err) {
    console.error("Session validation error:", err);
    return { user: null, session: null };
  }
};
