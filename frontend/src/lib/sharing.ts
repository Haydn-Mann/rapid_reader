import { supabase, isSupabaseConfigured } from "./supabase";
import type { CadenceProfile } from "../domain/types";

const EXPIRY_HOURS = 2;

export type SharedArticle = {
  id: string;
  text: string;
  wpm: number;
  cadence_profile: CadenceProfile;
  created_at: string;
  expires_at: string;
};

export type CreateShareResult =
  | { success: true; id: string; url: string }
  | { success: false; error: string };

export type FetchShareResult =
  | { success: true; article: SharedArticle }
  | { success: false; error: string };

/**
 * Creates a shareable link for an article.
 * Stores the article in Supabase with a 2-hour expiry.
 */
export async function createShare(
  text: string,
  wpm: number,
  cadenceProfile: CadenceProfile
): Promise<CreateShareResult> {
  console.log("[SHARE] createShare called with:", {
    textLength: text.length,
    wpm,
    cadenceProfile,
    timestamp: new Date().toISOString()
  });

  const configured = isSupabaseConfigured();
  console.log("[SHARE] Supabase configured check:", configured);
  console.log("[SHARE] Supabase client exists:", !!supabase);

  if (!configured || !supabase) {
    console.error("[SHARE] ERROR: Supabase not configured or client missing");
    console.error("[SHARE] Configuration state:", {
      isConfigured: configured,
      hasClient: !!supabase
    });
    return { success: false, error: "Sharing is not available. Please check the configuration." };
  }

  console.log("[SHARE] Starting cleanup of expired shares");
  try {
    await cleanupExpiredShares();
    console.log("[SHARE] Cleanup completed");
  } catch (cleanupError) {
    console.warn("[SHARE] Cleanup failed (non-critical):", cleanupError);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXPIRY_HOURS * 60 * 60 * 1000);
  console.log("[SHARE] Calculated expiry:", {
    now: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    hoursFromNow: EXPIRY_HOURS
  });

  const insertData = {
    text,
    wpm,
    cadence_profile: cadenceProfile,
    expires_at: expiresAt.toISOString(),
  };
  console.log("[SHARE] Attempting to insert into 'shared_articles' table:", {
    textLength: insertData.text.length,
    wpm: insertData.wpm,
    cadence_profile: insertData.cadence_profile,
    expires_at: insertData.expires_at
  });

  const { data, error } = await supabase
    .from("shared_articles")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    console.error("[SHARE] ERROR: Failed to create share in Supabase");
    console.error("[SHARE] Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      fullError: JSON.stringify(error, null, 2)
    });
    console.error("[SHARE] Insert data that failed:", {
      textLength: insertData.text.length,
      wpm: insertData.wpm,
      cadence_profile: insertData.cadence_profile,
      expires_at: insertData.expires_at
    });
    return { success: false, error: "Failed to create shareable link" };
  }

  if (!data || !data.id) {
    console.error("[SHARE] ERROR: Insert succeeded but no data/id returned");
    console.error("[SHARE] Response data:", data);
    return { success: false, error: "Failed to create shareable link" };
  }

  const url = `${window.location.origin}/share/${data.id}`;
  console.log("[SHARE] SUCCESS: Share created", {
    id: data.id,
    url,
    expiresAt: expiresAt.toISOString()
  });

  return { success: true, id: data.id, url };
}

/**
 * Fetches a shared article by ID.
 * Returns an error if the article is expired or not found.
 */
export async function fetchShare(id: string): Promise<FetchShareResult> {
  console.log("[SHARE] fetchShare called with ID:", id);
  console.log("[SHARE] Fetch timestamp:", new Date().toISOString());

  const configured = isSupabaseConfigured();
  console.log("[SHARE] Supabase configured check:", configured);
  console.log("[SHARE] Supabase client exists:", !!supabase);

  if (!configured || !supabase) {
    console.error("[SHARE] ERROR: Supabase not configured for fetch");
    return { success: false, error: "Sharing is not configured" };
  }

  console.log("[SHARE] Querying 'shared_articles' table for ID:", id);
  const { data, error } = await supabase
    .from("shared_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[SHARE] ERROR: Failed to fetch share from Supabase");
    console.error("[SHARE] Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      fullError: JSON.stringify(error, null, 2)
    });
    console.error("[SHARE] Query ID that failed:", id);
    return { success: false, error: "Shared article not found" };
  }

  if (!data) {
    console.error("[SHARE] ERROR: Query returned no data");
    console.error("[SHARE] Query ID:", id);
    return { success: false, error: "Shared article not found" };
  }

  console.log("[SHARE] Article found:", {
    id: data.id,
    textLength: data.text?.length || 0,
    wpm: data.wpm,
    cadence_profile: data.cadence_profile,
    created_at: data.created_at,
    expires_at: data.expires_at
  });

  // Check if expired
  const expiresAt = new Date(data.expires_at);
  const now = new Date();
  console.log("[SHARE] Checking expiry:", {
    expiresAt: expiresAt.toISOString(),
    now: now.toISOString(),
    isExpired: expiresAt < now
  });

  if (expiresAt < now) {
    console.warn("[SHARE] Article expired, deleting");
    try {
      await supabase.from("shared_articles").delete().eq("id", id);
      console.log("[SHARE] Expired article deleted");
    } catch (deleteError) {
      console.error("[SHARE] Failed to delete expired article:", deleteError);
    }
    return { success: false, error: "This shared link has expired" };
  }

  console.log("[SHARE] SUCCESS: Article fetched and valid", {
    id: data.id,
    expiresAt: expiresAt.toISOString()
  });

  return {
    success: true,
    article: data as SharedArticle,
  };
}

/**
 * Cleans up expired articles (lazy deletion).
 * Called automatically when creating new shares.
 */
async function cleanupExpiredShares(): Promise<void> {
  console.log("[SHARE] cleanupExpiredShares called");
  
  if (!isSupabaseConfigured() || !supabase) {
    console.log("[SHARE] Cleanup skipped - Supabase not configured");
    return;
  }

  const now = new Date().toISOString();
  console.log("[SHARE] Deleting articles expired before:", now);

  try {
    const { error } = await supabase
      .from("shared_articles")
      .delete()
      .lt("expires_at", now);
    
    if (error) {
      console.warn("[SHARE] Cleanup delete error:", {
        message: error.message,
        code: error.code,
        details: error.details
      });
    } else {
      console.log("[SHARE] Cleanup completed successfully");
    }
  } catch (err) {
    console.warn("[SHARE] Cleanup exception:", err);
  }
}

/**
 * Calculates remaining time until expiry.
 */
export function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Expired";
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m remaining`;
  }
  return `${mins}m remaining`;
}
