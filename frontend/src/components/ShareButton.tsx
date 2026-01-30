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
    console.log("[SHARE] ShareButton.handleShare called");
    console.log("[SHARE] Input validation:", {
      hasText: !!text.trim(),
      textLength: text.trim().length,
      isSharing,
      wpm,
      cadenceProfile
    });

    if (!text.trim() || isSharing) {
      console.log("[SHARE] Share cancelled - invalid input or already sharing");
      return;
    }

    console.log("[SHARE] Starting share process");
    setIsSharing(true);
    setShareResult(null);

    const startTime = Date.now();
    console.log("[SHARE] Calling createShare function");
    const result = await createShare(text, wpm, cadenceProfile);
    const duration = Date.now() - startTime;
    console.log("[SHARE] createShare completed", {
      success: result.success,
      duration: `${duration}ms`,
      hasId: result.success ? !!result.id : false,
      hasUrl: result.success ? !!result.url : false,
      error: result.success ? undefined : result.error
    });

    if (result.success) {
      console.log("[SHARE] Share created successfully, attempting clipboard copy");
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(result.url);
        console.log("[SHARE] Clipboard copy successful");
        setShareResult({
          type: "success",
          message: "Link copied to clipboard!",
          url: result.url,
        });
      } catch (clipboardError) {
        console.warn("[SHARE] Clipboard copy failed:", clipboardError);
        setShareResult({
          type: "success",
          message: "Share link created:",
          url: result.url,
        });
      }
    } else {
      console.error("[SHARE] Share creation failed:", result.error);
      setShareResult({
        type: "error",
        message: result.error,
      });
    }

    setIsSharing(false);
    console.log("[SHARE] Share process completed");

    // Clear success message after 30 seconds
    setTimeout(() => {
      setShareResult(null);
    }, 30000);
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
          {shareResult.type === "success" && (
            <div className="share-success-header">
              <span className="share-success-icon">✓</span>
              <span className="share-success-title">{shareResult.message}</span>
            </div>
          )}
          {shareResult.type === "error" && (
            <span>{shareResult.message}</span>
          )}
          {shareResult.url && (
            <div className="share-url-row">
              <input
                type="text"
                value={shareResult.url}
                readOnly
                className="share-url-input"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
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
            </div>
          )}
          {shareResult.type === "success" && (
            <div className="share-expiry-banner">
              <span className="share-expiry-icon">⏱</span>
              <span>This link expires in 2 hours</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
