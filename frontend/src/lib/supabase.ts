import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("[SUPABASE] Initialising Supabase client");
console.log("[SUPABASE] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "NOT SET");
console.log("[SUPABASE] NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "NOT SET");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[SUPABASE] WARNING: Supabase environment variables not set. Sharing features will be disabled."
  );
  console.warn("[SUPABASE] Missing variables:", {
    url: !supabaseUrl,
    anonKey: !supabaseAnonKey
  });
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (supabase) {
  console.log("[SUPABASE] Supabase client created successfully");
} else {
  console.error("[SUPABASE] Failed to create Supabase client - missing configuration");
}

export const isSupabaseConfigured = (): boolean => {
  const configured = supabase !== null;
  console.log("[SUPABASE] isSupabaseConfigured check:", configured);
  return configured;
};
