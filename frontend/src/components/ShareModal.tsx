"use client";

import { useState } from "react";
import { createShare } from "../lib/sharing";
import type { CadenceProfile } from "../domain/types";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  wpm: number;
  cadenceProfile: CadenceProfile;
};

type ShareState = "idle" | "creating" | "success" | "error";

export default function ShareModal({
  isOpen,
  onClose,
  text,
  wpm,
  cadenceProfile,
}: ShareModalProps) {
  const [state, setState] = useState<ShareState>("idle");
  const [shareUrl, setShareUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    if (!text.trim()) {
      setErrorMessage("Please paste some text first");
      setState("error");
      return;
    }

    setState("creating");
    setErrorMessage("");

    const result = await createShare(text, wpm, cadenceProfile);

    if (result.success) {
      setShareUrl(result.url);
      setState("success");
    } else {
      setErrorMessage(result.error);
      setState("error");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setState("idle");
    setShareUrl("");
    setErrorMessage("");
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={handleClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share article</h2>
          <button className="share-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="share-modal-body">
          {state === "idle" && (
            <>
              <p className="share-modal-description">
                Create a shareable link for this article. Anyone with the link can read it using Speed Reader.
              </p>
              <div className="share-modal-warning">
                <span className="share-modal-warning-icon">⏱</span>
                <span>Links expire after 2 hours</span>
              </div>
              <button
                className="btn btn-primary share-modal-create-btn"
                onClick={handleCreateShare}
              >
                Create link
              </button>
            </>
          )}

          {state === "creating" && (
            <div className="share-modal-loading">
              <div className="share-modal-spinner"></div>
              <p>Creating shareable link...</p>
            </div>
          )}

          {state === "success" && (
            <>
              <div className="share-modal-success-icon">✓</div>
              <p className="share-modal-success-text">Link created!</p>
              <div className="share-modal-link-row">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-modal-link-input"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  className="btn share-modal-copy-btn"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="share-modal-expiry-note">
                <span className="share-modal-warning-icon">⏱</span>
                <span>This link will expire in 2 hours</span>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div className="share-modal-error-icon">!</div>
              <p className="share-modal-error-text">{errorMessage}</p>
              <button
                className="btn btn-primary"
                onClick={() => setState("idle")}
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
