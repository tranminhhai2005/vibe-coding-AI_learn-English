import { INITIAL_DECKS, INITIAL_WORDS } from '../data/initialData';
import { AppSettings, Deck, StudyStats, Word } from '../types';
import { repairAllWords } from './vocabEngine';

const STORAGE_KEYS = {
  WORDS: 'learn_english_words_v1',
  DECKS: 'learn_english_decks_v1',
  STATS: 'learn_english_stats_v1',
  SETTINGS: 'learn_english_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVoiceURI: '',
  autoPlayAudio: true,
  dailyGoal: 10,
};

export function loadStoredWords(): Word[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORDS);
    if (!raw) {
      saveStoredWords(INITIAL_WORDS);
      return INITIAL_WORDS;
    }
    const parsed = JSON.parse(raw);
    const wordsList: Word[] = Array.isArray(parsed) ? parsed : INITIAL_WORDS;

    // Tự động chuẩn hóa và sửa lỗi từ vựng (tách IPA, sửa loại từ, sửa nghĩa)
    const { repairedWords, changedCount } = repairAllWords(wordsList);
    if (changedCount > 0) {
      console.log(`[Storage] Đã tự động chuẩn hóa & sửa ${changedCount} từ vựng trong kho.`);
      saveStoredWords(repairedWords);
      return repairedWords;
    }

    return wordsList;
  } catch (err) {
    console.error('Error loading words from localStorage:', err);
    return INITIAL_WORDS;
  }
}

export function repairStoredWordsDatabase(): {
  repairedWords: Word[];
  changedCount: number;
  report: { word: string; fixes: string[] }[];
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORDS);
    const parsed = raw ? JSON.parse(raw) : INITIAL_WORDS;
    const wordsList: Word[] = Array.isArray(parsed) ? parsed : INITIAL_WORDS;

    const result = repairAllWords(wordsList);
    if (result.changedCount > 0) {
      saveStoredWords(result.repairedWords);
    }
    return result;
  } catch (err) {
    console.error('Error repairing words:', err);
    return { repairedWords: [], changedCount: 0, report: [] };
  }
}

export function saveStoredWords(words: Word[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
  } catch (err) {
    console.error('Error saving words to localStorage:', err);
  }
}

export function loadStoredDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    if (!raw) {
      saveStoredDecks(INITIAL_DECKS);
      return INITIAL_DECKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DECKS;
  } catch (err) {
    console.error('Error loading decks from localStorage:', err);
    return INITIAL_DECKS;
  }
}

export function saveStoredDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  } catch (err) {
    console.error('Error saving decks to localStorage:', err);
  }
}

export function loadStoredStats(): StudyStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      const defaultStats: StudyStats = {
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        dailyActivity: {},
      };
      saveStoredStats(defaultStats);
      return defaultStats;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading stats:', err);
    return {
      streakDays: 0,
      lastActiveDate: '',
      dailyActivity: {},
    };
  }
}

export function saveStoredStats(stats: StudyStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Error saving stats:', err);
  }
}

export function recordActivity(
  wordsStudied: number,
  quizCompleted: number,
  correct: number,
  incorrect: number
): StudyStats {
  const current = loadStoredStats();
  const today = new Date().toISOString().split('T')[0];

  // Calculate streak
  let newStreak = current.streakDays || 0;
  if (current.lastActiveDate) {
    const lastDate = new Date(current.lastActiveDate);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    } else if (diffDays === 0 && newStreak === 0) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const existingToday = current.dailyActivity[today] || {
    wordsStudied: 0,
    quizCompleted: 0,
    correct: 0,
    incorrect: 0,
  };

  const updatedToday = {
    wordsStudied: existingToday.wordsStudied + wordsStudied,
    quizCompleted: existingToday.quizCompleted + quizCompleted,
    correct: existingToday.correct + correct,
    incorrect: existingToday.incorrect + incorrect,
  };

  const newStats: StudyStats = {
    ...current,
    streakDays: newStreak,
    lastActiveDate: today,
    dailyActivity: {
      ...current.dailyActivity,
      [today]: updatedToday,
    },
  };

  saveStoredStats(newStats);
  return newStats;
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function exportBackupJSON(): string {
  const words = loadStoredWords();
  const decks = loadStoredDecks();
  const stats = loadStoredStats();
  const settings = loadStoredSettings();

  const backupData = {
    app: 'Learn_English',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    words,
    decks,
    stats,
    settings,
  };

  return JSON.stringify(backupData, null, 2);
}

export function importBackupJSON(jsonStr: string): {
  success: boolean;
  wordsCount?: number;
  decksCount?: number;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || !Array.isArray(data.words)) {
      return { success: false, error: 'Tệp JSON không đúng định dạng sao lưu của Learn English.' };
    }

    saveStoredWords(data.words);
    if (Array.isArray(data.decks)) saveStoredDecks(data.decks);
    if (data.stats) saveStoredStats(data.stats);
    if (data.settings) saveStoredSettings(data.settings);

    return {
      success: true,
      wordsCount: data.words.length,
      decksCount: Array.isArray(data.decks) ? data.decks.length : 0,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Không thể phân tích dữ liệu tệp JSON: ' + (err as Error).message,
    };
  }
}

export function exportWordsCSV(words: Word[]): string {
  const headers = ['Từ tiếng Anh', 'Nghĩa tiếng Việt', 'Phiên âm', 'Loại từ', 'Ví dụ', 'Dịch ví dụ', 'Bộ từ', 'Mức độ'];
  const rows = words.map((w) => [
    `"${(w.word || '').replace(/"/g, '""')}"`,
    `"${(w.meaning || '').replace(/"/g, '""')}"`,
    `"${(w.ipa || '').replace(/"/g, '""')}"`,
    `"${(w.partOfSpeech || 'noun').replace(/"/g, '""')}"`,
    `"${(w.example || '').replace(/"/g, '""')}"`,
    `"${(w.exampleMeaning || '').replace(/"/g, '""')}"`,
    `"${(w.deckName || '').replace(/"/g, '""')}"`,
    `"${(w.memoryLevel || 'new').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export function importWordsCSV(csvStr: string): {
  words: Partial<Word>[];
  error?: string;
} {
  try {
    const lines = csvStr.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { words: [], error: 'Tệp CSV không có dữ liệu hoặc thiếu dòng tiêu đề.' };
    }

    const words: Partial<Word>[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV regex parser handling quotes
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const values: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index === regex.lastIndex) regex.lastIndex++;
        let val = match[1] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        values.push(val.trim());
        if (values.length >= 8) break;
      }

      const word = values[0];
      const meaning = values[1];
      if (word && meaning) {
        words.push({
          word,
          meaning,
          ipa: values[2] || '',
          partOfSpeech: (values[3] as any) || 'noun',
          example: values[4] || '',
          exampleMeaning: values[5] || '',
          deckName: values[6] || '',
        });
      }
    }

    return { words };
  } catch (err) {
    return { words: [], error: 'Lỗi đọc tệp CSV: ' + (err as Error).message };
  }
}
