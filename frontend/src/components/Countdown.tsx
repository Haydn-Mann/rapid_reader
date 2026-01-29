"use client";

import { useEffect, useState } from "react";
import { getOrpIndex } from "../domain/orp";

type CountdownProps = {
  onComplete: () => void;
};

// Intro sequence with research-based RSVP timing (150 WPM equivalent)
// 
// Timing formula: (base × word_length_multiplier) + punctuation_pause
// Base at 150 WPM = 400ms
// Word multipliers: veryShort(1-2)=0.8, short(3-4)=0.9, medium(5-8)=1.0
// Punctuation pause: sentence endings = +400ms
//
// Use empty string for a dramatic pause (blank screen moment)
const INTRO_SEQUENCE = [
  { word: "Ready?", delay: 800 },      // 6 chars medium (400×1.0) + 400ms stop
  { word: "", delay: 200 },            // Dramatic pause
  { word: "Empty", delay: 400 },       // 5 chars medium (400×1.0)
  { word: "your", delay: 360 },        // 4 chars short (400×0.9)
  { word: "mind.", delay: 760 },       // 4 chars short (400×0.9) + 400ms stop
  { word: "", delay: 200 },            // Dramatic pause
  { word: "Focus", delay: 400 },       // 5 chars medium (400×1.0)
  { word: "on", delay: 320 },          // 2 chars veryShort (400×0.8)
  { word: "the", delay: 360 },         // 3 chars short (400×0.9)
  { word: "red", delay: 360 },         // 3 chars short (400×0.9)
  { word: "letter.", delay: 800 },     // 6 chars medium (400×1.0) + 400ms stop
  { word: "", delay: 200 },            // Dramatic pause
  { word: "Here", delay: 360 },        // 4 chars short (400×0.9)
  { word: "we", delay: 320 },          // 2 chars veryShort (400×0.8)
  { word: "go!", delay: 720 },         // 2 chars veryShort (400×0.8) + 400ms stop
];

export default function Countdown({ onComplete }: CountdownProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= INTRO_SEQUENCE.length) {
      // Small pause then start
      const timer = setTimeout(onComplete, 225);
      return () => clearTimeout(timer);
    }

    const currentStep = INTRO_SEQUENCE[stepIndex];
    const timer = setTimeout(() => {
      setStepIndex(stepIndex + 1);
    }, currentStep.delay);

    return () => clearTimeout(timer);
  }, [stepIndex, onComplete]);

  if (stepIndex >= INTRO_SEQUENCE.length) {
    return null;
  }

  const currentWord = INTRO_SEQUENCE[stepIndex]?.word || "";
  
  // If it's a pause (empty word), show nothing but keep overlay
  if (!currentWord) {
    return (
      <div className="countdown-overlay">
        <div className="viewport">
          <div className="word-container">
            <div className="word-line">
              <span className="word-left"></span>
              <span className="word-orp">&nbsp;</span>
              <span className="word-right"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orpIndex = getOrpIndex(currentWord.replace(/[.,!?]/g, "")); // Strip punctuation for ORP calc
  const left = currentWord.slice(0, orpIndex);
  const orpChar = currentWord.charAt(orpIndex);
  const right = currentWord.slice(orpIndex + 1);

  return (
    <div className="countdown-overlay">
      <div className="viewport">
        <div className="word-container">
          <div className="word-line">
            <span className="word-left">{left}</span>
            <span className="word-orp">{orpChar}</span>
            <span className="word-right">{right}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
