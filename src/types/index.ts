export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'phrase'
  | 'other';

export type MemoryLevel = 'new' | 'learning' | 'mastered';

export interface Word {
  id: string;
  word: string;
  meaning: string;
  ipa?: string;
  partOfSpeech: PartOfSpeech;
  example?: string;
  exampleMeaning?: string;
  image?: string;
  deckId?: string;
  deckName?: string;
  memoryLevel: MemoryLevel;
  correctCount: number;
  incorrectCount: number;
  leitnerBox: number; // 1 to 5
  createdAt: string;
  lastStudied?: string;
  nextReviewDate: string;
  isSample?: boolean;
  acceptableMeanings?: string[];
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string;
  iconName?: string;
  coverImage?: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface StudyActivity {
  wordsStudied: number;
  quizCompleted: number;
  correct: number;
  incorrect: number;
}

export interface StudyStats {
  streakDays: number;
  lastActiveDate: string;
  dailyActivity: Record<string, StudyActivity>;
}

export type QuizType = 'en_to_vi' | 'vi_to_en' | 'audio_to_en' | 'fill_blank';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  subPrompt?: string;
  audioWord?: string;
  options: string[];
  correctAnswer: string;
  word: Word;
  explanation: string;
}

export interface QuizResult {
  questionId: string;
  wordId: string;
  word: string;
  meaning: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ExtractedOCRWord {
  id: string;
  word: string;
  meaning: string;
  ipa?: string;
  partOfSpeech: PartOfSpeech;
  example?: string;
  exampleMeaning?: string;
  selected: boolean;
  isExisting: boolean;
  existingId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  speechRate: number; // 0.75 - 1.25
  speechPitch: number;
  speechVoiceURI: string;
  autoPlayAudio: boolean;
  dailyGoal: number; // target words per day
}
