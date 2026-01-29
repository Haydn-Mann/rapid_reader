import type { Token } from "./types";

export function tokenise(input: string): Token[] {
  const normalized = input.replace(/\r\n/g, "\n").replace(/\t/g, " ");
  const trimmed = normalized.trim();

  if (!trimmed) {
    return [];
  }

  const paragraphs = trimmed.split(/\n{2,}/);
  const tokens: Token[] = [];

  paragraphs.forEach((paragraph, index) => {
    const cleaned = paragraph.replace(/\n/g, " ").trim();
    if (cleaned) {
      const words = cleaned.split(/\s+/).filter(Boolean);
      words.forEach((word) => {
        tokens.push({ kind: "word", text: word });
      });
    }

    if (index < paragraphs.length - 1) {
      tokens.push({ kind: "paragraph", text: "" });
    }
  });

  return tokens;
}
