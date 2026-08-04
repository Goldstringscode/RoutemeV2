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

/* ─── Client-side backoff & rate limit tracking ──────── */
const BACKOFF_KEY = "routeme:loginBackoff";

function getBackoff() {
  try {
    const raw = localStorage.getItem(BACKOFF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, until: 0 };
}

function saveBackoff(count, secondsUntil) {
  try {
    const until = secondsUntil > 0 ? Date.now() + secondsUntil * 1000 : 0;
    localStorage.setItem(BACKOFF_KEY, JSON.stringify({ count, until }));
  } catch {}
}

function clearBackoff() {
  try { localStorage.removeItem(BACKOFF_KEY); } catch {}
}

const BACKOFF_DELAYS = [1, 3, 10, 30, 60]; // seconds

/**
 * Sign in via the server auth proxy with client-side exponential backoff.
 * Falls back to direct Supabase auth if the proxy is unreachable.
 * @returns {{ user, error, rateLimited }}
 */
export async function signIn(email, password) {
  // 1. Check client-side backoff
  const backoff = getBackoff();
  if (backoff.until > Date.now()) {
    const waitSeconds = Math.ceil((backoff.until - Date.now()) / 1000);
    return {
      user: null,
      error: new Error(`Too many attempts. Please wait ${waitSeconds}s before trying again.`),
      rateLimited: true,
      waitSeconds,
    };
  }

  // 2. Try direct Supabase FIRST — the Express proxy (/api/auth/login) is often
  //    not running on Render and returns 200 with an empty body, which makes
  //    resp.json() throw and delays login. Direct auth is the reliable path.
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const delay = BACKOFF_DELAYS[Math.min(backoff.count, BACKOFF_DELAYS.length - 1)];
      saveBackoff(backoff.count + 1, delay);
      return { user: null, error };
    }
    clearBackoff();
    return { user: data.user, error: null };
  } catch (directErr) {
    console.warn("Direct Supabase auth failed, trying server proxy:", directErr.message);
  }

  // 3. Proxy fallback — only used when direct Supabase threw (rare)
  try {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (resp.status === 429) {
      // Server rate-limited — apply backoff
      const delay = BACKOFF_DELAYS[Math.min(backoff.count, BACKOFF_DELAYS.length - 1)];
      saveBackoff(backoff.count + 1, delay * 15); // 15-minute server window
      return {
        user: null,
        error: new Error("Too many login attempts. Please try again in 15 minutes."),
        rateLimited: true,
        waitSeconds: 900,
      };
    }

    const data = await resp.json();

    if (!resp.ok) {
      // Failed login — increment backoff
      if (resp.status === 401) {
        const delay = BACKOFF_DELAYS[Math.min(backoff.count, BACKOFF_DELAYS.length - 1)];
        saveBackoff(backoff.count + 1, delay);
      }
      return { user: null, error: new Error(data.error || "Invalid email or password.") };
    }

    // 4. Success — set the Supabase session from proxy tokens
    const { access_token, refresh_token } = data;
    if (access_token) {
      await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || "",
      });
    }

    clearBackoff();
    return { user: data.user, error: null };
  } catch (fetchErr) {
    // 5. Both paths failed
    console.warn("Auth proxy unreachable:", fetchErr.message);
    return {
      user: null,
      error: new Error("Unable to reach the authentication service. Please try again."),
    };
  }
}

/**
 * Sign out the current session.
 */
export const signOut = async () => {
  try { await supabase.auth.signOut(); } catch {}
};

/**
 * Demo credentials for quick testing.
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