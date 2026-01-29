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
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: "Sharing is not configured" };
  }

  // Clean up expired articles first (lazy cleanup)
  await cleanupExpiredShares();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXPIRY_HOURS * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("shared_articles")
    .insert({
      text,
      wpm,
      cadence_profile: cadenceProfile,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create share:", error);
    return { success: false, error: "Failed to create shareable link" };
  }

  const url = `${window.location.origin}/share/${data.id}`;
  return { success: true, id: data.id, url };
}

/**
 * Fetches a shared article by ID.
 * Returns an error if the article is expired or not found.
 */
export async function fetchShare(id: string): Promise<FetchShareResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: "Sharing is not configured" };
  }

  const { data, error } = await supabase
    .from("shared_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return { success: false, error: "Shared article not found" };
  }

  // Check if expired
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    // Delete expired article
    await supabase.from("shared_articles").delete().eq("id", id);
    return { success: false, error: "This shared link has expired" };
  }

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
  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  try {
    await supabase
      .from("shared_articles")
      .delete()
      .lt("expires_at", new Date().toISOString());
  } catch (err) {
    // Silently fail - cleanup is best-effort
    console.warn("Failed to cleanup expired shares:", err);
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
