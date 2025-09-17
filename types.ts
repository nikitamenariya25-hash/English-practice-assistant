
export enum Activity {
  MainMenu,
  Listening,
  Speaking,
  Writing,
  Vocabulary,
  Grammar,
}

export interface ListeningData {
  sentence: string;
  question: string;
  options: string[];
  answer: string;
}

export interface GrammarData {
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

export interface VocabularyData {
  word: string;
  meaning: string;
  example: string;
  synonym: string;
}

export interface WritingFeedback {
  praise: string;
  corrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
}

export interface SpeakingFeedback {
    praise: string;
    correction: string;
    explanation: string;
}
