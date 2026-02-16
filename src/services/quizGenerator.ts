import { QuizQuestion, QuizType, Word } from '../types';

// Helper to shuffle an array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate multiple choice options with smart distractors
function generateOptions(
  correctOption: string,
  allCandidates: string[],
  desiredCount: number = 4
): string[] {
  const uniqueDistractors = Array.from(
    new Set(allCandidates.filter((c) => c && c.trim().toLowerCase() !== correctOption.trim().toLowerCase()))
  );

  const shuffledDistractors = shuffleArray(uniqueDistractors);
  const neededDistractors = Math.min(desiredCount - 1, shuffledDistractors.length);
  const selectedDistractors = shuffledDistractors.slice(0, neededDistractors);

  const finalOptions = shuffleArray([correctOption, ...selectedDistractors]);
  return finalOptions;
}

export function generateQuizQuestions(
  poolWords: Word[],
  allWords: Word[],
  count: number = 10,
  typesAllowed: QuizType[] = ['en_to_vi', 'vi_to_en', 'audio_to_en', 'fill_blank']
): QuizQuestion[] {
  if (poolWords.length === 0) return [];

  // Candidate pool
  let candidateWords: Word[] = [];
  if (poolWords.length >= count) {
    candidateWords = shuffleArray(poolWords).slice(0, count);
  } else {
    // If pool has fewer words than requested count, cycle through poolWords
    while (candidateWords.length < count) {
      const remaining = count - candidateWords.length;
      candidateWords = candidateWords.concat(shuffleArray(poolWords).slice(0, remaining));
    }
  }
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < candidateWords.length; i++) {
    const word = candidateWords[i];

    // Pick a quiz type
    // If fill_blank is chosen but word has no example sentence containing the word, fallback to another type
    const possibleTypes = typesAllowed.filter((t) => {
      if (t === 'fill_blank') {
        if (!word.example) return false;
        // check if example contains word case-insensitively
        const re = new RegExp(`\\b${escapeRegExp(word.word)}\\b`, 'i');
        return re.test(word.example);
      }
      return true;
    });

    const chosenType =
      possibleTypes.length > 0
        ? possibleTypes[Math.floor(Math.random() * possibleTypes.length)]
        : 'en_to_vi';

    let prompt = '';
    let subPrompt: string | undefined = undefined;
    let correctAnswer = '';
    let options: string[] = [];
    let audioWord: string | undefined = undefined;
    let explanation = '';

    if (chosenType === 'en_to_vi') {
      prompt = `Từ "${word.word}" có nghĩa là gì?`;
      subPrompt = word.ipa ? `Phát âm: ${word.ipa}` : undefined;
      correctAnswer = word.meaning;
      // All other Vietnamese meanings as distractor candidates
      const candidates = allWords.map((w) => w.meaning);
      options = generateOptions(correctAnswer, candidates, 4);
      audioWord = word.word;
      explanation = `"${word.word}" nghĩa là "${word.meaning}". Ví dụ: ${word.example || 'Chưa có ví dụ.'}`;
    } else if (chosenType === 'vi_to_en') {
      prompt = `"${word.meaning}" trong tiếng Anh là từ nào?`;
      correctAnswer = word.word;
      const candidates = allWords.map((w) => w.word);
      options = generateOptions(correctAnswer, candidates, 4);
      explanation = `Đáp án đúng là "${word.word}" (${word.ipa || ''}) - ${word.meaning}`;
    } else if (chosenType === 'audio_to_en') {
      prompt = 'Nghe phát âm và chọn từ tiếng Anh tương ứng:';
      subPrompt = 'Nhấn nút loa để nghe lại âm thanh';
      correctAnswer = word.word;
      const candidates = allWords.map((w) => w.word);
      options = generateOptions(correctAnswer, candidates, 4);
      audioWord = word.word;
      explanation = `Từ vừa phát âm là "${word.word}" (${word.ipa || ''}): ${word.meaning}`;
    } else if (chosenType === 'fill_blank') {
      // Replace target word in example with blank '_____'
      const regex = new RegExp(`\\b${escapeRegExp(word.word)}\\b`, 'gi');
      const blankSentence = word.example!.replace(regex, '_____');
      prompt = 'Điền từ còn thiếu vào câu sau:';
      subPrompt = `"${blankSentence}"\n(Dịch: ${word.exampleMeaning || ''})`;
      correctAnswer = word.word;
      const candidates = allWords.map((w) => w.word);
      options = generateOptions(correctAnswer, candidates, 4);
      audioWord = word.word;
      explanation = `Câu hoàn chỉnh: "${word.example}". Dịch: ${word.exampleMeaning || word.meaning}`;
    }

    questions.push({
      id: `quiz-q-${i + 1}-${word.id}`,
      type: chosenType,
      prompt,
      subPrompt,
      audioWord,
      options,
      correctAnswer,
      word,
      explanation,
    });
  }

  return questions;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
