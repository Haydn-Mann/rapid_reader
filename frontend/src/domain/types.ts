export type Token =
  | {
      kind: "word";
      text: string;
    }
  | {
      kind: "paragraph";
      text: "";
    };

export type CadenceProfile = "normal" | "strong";

export type ReaderState = {
  tokens: Token[];
  index: number;
  isPlaying: boolean;
  wpm: number;
  cadenceProfile: CadenceProfile;
};
