import type { CadenceProfile, Token } from "./types";

/**
 * RSVP Cadence System - Research-Based Optimisation
 * 
 * Based on research into Rapid Serial Visual Presentation (RSVP):
 * 
 * 1. WRAP-UP EFFECT (Auburn University 2024, Busler & Lazarte 2017)
 *    - Efficient readers naturally pause at clause/sentence boundaries
 *    - Fixed pauses at punctuation significantly improve recall
 *    - Pauses must remain constant regardless of WPM for comprehension
 * 
 * 2. WORD LENGTH & VISUAL SPAN (Legge et al.)
 *    - Short words (1-3 chars) process faster - less visual span needed
 *    - Long words need proportionally more time
 *    - Visual span is ~10 letters in central vision
 * 
 * 3. INTERNAL PROSODY HYPOTHESIS (Fodor 2002)
 *    - Readers silently mimic speech patterns
 *    - Pauses at natural speech boundaries aid comprehension
 */

// Fixed pause durations in milliseconds - CONSTANT regardless of WPM
// This is critical: pauses represent processing time, not reading time
const FIXED_PAUSES = {
  normal: {
    comma: 150,        // Brief breath - clause boundary
    semicolon: 200,    // Longer pause - related clauses  
    colon: 250,        // Introducing what follows
    stop: 400,         // Sentence wrap-up - integrate meaning
    ellipsis: 500,     // Trailing thought - longer contemplative pause
    paragraph: 700,    // Topic shift - mental reset
  },
  strong: {
    comma: 220,        // More pronounced clause pause
    semicolon: 300,    // Clear separation
    colon: 350,        // Strong introduction
    stop: 550,         // Full sentence processing
    ellipsis: 700,     // Extended trailing thought
    paragraph: 1000,   // Complete mental breath
  }
};

// Word length multipliers - based on visual span research
// Short words need less visual processing, long words need more
const WORD_LENGTH_MULTIPLIERS = {
  veryShort: 0.8,    // 1-2 chars: "I", "a", "to", "is" - process very fast
  short: 0.9,        // 3-4 chars: "the", "and", "with" - process fast
  medium: 1.0,       // 5-8 chars: normal processing
  long: 1.15,        // 9-11 chars: needs more time
  veryLong: 1.3,     // 12+ chars: complex words need full attention
};

// Common abbreviations that end with periods but aren't sentence endings
const ABBREVIATIONS = new Set([
  "mr.", "mrs.", "ms.", "dr.", "prof.", "sr.", "jr.",
  "vs.", "etc.", "e.g.", "i.e.", "cf.", "al.",
  "inc.", "ltd.", "corp.", "co.",
  "st.", "ave.", "rd.", "blvd.",
  "jan.", "feb.", "mar.", "apr.", "jun.", "jul.", "aug.", "sep.", "sept.", "oct.", "nov.", "dec.",
  "mon.", "tue.", "wed.", "thu.", "fri.", "sat.", "sun.",
  "a.m.", "p.m.", "b.c.", "a.d.",
  "u.s.", "u.k.", "u.s.a.",
]);

export function getBaseIntervalMs(wpm: number) {
  const safeWpm = Math.max(1, wpm);
  return 60000 / safeWpm;
}

function stripPunctuation(text: string): string {
  return text.replace(/[^\w]/g, "");
}

function stripTrailingClosers(text: string): string {
  return text.replace(/[)\]"']+$/g, "");
}

function isAbbreviation(text: string): boolean {
  return ABBREVIATIONS.has(text.toLowerCase());
}

function isNumberWithCommas(text: string): boolean {
  // Matches patterns like 1,000 or 1,000,000
  return /^\d{1,3}(,\d{3})+$/.test(text.replace(/[^\d,]/g, ""));
}

function getWordLengthMultiplier(text: string): number {
  const cleanLength = stripPunctuation(text).length;
  
  if (cleanLength <= 2) return WORD_LENGTH_MULTIPLIERS.veryShort;
  if (cleanLength <= 4) return WORD_LENGTH_MULTIPLIERS.short;
  if (cleanLength <= 8) return WORD_LENGTH_MULTIPLIERS.medium;
  if (cleanLength <= 11) return WORD_LENGTH_MULTIPLIERS.long;
  return WORD_LENGTH_MULTIPLIERS.veryLong;
}

function getPunctuationPause(text: string, profile: CadenceProfile): number {
  const cleaned = stripTrailingClosers(text);
  const pauses = FIXED_PAUSES[profile];
  
  // Check for ellipsis first (... or …)
  if (cleaned.endsWith("...") || cleaned.endsWith("…")) {
    return pauses.ellipsis;
  }
  
  // Skip comma pause for numbers like 1,000,000
  if (isNumberWithCommas(text)) {
    return 0;
  }

  const lastChar = cleaned[cleaned.length - 1];

  // Sentence endings - but not abbreviations
  if (lastChar === ".") {
    // Check if it's an abbreviation (shouldn't get full stop pause)
    if (isAbbreviation(cleaned)) {
      return pauses.comma; // Treat like a brief pause instead
    }
    return pauses.stop;
  }
  
  // Question and exclamation marks are always sentence endings
  if (lastChar === "!" || lastChar === "?") {
    return pauses.stop;
  }

  // Clause separators
  if (lastChar === ",") {
    return pauses.comma;
  }

  if (lastChar === ";") {
    return pauses.semicolon;
  }

  // Introduction markers
  if (lastChar === ":") {
    return pauses.colon;
  }

  // Dash/em-dash - brief thought pause
  if (lastChar === "—" || lastChar === "-") {
    return pauses.comma;
  }

  return 0;
}

export function getDelayMs(token: Token, wpm: number, profile: CadenceProfile): number {
  const baseIntervalMs = getBaseIntervalMs(wpm);
  const pauses = FIXED_PAUSES[profile];

  // Paragraph breaks get fixed pause only (no word to display)
  if (token.kind === "paragraph") {
    return pauses.paragraph;
  }

  // Calculate word display time based on length
  const lengthMultiplier = getWordLengthMultiplier(token.text);
  const wordDisplayTime = baseIntervalMs * lengthMultiplier;

  // Add fixed pause for punctuation (wrap-up effect)
  const punctuationPause = getPunctuationPause(token.text, profile);

  return Math.max(1, Math.round(wordDisplayTime + punctuationPause));
}
