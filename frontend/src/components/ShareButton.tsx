"use client";

import { useState } from "react";
import { createShare } from "../lib/sharing";
import { isSupabaseConfigured } from "../lib/supabase";
import type { CadenceProfile } from "../domain/types";

type ShareButtonProps = {
  text: string;
  wpm: number;
  cadenceProfile: CadenceProfile;
  disabled?: boolean;
};

export default function ShareButton({
  text,
  wpm,
  cadenceProfile,
  disabled = false,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    type: "success" | "error";
    message: string;
    url?: string;
  } | null>(null);

  // Don't render if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return null;
  }

  const handleShare = async () => {
    if (!text.trim() || isSharing) {
      return;
    }

    setIsSharing(true);
    setShareResult(null);

    const result = await createShare(text, wpm, cadenceProfile);

    if (result.success) {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(result.url);
        setShareResult({
          type: "success",
          message: "Link copied to clipboard!",
          url: result.url,
        });
      } catch {
        setShareResult({
          type: "success",
          message: "Share link created:",
          url: result.url,
        });
      }
    } else {
      setShareResult({
        type: "error",
        message: result.error,
      });
    }

    setIsSharing(false);

    // Clear success message after 10 seconds
    setTimeout(() => {
      setShareResult(null);
    }, 10000);
  };

  const isDisabled = disabled || !text.trim() || isSharing;

  return (
    <div className="share-container">
      <button
        className="btn btn-ghost share-btn"
        onClick={handleShare}
        disabled={isDisabled}
        title={!text.trim() ? "Paste some text first" : "Create a shareable link (expires in 2 hours)"}
      >
        {isSharing ? "Creating link..." : "Share"}
      </button>
      {shareResult && (
        <div className={`share-result ${shareResult.type}`}>
          <span>{shareResult.message}</span>
          {shareResult.url && (
            <button
              className="share-copy-btn"
              onClick={async () => {
                await navigator.clipboard.writeText(shareResult.url!);
                setShareResult({
                  ...shareResult,
                  message: "Copied!",
                });
              }}
            >
              Copy
            </button>
          )}
          <span className="share-expiry-note">Link expires in 2 hours</span>
        </div>
      )}
    </div>
  );
}
