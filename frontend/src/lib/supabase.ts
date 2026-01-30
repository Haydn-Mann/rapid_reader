import { createClient } from "@supabase/supabase-js";

console.log("[SUPABASE] ========== SUPABASE INITIALISATION ==========");
console.log("[SUPABASE] Runtime environment:", typeof window !== 'undefined' ? 'CLIENT' : 'SERVER');
console.log("[SUPABASE] Timestamp:", new Date().toISOString());

// Check all NEXT_PUBLIC_ environment variables
const allEnvKeys = typeof process !== 'undefined' && process.env ? Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')) : [];
console.log("[SUPABASE] Available NEXT_PUBLIC_ env vars:", allEnvKeys.length > 0 ? allEnvKeys : 'NONE FOUND');
console.log("[SUPABASE] Total process.env keys available:", typeof process !== 'undefined' && process.env ? Object.keys(process.env).length : 'process.env not available');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("[SUPABASE] Raw env check:");
console.log("[SUPABASE]   process.env exists:", typeof process !== 'undefined' && !!process.env);
console.log("[SUPABASE]   NEXT_PUBLIC_SUPABASE_URL type:", typeof supabaseUrl);
console.log("[SUPABASE]   NEXT_PUBLIC_SUPABASE_URL value:", supabaseUrl === undefined ? 'undefined' : supabaseUrl === null ? 'null' : supabaseUrl === '' ? 'EMPTY STRING' : `${supabaseUrl.substring(0, 30)}...`);
console.log("[SUPABASE]   NEXT_PUBLIC_SUPABASE_URL length:", supabaseUrl?.length || 0);
console.log("[SUPABASE]   NEXT_PUBLIC_SUPABASE_ANON_KEY type:", typeof supabaseAnonKey);
console.log("[SUPABASE]   NEXT_PUBLIC_SUPABASE_ANON_KEY value:", supabaseAnonKey === undefined ? 'undefined' : supabaseAnonKey === null ? 'null' : supabaseAnonKey === '' ? 'EMPTY STRING' : `${supabaseAnonKey.substring(0, 30)}...`);
console.log("[SUPABASE]   NEXT_PUBLIC_SUPABASE_ANON_KEY length:", supabaseAnonKey?.length || 0);

const urlExists = !!supabaseUrl;
const urlNotEmpty = supabaseUrl && supabaseUrl.trim().length > 0;
const keyExists = !!supabaseAnonKey;
const keyNotEmpty = supabaseAnonKey && supabaseAnonKey.trim().length > 0;

console.log("[SUPABASE] Validation checks:");
console.log("[SUPABASE]   URL exists:", urlExists);
console.log("[SUPABASE]   URL not empty:", urlNotEmpty);
console.log("[SUPABASE]   Key exists:", keyExists);
console.log("[SUPABASE]   Key not empty:", keyNotEmpty);
console.log("[SUPABASE]   Both valid:", urlNotEmpty && keyNotEmpty);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[SUPABASE] ========== CONFIGURATION ERROR ==========");
  console.error("[SUPABASE] WARNING: Supabase environment variables not set. Sharing features will be disabled.");
  console.error("[SUPABASE] Missing variables:", {
    url: !supabaseUrl,
    urlEmpty: supabaseUrl === '',
    anonKey: !supabaseAnonKey,
    anonKeyEmpty: supabaseAnonKey === ''
  });
  console.error("[SUPABASE] This usually means:");
  console.error("[SUPABASE]   1. Variables not set in Vercel environment variables");
  console.error("[SUPABASE]   2. Variables not prefixed with NEXT_PUBLIC_");
  console.error("[SUPABASE]   3. Build needs to be redeployed after adding variables");
  console.error("[SUPABASE]   4. Variables are empty strings");
  console.error("[SUPABASE] =========================================");
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
