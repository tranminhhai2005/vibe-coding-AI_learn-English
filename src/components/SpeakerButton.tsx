import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakText, stopSpeaking } from '../services/speech';
import { useApp } from '../context/AppContext';

interface SpeakerButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({
  text,
  size = 'md',
  className = '',
  title = 'Nghe phát âm',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { settings, addToast } = useApp();

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      const played = await speakText(text, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        voiceURI: settings.speechVoiceURI,
      });
      if (!played) setIsPlaying(false);
    } catch (error) {
      console.error('[Speech] Playback failed:', error);
      addToast('Không thể phát âm thanh. Hãy kiểm tra cài đặt giọng đọc trên thiết bị.', 'error');
    } finally {
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={title}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 active:scale-95 ${
        isPlaying
          ? 'bg-brand-500 text-white shadow-md glow-primary animate-pulse'
          : 'bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 dark:text-brand-300'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <Volume2 className={`${iconSizes[size]} animate-bounce`} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  );
};
