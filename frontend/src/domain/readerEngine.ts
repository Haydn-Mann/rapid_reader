import type { CadenceProfile, ReaderState, Token } from "./types";
import { getDelayMs } from "./cadence";

export type ReaderEngine = {
  getState: () => ReaderState;
  load: (tokens: Token[]) => void;
  setWpm: (wpm: number) => void;
  setCadenceProfile: (profile: CadenceProfile) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  stepForward: () => void;
  stepBack: () => void;
  seek: (index: number) => void;
  subscribe: (listener: (state: ReaderState) => void) => () => void;
};

const MIN_WPM = 250;
const MAX_WPM = 1200;
const TICK_MS = 16;

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

export function createReaderEngine(initial?: Partial<ReaderState>): ReaderEngine {
  let state: ReaderState = {
    tokens: [],
    index: 0,
    isPlaying: false,
    wpm: initial?.wpm ?? 600,
    cadenceProfile: initial?.cadenceProfile ?? "normal"
  };

  let nextAt = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<(snapshot: ReaderState) => void>();

  const emit = () => {
    listeners.forEach((listener) => listener(state));
  };

  const stopLoop = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const startLoop = () => {
    if (intervalId !== null) {
      return;
    }
    intervalId = setInterval(() => {
      if (!state.isPlaying) {
        return;
      }
      const currentTime = now();
      if (currentTime < nextAt) {
        return;
      }
      const nextIndex = state.index + 1;
      if (nextIndex >= state.tokens.length) {
        state = { ...state, isPlaying: false };
        emit();
        stopLoop();
        return;
      }
      state = { ...state, index: nextIndex };
      emit();
      scheduleNext(currentTime);
    }, TICK_MS);
  };

  const scheduleNext = (fromTime: number) => {
    const token = state.tokens[state.index];
    if (!token) {
      nextAt = fromTime;
      return;
    }
    nextAt = fromTime + getDelayMs(token, state.wpm, state.cadenceProfile);
  };

  const reschedule = () => {
    if (!state.isPlaying) {
      return;
    }
    scheduleNext(now());
  };

  const clampIndex = (index: number) => {
    if (state.tokens.length === 0) {
      return 0;
    }
    return Math.max(0, Math.min(index, state.tokens.length - 1));
  };

  const clampWpm = (wpm: number) => {
    return Math.max(MIN_WPM, Math.min(wpm, MAX_WPM));
  };

  return {
    getState: () => state,
    load: (tokens: Token[]) => {
      stopLoop();
      state = {
        ...state,
        tokens,
        index: 0,
        isPlaying: false
      };
      emit();
    },
    setWpm: (wpm: number) => {
      state = { ...state, wpm: clampWpm(wpm) };
      emit();
      reschedule();
    },
    setCadenceProfile: (profile: CadenceProfile) => {
      state = { ...state, cadenceProfile: profile };
      emit();
      reschedule();
    },
    play: () => {
      if (state.isPlaying || state.tokens.length === 0) {
        return;
      }
      state = { ...state, isPlaying: true };
      emit();
      scheduleNext(now());
      startLoop();
    },
    pause: () => {
      if (!state.isPlaying) {
        return;
      }
      state = { ...state, isPlaying: false };
      emit();
      stopLoop();
    },
    toggle: () => {
      if (state.isPlaying) {
        state = { ...state, isPlaying: false };
        emit();
        stopLoop();
        return;
      }
      if (state.tokens.length === 0) {
        return;
      }
      state = { ...state, isPlaying: true };
      emit();
      scheduleNext(now());
      startLoop();
    },
    restart: () => {
      const wasPlaying = state.isPlaying;
      state = { ...state, index: 0, isPlaying: wasPlaying };
      emit();
      if (wasPlaying) {
        scheduleNext(now());
        startLoop();
      }
    },
    stepForward: () => {
      if (state.tokens.length === 0) {
        return;
      }
      state = { ...state, index: clampIndex(state.index + 1) };
      emit();
      reschedule();
    },
    stepBack: () => {
      if (state.tokens.length === 0) {
        return;
      }
      state = { ...state, index: clampIndex(state.index - 1) };
      emit();
      reschedule();
    },
    seek: (index: number) => {
      if (state.tokens.length === 0) {
        return;
      }
      state = { ...state, index: clampIndex(index) };
      emit();
      reschedule();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
