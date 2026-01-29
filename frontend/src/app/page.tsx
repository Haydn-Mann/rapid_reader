"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CelebrationScreen from "../components/CelebrationScreen";
import ControlsBar from "../components/ControlsBar";
import Countdown from "../components/Countdown";
import PasteInput from "../components/PasteInput";
import ProgressTracker from "../components/ProgressTracker";
import ReaderViewport from "../components/ReaderViewport";
import SettingsPanel from "../components/SettingsPanel";
import { tokenise } from "../domain/tokeniser";
import type { CadenceProfile, Token } from "../domain/types";
import { useReaderEngine } from "../hooks/useReaderEngine";

const DEFAULT_TEXT =
  "Paste text here to start. Try a short paragraph, hit Play, and adjust the WPM.";

export default function HomePage() {
  const { state, engine } = useReaderEngine({ wpm: 600, cadenceProfile: "normal" });
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"setup" | "countdown" | "reading" | "celebration">("setup");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");
  const wasPlayingRef = useRef(false);

  const currentToken: Token | undefined = useMemo(() => {
    return state.tokens[state.index];
  }, [state.index, state.tokens]);

  // Check if reading is complete
  useEffect(() => {
    if (mode === "reading" && !state.isPlaying && state.index >= state.tokens.length - 1 && state.tokens.length > 0) {
      // Add a small delay to show the last word before celebrating
      const timer = setTimeout(() => {
        setMode("celebration");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mode, state.isPlaying, state.index, state.tokens.length]);

  // Handle celebration exit - go back to setup
  const handleCelebrationExit = useCallback(() => {
    engine.pause();
    setMode("setup");
  }, [engine]);

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
    const tokens = tokenise(inputText);
    if (tokens.length === 0) {
      setError("Paste some text before hitting Play.");
      return;
    }
    engine.load(tokens);
    setError("");
    setMode("countdown");
  };

  const handleCountdownComplete = () => {
    setMode("reading");
    // Small pause before starting to let everything settle
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

  const handleCadenceChange = (profile: CadenceProfile) => {
    engine.setCadenceProfile(profile);
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

  // Get the first word for countdown preview
  const firstWord = useMemo(() => {
    const token = state.tokens[0];
    return token?.kind === "word" ? token.text : "";
  }, [state.tokens]);

  return (
    <main className={`app-shell ${mode}`}>
      {mode === "setup" && (
        <header className="hero">
          <div>
            <p className="eyebrow">Speed Reader</p>
            <h1>Keep your eyes still. Let the words move.</h1>
          </div>
          <button className="btn btn-ghost" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
        </header>
      )}

      {mode === "setup" && (
        <section className="setup">
          <div className="card">
            <PasteInput
              value={inputText}
              onChange={setInputText}
              placeholder={DEFAULT_TEXT}
            />
            <div className="controls-grid">
              <div className="control-block">
                <label htmlFor="wpm">WPM</label>
                <div className="wpm-inputs">
                  <input
                    id="wpm"
                    type="number"
                    min={250}
                    max={1200}
                    step={10}
                    value={state.wpm}
                    onChange={(event) =>
                      handleWpmChange(Number(event.target.value))
                    }
                  />
                  <input
                    type="range"
                    min={250}
                    max={1200}
                    step={10}
                    value={state.wpm}
                    onChange={(event) =>
                      handleWpmChange(Number(event.target.value))
                    }
                  />
                </div>
              </div>
              <div className="control-block">
                <label htmlFor="cadence">Cadence</label>
                <select
                  id="cadence"
                  value={state.cadenceProfile}
                  onChange={(event) =>
                    handleCadenceChange(event.target.value as CadenceProfile)
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="strong">Strong</option>
                </select>
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn btn-primary" onClick={handlePlay}>
              Play
            </button>
            <p className="helper">
              Space toggles play. Arrow keys step. Esc exits reading mode.
            </p>
          </div>
        </section>
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

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        cadenceProfile={state.cadenceProfile}
        onCadenceChange={handleCadenceChange}
      />
    </main>
  );
}
