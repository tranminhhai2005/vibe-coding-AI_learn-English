import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakerButton } from '../components/SpeakerButton';
import { isDueForReview, isWeakWord } from '../services/spacedRepetition';
import { Word } from '../types';

export const SmartReview: React.FC = () => {
  const navigate = useNavigate();
  const { words, recordAnswer } = useApp();

  // Filter tab: 'due' | 'weak' | 'new' | 'mastered' | 'all'
  const [filterTab, setFilterTab] = useState<'due' | 'weak' | 'new' | 'mastered' | 'all'>('due');

  // Leitner distribution
  const boxes = useMemo(() => {
    const b: Record<number, Word[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    words.forEach((w) => {
      const boxNum = Math.min(5, Math.max(1, w.leitnerBox || 1));
      b[boxNum].push(w);
    });
    return b;
  }, [words]);

  // Words based on active tab
  const filteredWords = useMemo(() => {
    switch (filterTab) {
      case 'due':
        return words.filter((w) => isDueForReview(w));
      case 'weak':
        return words.filter(isWeakWord);
      case 'new':
        return words.filter((w) => w.memoryLevel === 'new');
      case 'mastered':
        return words.filter((w) => w.memoryLevel === 'mastered');
      case 'all':
      default:
        return words.filter((w) => isDueForReview(w) || isWeakWord(w));
    }
  }, [words, filterTab]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thuật toán Lặp lại ngắt quãng (Leitner SRS)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Hệ thống Ôn tập Thông minh
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Từ vựng được tự động phân vào 5 Hộp ghi nhớ dựa trên kết quả trả lời của bạn.
              Từ trả lời sai sẽ quay về Hộp 1 để ưu tiên ôn tập, từ trả lời đúng sẽ tăng dần khoảng cách ngày ôn.
            </p>
          </div>

          <button
            onClick={() => navigate('/flashcard')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
          >
            <Layers className="w-4 h-4" />
            Ôn tập bằng Flashcard ngay
          </button>
        </div>

        {/* Leitner Box Progress Flow */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Phân bố 5 Hộp ghi nhớ Leitner:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { box: 1, label: 'Hộp 1 (Mỗi ngày)', interval: '1 ngày', count: boxes[1].length, color: 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' },
              { box: 2, label: 'Hộp 2 (Khá yếu)', interval: '3 ngày', count: boxes[2].length, color: 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
              { box: 3, label: 'Hộp 3 (Trung bình)', interval: '7 ngày', count: boxes[3].length, color: 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' },
              { box: 4, label: 'Hộp 4 (Ghi nhớ tốt)', interval: '14 ngày', count: boxes[4].length, color: 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' },
              { box: 5, label: 'Hộp 5 (Thành thạo)', interval: '30 ngày', count: boxes[5].length, color: 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
            ].map((item) => (
              <div
                key={item.box}
                className={`p-3.5 rounded-2xl border ${item.color} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Hộp {item.box}</span>
                    <span className="text-[10px] opacity-80">{item.interval}</span>
                  </div>
                  <p className="text-2xl font-black mt-2">{item.count}</p>
                </div>
                <span className="text-[11px] opacity-75 mt-1">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Filter Tabs & List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Danh sách từ trong hàng đợi ôn tập
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hiện có {filteredWords.length} từ phù hợp với tiêu chí lựa chọn.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { id: 'due', label: 'Đến hạn ôn hôm nay' },
              { id: 'weak', label: 'Từ hay làm sai' },
              { id: 'new', label: 'Từ mới học' },
              { id: 'mastered', label: 'Đã thuộc' },
              { id: 'all', label: 'Tất cả cần ôn' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Word Cards List */}
        {filteredWords.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Không có từ nào trong danh mục này!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Bạn đã ôn tập rất tốt hoặc chưa có từ nào bị trễ hạn. Hãy chuyển tab khác để xem tiếp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredWords.map((word) => {
              const reviewDue = isDueForReview(word);

              return (
                <div
                  key={word.id}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        Hộp {word.leitnerBox} / 5
                      </span>
                      {reviewDue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                          Đến hạn
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {word.word}
                      </h4>
                      <SpeakerButton text={word.word} size="sm" />
                    </div>

                    {word.ipa && (
                      <p className="text-xs font-mono text-slate-400">{word.ipa}</p>
                    )}

                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {word.meaning}
                    </p>

                    {word.example && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                        "{word.example}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Đúng: <strong className="text-emerald-500">{word.correctCount}</strong> / Sai:{' '}
                      <strong className="text-rose-500">{word.incorrectCount}</strong>
                    </span>
                    <button
                      onClick={() => navigate('/flashcard')}
                      className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                    >
                      Ôn từ này →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
