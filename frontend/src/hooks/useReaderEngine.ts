"use client";

import { useEffect, useRef, useState } from "react";
import type { CadenceProfile, ReaderState } from "../domain/types";
import { createReaderEngine, type ReaderEngine } from "../domain/readerEngine";

export function useReaderEngine(options?: {
  wpm?: number;
  cadenceProfile?: CadenceProfile;
}) {
  const engineRef = useRef<ReaderEngine>();
  if (!engineRef.current) {
    engineRef.current = createReaderEngine(options);
  }

  const [state, setState] = useState<ReaderState>(() =>
    engineRef.current!.getState()
  );

  useEffect(() => {
    if (!engineRef.current) {
      return;
    }
    const unsubscribe = engineRef.current.subscribe((snapshot) => {
      setState(snapshot);
    });
    return unsubscribe;
  }, []);

  return {
    state,
    engine: engineRef.current
  };
}
