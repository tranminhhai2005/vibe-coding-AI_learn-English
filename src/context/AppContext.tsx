import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  loadStoredDecks,
  loadStoredSettings,
  loadStoredStats,
  loadStoredWords,
  recordActivity,
  repairStoredWordsDatabase,
  saveStoredDecks,
  saveStoredSettings,
  saveStoredWords,
} from '../services/storage';
import { calculateNextReview } from '../services/spacedRepetition';
import { repairAndStandardizeWord } from '../services/vocabEngine';
import { AppSettings, Deck, StudyStats, Word } from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  words: Word[];
  decks: Deck[];
  stats: StudyStats;
  settings: AppSettings;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addWord: (
    data: Omit<Word, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount' | 'leitnerBox' | 'nextReviewDate'>
  ) => Word;
  updateWord: (id: string, updates: Partial<Word>) => void;
  deleteWord: (id: string) => void;
  batchAddWords: (newWords: Partial<Word>[]) => number;
  recordAnswer: (wordId: string, isCorrect: boolean) => void;
  createDeck: (name: string, description: string, color?: string) => Deck;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  addWordsToDeck: (wordIds: string[], deckId: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  reloadAllData: () => void;
  resetAllData: () => void;
  repairDatabase: () => { changedCount: number; report: { word: string; fixes: string[] }[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<StudyStats>({
    streakDays: 1,
    lastActiveDate: '',
    dailyActivity: {},
  });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initial load
  useEffect(() => {
    const loadedWords = loadStoredWords();
    const loadedDecks = loadStoredDecks();
    const loadedStats = loadStoredStats();
    const loadedSettings = loadStoredSettings();

    setWords(loadedWords);
    setDecks(loadedDecks);
    setStats(loadedStats);
    setSettings(loadedSettings);

    // Apply dark mode class to html document element
    if (
      loadedSettings.theme === 'dark' ||
      (loadedSettings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handleSpeechError = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      if (message) addToast(message, 'error');
    };

    window.addEventListener('learn-english:speech-error', handleSpeechError);
    return () => window.removeEventListener('learn-english:speech-error', handleSpeechError);
  }, []);

  // Update HTML class when theme changes
  useEffect(() => {
    if (
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredSettings(settings);
  }, [settings]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addWord = (
    data: Omit<Word, 'id' | 'createdAt' | 'correctCount' | 'incorrectCount' | 'leitnerBox' | 'nextReviewDate'>
  ): Word => {
    const rawWord: Word = {
      ...data,
      id: 'word_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      correctCount: 0,
      incorrectCount: 0,
      leitnerBox: 1,
      createdAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
    };

    const { repairedWord } = repairAndStandardizeWord(rawWord);
    const updated = [repairedWord, ...words];
    setWords(updated);
    saveStoredWords(updated);
    addToast(`Đã thêm từ "${repairedWord.word}" vào kho từ vựng.`, 'success');
    return repairedWord;
  };

  const updateWord = (id: string, updates: Partial<Word>) => {
    const updated = words.map((w) => {
      if (w.id === id) {
        const merged = { ...w, ...updates };
        const { repairedWord } = repairAndStandardizeWord(merged);
        return repairedWord;
      }
      return w;
    });
    setWords(updated);
    saveStoredWords(updated);
    addToast('Đã cập nhật thông tin từ vựng.', 'success');
  };

  const deleteWord = (id: string) => {
    const target = words.find((w) => w.id === id);
    const updated = words.filter((w) => w.id !== id);
    setWords(updated);
    saveStoredWords(updated);
    addToast(`Đã xóa từ "${target?.word || ''}".`, 'info');
  };

  const batchAddWords = (newWords: Partial<Word>[]): number => {
    let addedCount = 0;
    const currentWords = [...words];

    for (const nw of newWords) {
      if (!nw.word || !nw.meaning) continue;

      const rawObj: Word = {
        id: 'word_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        word: nw.word.trim(),
        meaning: nw.meaning.trim(),
        ipa: nw.ipa || '',
        partOfSpeech: nw.partOfSpeech || 'noun',
        example: nw.example || '',
        exampleMeaning: nw.exampleMeaning || '',
        image: nw.image || '',
        deckId: nw.deckId,
        deckName: nw.deckName,
        memoryLevel: 'new',
        correctCount: 0,
        incorrectCount: 0,
        leitnerBox: 1,
        createdAt: new Date().toISOString(),
        nextReviewDate: new Date().toISOString(),
        isSample: false,
        acceptableMeanings: nw.acceptableMeanings || [],
      };

      const { repairedWord } = repairAndStandardizeWord(rawObj);

      // Duplicate check (case-insensitive English word)
      const existing = currentWords.find(
        (w) => w.word.trim().toLowerCase() === repairedWord.word.trim().toLowerCase()
      );

      if (!existing) {
        currentWords.unshift(repairedWord);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setWords(currentWords);
      saveStoredWords(currentWords);
      addToast(`Đã lưu thành công ${addedCount} từ vựng mới vào kho!`, 'success');
    }
    return addedCount;
  };

  const repairDatabase = () => {
    const result = repairStoredWordsDatabase();
    if (result.changedCount > 0) {
      setWords(result.repairedWords);
      addToast(
        `Đã chuẩn hóa và sửa lỗi thành công ${result.changedCount} từ vựng (tách phiên âm, sửa loại từ & nghĩa)!`,
        'success'
      );
    } else {
      addToast('Toàn bộ từ vựng đã được chuẩn hóa chuẩn chỉnh, không có lỗi cần sửa.', 'info');
    }
    return { changedCount: result.changedCount, report: result.report };
  };

  const recordAnswer = (wordId: string, isCorrect: boolean) => {
    const targetWord = words.find((w) => w.id === wordId);
    if (!targetWord) return;

    const srsUpdate = calculateNextReview(targetWord, isCorrect);
    const updatedWords = words.map((w) =>
      w.id === wordId ? { ...w, ...srsUpdate } : w
    );
    setWords(updatedWords);
    saveStoredWords(updatedWords);

    // Record activity in daily statistics
    const updatedStats = recordActivity(1, 1, isCorrect ? 1 : 0, isCorrect ? 0 : 1);
    setStats(updatedStats);
  };

  const createDeck = (name: string, description: string, color?: string): Deck => {
    const newDeck: Deck = {
      id: 'deck_' + Date.now(),
      name,
      description,
      color: color || 'from-indigo-500 to-purple-600',
      createdAt: new Date().toISOString(),
      isDefault: false,
    };
    const updated = [...decks, newDeck];
    setDecks(updated);
    saveStoredDecks(updated);
    addToast(`Đã tạo bộ từ "${name}".`, 'success');
    return newDeck;
  };

  const updateDeck = (id: string, updates: Partial<Deck>) => {
    const updated = decks.map((d) => (d.id === id ? { ...d, ...updates } : d));
    setDecks(updated);
    saveStoredDecks(updated);

    // If deck name changed, update words that belong to this deck
    if (updates.name) {
      const updatedWords = words.map((w) =>
        w.deckId === id ? { ...w, deckName: updates.name } : w
      );
      setWords(updatedWords);
      saveStoredWords(updatedWords);
    }
    addToast('Đã cập nhật bộ từ vựng.', 'success');
  };

  const deleteDeck = (id: string) => {
    const updated = decks.filter((d) => d.id !== id);
    setDecks(updated);
    saveStoredDecks(updated);

    // Unlink words belonging to this deck
    const updatedWords = words.map((w) =>
      w.deckId === id ? { ...w, deckId: undefined, deckName: undefined } : w
    );
    setWords(updatedWords);
    saveStoredWords(updatedWords);
    addToast('Đã xóa bộ từ vựng.', 'info');
  };

  const addWordsToDeck = (wordIds: string[], deckId: string) => {
    const targetDeck = decks.find((d) => d.id === deckId);
    if (!targetDeck) return;

    const updatedWords = words.map((w) =>
      wordIds.includes(w.id) ? { ...w, deckId, deckName: targetDeck.name } : w
    );
    setWords(updatedWords);
    saveStoredWords(updatedWords);
    addToast(`Đã thêm ${wordIds.length} từ vào bộ "${targetDeck.name}".`, 'success');
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const reloadAllData = () => {
    setWords(loadStoredWords());
    setDecks(loadStoredDecks());
    setStats(loadStoredStats());
    setSettings(loadStoredSettings());
  };

  const resetAllData = () => {
    localStorage.clear();
    reloadAllData();
    addToast('Đã đặt lại dữ liệu về mặc định ban đầu.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        words,
        decks,
        stats,
        settings,
        toasts,
        addToast,
        removeToast,
        addWord,
        updateWord,
        deleteWord,
        batchAddWords,
        recordAnswer,
        createDeck,
        updateDeck,
        deleteDeck,
        addWordsToDeck,
        updateSettings,
        reloadAllData,
        resetAllData,
        repairDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
