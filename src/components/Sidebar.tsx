import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Layers,
  PenTool,
  CheckSquare,
  Headphones,
  RotateCcw,
  FolderKanban,
  BarChart3,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { words } = useApp();

  const weakWordsCount = words.filter(
    (w) => w.incorrectCount > 0 || (w.leitnerBox <= 2 && w.memoryLevel !== 'mastered')
  ).length;

  const navItems = [
    { to: '/', label: 'Tổng quan', icon: LayoutDashboard },
    {
      to: '/vocab',
      label: 'Kho từ vựng',
      icon: BookOpen,
      badge: words.length > 0 ? words.length : undefined,
    },
    { to: '/ocr', label: 'Trích xuất từ vựng', icon: FileText, highlight: true },
    { to: '/flashcard', label: 'Học từ vựng', icon: Layers },
    { to: '/writing', label: 'Luyện viết', icon: PenTool },
    { to: '/quiz', label: 'Trắc nghiệm', icon: CheckSquare },
    { to: '/listening', label: 'Luyện nghe & Nói', icon: Headphones },
    {
      to: '/review',
      label: 'Ôn tập từ sai',
      icon: RotateCcw,
      badge: weakWordsCount > 0 ? weakWordsCount : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    { to: '/decks', label: 'Bộ từ vựng', icon: FolderKanban },
    { to: '/stats', label: 'Thống kê tiến độ', icon: BarChart3 },
    { to: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Brand Header */}
        <div className="h-18 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Learn English
              </span>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                Học Tiếng Anh Thông Minh
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
            Menu Chính
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 dark:bg-brand-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${item.highlight && !location.pathname.includes(item.to) ? 'relative' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor ||
                              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.highlight && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Profile / Quick Info Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                Lưu trữ Offline
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">
              Dữ liệu được lưu an toàn trên trình duyệt của bạn (LocalStorage).
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
