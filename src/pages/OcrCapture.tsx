import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Plus,
  BookOpen,
  Sparkles,
  FileText,
  Type,
  ClipboardPaste,
  HelpCircle,
  CheckSquare,
  Square,
  Image as ImageIcon,
  ChevronDown,
  Volume2,
  Wand2,
  AlignLeft,
  Search,
  Filter,
  Download,
  FolderPlus,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExtractedOCRWord, PartOfSpeech } from '../types';
import { SpeakerButton } from '../components/SpeakerButton';
import {
  executeOcr,
  OcrLayoutMode,
  PRESET_CONTRACTS_WORDS,
  PRESET_CONFERENCES_WORDS,
} from '../services/ocrService';
import {
  COMPREHENSIVE_DICTIONARY,
  smartParseVocabLine,
  cleanEnglishWord,
  generateAutoIpa,
  classifyPartOfSpeech,
} from '../services/vocabEngine';

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

// Danh sách từ dừng (Stop words) khi trích xuất từ đoạn văn
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'and', 'but', 'or', 'nor', 'at', 'by', 'for', 'from', 'in', 'into',
  'of', 'off', 'on', 'onto', 'out', 'over', 'to', 'up', 'with', 'about', 'against', 'between',
  'through', 'during', 'before', 'after', 'above', 'below', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
  'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
]);

