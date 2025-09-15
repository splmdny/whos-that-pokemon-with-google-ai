export interface Pokemon {
  name: string;
  imageUrl: string;
}

export enum GameState {
  IDLE,
  LOADING,
  MORPHING_CORRECT,
  MORPHING_WRONG,
  GENERATING_CLUE,
  PLAYING,
  REVEALED_CORRECT,
  REVEALED_WRONG,
}

export enum ClueType {
  COLOR,
  APPEARANCE_HABITAT,
}
