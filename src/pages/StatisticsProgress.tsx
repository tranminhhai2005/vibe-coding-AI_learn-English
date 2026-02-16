import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  Calendar,
  Layers,
  BookOpen,
  TrendingUp,
  FolderKanban,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakerButton } from '../components/SpeakerButton';

export const StatisticsProgress: React.FC = () => {
  const { words, decks, stats } = useApp();

  // Real calculations
  const totalWords = words.length;
  const masteredWords = words.filter((w) => w.memoryLevel === 'mastered').length;
  const learningWords = words.filter((w) => w.memoryLevel === 'learning').length;
  const newWords = words.filter((w) => w.memoryLevel === 'new').length;
  const weakWords = words.filter(
    (w) => w.incorrectCount > 0 || (w.leitnerBox <= 2 && w.memoryLevel !== 'mastered')
  );

  // Overall question & accuracy metrics from daily logs
  let totalAnswers = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;

  Object.values(stats.dailyActivity).forEach((act) => {
    totalAnswers += act.quizCompleted;
    totalCorrect += act.correct;
    totalIncorrect += act.incorrect;
  });

  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  // Past 14 days chart data
  const past14Days: { date: string; label: string; wordsStudied: number; quizCompleted: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    const act = stats.dailyActivity[dStr] || { wordsStudied: 0, quizCompleted: 0 };
    past14Days.push({
      date: dStr,
      label: i === 0 ? 'Hôm nay' : label,
      wordsStudied: act.wordsStudied,
      quizCompleted: act.quizCompleted,
    });
  }

  const maxActivityValue = Math.max(
    5,
    ...past14Days.map((d) => d.wordsStudied + d.quizCompleted)
  );

  // Mistaken words sorted by incorrect count descending
  const mostMistakenWords = [...words]
    .filter((w) => w.incorrectCount > 0)
    .sort((a, b) => b.incorrectCount - a.incorrectCount)
    .slice(0, 10);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Thống kê thực tế</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Báo cáo Tiến độ Học tập Toàn diện
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Số liệu được tính toán minh bạch dựa trên từng lần lật thẻ, làm bài kiểm tra và bài tập trắc nghiệm.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Kho từ vựng</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalWords} từ</h3>
            <p className="text-[11px] text-slate-500">Đã lưu trữ trong bộ nhớ</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Đã thuộc lòng</span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {masteredWords} từ
            </h3>
            <p className="text-[11px] text-slate-500">
              {totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0}% trên tổng kho
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Tỷ lệ trả lời đúng</span>
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {accuracy}%
            </h3>
            <p className="text-[11px] text-slate-500">Trên {totalAnswers} lượt câu hỏi</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Chuỗi ngày học</span>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.streakDays || 1} ngày
            </h3>
            <p className="text-[11px] text-slate-500">Duy trì liên tục</p>
          </div>
        </div>
      </div>

      {/* 14 Days Activity Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Biểu đồ tương tác học tập 14 ngày gần nhất
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Số lượt học từ và hoàn thành bài kiểm tra theo từng ngày
            </p>
          </div>
        </div>

        <div className="h-56 flex items-end justify-between gap-2 pt-6 border-b border-slate-100 dark:border-slate-800">
          {past14Days.map((item, idx) => {
            const total = item.wordsStudied + item.quizCompleted;
            const heightPercent = Math.max(6, Math.round((total / maxActivityValue) * 100));
            const isToday = idx === past14Days.length - 1;

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {total}
                </span>
                <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-brand-500'
                        : total > 0
                        ? 'bg-slate-400 dark:bg-slate-600 group-hover:bg-brand-400'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] truncate max-w-full ${
                    isToday ? 'text-brand-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Columns: Deck Progress & Most Mistaken Words */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deck Progress Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Tiến độ theo từng Bộ từ vựng
            </h3>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {decks.map((deck) => {
              const dWords = words.filter((w) => w.deckId === deck.id);
              const mWords = dWords.filter((w) => w.memoryLevel === 'mastered').length;
              const pct = dWords.length > 0 ? Math.round((mWords / dWords.length) * 100) : 0;

              return (
                <div key={deck.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{deck.name}</span>
                    <span className="text-emerald-600 font-mono">
                      {mWords}/{dWords.length} từ ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Mistaken Words */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Top từ vựng thường bị sai ({mostMistakenWords.length} từ)
            </h3>
          </div>

          {mostMistakenWords.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Chưa có từ nào bị ghi nhận trả lời sai! Hãy duy trì phong độ nhé.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {mostMistakenWords.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {w.word}
                      </span>
                      {w.ipa && <span className="font-mono text-slate-400">{w.ipa}</span>}
                    </div>
                    <p className="text-slate-500 truncate">{w.meaning}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                      {w.incorrectCount} lần sai
                    </span>
                    <SpeakerButton text={w.word} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