export const OcrCapture: React.FC = () => {
  const { words, decks, batchAddWords, addToast } = useApp();

  // Mode: 'list' (Dán danh sách từ) | 'passage' (Trích xuất từ bài đọc)
  const [activeInputMode, setActiveInputMode] = useState<'list' | 'passage' | 'image'>('list');

  // Input states
  const [listInputText, setListInputText] = useState<string>('');
  const [passageInputText, setPassageInputText] = useState<string>('');

  // Options
  const [autoAddIpa, setAutoAddIpa] = useState<boolean>(true);
  const [autoTranslateMeaning, setAutoTranslateMeaning] = useState<boolean>(true);
  const [autoClassifyPos, setAutoClassifyPos] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLayoutMode, setImageLayoutMode] = useState<OcrLayoutMode>('split_2_columns');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // Extracted results state
  const [extractedWords, setExtractedWords] = useState<ExtractedOCRWord[]>([]);
  const [targetDeckId, setTargetDeckId] = useState<string>('');
  const [filterResultTab, setFilterResultTab] = useState<'all' | 'new' | 'existing'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Presets dropdown
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        addToast('Không thể đọc tệp ảnh đã chọn.', 'error');
        return;
      }
      setSelectedImage(reader.result);
      setExtractedWords([]);
    };
    reader.onerror = () => addToast('Không thể đọc tệp ảnh đã chọn.', 'error');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleImageOcr = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusText('Đang nhận diện từ vựng trong ảnh...');

    try {
      const result = await executeOcr(
        selectedImage,
        imageLayoutMode,
        'eng+vie',
        (percent, status) => {
          setProgress(percent);
          setStatusText(status);
        }
      );

      const items: ExtractedOCRWord[] = result.parsedWords.map((item) => {
        const existing = words.find(
          (word) => word.word.trim().toLowerCase() === item.word.trim().toLowerCase()
        );
        return { ...item, isExisting: !!existing, selected: !existing };
      });

      setExtractedWords(items);
      addToast(`Nhận diện thành công ${items.length} từ vựng từ ảnh.`, 'success');
    } catch (err) {
      console.error('Image OCR error:', err);
      addToast(
        `Lỗi nhận diện ảnh: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`,
        'error'
      );
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  // Tự động định dạng văn bản danh sách: xóa số thứ tự, gạch đầu dòng, căn chỉnh lại chuẩn đẹp
  const handleFormatListText = () => {
    if (!listInputText.trim()) return;

    const lines = listInputText.split(/\r?\n/);
    const cleanedLines = lines
      .map((line) => {
        let l = line.trim();
        if (!l) return '';

        // Xóa các số thứ tự: 1. , 01. , 1) , [1] , 1/ , 1 -
        l = l.replace(/^(\d+[\.\)\/\-\:]\s*|\[\d+\]\s*|\(\d+\)\s*)/, '');

        // Xóa ký tự gạch đầu dòng: - , * , • , + , > , ~
        l = l.replace(/^([\-\*\•\+\>\~]\s*)/, '');

        // Chuẩn hóa dấu tab thành ' - '
        l = l.replace(/\t+/g, ' - ');

        // Chuẩn hóa khoảng trắng dư thừa
        l = l.replace(/\s{2,}/g, ' ');

        return l.trim();
      })
      .filter(Boolean);

    const formatted = cleanedLines.join('\n');
    setListInputText(formatted);
    addToast('Đã tự động dọn dẹp số thứ tự, gạch đầu dòng và căn chỉnh văn bản!', 'success');
  };

  // Dán từ clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (activeInputMode === 'list') {
          setListInputText((prev) => (prev ? prev + '\n' + text : text));
        } else {
          setPassageInputText(text);
        }
        addToast('Đã dán nội dung từ bộ nhớ tạm!', 'success');
      }
    } catch {
      addToast('Không thể đọc clipboard. Bạn vui lòng bấm phím Ctrl + V để dán.', 'info');
    }
  };

  // Nạp dữ liệu mẫu
  const handleLoadSample = (sampleType: 'contracts' | 'conferences' | 'daily' | 'passage') => {
    if (sampleType === 'contracts') {
      const text = PRESET_CONTRACTS_WORDS.map((w) => `${w.word} ${w.ipa || ''} - ${w.meaning}`).join('\n');
      setListInputText(text);
      setActiveInputMode('list');
      addToast('Đã nạp danh sách 34 từ vựng Bài 1: Contracts (Hợp đồng)!', 'info');
    } else if (sampleType === 'conferences') {
      const text = PRESET_CONFERENCES_WORDS.map((w) => `${w.word} ${w.ipa || ''} - ${w.meaning}`).join('\n');
      setListInputText(text);
      setActiveInputMode('list');
      addToast('Đã nạp danh sách 50 từ vựng Bài 2: Conferences (Hội nghị)!', 'info');
    } else if (sampleType === 'daily') {
      const sampleDaily = [
        'abroad /əˈbrɔːd/ ở nước ngoài, ra nước ngoài',
        'culinary /ˈkʌlɪnəri/ (thuộc về) ẩm thực, nấu nướng',
        'decision /dɪˈsɪʒn/ quyết định',
        'criticize /ˈkrɪtɪsaɪz/ chỉ trích, phê bình',
        'justify /ˈdʒʌstɪfaɪ/ biện minh, giải thích lý do',
        'eggplant /ˈeɡplɑːnt/ cà tím',
        'keep in mind /kiːp ɪn maɪnd/ ghi nhớ, lưu ý',
        'preorder /ˌpriːˈɔːrdər/ đặt hàng trước',
        'be released /biː rɪˈliːst/ được phát hành, ra mắt',
        'product line /ˈprɒdʌkt laɪn/ dòng sản phẩm',
        'cookbook /ˈkʊkbʊk/ sách dạy nấu ăn',
        'passenger /ˈpæsɪndʒər/ hành khách',
      ].join('\n');
      setListInputText(sampleDaily);
      setActiveInputMode('list');
      addToast('Đã nạp danh sách từ vựng Giao tiếp & Đời sống!', 'info');
    } else if (sampleType === 'passage') {
      const samplePassage = `Learning English opens up tremendous career opportunities. When you travel abroad, having good culinary knowledge helps you enjoy local cuisine. You should keep in mind that consistent daily practice is the key to fluency. Before the product line is released, our team must make an important decision to justify every feature. Do not criticize mistakes, as they are an essential part of the learning journey.`;
      setPassageInputText(samplePassage);
      setActiveInputMode('passage');
      addToast('Đã nạp bài đọc mẫu! Nhấn "Trích xuất từ vựng" để quét các từ trọng tâm.', 'info');
    }
    setShowPresetDropdown(false);
  };

  // Xử lý trích xuất danh sách văn bản (List Mode)
  const handleProcessListInput = () => {
    if (!listInputText.trim()) {
      addToast('Vui lòng nhập hoặc dán danh sách từ vựng vào ô.', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress(30);
    setStatusText('Đang tự động bóc tách từ tiếng Anh, phiên âm IPA và nghĩa...');

    setTimeout(() => {
      const lines = listInputText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const results: ExtractedOCRWord[] = [];
      const seen = new Set<string>();

      for (let i = 0; i < lines.length; i++) {
        const parsed = smartParseVocabLine(lines[i]);
        if (parsed && parsed.word) {
          const key = parsed.word.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);

            // Kiểm tra xem từ đã có trong kho chưa
            const existing = words.find(
              (w) => w.word.trim().toLowerCase() === parsed.word.trim().toLowerCase()
            );

            // Bổ sung hoặc làm giàu từ điển
            let ipa = parsed.ipa;
            if (!ipa && autoAddIpa) {
              ipa = generateAutoIpa(parsed.word);
            }

            let meaning = parsed.meaning;
            if ((!meaning || meaning.includes('Chưa có nghĩa')) && autoTranslateMeaning) {
              const dict = COMPREHENSIVE_DICTIONARY[key];
              if (dict) meaning = dict.meaning;
            }

            const pos = autoClassifyPos
              ? classifyPartOfSpeech(parsed.word, meaning)
              : parsed.partOfSpeech;

            results.push({
              id: 'vocab_' + Date.now() + '_' + i,
              word: parsed.word,
              ipa: ipa || '',
              partOfSpeech: pos,
              meaning: meaning || '(Chưa có nghĩa tiếng Việt)',
              selected: !existing,
              isExisting: !!existing,
            });
          }
        }
      }

      setExtractedWords(results);
      setIsProcessing(false);
      setProgress(100);

      if (results.length === 0) {
        addToast('Không tìm thấy từ vựng hợp lệ. Vui lòng kiểm tra lại định dạng.', 'error');
      } else {
        addToast(`Trích xuất và chuẩn hóa thành công ${results.length} từ vựng!`, 'success');
      }
    }, 200);
  };

  // Xử lý trích xuất từ đoạn văn / bài đọc (Passage Mode)
  const handleProcessPassageInput = () => {
    if (!passageInputText.trim()) {
      addToast('Vui lòng dán đoạn văn tiếng Anh vào ô.', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setStatusText('Đang phân tích cú pháp bài đọc và chọn lọc các từ vựng cốt lõi...');

    setTimeout(() => {
      const text = passageInputText;

      // Tìm kiếm các cụm từ quan trọng trước
      const phraseMatches: string[] = [];
      Object.keys(COMPREHENSIVE_DICTIONARY).forEach((dictKey) => {
        if (dictKey.includes(' ')) {
          const regex = new RegExp(`\\b${dictKey}\\b`, 'gi');
          if (regex.test(text)) {
            phraseMatches.push(dictKey);
          }
        }
      });

      // Tách các từ đơn
      const rawWords = text
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”’\n\r]/g, ' ')
        .split(/\s+/)
        .map((w) => cleanEnglishWord(w).toLowerCase())
        .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

      // Lấy danh sách từ vựng duy nhất
      const uniqueWords = Array.from(new Set([...phraseMatches, ...rawWords]));
      const results: ExtractedOCRWord[] = [];

      uniqueWords.forEach((wordItem, idx) => {
        const dict = COMPREHENSIVE_DICTIONARY[wordItem];
        const existing = words.find(
          (w) => w.word.trim().toLowerCase() === wordItem.trim().toLowerCase()
        );

        let ipa = dict ? dict.ipa : generateAutoIpa(wordItem);
        let meaning = dict ? dict.meaning : '';
        let pos: PartOfSpeech = dict
          ? dict.partOfSpeech
          : classifyPartOfSpeech(wordItem, meaning);

        // Chữ cái đầu viết hoa cho đẹp
        const displayWord = wordItem.charAt(0).toUpperCase() + wordItem.slice(1);

        results.push({
          id: 'passage_' + Date.now() + '_' + idx,
          word: displayWord,
          ipa,
          partOfSpeech: pos,
          meaning: meaning || '(Từ vựng trong bài đọc)',
          selected: !existing,
          isExisting: !!existing,
        });
      });

      setExtractedWords(results);
      setIsProcessing(false);
      setProgress(100);

      if (results.length === 0) {
        addToast('Không tìm thấy từ vựng thích hợp trong bài đọc.', 'info');
      } else {
        addToast(`Đã chọn lọc thành công ${results.length} từ vựng quan trọng từ bài đọc!`, 'success');
      }
    }, 250);
  };

  // Toggle chọn tất cả
  const handleToggleSelectAll = () => {
    const hasUnselected = displayWords.some((w) => !w.selected);
    const visibleIds = new Set(displayWords.map((w) => w.id));
    setExtractedWords((prev) =>
      prev.map((w) => (visibleIds.has(w.id) ? { ...w, selected: hasUnselected } : w))
    );
  };

  // Cập nhật từng trường của 1 từ
  const handleUpdateItem = (id: string, field: keyof ExtractedOCRWord, val: any) => {
    setExtractedWords((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Xóa 1 từ khỏi danh sách trích xuất
  const handleRemoveItem = (id: string) => {
    setExtractedWords((prev) => prev.filter((item) => item.id !== id));
  };

  // Thêm dòng mới thủ công
  const handleAddNewManualRow = () => {
    const newItem: ExtractedOCRWord = {
      id: 'manual_' + Date.now(),
      word: '',
      ipa: '',
      partOfSpeech: 'noun',
      meaning: '',
      selected: true,
      isExisting: false,
    };
    setExtractedWords((prev) => [newItem, ...prev]);
  };

  // Lưu các từ đã chọn vào kho từ vựng
  const handleSaveToVocabBank = () => {
    const toSave = extractedWords.filter((w) => w.selected && w.word.trim());
    if (toSave.length === 0) {
      addToast('Chưa có từ nào được chọn hoặc từ được chọn bị trống.', 'error');
      return;
    }

    const targetDeck = decks.find((d) => d.id === targetDeckId);

    const formattedList = toSave.map((item) => ({
      word: item.word.trim(),
      meaning: item.meaning.trim() || '(Chưa nhập nghĩa)',
      ipa: item.ipa?.trim() || generateAutoIpa(item.word.trim()),
      partOfSpeech: item.partOfSpeech,
      deckId: targetDeck?.id,
      deckName: targetDeck?.name,
    }));

    const added = batchAddWords(formattedList);
    if (added > 0) {
      // Đánh dấu các từ đã lưu
      setExtractedWords((prev) =>
        prev.map((w) =>
          toSave.some((s) => s.id === w.id)
            ? { ...w, selected: false, isExisting: true }
            : w
        )
      );
    }
  };

  // Lọc danh sách hiển thị
  const displayWords = extractedWords.filter((item) => {
    if (filterResultTab === 'new' && item.isExisting) return false;
    if (filterResultTab === 'existing' && !item.isExisting) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return (
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        (item.ipa && item.ipa.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedCount = extractedWords.filter((w) => w.selected).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Studio Hero Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/60 dark:to-indigo-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200/50 dark:border-brand-800/50">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Studio Trích xuất & Định dạng Từ vựng Thông minh</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Trích xuất Từ vựng Chuẩn chỉnh & Tự động Phiên âm - Dịch nghĩa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Dán danh sách từ, bảng copy từ Excel/Sheets, hoặc bài đọc tiếng Anh. Hệ thống tự động căn chỉnh định dạng, bóc tách tiếng Anh, sinh phiên âm chuẩn IPA và dịch nghĩa chuẩn xác.
          </p>
        </div>

        {/* Mode Selector & Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setActiveInputMode('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeInputMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-emerald-500" />
              <span>Danh sách từ</span>
            </button>

            <button
              onClick={() => setActiveInputMode('passage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeInputMode === 'passage'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Bài đọc / Đoạn văn</span>
            </button>

            <button
              onClick={() => setActiveInputMode('image')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeInputMode === 'image'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
              <span>Ảnh OCR</span>
            </button>

          </div>

          {/* Quick Presets Menu */}
          <div className="relative">
            <button
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Nạp bảng mẫu</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showPresetDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-40 animate-fade-in">
                <button
                  onClick={() => handleLoadSample('daily')}
                  className="w-full px-4 py-2.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 flex flex-col gap-0.5"
                >
                  <span className="font-bold flex items-center gap-1.5">
                    ✨ Từ vựng chuẩn (abroad, culinary, criticize...)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Mẫu chuẩn tách đúng phiên âm, loại từ và nghĩa
                  </span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                <button
                  onClick={() => handleLoadSample('contracts')}
                  className="w-full px-4 py-2.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 flex flex-col gap-0.5"
                >
                  <span className="font-bold">Bài 1: Contracts (Hợp đồng)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    34 từ vựng thương mại & hợp đồng
                  </span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                <button
                  onClick={() => handleLoadSample('conferences')}
                  className="w-full px-4 py-2.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 flex flex-col gap-0.5"
                >
                  <span className="font-bold">Bài 2: Conferences (Hội nghị)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    50 từ vựng hội thảo & công sở
                  </span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                <button
                  onClick={() => handleLoadSample('passage')}
                  className="w-full px-4 py-2.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 flex flex-col gap-0.5"
                >
                  <span className="font-bold">Đoạn văn đọc hiểu tiếng Anh mẫu</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Trích xuất từ khóa, sinh phiên âm và dịch nghĩa tự động
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Smart Input Area (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* 1. SMART LIST INPUT MODE */}
            {activeInputMode === 'list' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Nhập hoặc Dán danh sách từ
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Hỗ trợ định dạng: Từ - Nghĩa, Từ : Nghĩa, IPA, hoặc copy từ Excel
                      </p>
                    </div>
                  </div>
                </div>

                {/* Toolbar Buttons: Auto-format, Paste, Clear */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs border border-slate-200/50 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={handleFormatListText}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:border-brand-500 hover:text-brand-600 text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                    title="Xóa số thứ tự đầu dòng, gạch đầu dòng, chuẩn hóa khoảng trắng và căn chỉnh văn bản"
                  >
                    <Wand2 className="w-3 h-3 text-brand-500" />
                    <span>Tự định dạng</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:border-brand-500 hover:text-brand-600 text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <ClipboardPaste className="w-3 h-3 text-indigo-500" />
                    <span>Dán clipboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setListInputText('')}
                    className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] ml-auto font-bold transition-colors"
                  >
                    Xóa trắng
                  </button>
                </div>

                {/* Textarea */}
                <div className="space-y-1.5">
                  <textarea
                    rows={13}
                    value={listInputText}
                    onChange={(e) => setListInputText(e.target.value)}
                    placeholder={`Dán văn bản từ vựng vào đây, ví dụ:\n\nabroad /əˈbrɔːd/ ở nước ngoài\nculinary /ˈkʌlɪnəri/ (thuộc về) ẩm thực, nấu ăn\ncriticize /ˈkrɪtɪsaɪz/ chỉ trích, phê bình\njustify /ˈdʒʌstɪfaɪ/ biện minh, giải thích lý do\neggplant /ˈeɡplɑːnt/ cà tím\nkeep in mind /kiːp ɪn maɪnd/ ghi nhớ, lưu ý\npreorder đặt hàng trước\nbe released được phát hành, ra mắt\nproduct line dòng sản phẩm\n\nHoặc dán trực tiếp nhiều cột từ Excel / Google Sheets!`}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>
                      {listInputText ? listInputText.split(/\r?\n/).filter(Boolean).length : 0} dòng
                    </span>
                    <span>Tự động tách tiếng Anh, IPA và tiếng Việt</span>
                  </div>
                </div>

                {/* AI Configuration Options */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                    Tùy chọn tự động thông minh:
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoAddIpa}
                      onChange={(e) => setAutoAddIpa(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Tự động tạo phiên âm chuẩn IPA nếu thiếu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoTranslateMeaning}
                      onChange={(e) => setAutoTranslateMeaning(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Tự động tra nghĩa tiếng Việt nếu thiếu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoClassifyPos}
                      onChange={(e) => setAutoClassifyPos(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Tự nhận diện loại từ (Danh từ, Động từ, Tính từ, Trạng từ, Cụm từ)</span>
                  </label>
                </div>

                {/* Execute Button */}
                <button
                  type="button"
                  onClick={handleProcessListInput}
                  disabled={!listInputText.trim() || isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trích xuất danh sách vào Bảng từ vựng</span>
                </button>
              </div>
            )}

            {/* 2. PASSAGE / ARTICLE EXTRACTION MODE */}
            {activeInputMode === 'passage' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Trích xuất từ vựng từ bài đọc
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Dán bài báo, đoạn văn TOEIC/IELTS, câu chuyện để tự động lọc từ vựng
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs border border-slate-200/50 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('passage')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:border-brand-500 text-[11px] flex items-center gap-1 shadow-xs"
                  >
                    <BookOpen className="w-3 h-3 text-indigo-500" />
                    <span>Bài đọc mẫu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:border-brand-500 text-[11px] flex items-center gap-1 shadow-xs"
                  >
                    <ClipboardPaste className="w-3 h-3 text-indigo-500" />
                    <span>Dán clipboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassageInputText('')}
                    className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-bold"
                  >
                    Xóa trắng
                  </button>
                </div>

                <textarea
                  rows={13}
                  value={passageInputText}
                  onChange={(e) => setPassageInputText(e.target.value)}
                  placeholder="Dán toàn bộ đoạn văn bản tiếng Anh vào đây..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                <button
                  type="button"
                  onClick={handleProcessPassageInput}
                  disabled={!passageInputText.trim() || isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trích xuất từ khóa, sinh phiên âm & dịch nghĩa</span>
                </button>
              </div>
            )}

            {activeInputMode === 'image' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Nhận diện từ vựng từ ảnh có sẵn
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Chọn ảnh từ thiết bị. OCR chạy ngay trên điện thoại và không cần Internet.
                  </p>
                </div>

                <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                  <ImageIcon className="h-5 w-5 text-sky-500" />
                  <span>{selectedImage ? 'Chọn ảnh khác' : 'Chọn ảnh từ thiết bị'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="sr-only"
                  />
                </label>

                {selectedImage && (
                  <>
                    <img
                      src={selectedImage}
                      alt="Ảnh được chọn để nhận diện"
                      className="max-h-64 w-full rounded-xl border border-slate-200 object-contain dark:border-slate-700"
                    />

                    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Bố cục bảng trong ảnh
                      </span>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="imageLayout"
                          checked={imageLayoutMode === 'split_2_columns'}
                          onChange={() => setImageLayoutMode('split_2_columns')}
                        />
                        <span>Bảng 2 cột song song</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="imageLayout"
                          checked={imageLayoutMode === 'single_table'}
                          onChange={() => setImageLayoutMode('single_table')}
                        />
                        <span>Bảng đơn</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="imageLayout"
                          checked={imageLayoutMode === 'free_text'}
                          onChange={() => setImageLayoutMode('free_text')}
                        />
                        <span>Văn bản tự do</span>
                      </label>
                    </div>

                    {isProcessing && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {statusText} ({progress}%)
                      </p>
                    )}

                    <button
                      onClick={handleImageOcr}
                      disabled={isProcessing}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:from-sky-500 hover:to-blue-500 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{isProcessing ? 'Đang nhận diện...' : 'Bắt đầu nhận diện OCR'}</span>
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: High-End Vocabulary Table & Batch Tools (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            {/* Table Header: Filters, Counts, Deck Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Bảng từ vựng đã trích xuất
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                  {extractedWords.length} từ
                </span>
              </div>

              {/* Target Deck Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium shrink-0">Lưu vào bộ:</span>
                <select
                  value={targetDeckId}
                  onChange={(e) => setTargetDeckId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">-- Mặc định (Tất cả) --</option>
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
                <button
                  onClick={() => setFilterResultTab('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filterResultTab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Tất cả ({extractedWords.length})
                </button>
                <button
                  onClick={() => setFilterResultTab('new')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filterResultTab === 'new'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Từ mới ({extractedWords.filter((w) => !w.isExisting).length})
                </button>
                <button
                  onClick={() => setFilterResultTab('existing')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filterResultTab === 'existing'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Đã có trong kho ({extractedWords.filter((w) => w.isExisting).length})
                </button>
              </div>

              {/* In-table Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Lọc từ hoặc nghĩa..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 w-44"
                />
              </div>
            </div>

            {/* Table Content */}
            {extractedWords.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Chưa có từ vựng nào được trích xuất
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy nhập danh sách ở bên trái hoặc nhấn nút "Nạp bảng mẫu" ở trên để trải nghiệm công nghệ trích xuất thông minh.
                </p>
                <button
                  onClick={() => handleLoadSample('daily')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
                >
                  ✨ Nạp từ mẫu ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-8">
                          <button
                            onClick={handleToggleSelectAll}
                            className="text-slate-400 hover:text-brand-500"
                          >
                            {selectedCount === displayWords.length && displayWords.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-brand-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="py-2.5 px-3">Từ tiếng Anh</th>
                        <th className="py-2.5 px-3">Phiên âm IPA</th>
                        <th className="py-2.5 px-3">Loại từ</th>
                        <th className="py-2.5 px-3">Nghĩa tiếng Việt</th>
                        <th className="py-2.5 px-3 text-right">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {displayWords.map((item) => {
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                              item.selected ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-2.5 px-3">
                              <button
                                onClick={() =>
                                  handleUpdateItem(item.id, 'selected', !item.selected)
                                }
                                className="text-slate-400 hover:text-brand-500"
                              >
                                {item.selected ? (
                                  <CheckSquare className="w-4 h-4 text-brand-500" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* English Word */}
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                              <div className="flex items-center gap-2">
                                <SpeakerButton text={item.word} size="sm" />
                                <input
                                  type="text"
                                  value={item.word}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, 'word', e.target.value)
                                  }
                                  className="font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:outline-none w-32 sm:w-40"
                                />
                                {item.isExisting && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                                    Đã có
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* IPA */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.ipa || ''}
                                onChange={(e) => handleUpdateItem(item.id, 'ipa', e.target.value)}
                                placeholder="/.../"
                                className="font-mono text-slate-600 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:outline-none w-28"
                              />
                            </td>

                            {/* Part of Speech */}
                            <td className="py-2.5 px-3">
                              <select
                                value={item.partOfSpeech}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    'partOfSpeech',
                                    e.target.value as PartOfSpeech
                                  )
                                }
                                className={`px-2 py-0.5 rounded-md font-bold text-[11px] border focus:outline-none ${
                                  POS_COLORS[item.partOfSpeech] || POS_COLORS.noun
                                }`}
                              >
                                {Object.entries(POS_LABELS).map(([posKey, posName]) => (
                                  <option key={posKey} value={posKey}>
                                    {posName}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Meaning */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.meaning}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, 'meaning', e.target.value)
                                }
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:outline-none font-medium text-slate-800 dark:text-slate-200"
                              />
                            </td>

                            {/* Delete Action */}
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                                title="Xóa từ này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Actions & Batch Save */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddNewManualRow}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-500 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm dòng mới</span>
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      Đã chọn: <b className="text-brand-600 dark:text-brand-400">{selectedCount}</b> / {extractedWords.length} từ
                    </span>
                  </div>

                  <button
                    onClick={handleSaveToVocabBank}
                    disabled={selectedCount === 0}
                    className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/25 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu vào kho từ vựng ({selectedCount})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
