/**
 * Shared text-to-speech and speech-recognition service.
 */
import { Capacitor } from '@capacitor/core';
import { QueueStrategy, TextToSpeech } from '@capacitor-community/text-to-speech';

export interface SpeechSettingsOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  lang?: string;
}

const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === 'android';
let activeSpeechId = 0;
let finishActiveSpeech: ((played: boolean) => void) | undefined;

export function isNativeSpeechPlatform(): boolean {
  return isNative;
}

export function isAndroidSpeechPlatform(): boolean {
  return isAndroid;
}

export function isSpeechSynthesisSupported(): boolean {
  return isNative || (typeof window !== 'undefined' && 'speechSynthesis' in window);
}

export async function getSupportedSpeechLanguages(): Promise<string[]> {
  if (isNative) {
    const { languages } = await TextToSpeech.getSupportedLanguages();
    return languages;
  }
  const voices = await getAvailableVoices();
  return [...new Set(voices.map((voice) => voice.lang))];
}

export async function openSpeechInstallSettings(): Promise<void> {
  if (!isAndroid) {
    throw new Error('Cài đặt dữ liệu giọng đọc chỉ khả dụng trong ứng dụng Android.');
  }
  await TextToSpeech.openInstall();
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (isNative) {
    return TextToSpeech.getSupportedVoices().then(({ voices }) => voices);
  }

  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
      return;
    }

    synth.onvoiceschanged = () => {
      cachedVoices = synth.getVoices();
      resolve(cachedVoices);
    };

    // Fallback timeout in case onvoiceschanged does not fire
    setTimeout(() => {
      resolve(synth.getVoices());
    }, 500);
  });
}

function reportSpeechError(error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  const message = /language is not supported|lang_missing_data|language[-_ ]unavailable|failed to read text/i.test(detail)
    ? 'Chưa có dữ liệu giọng đọc tiếng Anh trên thiết bị. Hãy cài giọng English trong cài đặt Chuyển văn bản thành giọng nói của Android.'
    : /not yet initialized|not available on this device|no tts engine|engine not found/i.test(detail)
      ? 'Thiết bị chưa sẵn sàng đọc văn bản. Hãy cài hoặc bật công cụ Chuyển văn bản thành giọng nói của Android.'
      : `Không thể phát âm thanh: ${detail}`;

  console.error('[Speech] Text-to-speech failed:', error);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('learn-english:speech-error', { detail: message }));
  }
}

async function stopNativeSpeech(): Promise<void> {
  try {
    await TextToSpeech.stop();
  } catch (error) {
    console.warn('[Speech] Unable to stop native speech:', error);
  }
}

export async function speakText(text: string, options?: SpeechSettingsOptions): Promise<boolean> {
  const cleanText = text.trim();
  if (!cleanText) return false;

  const requestId = ++activeSpeechId;
  finishActiveSpeech?.(false);
  finishActiveSpeech = undefined;

  if (!isSpeechSynthesisSupported()) {
    reportSpeechError(new Error('Text-to-speech is not supported on this device.'));
    return false;
  }

  if (isNative) {
    await stopNativeSpeech();
    if (requestId !== activeSpeechId) return false;

    let voices: SpeechSynthesisVoice[] = [];
    try {
      const response = await TextToSpeech.getSupportedVoices();
      voices = response.voices;
    } catch (error) {
      console.warn('[Speech] Unable to query native voices:', error);
    }

    const selectedVoice = options?.voiceURI
      ? voices.findIndex((voice) => voice.voiceURI === options.voiceURI)
      : -1;
    const defaultEnglishVoice = voices.findIndex((item) =>
      item.lang.toLowerCase().startsWith('en-us')
    );
    const britishEnglishVoice = voices.findIndex((item) =>
      item.lang.toLowerCase().startsWith('en-gb')
    );
    const voiceIndex = selectedVoice >= 0
      ? selectedVoice
      : defaultEnglishVoice >= 0
        ? defaultEnglishVoice
        : britishEnglishVoice;
    const voice = voiceIndex >= 0 ? voices[voiceIndex] : undefined;
    const lang = options?.lang ?? voice?.lang ?? 'en-US';

    return new Promise((resolve) => {
      let completed = false;
      const finish = (played: boolean) => {
        if (completed) return;
        completed = true;
        if (requestId === activeSpeechId) finishActiveSpeech = undefined;
        resolve(played);
      };
      finishActiveSpeech = finish;

      const attemptSpeak = async (attempt: number): Promise<void> => {
        if (requestId !== activeSpeechId) {
          finish(false);
          return;
        }
        try {
          await TextToSpeech.speak({
            text: cleanText,
            lang,
            rate: options?.rate ?? 1.0,
            pitch: options?.pitch ?? 1.0,
            volume: 1.0,
            voice: voiceIndex >= 0 ? voiceIndex : undefined,
            queueStrategy: QueueStrategy.Flush,
          });
          finish(true);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (attempt < 5 && /not yet initialized/i.test(message)) {
            await new Promise((retry) => setTimeout(retry, 250));
            await attemptSpeak(attempt + 1);
            return;
          }
          if (requestId === activeSpeechId) reportSpeechError(error);
          finish(false);
        }
      };

      void attemptSpeak(0);
    });
  }

  const synth = window.speechSynthesis;
  return new Promise((resolve) => {
    let completed = false;
    const finish = (played: boolean) => {
      if (completed) return;
      completed = true;
      if (requestId === activeSpeechId) finishActiveSpeech = undefined;
      resolve(played);
    };
    finishActiveSpeech = finish;
    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;

      const voices = cachedVoices.length > 0 ? cachedVoices : synth.getVoices();
      const selectedVoice = options?.voiceURI
        ? voices.find((voice) => voice.voiceURI === options.voiceURI)
        : undefined;
      const preferredVoice = selectedVoice ?? voices.find(
        (voice) =>
          (voice.lang.toLowerCase().startsWith('en-us') ||
            voice.lang.toLowerCase().startsWith('en-gb')) &&
          /natural|google|samantha|english/i.test(voice.name)
      ) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));

      utterance.lang = options?.lang ?? preferredVoice?.lang ?? 'en-US';
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => finish(true);
      utterance.onerror = (event) => {
        if (requestId === activeSpeechId) reportSpeechError(event.error);
        finish(false);
      };
      synth.speak(utterance);
    } catch (error) {
      reportSpeechError(error);
      finish(false);
    }
  });
}

export function stopSpeaking(): void {
  activeSpeechId += 1;
  finishActiveSpeech?.(false);
  finishActiveSpeech = undefined;

  if (isNative) {
    void stopNativeSpeech();
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech recognition for pronunciation practice
export interface SpeechRecognitionListener {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function startSpeechRecognition(
  lang: string = 'en-US',
  listeners: SpeechRecognitionListener
): { stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    listeners.onError('Trình duyệt hiện tại không hỗ trợ Web Speech Recognition. Khuyến khích sử dụng Google Chrome hoặc Microsoft Edge.');
    return null;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      listeners.onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      listeners.onError(event.error || 'Lỗi nhận diện giọng nói');
    };

    recognition.onend = () => {
      listeners.onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {}
      },
    };
  } catch (err: any) {
    listeners.onError(err.message || 'Không thể khởi động micro.');
    return null;
  }
}
