import { MemoryLevel, Word } from '../types';

// Interval days per Leitner box
export const LEITNER_INTERVALS: Record<number, number> = {
  1: 1, // 1 day
  2: 3, // 3 days
  3: 7, // 7 days
  4: 14, // 14 days
  5: 30, // 30 days
};

export function calculateNextReview(
  currentWord: Word,
  isCorrect: boolean
): {
  leitnerBox: number;
  memoryLevel: MemoryLevel;
  correctCount: number;
  incorrectCount: number;
  lastStudied: string;
  nextReviewDate: string;
} {
  const now = new Date();
  let newBox = currentWord.leitnerBox || 1;
  let newCorrect = currentWord.correctCount || 0;
  let newIncorrect = currentWord.incorrectCount || 0;

  if (isCorrect) {
    newCorrect += 1;
    newBox = Math.min(5, newBox + 1);
  } else {
    newIncorrect += 1;
    newBox = Math.max(1, newBox - 1);
  }

  // Determine memory level based on concrete mastery actions
  let memoryLevel: MemoryLevel = 'learning';
  if (newBox >= 4 && newCorrect >= 3) {
    memoryLevel = 'mastered';
  } else if (newCorrect === 0 && newIncorrect === 0) {
    memoryLevel = 'new';
  } else {
    memoryLevel = 'learning';
  }

  const intervalDays = LEITNER_INTERVALS[newBox] || 1;
  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    leitnerBox: newBox,
    memoryLevel,
    correctCount: newCorrect,
    incorrectCount: newIncorrect,
    lastStudied: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
  };
}

export function isDueForReview(word: Word): boolean {
  if (!word.nextReviewDate) return true;
  const reviewTime = new Date(word.nextReviewDate).getTime();
  const now = Date.now();
  return reviewTime <= now;
}

export function isWeakWord(word: Word): boolean {
  return word.incorrectCount > 0 || (word.leitnerBox <= 2 && word.memoryLevel !== 'mastered');
}
