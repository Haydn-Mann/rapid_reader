import type { Token } from "../domain/types";
import { getOrpIndex } from "../domain/orp";

type ReaderViewportProps = {
  token?: Token;
  isPlaying: boolean;
};

export default function ReaderViewport({
  token,
  isPlaying
}: ReaderViewportProps) {
  const word = token?.kind === "word" ? token.text : "";
  const orpIndex = token?.kind === "word" ? getOrpIndex(word) : 0;
  const left = token?.kind === "word" ? word.slice(0, orpIndex) : "";
  const orpChar = token?.kind === "word" ? word.charAt(orpIndex) : "";
  const right = token?.kind === "word" ? word.slice(orpIndex + 1) : "";

  return (
    <div className="viewport">
      <div className="word-container">
        {/* Centre marker line - the ORP always aligns here */}
        <div className="centre-marker" />
        <div className="word-line">
          <span className="word-left">{left}</span>
          <span className="word-orp">{orpChar || "\u00A0"}</span>
          <span className="word-right">{right}</span>
        </div>
      </div>
      <div className="viewport-hint">
        {isPlaying ? "Tap to pause" : "Tap to resume"}
      </div>
    </div>
  );
}
