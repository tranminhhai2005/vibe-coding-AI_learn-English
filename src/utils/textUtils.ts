/**
 * Utility functions for text normalization, comparison, and Levenshtein distance
 */

// Normalize string: lowercase, trim, collapse consecutive whitespaces, remove outer punctuation
export function cleanString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize Vietnamese string while preserving diacritics, but standardizing accents
export function normalizeVietnamese(str: string): string {
  return cleanString(str).normalize('NFC');
}

// Split multiple alternative meanings from a string like "lịch trình, thời gian biểu; kế hoạch"
export function extractMeanings(meaningStr: string, additionalMeanings?: string[]): string[] {
  const parts = meaningStr
    .split(/[,;\n/]+/)
    .map((s) => normalizeVietnamese(s))
    .filter(Boolean);

  if (additionalMeanings) {
    additionalMeanings.forEach((m) => {
      const norm = normalizeVietnamese(m);
      if (norm && !parts.includes(norm)) {
        parts.push(norm);
      }
    });
  }

  return parts;
}

// Check if user answer matches any valid Vietnamese meaning
export function isVietnameseMeaningMatch(
  userInput: string,
  targetMeaning: string,
  acceptableMeanings?: string[]
): boolean {
  const cleanInput = normalizeVietnamese(userInput);
  if (!cleanInput) return false;

  const validMeanings = extractMeanings(targetMeaning, acceptableMeanings);

  // Exact match with any valid meaning
  if (validMeanings.includes(cleanInput)) {
    return true;
  }

  // Check if user input is contained in or contains one of the main meanings closely
  for (const valid of validMeanings) {
    if (cleanInput === valid) return true;
    // Allow slight tolerance if distance is 1 (minor typo) for words longer than 4 chars
    if (valid.length >= 5 && levenshteinDistance(cleanInput, valid) <= 1) {
      return true;
    }
  }

  return false;
}

// Check if user English answer matches the target word
export function isEnglishWordMatch(userInput: string, targetWord: string): {
  isMatch: boolean;
  isClose: boolean;
  distance: number;
} {
  const cleanInput = cleanString(userInput);
  const cleanTarget = cleanString(targetWord);

  if (!cleanInput) {
    return { isMatch: false, isClose: false, distance: 999 };
  }

  if (cleanInput === cleanTarget) {
    return { isMatch: true, isClose: false, distance: 0 };
  }

  const dist = levenshteinDistance(cleanInput, cleanTarget);
  const isClose = dist <= 2 && cleanTarget.length >= 4;

  return {
    isMatch: false,
    isClose,
    distance: dist,
  };
}

// Calculate Levenshtein edit distance
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}
