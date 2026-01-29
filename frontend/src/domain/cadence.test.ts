import { describe, expect, it } from "vitest";
import { getDelayMs, getBaseIntervalMs } from "./cadence";
import type { Token } from "./types";

describe("getDelayMs", () => {
  it("adds pause for punctuation", () => {
    const base: Token = { kind: "word", text: "hello" };
    const comma: Token = { kind: "word", text: "hello," };
    const stop: Token = { kind: "word", text: "hello." };

    const baseDelay = getDelayMs(base, 600, "normal");
    const commaDelay = getDelayMs(comma, 600, "normal");
    const stopDelay = getDelayMs(stop, 600, "normal");

    expect(commaDelay).toBeGreaterThan(baseDelay);
    expect(stopDelay).toBeGreaterThan(commaDelay);
  });

  it("adds pause for long words and paragraphs", () => {
    const longWord: Token = { kind: "word", text: "extraordinary" };
    const shortWord: Token = { kind: "word", text: "short" };
    const paragraph: Token = { kind: "paragraph", text: "" };

    expect(getDelayMs(longWord, 600, "normal")).toBeGreaterThan(
      getDelayMs(shortWord, 600, "normal")
    );
    expect(getDelayMs(paragraph, 600, "normal")).toBeGreaterThan(
      getDelayMs(shortWord, 600, "normal")
    );
  });

  it("handles ellipsis with longer pause", () => {
    const stop: Token = { kind: "word", text: "wait." };
    const ellipsis: Token = { kind: "word", text: "wait..." };

    const stopDelay = getDelayMs(stop, 600, "normal");
    const ellipsisDelay = getDelayMs(ellipsis, 600, "normal");

    // Ellipsis should have a longer pause than a regular stop
    expect(ellipsisDelay).toBeGreaterThan(stopDelay);
  });

  it("treats abbreviations as brief pauses, not sentence endings", () => {
    const sentence: Token = { kind: "word", text: "world." };
    const abbrev: Token = { kind: "word", text: "Dr." };

    const sentenceDelay = getDelayMs(sentence, 600, "normal");
    const abbrevDelay = getDelayMs(abbrev, 600, "normal");

    // Abbreviation should have much shorter pause than sentence ending
    expect(sentenceDelay).toBeGreaterThan(abbrevDelay);
  });

  it("does not add comma pause for numbers with commas", () => {
    const withComma: Token = { kind: "word", text: "hello," };
    const number: Token = { kind: "word", text: "1,000,000" };

    const commaDelay = getDelayMs(withComma, 600, "normal");
    const numberDelay = getDelayMs(number, 600, "normal");

    // Number should not have comma pauses added
    // Word with comma should have more delay than number (which has no punctuation pause)
    expect(commaDelay).toBeGreaterThan(numberDelay);
  });

  it("applies word length multipliers correctly", () => {
    const veryShort: Token = { kind: "word", text: "I" };     // 1 char = 0.8x
    const short: Token = { kind: "word", text: "the" };       // 3 chars = 0.9x
    const medium: Token = { kind: "word", text: "hello" };    // 5 chars = 1.0x
    const long: Token = { kind: "word", text: "important" };  // 9 chars = 1.15x
    const veryLong: Token = { kind: "word", text: "extraordinary" }; // 13 chars = 1.3x

    const base = getBaseIntervalMs(600); // 100ms at 600 WPM

    expect(getDelayMs(veryShort, 600, "normal")).toBe(Math.round(base * 0.8));
    expect(getDelayMs(short, 600, "normal")).toBe(Math.round(base * 0.9));
    expect(getDelayMs(medium, 600, "normal")).toBe(Math.round(base * 1.0));
    expect(getDelayMs(long, 600, "normal")).toBe(Math.round(base * 1.15));
    expect(getDelayMs(veryLong, 600, "normal")).toBe(Math.round(base * 1.3));
  });

  it("keeps punctuation pauses constant regardless of WPM", () => {
    const stop: Token = { kind: "word", text: "hello." }; // 5 chars = 1.0x multiplier
    
    // At different WPMs, the punctuation pause component should be the same
    const delay150 = getDelayMs(stop, 150, "normal");
    const delay600 = getDelayMs(stop, 600, "normal");
    
    const base150 = getBaseIntervalMs(150); // 400ms
    const base600 = getBaseIntervalMs(600); // 100ms
    
    // Using a word with 1.0x multiplier, so base is unchanged
    // At 150 WPM: 400ms base + 400ms pause = 800ms total
    // At 600 WPM: 100ms base + 400ms pause = 500ms total
    // The pause (400ms) stays constant, only base changes
    const pauseAt150 = delay150 - base150;
    const pauseAt600 = delay600 - base600;
    
    expect(pauseAt150).toBe(pauseAt600);
    expect(pauseAt150).toBe(400); // Fixed 400ms pause for sentence endings
  });
});
