// Supabase client for RouteMeV2
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase credentials missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

// Helper: get the current user session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Session error:", error.message);
    return null;
  }
  return data?.session ?? null;
}

// Helper: get current user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

// Helper: sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error.message);
  return !error;
}