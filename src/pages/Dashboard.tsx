import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakerButton } from '../components/SpeakerButton';
import { isDueForReview, isWeakWord } from '../services/spacedRepetition';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenAddModal } = useOutletContext<{ onOpenAddModal: () => void }>();
  const { words, stats } = useApp();

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  let greeting = 'Chào buổi sáng';
  if (hour >= 12 && hour < 18) greeting = 'Chào buổi chiều';
  else if (hour >= 18) greeting = 'Chào buổi tối';

  // Real statistics computation
  const totalWords = words.length;
  const masteredWords = words.filter((w) => w.memoryLevel === 'mastered').length;
  const weakWords = words.filter(isWeakWord);
  const wordsToReview = words.filter((w) => isDueForReview(w) || isWeakWord(w));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = stats.dailyActivity[todayStr] || {
    wordsStudied: 0,
    quizCompleted: 0,
    correct: 0,
    incorrect: 0,
  };

  // Compute total questions & overall accuracy across all recorded history
  let totalQuestionsAnswered = 0;
  let totalCorrectAnswers = 0;
  Object.values(stats.dailyActivity).forEach((act) => {
    totalQuestionsAnswered += act.quizCompleted;
    totalCorrectAnswers += act.correct;
  });

  const accuracyRate =
    totalQuestionsAnswered > 0
      ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
      : totalWords > 0
      ? Math.round(
          (words.reduce((sum, w) => sum + w.correctCount, 0) /
            Math.max(
              1,
              words.reduce((sum, w) => sum + w.correctCount + w.incorrectCount, 0)
            )) *
            100
        )
      : 0;

  // Last 7 days activity chart data
  const last7Days: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'Hôm nay' : `${d.getDate()}/${d.getMonth() + 1}`;
    const count =
      (stats.dailyActivity[dStr]?.wordsStudied || 0) +
      (stats.dailyActivity[dStr]?.quizCompleted || 0);
    last7Days.push({ date: dStr, label: dayLabel, count });
  }

  const maxChartCount = Math.max(5, ...last7Days.map((d) => d.count));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mỗi ngày 15 phút để làm chủ tiếng Anh</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}! Hãy tiếp tục chinh phục từ vựng hôm nay.
          </h2>
          <p className="mt-2 text-white/80 text-sm sm:text-base leading-relaxed">
            Bạn đã duy trì chuỗi học tập{' '}
            <strong className="text-amber-300 font-bold">{stats.streakDays || 1} ngày liên tiếp</strong>.
            Cố gắng đạt mục tiêu học tập hôm nay nhé!
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/flashcard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-600 hover:bg-slate-100 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Bắt đầu học ngay
            </button>

            {wordsToReview.length > 0 && (
              <button
                onClick={() => navigate('/review')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Ôn tập {wordsToReview.length} từ
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Thêm từ mới
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Words */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng từ vựng</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalWords}</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">đã lưu trong kho</p>
          </div>
        </div>

        {/* Mastered */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã ghi nhớ</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {masteredWords}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">từ đã thuộc lòng</p>
          </div>
        </div>

        {/* Review Needed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cần ôn tập</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {wordsToReview.length}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">từ đến hạn ôn</p>
          </div>
        </div>

        {/* Studied Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hôm nay</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {todayActivity.wordsStudied}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">lượt từ đã học</p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tỷ lệ đúng</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {accuracyRate}%
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">độ chính xác</p>
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chuỗi ngày</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
              {stats.streakDays || 1}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ngày liên tiếp</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Activity Chart & Review List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Real Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tiến độ học tập 7 ngày qua
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thống kê số lượt học & hoàn thành bài tập thực tế
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1.5 rounded-xl">
              <span>{last7Days.reduce((acc, d) => acc + d.count, 0)} lượt</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800">
            {last7Days.map((item, idx) => {
              const heightPercent = Math.max(8, Math.round((item.count / maxChartCount) * 100));
              const isToday = idx === last7Days.length - 1;

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-brand-600 to-indigo-500'
                          : 'bg-gradient-to-t from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 group-hover:from-brand-500 group-hover:to-brand-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      isToday
                        ? 'text-brand-600 dark:text-brand-400 font-bold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Dữ liệu được cập nhật tự động khi bạn học hoặc làm bài.</span>
            <button
              onClick={() => navigate('/stats')}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1"
            >
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Words To Review Sidebar Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Từ vựng cần ôn tập
              </h3>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-1 rounded-full">
                {wordsToReview.length} từ
              </span>
            </div>

            {wordsToReview.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Tuyệt vời! Bạn không có từ nào bị trễ hạn ôn.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hãy tiếp tục học thêm từ vựng mới hoặc làm bài trắc nghiệm nhé.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {wordsToReview.slice(0, 5).map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {w.word}
                        </span>
                        {w.ipa && (
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                            {w.ipa}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {w.meaning}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <SpeakerButton text={w.word} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {wordsToReview.length > 0 ? (
              <button
                onClick={() => navigate('/review')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Bắt đầu ôn tập ({wordsToReview.length} từ)
              </button>
            ) : (
              <button
                onClick={() => navigate('/flashcard')}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Layers className="w-4 h-4" />
                Học từ vựng mới bằng Flashcard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Showcase Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/ocr')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Trích xuất Từ vựng</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dán danh sách, bài đọc, tự định dạng, tạo phiên âm và dịch nghĩa chuẩn xác.
          </p>
        </div>

        <div
          onClick={() => navigate('/writing')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Luyện viết 2 chiều</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gõ đáp án Anh ↔ Việt với kiểm tra dấu và phát hiện lỗi gõ sai.
          </p>
        </div>

        <div
          onClick={() => navigate('/quiz')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Bài tập trắc nghiệm</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            4 dạng trắc nghiệm phong phú, nghe phát âm và điền vào chỗ trống.
          </p>
        </div>

        <div
          onClick={() => navigate('/listening')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Luyện nghe & Nói</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nghe phát âm chuẩn bản xứ và thử sức đọc phát âm qua microphone.
          </p>
        </div>
      </div>
    </div>
  );
};
