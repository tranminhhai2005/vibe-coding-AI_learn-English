import React, { useState, useEffect } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Volume2,
  Download,
  Upload,
  RefreshCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  exportBackupJSON,
  exportWordsCSV,
  importBackupJSON,
  importWordsCSV,
} from '../services/storage';
import {
  getAvailableVoices,
  getSupportedSpeechLanguages,
  isAndroidSpeechPlatform,
  isNativeSpeechPlatform,
  openSpeechInstallSettings,
  speakText,
} from '../services/speech';

export const SettingsBackup: React.FC = () => {
  const { settings, updateSettings, words, batchAddWords, resetAllData, reloadAllData, addToast } =
    useApp();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supportedSpeechLanguages, setSupportedSpeechLanguages] = useState<string[]>([]);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    getAvailableVoices().then((v) => {
      setVoices(v.filter((x) => x.lang.startsWith('en')));
    }).catch((error: unknown) => {
      console.warn('[Speech] Unable to load voices:', error);
    });
    getSupportedSpeechLanguages().then(setSupportedSpeechLanguages).catch((error: unknown) => {
      console.warn('[Speech] Unable to load supported languages:', error);
    });
  }, []);

  // Export JSON backup
  const handleExportJSON = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LearnEnglish_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Đã tải xuống tệp sao lưu JSON.', 'success');
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const res = importBackupJSON(text);
        if (res.success) {
          reloadAllData();
          addToast(
            `Khôi phục thành công ${res.wordsCount} từ vựng và ${res.decksCount} bộ từ!`,
            'success'
          );
        } else {
          addToast(res.error || 'Lỗi khi nhập tệp sao lưu.', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = exportWordsCSV(words);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LearnEnglish_Vocab_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Đã xuất ${words.length} từ vựng sang tệp CSV.`, 'success');
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const testVoice = async () => {
    try {
      const languages = await getSupportedSpeechLanguages();
      setSupportedSpeechLanguages(languages);
      const englishLanguage = languages.find((lang) => /^en-US$/i.test(lang)) ??
        languages.find((lang) => /^en-GB$/i.test(lang)) ??
        languages.find((lang) => /^en(?:-|$)/i.test(lang));

      if (!englishLanguage) {
        addToast(
          'Thiết bị chưa có giọng đọc tiếng Anh. Hãy cài dữ liệu English trong cài đặt Chuyển văn bản thành giọng nói.',
          'error'
        );
        return;
      }

      const played = await speakText('Hello, how are you?', {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        voiceURI: settings.speechVoiceURI,
        lang: englishLanguage,
      });
      if (played) addToast(`Đã phát thử câu tiếng Anh (${englishLanguage}).`, 'success');
    } catch (error) {
      console.error('[Speech] Voice test failed:', error);
      addToast(
        'Không kiểm tra được giọng đọc. Hãy cài hoặc bật công cụ Chuyển văn bản thành giọng nói của Android.',
        'error'
      );
    }
  };

  const handleOpenSpeechInstall = async () => {
    try {
      await openSpeechInstallSettings();
      addToast(
        'Trong màn hình Android, tải dữ liệu giọng đọc English (United States) hoặc English (United Kingdom).',
        'info'
      );
    } catch (error) {
      console.error('[Speech] Unable to open speech installation settings:', error);
      addToast(
        'Không mở được cài đặt giọng đọc. Vào Cài đặt Android > Hệ thống > Ngôn ngữ & nhập liệu > Chuyển văn bản thành giọng nói.',
        'error'
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
          <Settings className="w-3.5 h-3.5" />
          <span>Hệ thống & Tùy biến</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
          Cài đặt & Quản lý Dữ liệu
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Tùy chỉnh trải nghiệm học tập, giọng phát âm và sao lưu an toàn dữ liệu cá nhân.
        </p>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Giao diện hiển thị
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Giao diện sáng', icon: Sun },
            { id: 'dark', label: 'Giao diện tối', icon: Moon },
            { id: 'system', label: 'Theo hệ thống', icon: Sliders },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = settings.theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSettings({ theme: item.id as any })}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Audio & Speech Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Cài đặt Âm thanh & Phát âm ({isNativeSpeechPlatform() ? 'Android TTS' : 'Web Speech'})
          </h3>
          <button
            type="button"
            onClick={testVoice}
            className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Nghe thử giọng đọc
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {supportedSpeechLanguages.length > 0
              ? `Ngôn ngữ hệ thống hỗ trợ: ${supportedSpeechLanguages.join(', ')}`
              : 'Chưa lấy được danh sách ngôn ngữ giọng đọc từ thiết bị.'}
          </p>
          {isAndroidSpeechPlatform() && (
            <button
              type="button"
              onClick={handleOpenSpeechInstall}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cài đặt dữ liệu giọng đọc Android
            </button>
          )}
          {/* Preferred voice */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Giọng đọc tiếng Anh ưu tiên
            </label>
            <select
              value={settings.speechVoiceURI}
              onChange={(e) => updateSettings({ speechVoiceURI: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="">-- Mặc định trình duyệt (Tự động chọn giọng chuẩn en-US/GB) --</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-400 uppercase tracking-wider">Tốc độ phát âm</span>
              <span className="text-brand-600 dark:text-brand-400 font-mono">
                {settings.speechRate.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Chậm (0.5x)</span>
              <span>Chuẩn (1.0x)</span>
              <span>Nhanh (1.5x)</span>
            </div>
          </div>

          {/* Auto play toggle */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tự động phát âm thanh khi lật từ
              </p>
              <p className="text-xs text-slate-500">
                Tự phát giọng đọc khi chuyển sang flashcard hoặc câu hỏi mới
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoPlayAudio}
              onChange={(e) => updateSettings({ autoPlayAudio: e.target.checked })}
              className="w-5 h-5 text-brand-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Data Backup, Export & Import */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Sao lưu & Phục hồi dữ liệu
        </h3>
        <p className="text-xs text-slate-500">
          Dữ liệu của bạn được lưu hoàn toàn trên trình duyệt (LocalStorage). Hãy xuất tệp sao lưu để không bị mất dữ liệu khi đổi trình duyệt hoặc cài lại máy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                Sao lưu toàn bộ (JSON)
              </span>
              <span className="text-xs text-slate-500">Bao gồm từ vựng, bộ từ & tiến độ</span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 transition-all flex items-center gap-3 text-left cursor-pointer group">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                Phục hồi từ JSON
              </span>
              <span className="text-xs text-slate-500">Nhập tệp đã sao lưu trước đó</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                Xuất bảng tính (CSV)
              </span>
              <span className="text-xs text-slate-500">Mở trên Excel hoặc Google Sheets</span>
            </div>
          </button>

          {/* Import CSV */}
          <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 transition-all flex items-center gap-3 text-left cursor-pointer group">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                Nhập từ tệp CSV
              </span>
              <span className="text-xs text-slate-500">Thêm nhiều từ vựng cùng lúc</span>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4. Danger Zone */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-3xl border border-rose-200 dark:border-rose-900/40 space-y-4">
        <div className="flex items-center gap-2 text-rose-600">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-base font-bold">Vùng quản trị nguy hiểm</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Khôi phục dữ liệu mẫu ban đầu
          </button>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-600">Khôi phục về dữ liệu ban đầu?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Hành động này sẽ xóa các thay đổi hiện tại và đặt lại kho từ vựng về bộ mẫu chuẩn ban đầu. Bạn có muốn tiếp tục?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setConfirmResetOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
