
type ControlsBarProps = {
  isPlaying: boolean;
  wpm: number;
  onToggle: () => void;
  onRestart: () => void;
  onExit: () => void;
  onWpmChange: (value: number) => void;
};

export default function ControlsBar({
  isPlaying,
  wpm,
  onToggle,
  onRestart,
  onExit,
  onWpmChange
}: ControlsBarProps) {
  const handleNudge = (delta: number) => {
    onWpmChange(wpm + delta);
  };

  return (
    <div className="controls-bar" onClick={(event) => event.stopPropagation()}>
      <button className="btn btn-ghost" onClick={onToggle}>
        {isPlaying ? "Pause" : "Resume"}
      </button>
      <div className="controls-wpm">
        <span className="label">WPM</span>
        <button className="btn btn-mini" onClick={() => handleNudge(-50)}>
          -
        </button>
        <span className="wpm-value">{wpm}</span>
        <button className="btn btn-mini" onClick={() => handleNudge(50)}>
          +
        </button>
      </div>
      <button className="btn btn-ghost" onClick={onRestart}>
        Restart
      </button>
      <button className="btn btn-ghost" onClick={onExit}>
        Exit
      </button>
    </div>
  );
}
