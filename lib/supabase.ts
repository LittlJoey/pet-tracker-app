import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Replace these with your Supabase project credentials
const supabaseUrl = "https://xlqzodrfmofmhumqcpro.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXpvZHJmbW9mbWh1bXFjcHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTY5NTAsImV4cCI6MjA1NjM5Mjk1MH0.1GEmhreEfGGr5x2P40rEIgyCU438BXJNGnfftcafCDE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  return { data, error };
};

export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
};
