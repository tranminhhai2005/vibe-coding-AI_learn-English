import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Settings2,
  Volume2,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Word } from '../types';
import { SpeakerButton } from '../components/SpeakerButton';
import { speakText, stopSpeaking } from '../services/speech';

export const FlashcardStudy: React.FC = () => {
  const { words, decks, recordAnswer, settings } = useApp();

  // Study setup options
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'new' | 'weak'>('all');
  const [sessionCount, setSessionCount] = useState<number | 'all'>(10);

  // Active study state
  const [studyList, setStudyList] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showIPA, setShowIPA] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Session results tracking
  const [masteredCount, setMasteredCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);

  // Filter pool words
  const eligibleWords = useMemo(() => {
    return words.filter((w) => {
      if (selectedDeckId !== 'all' && w.deckId !== selectedDeckId) return false;
      if (filterMode === 'new' && w.memoryLevel !== 'new') return false;
      if (
        filterMode === 'weak' &&
        w.incorrectCount === 0 &&
        w.memoryLevel === 'mastered'
      )
        return false;
      return true;
    });
  }, [words, selectedDeckId, filterMode]);

  // Start study session
  const startSession = () => {
    if (eligibleWords.length === 0) return;

    // Shuffle words
    const shuffled = [...eligibleWords].sort(() => Math.random() - 0.5);
    const count = sessionCount === 'all' ? shuffled.length : Math.min(sessionCount, shuffled.length);
    const selected = shuffled.slice(0, count);

    setStudyList(selected);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setMasteredCount(0);
    setLearningCount(0);
    setIsConfiguring(false);

    // Auto play audio of first word if enabled
    if (settings.autoPlayAudio && selected[0]) {
      speakText(selected[0].word);
    }
  };

  const currentWord = studyList[currentIndex];

  // Auto pronounce on next card if setting is enabled
  useEffect(() => {
    if (!isConfiguring && !isFinished && currentWord && settings.autoPlayAudio) {
      speakText(currentWord.word);
    }
    return () => stopSpeaking();
  }, [currentIndex, isConfiguring, isFinished]);

  // Handle Mark Mastered (Thuộc)
  const handleMarkMastered = () => {
    if (!currentWord) return;
    recordAnswer(currentWord.id, true);
    setMasteredCount((prev) => prev + 1);
    goToNextCard();
  };

  // Handle Mark Needs Practice (Chưa thuộc)
  const handleMarkLearning = () => {
    if (!currentWord) return;
    recordAnswer(currentWord.id, false);
    setLearningCount((prev) => prev + 1);
    goToNextCard();
  };

  const goToNextCard = () => {
    setIsFlipped(false);
    if (currentIndex + 1 < studyList.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishSession();
    }
  };

  const goToPrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finishSession = () => {
    setIsFinished(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  if (words.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <Layers className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Kho từ vựng của bạn đang trống
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Hãy thêm từ vựng mới hoặc nhập danh sách từ để bắt đầu học với Flashcard.
        </p>
      </div>
    );
  }

  // Setup Screen
  if (isConfiguring) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>Chế độ Flashcard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Cấu hình buổi học Thẻ ghi nhớ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tùy chỉnh nội dung và số lượng từ vựng bạn muốn ôn tập hôm nay.
            </p>
          </div>

          <div className="space-y-4">
            {/* Filter Deck */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Chọn bộ từ vựng
              </label>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="all">Toàn bộ kho từ vựng ({words.length} từ)</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({words.filter((w) => w.deckId === d.id).length} từ)
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Trạng thái từ vựng
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'all', label: 'Tất cả từ' },
                  { id: 'new', label: 'Chỉ từ mới' },
                  { id: 'weak', label: 'Từ chưa thuộc' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilterMode(item.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                      filterMode === item.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Count */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Số lượng từ trong buổi học
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[10, 20, 30, 'all'].map((cnt) => (
                  <button
                    key={cnt.toString()}
                    type="button"
                    onClick={() => setSessionCount(cnt as any)}
                    className={`py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                      sessionCount === cnt
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cnt === 'all' ? 'Tất cả' : `${cnt} từ`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Có <strong>{eligibleWords.length}</strong> từ phù hợp điều kiện
            </span>

            <button
              onClick={startSession}
              disabled={eligibleWords.length === 0}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Bắt đầu học
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (isFinished) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Xuất sắc! Bạn đã hoàn thành buổi học!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dữ liệu ghi nhớ và chu kỳ ôn tập ngắt quãng đã được cập nhật thành công.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              Đã thuộc
            </span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {masteredCount}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
              Cần ôn thêm
            </span>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {learningCount}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsConfiguring(true)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
          >
            Đổi bộ từ khác
          </button>
          <button
            onClick={startSession}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25"
          >
            Học lại bộ này
          </button>
        </div>
      </div>
    );
  }

  // Active Flashcard Screen
  const progressPercent = Math.round(((currentIndex + 1) / studyList.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header: Progress & Controls */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
        <button
          onClick={() => setIsConfiguring(true)}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Thoát buổi học
        </button>

        <span className="text-slate-600 dark:text-slate-400 font-mono">
          {currentIndex + 1} / {studyList.length} từ
        </span>

        <button
          onClick={() => setShowIPA(!showIPA)}
          className="text-brand-600 dark:text-brand-400 flex items-center gap-1"
          title={showIPA ? 'Ẩn phiên âm' : 'Hiện phiên âm'}
        >
          {showIPA ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showIPA ? 'Ẩn IPA' : 'Hiện IPA'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-brand-500 transition-all duration-300 rounded-full"
        />
      </div>

      {/* 3D Flip Flashcard */}
      <div
        className="w-full h-[380px] perspective-1000 cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`w-full h-full relative preserve-3d transition-transform duration-500 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front: English Word */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between items-center text-center">
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">{currentWord?.deckName || 'Từ vựng'}</span>
              <SpeakerButton text={currentWord?.word || ''} size="md" />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {currentWord?.word}
              </h2>

              {showIPA && currentWord?.ipa && (
                <p className="text-lg font-mono text-brand-600 dark:text-brand-400">
                  {currentWord.ipa}
                </p>
              )}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5 animate-pulse">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Nhấn vào thẻ để lật xem nghĩa tiếng Việt</span>
            </div>
          </div>

          {/* Card Back: Vietnamese Meaning & Examples */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-b from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-3xl p-8 border border-brand-200 dark:border-slate-800 shadow-xl flex flex-col justify-between items-center text-center">
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold uppercase">
                {currentWord?.partOfSpeech}
              </span>
              <SpeakerButton text={currentWord?.word || ''} size="md" />
            </div>

            <div className="space-y-4 max-w-md">
              <h3 className="text-3xl font-black text-brand-600 dark:text-brand-400">
                {currentWord?.meaning}
              </h3>

              {currentWord?.example && (
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-left space-y-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 italic">
                    "{currentWord.example}"
                  </p>
                  {currentWord.exampleMeaning && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      → {currentWord.exampleMeaning}
                    </p>
                  )}
                </div>
              )}
            </div>

            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Nhấn thẻ để lật lại mặt trước
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Mark Result & Navigation */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleMarkLearning}
            className="py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 font-bold text-sm border border-amber-200 dark:border-amber-800 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <XCircle className="w-5 h-5 text-amber-500" />
            Chưa thuộc (Cần ôn)
          </button>

          <button
            onClick={handleMarkMastered}
            className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            Đã thuộc (Nhớ rõ)
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={goToPrevCard}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Từ trước
          </button>

          <button
            onClick={goToNextCard}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
          >
            Bỏ qua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
