"use client";

import { useCallback, useRef, useState } from "react";

type ProgressTrackerProps = {
  current: number;
  total: number;
  onSeek: (index: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
};

export default function ProgressTracker({
  current,
  total,
  onSeek,
  onSeekStart,
  onSeekEnd
}: ProgressTrackerProps) {
  const progress = total > 0 ? (current / (total - 1)) * 100 : 0;
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateIndex = useCallback(
    (clientX: number) => {
      if (!barRef.current || total === 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      return Math.round(percentage * (total - 1));
    },
    [total]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onSeekStart();
    onSeek(calculateIndex(e.clientX));

    const handleMouseMove = (e: MouseEvent) => {
      onSeek(calculateIndex(e.clientX));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onSeekEnd();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    onSeekStart();
    onSeek(calculateIndex(e.touches[0].clientX));

    const handleTouchMove = (e: TouchEvent) => {
      onSeek(calculateIndex(e.touches[0].clientX));
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      onSeekEnd();
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className={`progress-tracker ${isDragging ? "dragging" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="progress-bar"
        ref={barRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <div
          className={`progress-avatar ${isDragging ? "active" : ""}`}
          style={{ left: `${progress}%` }}
        >
          <img src="/images/indicator.png" alt="" className="progress-indicator-img" />
        </div>
      </div>
      <div className="progress-info">
        <span>{current + 1}</span>
        <span>/</span>
        <span>{total}</span>
      </div>
    </div>
  );
}
