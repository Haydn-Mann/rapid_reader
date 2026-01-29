"use client";

import { useEffect, useState } from "react";

type CelebrationScreenProps = {
  wordsRead: number;
  wpm: number;
  onExit: () => void;
};

export default function CelebrationScreen({
  wordsRead,
  wpm,
  onExit
}: CelebrationScreenProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);
  const timeInSeconds = Math.round((wordsRead / wpm) * 60);

  useEffect(() => {
    // Generate confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="celebration-overlay">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`
          }}
        />
      ))}
      
      <div className="celebration-content">
        <div className="celebration-icon">🎉</div>
        <h2 className="celebration-title">Congratulations!</h2>
        <p className="celebration-subtitle">You've completed your speed reading session</p>
        
        <div className="celebration-stats">
          <div className="stat">
            <div className="stat-value">{wordsRead}</div>
            <div className="stat-label">Words read</div>
          </div>
          <div className="stat">
            <div className="stat-value">{wpm}</div>
            <div className="stat-label">WPM</div>
          </div>
          <div className="stat">
            <div className="stat-value">{timeInSeconds}s</div>
            <div className="stat-label">Time</div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onExit}>
          Read Again
        </button>
      </div>
    </div>
  );
}
