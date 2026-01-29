import { describe, expect, it } from "vitest";
import { tokenise } from "./tokeniser";


describe("tokenise", () => {
  it("preserves punctuation and paragraph breaks", () => {
    const input = "Hello world.\n\nThis is fast, right?";
    const tokens = tokenise(input);

    expect(tokens).toHaveLength(7);
    expect(tokens[0]).toEqual({ kind: "word", text: "Hello" });
    expect(tokens[1]).toEqual({ kind: "word", text: "world." });
    expect(tokens[2]).toEqual({ kind: "paragraph", text: "" });
    expect(tokens[3]).toEqual({ kind: "word", text: "This" });
    expect(tokens[6]).toEqual({ kind: "word", text: "right?" });
  });
});
