import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { VocabularyBank } from './pages/VocabularyBank';
import { OcrCapture } from './pages/OcrCapture';
import { FlashcardStudy } from './pages/FlashcardStudy';
import { WritingPractice } from './pages/WritingPractice';
import { QuizPractice } from './pages/QuizPractice';
import { ListeningPractice } from './pages/ListeningPractice';
import { SmartReview } from './pages/SmartReview';
import { DeckManagement } from './pages/DeckManagement';
import { StatisticsProgress } from './pages/StatisticsProgress';
import { SettingsBackup } from './pages/SettingsBackup';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="vocab" element={<VocabularyBank />} />
            <Route path="ocr" element={<OcrCapture />} />
            <Route path="flashcard" element={<FlashcardStudy />} />
            <Route path="writing" element={<WritingPractice />} />
            <Route path="quiz" element={<QuizPractice />} />
            <Route path="listening" element={<ListeningPractice />} />
            <Route path="review" element={<SmartReview />} />
            <Route path="decks" element={<DeckManagement />} />
            <Route path="stats" element={<StatisticsProgress />} />
            <Route path="settings" element={<SettingsBackup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
