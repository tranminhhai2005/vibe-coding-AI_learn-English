import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  FolderPlus,
  Check,
  CheckSquare,
  Square,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  ChevronDown,
  Info,
  Layers,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  Wrench,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakerButton } from '../components/SpeakerButton';
import { WordModal } from '../components/WordModal';
import { PartOfSpeech, Word } from '../types';
import { exportBackupJSON, exportWordsCSV, importWordsCSV } from '../services/storage';

const POS_LABELS: Record<PartOfSpeech, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  adverb: 'Trạng từ',
  preposition: 'Giới từ',
  conjunction: 'Liên từ',
  phrase: 'Cụm từ',
  other: 'Khác',
};

const POS_COLORS: Record<PartOfSpeech, string> = {
  noun: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
  verb: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
  adjective: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
  adverb: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
  preposition: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
  conjunction: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/60 dark:border-pink-800/60',
  phrase: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export const VocabularyBank: React.FC = () => {
  const { words, decks, deleteWord, batchAddWords, addWordsToDeck, addToast, repairDatabase } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeckFilter, setSelectedDeckFilter] = useState<string>('all');
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'az' | 'za' | 'wrong_desc'>('date_desc');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [detailWord, setDetailWord] = useState<Word | null>(null);
  const [confirmDeleteWord, setConfirmDeleteWord] = useState<Word | null>(null);
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [repairReportData, setRepairReportData] = useState<{ changedCount: number; report: { word: string; fixes: string[] }[] }>({
    changedCount: 0,
    report: [],
  });

  // Batch Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeckModalOpen, setBatchDeckModalOpen] = useState(false);
  const [batchTargetDeckId, setBatchTargetDeckId] = useState('');

  // Filter & Sort Logic
  const filteredWords = useMemo(() => {
    return words
      .filter((w) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchWord = w.word.toLowerCase().includes(q);
          const matchMeaning = w.meaning.toLowerCase().includes(q);
          if (!matchWord && !matchMeaning) return false;
        }

        // Deck filter
        if (selectedDeckFilter !== 'all') {
          if (selectedDeckFilter === 'none') {
            if (w.deckId) return false;
          } else if (w.deckId !== selectedDeckFilter) {
            return false;
          }
        }

        // POS filter
        if (selectedPosFilter !== 'all' && w.partOfSpeech !== selectedPosFilter) {
          return false;
        }

        // Level filter
        if (selectedLevelFilter !== 'all' && w.memoryLevel !== selectedLevelFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'az') {
          return a.word.localeCompare(b.word);
        }
        if (sortBy === 'za') {
          return b.word.localeCompare(a.word);
        }
        if (sortBy === 'wrong_desc') {
          return b.incorrectCount - a.incorrectCount;
        }
        return 0;
      });
  }, [words, searchQuery, selectedDeckFilter, selectedPosFilter, selectedLevelFilter, sortBy]);

  // Selection helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredWords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredWords.map((w) => w.id));
    }
  };

  // Batch Add to Deck
  const handleApplyBatchDeck = () => {
    if (!batchTargetDeckId || selectedIds.length === 0) return;
    addWordsToDeck(selectedIds, batchTargetDeckId);
    setSelectedIds([]);
    setBatchDeckModalOpen(false);
  };

  // Export handlers
  const handleExportCSV = () => {
    const csvContent = exportWordsCSV(filteredWords);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LearnEnglish_Vocab_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Đã xuất ${filteredWords.length} từ vựng sang tệp CSV.`, 'success');
  };

  const handleExportJSON = () => {
    const jsonContent = exportBackupJSON();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LearnEnglish_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Đã xuất toàn bộ dữ liệu sao lưu sang tệp JSON.', 'success');
  };

  // Import CSV handler
  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const { words: parsed, error } = importWordsCSV(text);
        if (error) {
          addToast(error, 'error');
        } else if (parsed.length > 0) {
          batchAddWords(parsed);
        } else {
          addToast('Không tìm thấy từ vựng hợp lệ trong tệp CSV.', 'info');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handler for manual database repair
  const handleRunDatabaseRepair = () => {
    const result = repairDatabase();
    setRepairReportData(result);
    setRepairModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chuẩn hóa & Sửa lỗi từ vựng */}
          <button
            onClick={handleRunDatabaseRepair}
            title="Tự động kiểm tra, tách phiên âm IPA khỏi từ tiếng Anh, sửa loại từ (Danh từ, Động từ, Tính từ, Trạng từ, Cụm từ) và sửa các lỗi sai nghĩa"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Chuẩn hóa & Sửa lỗi</span>
          </button>

          {/* CSV Import */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors">
            <Upload className="w-4 h-4 text-brand-500" />
            <span>Nhập CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSVFile}
              className="hidden"
            />
          </label>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={handleExportCSV}
            title="Xuất danh sách đang xem ra CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            title="Sao lưu JSON toàn bộ hệ thống"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            <FileJson className="w-4 h-4 text-indigo-500" />
            <span>Sao lưu JSON</span>
          </button>

          {/* Add Word Button */}
          <button
            onClick={() => {
              setEditingWord(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ vựng</span>
          </button>
        </div>
      </div>

      {/* Filter and Sorting Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-brand-500" /> Bộ lọc:
          </span>

          {/* Deck Filter */}
          <select
            value={selectedDeckFilter}
            onChange={(e) => setSelectedDeckFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs font-medium"
          >
            <option value="all">Tất cả bộ từ</option>
            <option value="none">Chưa phân loại</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* POS Filter */}
          <select
            value={selectedPosFilter}
            onChange={(e) => setSelectedPosFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs font-medium"
          >
            <option value="all">Tất cả loại từ</option>
            {Object.entries(POS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs font-medium"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="new">Mới học (Hộp 1)</option>
            <option value="learning">Đang học (Hộp 2-3)</option>
            <option value="mastered">Đã thuộc (Hộp 4-5)</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs font-medium"
          >
            <option value="date_desc">Mới thêm gần nhất</option>
            <option value="date_asc">Cũ nhất</option>
            <option value="az">Từ vựng (A → Z)</option>
            <option value="za">Từ vựng (Z → A)</option>
            <option value="wrong_desc">Số lần trả lời sai nhiều nhất</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-100 animate-slide-up">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span>Đã chọn {selectedIds.length} từ vựng</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-brand-600 dark:text-brand-400 underline font-normal ml-2"
            >
              Bỏ chọn
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBatchDeckModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Đưa vào bộ từ
            </button>
          </div>
        </div>
      )}

      {/* Table & Cards of Words */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredWords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Không tìm thấy từ vựng nào
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Thử thay đổi bộ lọc tìm kiếm hoặc nhấn nút "Thêm từ vựng" để bắt đầu làm giàu kho kiến thức của bạn.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDeckFilter('all');
                setSelectedPosFilter('all');
                setSelectedLevelFilter('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Xóa toàn bộ bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {selectedIds.length === filteredWords.length ? (
                        <CheckSquare className="w-4 h-4 text-brand-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Từ tiếng Anh</th>
                  <th className="py-3 px-4">Nghĩa tiếng Việt</th>
                  <th className="py-3 px-4 hidden md:table-cell">Loại từ</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Bộ từ</th>
                  <th className="py-3 px-4 text-center">Ghi nhớ</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">Đúng / Sai</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredWords.map((word) => {
                  const isSelected = selectedIds.includes(word.id);
                  let levelBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Mới học
                    </span>
                  );
                  if (word.memoryLevel === 'mastered') {
                    levelBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Đã thuộc
                      </span>
                    );
                  } else if (word.memoryLevel === 'learning') {
                    levelBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        Đang học
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={word.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-brand-50/50 dark:bg-brand-950/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleSelect(word.id)}
                          className="text-slate-400 hover:text-brand-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Word & IPA */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <SpeakerButton text={word.word} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span>{word.word}</span>
                              {word.isSample && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  Mẫu
                                </span>
                              )}
                            </div>
                            {word.ipa && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono font-normal">
                                {word.ipa}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Meaning */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        <div>
                          <span>{word.meaning}</span>
                          {word.example && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-1 mt-0.5 font-normal">
                              "{word.example}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* POS */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${
                            POS_COLORS[word.partOfSpeech] || POS_COLORS.noun
                          }`}
                        >
                          {POS_LABELS[word.partOfSpeech] || word.partOfSpeech}
                        </span>
                      </td>

                      {/* Deck */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs">
                        {word.deckName ? (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-brand-600 dark:text-brand-400 font-medium">
                            {word.deckName}
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa gắn</span>
                        )}
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-4 text-center">{levelBadge}</td>

                      {/* Stats */}
                      <td className="py-3.5 px-4 text-center hidden sm:table-cell text-xs font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {word.correctCount}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-rose-500 font-bold">{word.incorrectCount}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailWord(word)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingWord(word);
                              setIsAddModalOpen(true);
                            }}
                            title="Chỉnh sửa từ"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setConfirmDeleteWord(word)}
                            title="Xóa từ"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Hiển thị <strong>{filteredWords.length}</strong> / <strong>{words.length}</strong> từ
          </span>
          <span>Hệ thống ghi nhớ tự động điều chỉnh theo thuật toán Leitner.</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Xác nhận xóa từ vựng</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa từ{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                "{confirmDeleteWord.word}"
              </strong>{' '}
              khỏi kho từ vựng không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteWord(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  deleteWord(confirmDeleteWord.id);
                  setConfirmDeleteWord(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Detail Drawer / Modal */}
      {detailWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <SpeakerButton text={detailWord.word} size="lg" />
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {detailWord.word}
                  </h3>
                  {detailWord.ipa && (
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                      {detailWord.ipa}
                    </span>
                  )}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                {POS_LABELS[detailWord.partOfSpeech] || detailWord.partOfSpeech}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nghĩa tiếng Việt
              </p>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {detailWord.meaning}
              </p>
              {detailWord.acceptableMeanings && detailWord.acceptableMeanings.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nghĩa phụ chấp nhận: {detailWord.acceptableMeanings.join(', ')}
                </p>
              )}
            </div>

            {detailWord.example && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ví dụ</p>
                  <SpeakerButton text={detailWord.example} size="sm" />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">
                  "{detailWord.example}"
                </p>
                {detailWord.exampleMeaning && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    → {detailWord.exampleMeaning}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">Hộp Leitner (SRS)</span>
                <span className="font-bold text-sm text-brand-600 dark:text-brand-400">
                  Hộp {detailWord.leitnerBox} / 5
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">Lịch sử trả lời</span>
                <span className="font-bold text-sm text-emerald-600">
                  {detailWord.correctCount} đúng
                </span>{' '}
                /{' '}
                <span className="font-bold text-sm text-rose-500">
                  {detailWord.incorrectCount} sai
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailWord(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Add To Deck Modal */}
      {batchDeckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Đưa {selectedIds.length} từ đã chọn vào bộ từ vựng
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Chọn bộ từ vựng
              </label>
              <select
                value={batchTargetDeckId}
                onChange={(e) => setBatchTargetDeckId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Chọn bộ từ --</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBatchDeckModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyBatchDeck}
                disabled={!batchTargetDeckId}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repair Report Modal */}
      {repairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Chuẩn hóa & Sửa lỗi từ vựng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tự động tách phiên âm, sửa loại từ và hiệu chỉnh nghĩa tiếng Việt
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm space-y-1">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>
                  {repairReportData.changedCount > 0
                    ? `Đã sửa thành công ${repairReportData.changedCount} từ vựng!`
                    : 'Toàn bộ từ vựng đã chuẩn chỉnh, không có lỗi cần sửa!'}
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Tất cả các từ bị dính phiên âm trong tên từ (như abroad /ə'brɔ:d/), sai loại từ (Danh từ sang Trạng từ, Động từ, Tính từ...) và các từ bị mất nghĩa đã được khắc phục hoàn toàn.
              </p>
            </div>

            {repairReportData.report.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                <p className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  Chi tiết một số từ vừa được chuẩn hóa:
                </p>
                <div className="space-y-1.5">
                  {repairReportData.report.slice(0, 30).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-2"
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {item.word}
                      </span>
                      <span className="text-[11px] text-brand-600 dark:text-brand-400 text-right">
                        {item.fixes.join('; ')}
                      </span>
                    </div>
                  ))}
                  {repairReportData.report.length > 30 && (
                    <p className="text-center text-[11px] text-slate-400 italic">
                      và {repairReportData.report.length - 30} từ khác...
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRepairModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Word Modal */}
      <WordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingWord(null);
        }}
        editWord={editingWord}
      />
    </div>
  );
};
