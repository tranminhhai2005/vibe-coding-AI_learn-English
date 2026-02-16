import React, { useState, useMemo } from 'react';
import {
  PenTool,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Volume2,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Word } from '../types';
import { SpeakerButton } from '../components/SpeakerButton';
import { speakText } from '../services/speech';
import { isEnglishWordMatch, isVietnameseMeaningMatch } from '../utils/textUtils';

export const WritingPractice: React.FC = () => {
  const { words, decks, recordAnswer, settings } = useApp();

  // Mode: 'en_to_vi' | 'vi_to_en'
  const [direction, setDirection] = useState<'en_to_vi' | 'vi_to_en'>('en_to_vi');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [isStudying, setIsStudying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Active question session
  const [questionList, setQuestionList] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isCloseMatch, setIsCloseMatch] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0 = no hint, 1 = character count, 2 = first letter

  // Results tracking
  const [correctList, setCorrectList] = useState<Word[]>([]);
  const [wrongList, setWrongList] = useState<Word[]>([]);

  // Eligible pool words
  const eligibleWords = useMemo(() => {
    return words.filter((w) => {
      if (selectedDeckId !== 'all' && w.deckId !== selectedDeckId) return false;
      return true;
    });
  }, [words, selectedDeckId]);

  // Start Session
  const startSession = (retryList?: Word[]) => {
    const pool = retryList || eligibleWords;
    if (pool.length === 0) return;

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 15);
    setQuestionList(shuffled);
    setCurrentIndex(0);
    setUserAnswer('');
    setHasChecked(false);
    setHintLevel(0);
    setCorrectList([]);
    setWrongList([]);
    setIsFinished(false);
    setIsStudying(true);

    if (direction === 'en_to_vi' && settings.autoPlayAudio && shuffled[0]) {
      speakText(shuffled[0].word);
    }
  };

  const currentWord = questionList[currentIndex];

  // Check Answer
  const handleCheckAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentWord || hasChecked || !userAnswer.trim()) return;

    let correct = false;
    let close = false;

    if (direction === 'en_to_vi') {
      correct = isVietnameseMeaningMatch(
        userAnswer,
        currentWord.meaning,
        currentWord.acceptableMeanings
      );
    } else {
      const matchRes = isEnglishWordMatch(userAnswer, currentWord.word);
      correct = matchRes.isMatch;
      close = matchRes.isClose;
    }

    setIsAnswerCorrect(correct);
    setIsCloseMatch(close);
    setHasChecked(true);

    // Record SRS progress
    recordAnswer(currentWord.id, correct);

    if (correct) {
      setCorrectList((prev) => [...prev, currentWord]);
    } else {
      setWrongList((prev) => [...prev, currentWord]);
    }

    // Pronounce English word after answering
    speakText(currentWord.word);
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questionList.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setUserAnswer('');
      setHasChecked(false);
      setIsCloseMatch(false);
      setHintLevel(0);

      if (direction === 'en_to_vi' && settings.autoPlayAudio && questionList[nextIdx]) {
        speakText(questionList[nextIdx].word);
      }
    } else {
      setIsFinished(true);
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // Hint Generator for vi_to_en
  const renderHint = () => {
    if (!currentWord) return null;
    const target = currentWord.word;

    if (hintLevel === 1) {
      // Show letter slots
      const slots = target
        .split('')
        .map((c) => (c === ' ' ? '   ' : '_'))
        .join(' ');
      return (
        <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
          Gợi ý số ký tự: {slots} ({target.length} chữ cái)
        </p>
      );
    }
    if (hintLevel >= 2) {
      // Show first letter
      const firstLetter = target.charAt(0);
      const rest = target
        .slice(1)
        .split('')
        .map((c) => (c === ' ' ? ' ' : '_'))
        .join(' ');
      return (
        <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
          Gợi ý chữ cái đầu: {firstLetter} {rest}
        </p>
      );
    }
    return null;
  };

  if (words.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <PenTool className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Kho từ vựng của bạn đang trống
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Hãy bổ sung thêm từ vựng để bắt đầu luyện viết hai chiều.
        </p>
      </div>
    );
  }

  // Setup Screen
  if (!isStudying) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold">
              <PenTool className="w-3.5 h-3.5" />
              <span>Luyện viết 2 chiều</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Chọn hướng kiểm tra từ vựng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Rèn luyện phản xạ ngôn ngữ và độ chính xác chính tả qua bài tập gõ trực tiếp.
            </p>
          </div>

          {/* Direction Choice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setDirection('en_to_vi')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                direction === 'en_to_vi'
                  ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                  Anh → Việt
                </span>
                {direction === 'en_to_vi' && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Xem từ tiếng Anh và gõ nghĩa tiếng Việt tương ứng.
              </p>
            </button>

            <button
              onClick={() => setDirection('vi_to_en')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                direction === 'vi_to_en'
                  ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                  Việt → Anh
                </span>
                {direction === 'vi_to_en' && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Xem nghĩa tiếng Việt và gõ chính xác từ tiếng Anh.
              </p>
            </button>
          </div>

          {/* Deck select */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Bộ từ vựng
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

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Sẵn sàng luyện tập với <strong>{eligibleWords.length}</strong> từ
            </span>

            <button
              onClick={() => startSession()}
              disabled={eligibleWords.length === 0}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              Bắt đầu luyện viết
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Finished Results Screen
  if (isFinished) {
    const accuracy =
      questionList.length > 0
        ? Math.round((correctList.length / questionList.length) * 100)
        : 0;

    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Kết quả bài luyện viết
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Độ chính xác: <strong className="text-brand-600 font-bold">{accuracy}%</strong> ({correctList.length}/{questionList.length} câu đúng)
          </p>
        </div>

        {wrongList.length > 0 && (
          <div className="text-left space-y-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold text-rose-500 uppercase">
              Các từ cần ôn lại ({wrongList.length} từ):
            </p>
            {wrongList.map((w) => (
              <div key={w.id} className="text-xs flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0">
                <span className="font-bold text-slate-900 dark:text-slate-100">{w.word}</span>
                <span className="text-slate-500 dark:text-slate-400">{w.meaning}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {wrongList.length > 0 && (
            <button
              onClick={() => startSession(wrongList)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại các câu sai ({wrongList.length})
            </button>
          )}

          <button
            onClick={() => setIsStudying(false)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
          >
            Đổi chế độ khác
          </button>

          <button
            onClick={() => startSession()}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md"
          >
            Làm đề mới
          </button>
        </div>
      </div>
    );
  }

  // Active Practice Question Screen
  const progressPercent = Math.round(((currentIndex + 1) / questionList.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
        <button
          onClick={() => setIsStudying(false)}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          ← Dừng buổi học
        </button>

        <span className="text-slate-600 dark:text-slate-400 font-mono">
          Câu {currentIndex + 1} / {questionList.length}
        </span>

        <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-xs">
          {direction === 'en_to_vi' ? 'Anh → Việt' : 'Việt → Anh'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-brand-500 transition-all duration-300 rounded-full"
        />
      </div>

      {/* Prompt Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {direction === 'en_to_vi' ? 'Dịch từ tiếng Anh sau sang tiếng Việt' : 'Nhập từ tiếng Anh tương ứng'}
          </span>

          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
              {direction === 'en_to_vi' ? currentWord?.word : currentWord?.meaning}
            </h2>
            {direction === 'en_to_vi' && (
              <SpeakerButton text={currentWord?.word || ''} size="md" />
            )}
          </div>

          {direction === 'en_to_vi' && currentWord?.ipa && (
            <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
              {currentWord.ipa}
            </p>
          )}

          {currentWord?.example && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic max-w-md mx-auto">
              "{currentWord.example}"
            </p>
          )}
        </div>

        {/* Optional Hint for vi_to_en */}
        {direction === 'vi_to_en' && (
          <div className="space-y-2">
            {renderHint()}
            {!hasChecked && hintLevel < 2 && (
              <button
                type="button"
                onClick={() => setHintLevel((prev) => prev + 1)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {hintLevel === 0 ? 'Hiện gợi ý ký tự' : 'Hiện thêm chữ cái đầu'}
              </button>
            )}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleCheckAnswer} className="space-y-4 max-w-md mx-auto">
          <div>
            <input
              type="text"
              autoFocus
              disabled={hasChecked}
              placeholder={
                direction === 'en_to_vi'
                  ? 'Gõ nghĩa tiếng Việt của từ...'
                  : 'Gõ từ tiếng Anh...'
              }
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={`w-full px-5 py-3.5 rounded-2xl border text-center font-bold text-base sm:text-lg transition-all focus:outline-none focus:ring-2 ${
                hasChecked
                  ? isAnswerCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-brand-500'
              }`}
            />
          </div>

          {!hasChecked ? (
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-95"
            >
              Kiểm tra đáp án (Enter)
            </button>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {/* Feedback box */}
              <div
                className={`p-4 rounded-2xl border text-left space-y-1.5 ${
                  isAnswerCorrect
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isAnswerCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Chính xác! Rất tuyệt vời.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>
                        {isCloseMatch ? 'Gần đúng rồi! Hãy chú ý chính tả:' : 'Chưa chính xác!'}
                      </span>
                    </>
                  )}
                </div>

                <div className="text-xs pt-1">
                  <p>
                    <strong>Đáp án đúng:</strong>{' '}
                    <span className="font-bold underline">
                      {direction === 'en_to_vi' ? currentWord?.meaning : currentWord?.word}
                    </span>
                  </p>
                  {direction === 'en_to_vi' &&
                    currentWord?.acceptableMeanings &&
                    currentWord.acceptableMeanings.length > 0 && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Các nghĩa khác được chấp nhận: {currentWord.acceptableMeanings.join(', ')}
                      </p>
                    )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
