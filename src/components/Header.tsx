import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Moon,
  Sun,
  Flame,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenAddModal: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Tổng quan học tập', subtitle: 'Theo dõi tiến trình & mục tiêu học từ vựng mỗi ngày' },
  '/vocab': { title: 'Kho từ vựng', subtitle: 'Quản lý, tìm kiếm, nhập & xuất toàn bộ từ vựng' },
  '/ocr': { title: 'Trích xuất Từ vựng Thông minh', subtitle: 'Tự động định dạng, bóc tách tiếng Anh, sinh phiên âm IPA và dịch nghĩa' },
  '/flashcard': { title: 'Học bằng Flashcard', subtitle: 'Lật thẻ ghi nhớ, nghe phát âm và phân loại mức độ' },
  '/writing': { title: 'Luyện viết 2 chiều', subtitle: 'Kiểm tra trí nhớ qua luyện gõ Anh → Việt & Việt → Anh' },
  '/quiz': { title: 'Bài tập Trắc nghiệm', subtitle: '4 dạng trắc nghiệm với phân tích đáp án chi tiết' },
  '/listening': { title: 'Luyện nghe & Phát âm', subtitle: 'Rèn luyện thính giác và kiểm tra phát âm tiếng Anh' },
  '/review': { title: 'Ôn tập thông minh', subtitle: 'Hệ thống Leitner lặp lại ngắt quãng cho từ chưa thuộc' },
  '/decks': { title: 'Quản lý Bộ từ vựng', subtitle: 'Tổ chức từ vựng theo từng chủ đề và mục tiêu' },
  '/stats': { title: 'Thống kê tiến độ', subtitle: 'Phân tích chi tiết dữ liệu học tập thực tế' },
  '/settings': { title: 'Cài đặt & Dữ liệu', subtitle: 'Tùy chỉnh giọng đọc, giao diện và sao lưu dữ liệu' },
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenAddModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, settings, updateSettings } = useApp();

  const currentRouteInfo =
    ROUTE_TITLES[location.pathname] || {
      title: 'Learn English',
      subtitle: 'Ứng dụng học tiếng Anh thông minh',
    };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Mở danh mục menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {currentRouteInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-400 font-medium">
            {currentRouteInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Streak Indicator */}
        <div
          title={`Chuỗi học tập liên tục: ${stats.streakDays || 1} ngày!`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs"
        >
          <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>{stats.streakDays || 1} ngày</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={settings.theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          aria-label={settings.theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Quick Add Word Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm từ mới</span>
        </button>
      </div>
    </header>
  );
};
