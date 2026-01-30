"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CelebrationScreen from "../../../components/CelebrationScreen";
import ControlsBar from "../../../components/ControlsBar";
import Countdown from "../../../components/Countdown";
import ProgressTracker from "../../../components/ProgressTracker";
import ReaderViewport from "../../../components/ReaderViewport";
import { tokenise } from "../../../domain/tokeniser";
import type { CadenceProfile, Token } from "../../../domain/types";
import { useReaderEngine } from "../../../hooks/useReaderEngine";
import { fetchShare, getTimeRemaining, getReadingTime, type SharedArticle } from "../../../lib/sharing";

type LoadingState = "loading" | "error" | "ready";

export default function SharedArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [article, setArticle] = useState<SharedArticle | null>(null);

  const { state, engine } = useReaderEngine({
    wpm: article?.wpm ?? 600,
    cadenceProfile: article?.cadence_profile ?? "normal",
  });

  const [mode, setMode] = useState<"setup" | "countdown" | "reading" | "celebration">("setup");
  const wasPlayingRef = useRef(false);

  // Fetch shared article on mount
  useEffect(() => {
    async function loadArticle() {
      const result = await fetchShare(id);
      if (result.success) {
        setArticle(result.article);
        setLoadingState("ready");
      } else {
        setErrorMessage(result.error);
        setLoadingState("error");
      }
    }
    loadArticle();
  }, [id]);

  // Load tokens when article is ready
  useEffect(() => {
    if (article && engine) {
      const tokens = tokenise(article.text);
      engine.load(tokens);
      engine.setWpm(article.wpm);
      engine.setCadenceProfile(article.cadence_profile);
    }
  }, [article, engine]);

  const currentToken: Token | undefined = useMemo(() => {
    return state.tokens[state.index];
  }, [state.index, state.tokens]);

  // Check if reading is complete
  useEffect(() => {
    if (mode === "reading" && !state.isPlaying && state.index >= state.tokens.length - 1 && state.tokens.length > 0) {
      const timer = setTimeout(() => {
        setMode("celebration");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mode, state.isPlaying, state.index, state.tokens.length]);

  const handleCelebrationExit = useCallback(() => {
    engine?.pause();
    setMode("setup");
  }, [engine]);

  // Keyboard shortcuts
  useEffect(() => {
    if ((mode !== "reading" && mode !== "countdown") || !engine) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        engine.toggle();
      }
      if (event.code === "ArrowLeft") {
        event.preventDefault();
        engine.stepBack();
      }
      if (event.code === "ArrowRight") {
        event.preventDefault();
        engine.stepForward();
      }
      if (event.code === "Escape") {
        event.preventDefault();
        handleExit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [engine, mode]);

  if (!engine) {
    return null;
  }

  const handlePlay = () => {
    if (state.tokens.length === 0) {
      return;
    }
    setMode("countdown");
  };

  const handleCountdownComplete = () => {
    setMode("reading");
    setTimeout(() => {
      engine.play();
    }, 500);
  };

  const handleExit = () => {
    engine.pause();
    setMode("setup");
  };

  const handleWpmChange = (value: number) => {
    if (Number.isNaN(value)) {
      return;
    }
    engine.setWpm(value);
  };

  const handleSeek = useCallback((index: number) => {
    engine.seek(index);
  }, [engine]);

  const handleSeekStart = useCallback(() => {
    wasPlayingRef.current = state.isPlaying;
    engine.pause();
  }, [engine, state.isPlaying]);

  const handleSeekEnd = useCallback(() => {
    if (wasPlayingRef.current) {
      engine.play();
    }
  }, [engine]);

  const handleGoHome = () => {
    router.push("/");
  };

  // Loading state
  if (loadingState === "loading") {
    return (
      <main className="app-shell setup">
        <div className="card" style={{ textAlign: "center", padding: "48px" }}>
          <p>Loading shared article...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (loadingState === "error") {
    return (
      <main className="app-shell setup">
        <header className="hero">
          <div>
            <p className="eyebrow">Speed Reader</p>
            <h1>Shared Article</h1>
          </div>
        </header>
        <div className="card" style={{ textAlign: "center" }}>
          <p className="error" style={{ marginBottom: "16px" }}>{errorMessage}</p>
          <p className="helper" style={{ marginBottom: "24px" }}>
            Shared links expire after 2 hours. The person who shared this may need to create a new link.
          </p>
          <button className="btn btn-primary" onClick={handleGoHome}>
            Go to Speed Reader
          </button>
        </div>
      </main>
    );
  }

  // Ready state
  return (
    <main className={`app-shell ${mode}`}>
      {mode === "setup" && (
        <>
          <header className="hero">
            <div>
              <p className="eyebrow">Shared Article</p>
              <h1>Someone shared this with you</h1>
            </div>
            <button className="btn btn-ghost" onClick={handleGoHome}>
              Create Your Own
            </button>
          </header>

          <section className="setup">
            <div className="card">
              <div className="shared-preview">
                <p className="shared-text-preview">
                  {article?.text.slice(0, 300)}
                  {(article?.text.length ?? 0) > 300 ? "..." : ""}
                </p>
              </div>
              <div className="shared-info">
                <span className="shared-meta">
                  {state.tokens.length} words at {article?.wpm} WPM
                </span>
                {article && (
                  <span className="shared-expiry">
                    {getReadingTime(state.tokens.length, article.wpm)} reading time
                  </span>
                )}
              </div>
              <button className="btn btn-primary" onClick={handlePlay}>
                Start Reading
              </button>
              <p className="helper">
                Space toggles play. Arrow keys step. Esc exits reading mode.
              </p>
            </div>
          </section>
        </>
      )}

      {mode === "countdown" && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {mode === "reading" && (
        <section className="reader" onClick={() => engine.toggle()}>
          <ControlsBar
            isPlaying={state.isPlaying}
            wpm={state.wpm}
            onToggle={engine.toggle}
            onRestart={engine.restart}
            onExit={handleExit}
            onWpmChange={handleWpmChange}
          />
          <ReaderViewport token={currentToken} isPlaying={state.isPlaying} />
          <ProgressTracker
            current={state.index}
            total={state.tokens.length}
            onSeek={handleSeek}
            onSeekStart={handleSeekStart}
            onSeekEnd={handleSeekEnd}
          />
        </section>
      )}

      {mode === "celebration" && (
        <CelebrationScreen
          wordsRead={state.tokens.length}
          wpm={state.wpm}
          onExit={handleCelebrationExit}
        />
      )}
    </main>
  );
}
