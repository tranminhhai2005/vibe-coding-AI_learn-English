import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  Volume2,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { QuizQuestion, QuizResult, QuizType } from '../types';
import { generateQuizQuestions } from '../services/quizGenerator';
import { SpeakerButton } from '../components/SpeakerButton';
import { speakText, stopSpeaking } from '../services/speech';

export const QuizPractice: React.FC = () => {
  const { words, decks, recordAnswer, settings } = useApp();

  // Setup options
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [countMode, setCountMode] = useState<string>('10');
  const [customCount, setCustomCount] = useState<string>('20');
  const [enableTimer, setEnableTimer] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<QuizType[]>([
    'en_to_vi',
    'vi_to_en',
    'audio_to_en',
    'fill_blank',
  ]);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  // Eligible pool words
  const eligibleWords = selectedDeckId === 'all'
    ? words
    : words.filter((w) => w.deckId === selectedDeckId);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (!isConfiguring && !isFinished && enableTimer && !hasSubmittedAnswer) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConfiguring, isFinished, enableTimer, hasSubmittedAnswer, currentIndex]);

  const handleTimeOut = () => {
    if (!hasSubmittedAnswer && questions[currentIndex]) {
      handleSelectOption('__TIMEOUT__');
    }
  };

  // Calculate effective question count
  const getEffectiveCount = (): number => {
    if (eligibleWords.length === 0) return 0;
    if (countMode === 'all') {
      return eligibleWords.length;
    }
    if (countMode === 'custom') {
      const parsed = parseInt(String(customCount), 10);
      if (isNaN(parsed) || parsed < 1) return 1;
      return parsed;
    }
    return Number(countMode) || 10;
  };

  const adjustCustomCount = (delta: number) => {
    const current = parseInt(String(customCount), 10) || 1;
    const next = Math.max(1, current + delta);
    setCustomCount(String(next));
  };

  const handleCustomCountBlur = () => {
    const val = parseInt(String(customCount), 10);
    if (isNaN(val) || val < 1) {
      setCustomCount('1');
    } else {
      setCustomCount(String(val));
    }
  };

  // Start Quiz
  const startQuiz = (customPool?: QuizQuestion[]) => {
    if (customPool) {
      setQuestions(customPool);
    } else {
      if (words.length < 4 || eligibleWords.length === 0) return;
      const count = getEffectiveCount();
      if (count <= 0) return;
      const genQuestions = generateQuizQuestions(
        eligibleWords,
        words,
        count,
        selectedTypes
      );
      if (genQuestions.length === 0) return;
      setQuestions(genQuestions);
    }

    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setResults([]);
    setIsFinished(false);
    setSecondsLeft(30);
    setIsConfiguring(false);

    // If first question is audio, play it
    const firstQ = customPool ? customPool[0] : undefined;
    if (firstQ?.audioWord) {
      speakText(firstQ.audioWord);
    }
  };

  const currentQ = questions[currentIndex];

  // Play audio on question change if audio type
  useEffect(() => {
    if (!isConfiguring && !isFinished && currentQ?.audioWord && currentQ.type === 'audio_to_en') {
      speakText(currentQ.audioWord);
    }
    return () => stopSpeaking();
  }, [currentIndex, isConfiguring, isFinished]);

  // Select Option
  const handleSelectOption = (opt: string) => {
    if (hasSubmittedAnswer || !currentQ) return;

    setSelectedOption(opt);
    setHasSubmittedAnswer(true);

    const isCorrect = opt === currentQ.correctAnswer;

    // Record progress
    recordAnswer(currentQ.word.id, isCorrect);

    const resultEntry: QuizResult = {
      questionId: currentQ.id,
      wordId: currentQ.word.id,
      word: currentQ.word.word,
      meaning: currentQ.word.meaning,
      selectedAnswer: opt === '__TIMEOUT__' ? 'Hết giờ làm bài' : opt,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
    };

    setResults((prev) => [...prev, resultEntry]);

    // Speak audio for reinforcement
    speakText(currentQ.word.word);
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
      setSecondsLeft(30);
    } else {
      setIsFinished(true);
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // Toggle quiz types in setup
  const toggleType = (t: QuizType) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((x) => x !== t));
      }
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  // Guard: Not enough words in bank
  if (words.length < 4) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm animate-fade-in">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Chưa đủ từ vựng để tạo bài trắc nghiệm
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Hệ thống cần tối thiểu <strong>4 từ vựng</strong> trong kho để tạo 4 phương án ngẫu nhiên hợp lý. Vui lòng thêm từ mới hoặc tải ảnh trích xuất OCR để tiếp tục.
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
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Trắc nghiệm tương tác</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Cấu hình bài tập Trắc nghiệm
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Chọn dạng câu hỏi và số lượng để kiểm tra toàn diện khả năng ghi nhớ.
            </p>
          </div>

          <div className="space-y-4">
            {/* Deck */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Bộ từ vựng cần kiểm tra
              </label>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="all">Toàn bộ kho từ ({words.length} từ)</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({words.filter((w) => w.deckId === d.id).length} từ)
                  </option>
                ))}
              </select>
            </div>

            {/* Quiz Types Multi-select */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Các dạng bài tập (Chọn ít nhất 1 dạng)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'en_to_vi', label: '1. Tiếng Anh → Chọn nghĩa tiếng Việt' },
                  { id: 'vi_to_en', label: '2. Tiếng Việt → Chọn từ tiếng Anh' },
                  { id: 'audio_to_en', label: '3. Nghe phát âm → Chọn từ đúng' },
                  { id: 'fill_blank', label: '4. Điền từ còn thiếu vào câu' },
                ].map((item) => {
                  const isChecked = selectedTypes.includes(item.id as QuizType);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleType(item.id as QuizType)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Count & Timer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Số lượng câu hỏi
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Kho: {eligibleWords.length} từ
                  </span>
                </div>
                <select
                  value={countMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setCountMode(mode);
                    if (mode !== 'custom' && mode !== 'all') {
                      setCustomCount(mode);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="5">5 câu</option>
                  <option value="10">10 câu</option>
                  <option value="15">15 câu</option>
                  <option value="20">20 câu</option>
                  <option value="30">30 câu</option>
                  <option value="50">50 câu</option>
                  <option value="all">Toàn bộ kho ({eligibleWords.length} câu)</option>
                  <option value="custom">✏️ Tùy chỉnh số câu...</option>
                </select>

                {countMode === 'custom' && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-brand-200 dark:border-brand-900/60 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Nhập số câu muốn làm:</span>
                      <button
                        type="button"
                        onClick={() => setCustomCount(String(eligibleWords.length))}
                        className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      >
                        Tối đa ({eligibleWords.length})
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustCustomCount(-5)}
                        className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                        title="Giảm 5 câu"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustCustomCount(-1)}
                        className="w-8 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                        title="Giảm 1 câu"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={customCount}
                        onChange={(e) => setCustomCount(e.target.value)}
                        onBlur={handleCustomCountBlur}
                        className="flex-1 min-w-0 text-center py-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Số câu"
                      />
                      <button
                        type="button"
                        onClick={() => adjustCustomCount(1)}
                        className="w-8 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                        title="Tăng 1 câu"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustCustomCount(5)}
                        className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                        title="Tăng 5 câu"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Giới hạn thời gian
                </label>
                <button
                  type="button"
                  onClick={() => setEnableTimer(!enableTimer)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    enableTimer
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{enableTimer ? 'Bật (30s / câu)' : 'Không giới hạn'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {eligibleWords.length === 0 ? (
                <span className="text-rose-500 font-semibold">Chưa có từ vựng nào trong bộ này</span>
              ) : (
                <span>
                  Bài tập gồm <strong className="text-brand-600 dark:text-brand-400 font-bold">{getEffectiveCount()} câu hỏi</strong>
                </span>
              )}
            </span>

            <button
              onClick={() => startQuiz()}
              disabled={eligibleWords.length === 0 || getEffectiveCount() === 0}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (isFinished) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const wrongCount = results.length - correctCount;
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
    const wrongQuestions = questions.filter((q) =>
      results.some((r) => r.questionId === q.id && !r.isCorrect)
    );

    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Kết quả bài trắc nghiệm
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bạn đã trả lời đúng <strong className="text-emerald-600 font-bold">{correctCount}</strong> / {results.length} câu ({accuracy}%)
          </p>
        </div>

        {/* Detailed Results List */}
        <div className="text-left space-y-2 max-h-56 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Chi tiết các câu hỏi:</p>
          {results.map((res, i) => (
            <div
              key={res.questionId}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Câu {i + 1}: {res.word}
                </span>
                <p className="text-slate-500 dark:text-slate-400">
                  Bạn chọn: <span className={res.isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>{res.selectedAnswer}</span>
                  {!res.isCorrect && (
                    <span className="text-emerald-600 ml-2">→ Đúng: {res.correctAnswer}</span>
                  )}
                </p>
              </div>
              {res.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {wrongQuestions.length > 0 && (
            <button
              onClick={() => startQuiz(wrongQuestions)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại {wrongQuestions.length} câu sai
            </button>
          )}

          <button
            onClick={() => setIsConfiguring(true)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
          >
            Đổi đề mới
          </button>
        </div>
      </div>
    );
  }

  // Active Question
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
        <button
          onClick={() => setIsConfiguring(true)}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          ← Dừng làm bài
        </button>

        <span className="text-slate-600 dark:text-slate-400 font-mono">
          Câu {currentIndex + 1} / {questions.length}
        </span>

        {enableTimer && (
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs font-bold ${
              secondsLeft <= 5
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{secondsLeft}s</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-brand-500 transition-all duration-300 rounded-full"
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-3 text-center">
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            {currentQ?.type === 'en_to_vi'
              ? 'Tiếng Anh → Tiếng Việt'
              : currentQ?.type === 'vi_to_en'
              ? 'Tiếng Việt → Tiếng Anh'
              : currentQ?.type === 'audio_to_en'
              ? 'Nghe âm thanh → Chọn từ'
              : 'Điền từ vào chỗ trống'}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {currentQ?.prompt}
          </h2>

          {currentQ?.subPrompt && (
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 whitespace-pre-line">
              {currentQ.subPrompt}
            </p>
          )}

          {currentQ?.audioWord && (
            <div className="pt-2 flex justify-center">
              <SpeakerButton text={currentQ.audioWord} size="lg" />
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ?.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            let optionClass = 'border-slate-200 dark:border-slate-800 hover:border-brand-400 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200';

            if (hasSubmittedAnswer) {
              if (option === currentQ.correctAnswer) {
                optionClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20';
              } else if (option === selectedOption) {
                optionClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
              } else {
                optionClass = 'opacity-40 border-slate-200 dark:border-slate-800';
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={hasSubmittedAnswer}
                onClick={() => handleSelectOption(option)}
                className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center gap-3 active:scale-98 ${optionClass}`}
              >
                <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black flex-shrink-0">
                  {letter}
                </span>
                <span className="flex-1 leading-snug">{option}</span>
                {hasSubmittedAnswer && option === currentQ.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                )}
                {hasSubmittedAnswer && option === selectedOption && option !== currentQ.correctAnswer && (
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Post Submit Feedback & Next Button */}
        {hasSubmittedAnswer && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-slide-up">
            <div
              className={`p-4 rounded-2xl text-xs space-y-1 ${
                selectedOption === currentQ?.correctAnswer
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <p className="font-bold">
                {selectedOption === currentQ?.correctAnswer
                  ? 'Đúng rồi! 🎉'
                  : selectedOption === '__TIMEOUT__'
                  ? 'Hết giờ làm bài! ⏰'
                  : 'Chưa chính xác!'}
              </p>
              <p className="leading-relaxed">{currentQ?.explanation}</p>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả tổng kết'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
