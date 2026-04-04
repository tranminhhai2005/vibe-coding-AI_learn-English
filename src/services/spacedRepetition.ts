import { MemoryLevel, Word } from '../types';

/**
 * Leitner System - Spaced Repetition Algorithm
 *
 * Box 1: Review every 1 day  (new / unknown)
 * Box 2: Review every 3 days
 * Box 3: Review every 7 days
 * Box 4: Review every 14 days
 * Box 5: Review every 30 days (fully mastered)
 *
 * On correct answer → move up one box (max 5)
 * On incorrect answer → move back to box 1
 */

// Interval days per Leitner box
export const LEITNER_INTERVALS: Record<number, number> = {
  1: 1,  // 1 day
  2: 3,  // 3 days
  3: 7,  // 7 days
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

/**
 * Returns the percentage progress toward mastery for a word (0–100).
 * Based on Leitner box position and correct answer ratio.
 */
export function masteryProgress(word: Word): number {
  const boxProgress = ((word.leitnerBox - 1) / 4) * 70; // box contributes 70%
  const total = (word.correctCount || 0) + (word.incorrectCount || 0);
  const accuracy = total > 0 ? (word.correctCount / total) * 30 : 0; // accuracy contributes 30%
  return Math.min(100, Math.round(boxProgress + accuracy));
}

/**
 * Returns a human-readable label for a word's current Leitner box.
 */
export function leitnerBoxLabel(box: number): string {
  const labels: Record<number, string> = {
    1: 'Mới học',
    2: 'Đang nhớ',
    3: 'Khá thuộc',
    4: 'Gần thuộc',
    5: 'Đã thuộc',
  };
  return labels[box] || 'Chưa xác định';
}
