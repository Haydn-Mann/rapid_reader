import { describe, expect, it } from "vitest";
import { getDelayMs } from "./cadence";
import { createReaderEngine } from "./readerEngine";
import { tokenise } from "./tokeniser";


describe("reader engine integration", () => {
  it("advances through tokens with valid delays", () => {
    const tokens = tokenise("Hello world. This is fast.");
    expect(tokens.length).toBeGreaterThan(4);

    const delays = tokens.map((token) => getDelayMs(token, 600, "normal"));
    delays.forEach((delay) => expect(delay).toBeGreaterThan(0));

    const engine = createReaderEngine({ wpm: 600, cadenceProfile: "normal" });
    engine.load(tokens);

    const startIndex = engine.getState().index;
    engine.stepForward();
    const nextIndex = engine.getState().index;

    expect(nextIndex).toBe(startIndex + 1);
  });
});
