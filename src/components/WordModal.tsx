import React, { useState, useEffect } from 'react';
import { X, Volume2, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PartOfSpeech, Word } from '../types';
import { speakText } from '../services/speech';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editWord?: Word | null;
}

export const WordModal: React.FC<WordModalProps> = ({ isOpen, onClose, editWord }) => {
  const { addWord, updateWord, decks } = useApp();

  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [ipa, setIpa] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [example, setExample] = useState('');
  const [exampleMeaning, setExampleMeaning] = useState('');
  const [deckId, setDeckId] = useState('');
  const [additionalMeanings, setAdditionalMeanings] = useState<string>('');
  const [errors, setErrors] = useState<{ word?: string; meaning?: string }>({});

  useEffect(() => {
    if (editWord) {
      setWord(editWord.word);
      setMeaning(editWord.meaning);
      setIpa(editWord.ipa || '');
      setPartOfSpeech(editWord.partOfSpeech || 'noun');
      setExample(editWord.example || '');
      setExampleMeaning(editWord.exampleMeaning || '');
      setDeckId(editWord.deckId || '');
      setAdditionalMeanings(editWord.acceptableMeanings?.join(', ') || '');
    } else {
      setWord('');
      setMeaning('');
      setIpa('');
      setPartOfSpeech('noun');
      setExample('');
      setExampleMeaning('');
      setDeckId(decks[0]?.id || '');
      setAdditionalMeanings('');
    }
    setErrors({});
  }, [editWord, isOpen, decks]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { word?: string; meaning?: string } = {};

    if (!word.trim()) newErrors.word = 'Vui lòng nhập từ tiếng Anh';
    if (!meaning.trim()) newErrors.meaning = 'Vui lòng nhập nghĩa tiếng Việt';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedDeck = decks.find((d) => d.id === deckId);
    const parsedAltMeanings = additionalMeanings
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (editWord) {
      updateWord(editWord.id, {
        word: word.trim(),
        meaning: meaning.trim(),
        ipa: ipa.trim(),
        partOfSpeech,
        example: example.trim(),
        exampleMeaning: exampleMeaning.trim(),
        deckId: selectedDeck?.id,
        deckName: selectedDeck?.name,
        acceptableMeanings: parsedAltMeanings,
      });
    } else {
      addWord({
        word: word.trim(),
        meaning: meaning.trim(),
        ipa: ipa.trim(),
        partOfSpeech,
        example: example.trim(),
        exampleMeaning: exampleMeaning.trim(),
        deckId: selectedDeck?.id,
        deckName: selectedDeck?.name,
        memoryLevel: 'new',
        acceptableMeanings: parsedAltMeanings,
      });
    }

    onClose();
  };

  const handleTestPronounce = () => {
    if (word.trim()) {
      speakText(word.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {editWord ? 'Sửa thông tin từ vựng' : 'Thêm từ vựng mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Từ tiếng Anh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: Delicious"
                  value={word}
                  onChange={(e) => {
                    setWord(e.target.value);
                    if (errors.word) setErrors((prev) => ({ ...prev, word: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    errors.word ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {word.trim() && (
                  <button
                    type="button"
                    onClick={handleTestPronounce}
                    title="Nghe thử phát âm"
                    className="absolute right-2 top-2 p-1 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {errors.word && <p className="text-xs text-rose-500 mt-1">{errors.word}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nghĩa tiếng Việt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Thơm ngon, ngon miệng"
                value={meaning}
                onChange={(e) => {
                  setMeaning(e.target.value);
                  if (errors.meaning) setErrors((prev) => ({ ...prev, meaning: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.meaning ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {errors.meaning && <p className="text-xs text-rose-500 mt-1">{errors.meaning}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Phiên âm IPA (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: /dɪˈlɪʃəs/"
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Loại từ
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="noun">Danh từ (noun)</option>
                <option value="verb">Động từ (verb)</option>
                <option value="adjective">Tính từ (adjective)</option>
                <option value="adverb">Trạng từ (adverb)</option>
                <option value="preposition">Giới từ (preposition)</option>
                <option value="conjunction">Liên từ (conjunction)</option>
                <option value="phrase">Cụm từ (phrase)</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Bộ từ vựng (Chủ đề)
            </label>
            <select
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Chưa phân loại --</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Ví dụ câu tiếng Anh
            </label>
            <input
              type="text"
              placeholder="Ví dụ: This soup is delicious."
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Bản dịch tiếng Việt của ví dụ
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Món súp này rất thơm ngon."
              value={exampleMeaning}
              onChange={(e) => setExampleMeaning(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nghĩa phụ chấp nhận khi làm bài viết (cách nhau bởi dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: ngon, ngon lành, tuyệt hảo"
              value={additionalMeanings}
              onChange={(e) => setAdditionalMeanings(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 active:scale-95 transition-all"
            >
              {editWord ? 'Lưu thay đổi' : 'Thêm vào kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
