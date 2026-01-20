
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum PageState {
  COVER = 'COVER',
  TUTORIAL = 'TUTORIAL',
  WORLD_MAP = 'WORLD_MAP',
  GAME_ACTIVE = 'GAME_ACTIVE',
  SUCCESS = 'SUCCESS'
}

export enum WorldType {
  ALPHABET_FOREST = 'ALPHABET_FOREST',
  NUMBER_VALLEY = 'NUMBER_VALLEY',
  PUZZLE_PLAYGROUND = 'PUZZLE_PLAYGROUND',
  DISCOVERY_ISLAND = 'DISCOVERY_ISLAND',
  CREATIVE_CORNER = 'CREATIVE_CORNER',
  BIBLE_ADVENTURE = 'BIBLE_ADVENTURE',
  WORLD_EXPLORER_COVE = 'WORLD_EXPLORER_COVE',
  SCIENCE_LAB_QUEST = 'SCIENCE_LAB_QUEST',
  CREATIVE_CASTLE = 'CREATIVE_CASTLE',
  LOGIC_TIME_TOWER = 'LOGIC_TIME_TOWER',
  BUSINESS_MONEY_WISDOM = 'BUSINESS_MONEY_WISDOM'
}

export interface WorldData {
  type: WorldType;
  name: string;
  icon: string;
  color: string;
  description: string;
  themeColors: string[];
}

export interface PuzzleItem {
  id: number;
  word: string;
  pattern: string;
  hint: string;
}

export interface MathItem {
  id: number;
  question: string;
  answer: number;
  options: number[];
  visualItems: string;
}

export interface DiscoveryItem {
  id: number;
  question: string;
  answer: string;
  options: string[];
  category: string;
  helperEmoji: string;
}

export interface BibleRegion {
  id: number;
  name: string;
  theme: string;
  missions: string[];
  icon: string;
}

export interface ScrambleItem {
  id: number;
  scrambled: string;
  correct: string;
  hint: string;
}

export interface SessionHistory {
  usedWords: string[];
  usedNumbers: number[];
  usedFacts: string[];
}
