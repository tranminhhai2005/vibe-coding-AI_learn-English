import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Sliders,
  Play,
  HelpCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Word } from '../types';
import {
  getAvailableVoices,
  isSpeechRecognitionSupported,
  speakText,
  startSpeechRecognition,
} from '../services/speech';
import { cleanString, isEnglishWordMatch } from '../utils/textUtils';

export const ListeningPractice: React.FC = () => {
  const { words, settings, updateSettings, recordAnswer, addToast } = useApp();

  // Mode: 'dictation' (Nghe & gõ lại) | 'pronounce' (Luyện đọc bằng mic)
  const [mode, setMode] = useState<'dictation' | 'pronounce'>('dictation');

  // Voices list
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechRate, setSpeechRate] = useState<number>(settings.speechRate || 1.0);

  // Active word
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyPool, setStudyPool] = useState<Word[]>([]);

  // Dictation state
  const [userInput, setUserInput] = useState('');
  const [hasCheckedDictation, setHasCheckedDictation] = useState(false);
  const [isDictationCorrect, setIsDictationCorrect] = useState(false);

  // Pronunciation practice state (Microphone)
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedTranscript, setRecognizedTranscript] = useState('');
  const [hasCheckedSpeech, setHasCheckedSpeech] = useState(false);
  const [isSpeechMatch, setIsSpeechMatch] = useState(false);
  const [speechController, setSpeechController] = useState<{ stop: () => void } | null>(null);

  // Load voices
  useEffect(() => {
    getAvailableVoices().then((v) => {
      setVoices(v.filter((x) => x.lang.startsWith('en')));
    }).catch((error: unknown) => {
      console.warn('[Speech] Unable to load voices:', error);
    });
  }, []);

  // Initialize pool
  useEffect(() => {
    if (words.length > 0) {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setStudyPool(shuffled);
      setCurrentIndex(0);
      resetQuestion();
    }
  }, [words]);

  const currentWord = studyPool[currentIndex];

  const resetQuestion = () => {
    setUserInput('');
    setHasCheckedDictation(false);
    setIsDictationCorrect(false);
    setRecognizedTranscript('');
    setHasCheckedSpeech(false);
    setIsSpeechMatch(false);
    if (speechController) {
      speechController.stop();
      setSpeechController(null);
      setIsRecording(false);
    }
  };

  // Play audio of current word
  const playAudio = (rateMultiplier: number = 1.0) => {
    if (!currentWord) return;
    speakText(currentWord.word, {
      rate: speechRate * rateMultiplier,
      voiceURI: settings.speechVoiceURI,
    });
  };

  // Play example sentence
  const playExample = () => {
    if (!currentWord?.example) return;
    speakText(currentWord.example, {
      rate: speechRate,
      voiceURI: settings.speechVoiceURI,
    });
  };

  // Check Dictation Answer
  const handleCheckDictation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || hasCheckedDictation || !userInput.trim()) return;

    const match = isEnglishWordMatch(userInput, currentWord.word);
    setIsDictationCorrect(match.isMatch);
    setHasCheckedDictation(true);

    recordAnswer(currentWord.id, match.isMatch);
    playAudio();
  };

  // Toggle Microphone for Pronunciation
  const handleToggleMic = () => {
    if (!isSpeechRecognitionSupported()) {
      addToast(
        'Trình duyệt của bạn không hỗ trợ Speech Recognition API. Vui lòng mở trang trên Google Chrome hoặc Microsoft Edge.',
        'error'
      );
      return;
    }

    if (isRecording) {
      if (speechController) speechController.stop();
      setIsRecording(false);
      return;
    }

    setRecognizedTranscript('');
    setHasCheckedSpeech(false);
    setIsRecording(true);

    const controller = startSpeechRecognition('en-US', {
      onResult: (transcript) => {
        setRecognizedTranscript(transcript);
        const match = isEnglishWordMatch(transcript, currentWord.word);
        setIsSpeechMatch(match.isMatch);
        setHasCheckedSpeech(true);
        setIsRecording(false);

        if (match.isMatch) {
          addToast('Tuyệt vời! Bạn đã phát âm chính xác từ tiếng Anh này.', 'success');
        }
      },
      onError: (err) => {
        setIsRecording(false);
        addToast(
          'Không thể ghi âm hoặc không nhận diện được giọng nói: ' + err,
          'error'
        );
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    setSpeechController(controller);
  };

  // Next Word
  const handleNextWord = () => {
    if (currentIndex + 1 < studyPool.length) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestion();
    } else {
      // Loop or restart
      setCurrentIndex(0);
      resetQuestion();
      addToast('Bạn đã hoàn thành danh sách từ trong lượt này!', 'info');
    }
  };

  if (words.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <Headphones className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Chưa có từ vựng trong kho
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Hãy thêm từ vựng để bắt đầu luyện nghe và phát âm.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1">
              <Headphones className="w-3.5 h-3.5" />
              <span>Luyện nghe & Phát âm Web Speech API</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Rèn luyện phản xạ thính giác & Phát âm
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => {
                setMode('dictation');
                resetQuestion();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'dictation'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Nghe & Gõ lại (Dictation)
            </button>
            <button
              onClick={() => {
                setMode('pronounce');
                resetQuestion();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'pronounce'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tập đọc qua Mic
            </button>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Giọng đọc phụ thuộc bộ giọng nói trên điện thoại. Nhận diện phát âm qua mic dùng dịch vụ
          nhận dạng của hệ thống và có thể cần Internet hoặc gói ngôn ngữ đã cài.
        </p>

        {/* Audio controls bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Tốc độ đọc:</span>
            {[0.75, 0.9, 1.0, 1.2].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  setSpeechRate(spd);
                  updateSettings({ speechRate: spd });
                }}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  Math.abs(speechRate - spd) < 0.05
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {voices.length > 0 && (
            <select
              value={settings.speechVoiceURI}
              onChange={(e) => updateSettings({ speechVoiceURI: e.target.value })}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs max-w-[200px] truncate"
            >
              <option value="">Giọng đọc mặc định hệ thống</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Interactive Listening Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
          <span>Từ số {currentIndex + 1} / {studyPool.length}</span>
          <span className="text-brand-600">{currentWord?.partOfSpeech}</span>
        </div>

        {/* Audio Player Controls */}
        <div className="space-y-4 py-4">
          <button
            type="button"
            onClick={() => playAudio(1.0)}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all glow-primary"
            title="Nhấn để nghe phát âm từ vựng"
          >
            <Volume2 className="w-10 h-10" />
          </button>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => playAudio(0.7)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors"
            >
              Nghe chậm (0.7x)
            </button>

            {currentWord?.example && (
              <button
                onClick={playExample}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-brand-600 dark:text-brand-400 transition-colors"
              >
                Nghe câu ví dụ
              </button>
            )}
          </div>
        </div>

        {/* MODE 1: DICTATION (Nghe & gõ lại) */}
        {mode === 'dictation' && (
          <form onSubmit={handleCheckDictation} className="space-y-4 max-w-md mx-auto">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Hãy nghe và nhập lại từ tiếng Anh bạn vừa nghe được:
              </p>
              <input
                type="text"
                autoFocus
                disabled={hasCheckedDictation}
                placeholder="Nhập từ tiếng Anh..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-2xl border text-center font-bold text-base transition-all focus:outline-none focus:ring-2 ${
                  hasCheckedDictation
                    ? isDictationCorrect
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-brand-500'
                }`}
              />
            </div>

            {!hasCheckedDictation ? (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all"
              >
                Kiểm tra từ vừa gõ
              </button>
            ) : (
              <div className="space-y-3 animate-slide-up">
                <div
                  className={`p-4 rounded-2xl text-left text-xs space-y-1.5 ${
                    isDictationCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <p className="font-bold text-sm">
                    {isDictationCorrect ? 'Chính xác! 👏' : 'Chưa đúng chính tả!'}
                  </p>
                  <p>
                    Từ đúng: <strong className="text-sm underline">{currentWord?.word}</strong>{' '}
                    {currentWord?.ipa && `(${currentWord.ipa})`}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Nghĩa: {currentWord?.meaning}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextWord}
                  className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Từ tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        )}

        {/* MODE 2: PRONUNCIATION VIA MIC */}
        {mode === 'pronounce' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Từ cần đọc phát âm:
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {currentWord?.word}
              </h3>
              {currentWord?.ipa && (
                <p className="text-sm font-mono text-brand-600 dark:text-brand-400">
                  {currentWord.ipa}
                </p>
              )}
            </div>

            {/* Mic Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 scale-110'
                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 active:scale-95'
                }`}
                title={isRecording ? 'Đang lắng nghe... Nhấn để dừng' : 'Nhấn để bắt đầu đọc'}
              >
                {isRecording ? <Mic className="w-8 h-8 animate-bounce" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {isRecording ? 'Đang lắng nghe giọng của bạn...' : 'Nhấn biểu tượng mic và đọc to từ tiếng Anh'}
              </p>
            </div>

            {/* Mic recognition result */}
            {hasCheckedSpeech && (
              <div
                className={`p-4 rounded-2xl text-left text-xs space-y-1.5 animate-slide-up ${
                  isSpeechMatch
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <p className="font-bold text-sm">
                  {isSpeechMatch ? 'Phát âm rất tốt! 🎉' : 'Chưa nhận diện đúng phát âm!'}
                </p>
                <p>
                  Hệ thống nhận diện được: "<strong>{recognizedTranscript || '(Không rõ)'}</strong>"
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lưu ý: Độ nhận diện phụ thuộc chất lượng micro và khả năng hỗ trợ Web Speech của trình duyệt.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextWord}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Chuyển sang từ tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
