import { describe, expect, it } from "vitest";
import { getOrpIndex } from "./orp";

describe("getOrpIndex", () => {
  it("maps short words to index 1", () => {
    expect(getOrpIndex("brain")).toBe(1);
  });

  it("maps medium words to index 2", () => {
    expect(getOrpIndex("sensor")).toBe(2);
  });

  it("clamps for very short words", () => {
    expect(getOrpIndex("a")).toBe(0);
  });

  it("maps longer words to higher indices", () => {
    expect(getOrpIndex("recognition")).toBe(3);
  });
});
