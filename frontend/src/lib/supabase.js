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

/**
 * Sign in with email + password via Supabase Auth.
 * @returns {{ user, error }}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

/**
 * Sign out the current session.
 */
export const signOut = async () => {
  await supabase.auth.signOut();
};

/**
 * Demo credentials for quick testing.
 * "Demo Login" signs in as Amara Okafor (the core test user).
 */
export const DEMO_ACCOUNTS = {
  nurse: {
    email: "amara.okafor@nurse.demo",
    password: "Demo1234!",
    label: "Amara Okafor, RN",
  },
  agency: {
    email: "priya@sunrisehh.demo",
    password: "Demo1234!",
    label: "Priya Nair (Sunrise HH)",
    code: "SUNRISE-2026",
  },
  superAdmin: {
    email: "super@routeme.com",
    password: "SuperAdmin2026!",
    label: "Dr. Isla Fernández",
  },
};
