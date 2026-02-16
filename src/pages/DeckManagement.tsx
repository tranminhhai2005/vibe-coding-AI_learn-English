import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Play,
  CheckSquare,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Deck } from '../types';

const COLOR_OPTIONS = [
  { name: 'Xanh dương (Blue)', value: 'from-blue-500 to-indigo-600' },
  { name: 'Xanh ngọc (Cyan)', value: 'from-cyan-500 to-blue-600' },
  { name: 'Xanh lá (Emerald)', value: 'from-emerald-500 to-teal-600' },
  { name: 'Tím đậm (Purple)', value: 'from-purple-500 to-pink-600' },
  { name: 'Cam cháy (Amber)', value: 'from-amber-500 to-orange-600' },
  { name: 'Hồng sen (Rose)', value: 'from-rose-500 to-red-600' },
];

export const DeckManagement: React.FC = () => {
  const navigate = useNavigate();
  const { decks, words, createDeck, updateDeck, deleteDeck } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [confirmDeleteDeck, setConfirmDeleteDeck] = useState<Deck | null>(null);

  const openCreateModal = () => {
    setEditingDeck(null);
    setName('');
    setDescription('');
    setColor(COLOR_OPTIONS[0].value);
    setModalOpen(true);
  };

  const openEditModal = (d: Deck) => {
    setEditingDeck(d);
    setName(d.name);
    setDescription(d.description);
    setColor(d.color || COLOR_OPTIONS[0].value);
    setModalOpen(true);
  };

  const handleSaveDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDeck) {
      updateDeck(editingDeck.id, {
        name: name.trim(),
        description: description.trim(),
        color,
      });
    } else {
      createDeck(name.trim(), description.trim(), color);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Phân loại theo mục tiêu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Quản lý Bộ từ vựng theo Chủ đề
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tạo và sắp xếp từ vựng theo chủ đề: Giao tiếp, TOEIC, IELTS, Du lịch, Công việc...
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo bộ từ mới</span>
        </button>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => {
          const deckWords = words.filter((w) => w.deckId === deck.id);
          const masteredCount = deckWords.filter((w) => w.memoryLevel === 'mastered').length;
          const progressPercent =
            deckWords.length > 0 ? Math.round((masteredCount / deckWords.length) * 100) : 0;

          return (
            <div
              key={deck.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              {/* Deck Cover / Header with Gradient */}
              <div
                className={`p-6 bg-gradient-to-r ${deck.color || 'from-blue-500 to-indigo-600'} text-white relative`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
                    {deckWords.length} từ vựng
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(deck)}
                      title="Sửa bộ từ"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!deck.isDefault && (
                      <button
                        onClick={() => setConfirmDeleteDeck(deck)}
                        title="Xóa bộ từ"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-black tracking-tight">{deck.name}</h3>
                <p className="text-xs text-white/80 line-clamp-2 mt-1 leading-relaxed">
                  {deck.description || 'Chưa có mô tả cho bộ từ này.'}
                </p>
              </div>

              {/* Progress & Content */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Tiến độ đã thuộc:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {masteredCount} / {deckWords.length} từ ({progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Quick actions for deck */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => navigate('/flashcard')}
                    disabled={deckWords.length === 0}
                    className="py-2.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-brand-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Lật Flashcard</span>
                  </button>

                  <button
                    onClick={() => navigate('/quiz')}
                    disabled={deckWords.length < 4}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                    title={deckWords.length < 4 ? 'Cần tối thiểu 4 từ để tạo trắc nghiệm' : ''}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Trắc nghiệm</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Deck Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingDeck ? 'Chỉnh sửa bộ từ vựng' : 'Tạo bộ từ vựng mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tên bộ từ vựng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tiếng Anh Du lịch & Sân bay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả mục tiêu của bộ từ này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Màu sắc chủ đạo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                        color === c.value
                          ? 'border-brand-500 ring-2 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${c.value}`} />
                      <span className="truncate">{c.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md"
                >
                  {editingDeck ? 'Lưu thay đổi' : 'Tạo ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-600">Xác nhận xóa bộ từ</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Bạn có chắc muốn xóa bộ từ <strong>"{confirmDeleteDeck.name}"</strong>? Các từ vựng
              thuộc bộ từ này vẫn sẽ được giữ lại trong kho từ vựng.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteDeck(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  deleteDeck(confirmDeleteDeck.id);
                  setConfirmDeleteDeck(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
