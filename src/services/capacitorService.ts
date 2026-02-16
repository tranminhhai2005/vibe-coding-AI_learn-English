/**
 * capacitorService.ts
 * Wrapper thông minh cho Capacitor APIs.
 * - Tự động detect môi trường (Android native vs Web browser)
 * - Fallback graceful khi chạy trên web
 */

// ─── Type helpers ───────────────────────────────────────────────────────────

declare const Capacitor: {
  isNativePlatform: () => boolean;
  getPlatform: () => 'android' | 'ios' | 'web';
} | undefined;

export const isAndroid = (): boolean => {
  try {
    return typeof Capacitor !== 'undefined' && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
};

export const isNative = (): boolean => {
  try {
    return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

// ─── Haptic Feedback ─────────────────────────────────────────────────────────

export const hapticLight = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // ignore on web
  }
};

export const hapticMedium = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // ignore on web
  }
};

export const hapticSuccess = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // ignore on web
  }
};

// ─── Preferences (Storage) ───────────────────────────────────────────────────

export const prefSet = async (key: string, value: string): Promise<void> => {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
      return;
    } catch {
      // fallback to localStorage
    }
  }
  localStorage.setItem(key, value);
};

export const prefGet = async (key: string): Promise<string | null> => {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      // fallback to localStorage
    }
  }
  return localStorage.getItem(key);
};

export const prefRemove = async (key: string): Promise<void> => {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
      return;
    } catch {
      // fallback
    }
  }
  localStorage.removeItem(key);
};

// ─── File System ──────────────────────────────────────────────────────────────

/**
 * Đọc nội dung một file text từ thiết bị.
 * Trên Android native: dùng @capacitor/filesystem (qua file picker)
 * Trên Web: dùng File API bình thường
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Không thể đọc file'));
    reader.readAsText(file, 'utf-8');
  });
};

/**
 * Lưu dữ liệu xuống file (export).
 * Trên Android: tạo blob và trigger download qua <a> tag
 * Capacitor filesystem cần quyền WRITE_EXTERNAL_STORAGE (API < 29)
 * Trên Android 10+: Share API hoặc MediaStore
 */
export const exportToFile = async (
  filename: string,
  content: string,
  mimeType = 'application/json'
): Promise<void> => {
  if (isNative()) {
    try {
      const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
      await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      // Thông báo cho người dùng
      alert(`✅ Đã lưu file "${filename}" vào thư mục Documents.`);
      return;
    } catch (err) {
      console.warn('Filesystem write failed, falling back to download:', err);
    }
  }

  // Web fallback: trigger browser download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── Status Bar ───────────────────────────────────────────────────────────────

export const setStatusBarDark = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch {
    // ignore
  }
};

// ─── App lifecycle ────────────────────────────────────────────────────────────

export const addBackButtonListener = (handler: () => boolean): (() => void) => {
  if (!isNative()) return () => {};

  let removeListener: (() => void) | null = null;

  import('@capacitor/app').then(({ App }) => {
    const listener = App.addListener('backButton', ({ canGoBack }) => {
      const handled = handler();
      if (!handled && !canGoBack) {
        App.exitApp();
      }
    });

    removeListener = () => {
      listener.then((l) => l.remove());
    };
  });

  return () => {
    if (removeListener) removeListener();
  };
};
