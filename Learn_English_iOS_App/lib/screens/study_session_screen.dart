import 'dart:async';

import 'package:flutter/material.dart';

import '../database/app_database.dart';
import '../models/quiz_question.dart';
import '../models/vocabulary_word.dart';
import '../services/quiz_service.dart';
import '../services/speech_service.dart';
import '../utils/answer_utils.dart';

enum StudyMode {
  flashcards,
  writingEnglishVietnamese,
  writingVietnameseEnglish,
  listeningTyping,
  quizEnglishVietnamese,
  quizVietnameseEnglish,
  listeningChoice,
  fillBlank,
}

class StudySessionScreen extends StatefulWidget {
  const StudySessionScreen({
    super.key,
    required this.mode,
    this.words,
    this.limit,
    this.timed = false,
  });

  final StudyMode mode;
  final List<VocabularyWord>? words;
  final int? limit;
  final bool timed;

  @override
  State<StudySessionScreen> createState() => _StudySessionScreenState();
}

class _StudySessionScreenState extends State<StudySessionScreen> {
  final _answer = TextEditingController();
  List<VocabularyWord> _words = [];
  List<QuizQuestion> _questions = [];
  final List<VocabularyWord> _wrongWords = [];
  int _index = 0;
  int _correct = 0;
  bool _loading = true;
  bool _submitting = false;
  bool _revealed = false;
  bool? _lastCorrect;
  String? _selectedChoice;
  bool _showMeaning = false;
  Timer? _timer;
  int _secondsLeft = 20;

  bool get _isFlashcard => widget.mode == StudyMode.flashcards;
  bool get _isWriting =>
      widget.mode == StudyMode.writingEnglishVietnamese ||
      widget.mode == StudyMode.writingVietnameseEnglish ||
      widget.mode == StudyMode.listeningTyping;

  QuizKind? get _quizKind => switch (widget.mode) {
    StudyMode.quizEnglishVietnamese => QuizKind.englishToVietnamese,
    StudyMode.quizVietnameseEnglish => QuizKind.vietnameseToEnglish,
    StudyMode.listeningChoice => QuizKind.listening,
    StudyMode.fillBlank => QuizKind.fillBlank,
    _ => null,
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _answer.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      var words = widget.words ?? await AppDatabase.instance.getWordsToReview();
      if (words.isEmpty && widget.words == null) {
        words = await AppDatabase.instance.getWords();
      }
      words = [...words]..shuffle();
      final kind = _quizKind;
      final questions = kind == null
          ? <QuizQuestion>[]
          : buildQuiz(words, kind: kind, limit: widget.limit);
      if (widget.limit != null &&
          kind == null &&
          words.length > widget.limit!) {
        words = words.take(widget.limit!).toList();
      }
      if (mounted) {
        setState(() {
          _words = words;
          _questions = questions;
          _loading = false;
        });
        if (widget.timed && !_isFlashcard && _hasCurrent) {
          _startTimer();
        }
      }
    } catch (error) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không tải được buổi học: $error')),
        );
      }
    }
  }

  bool get _hasCurrent =>
      _quizKind == null ? _index < _words.length : _index < _questions.length;

  int get _total => _quizKind == null ? _words.length : _questions.length;

  VocabularyWord? get _currentWord {
    if (_quizKind == null) {
      return _index < _words.length ? _words[_index] : null;
    }
    final id = _questions[_index].wordId;
    for (final word in _words) {
      if (word.id == id) return word;
    }
    return null;
  }

  void _startTimer() {
    _timer?.cancel();
    _secondsLeft = 20;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || _revealed) {
        timer.cancel();
        return;
      }
      if (_secondsLeft <= 1) {
        timer.cancel();
        _submit(null);
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  Future<bool> _record(bool correct, {String mode = 'study'}) async {
    final word = _currentWord;
    if (word == null) return false;
    try {
      await AppDatabase.instance.recordAnswer(
        word: word,
        correct: correct,
        mode: mode,
      );
      if (correct) {
        _correct++;
      } else if (!_wrongWords.any((item) => item.id == word.id)) {
        _wrongWords.add(word);
      }
      return true;
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không lưu được kết quả học: $error')),
        );
      }
      return false;
    }
  }

  Future<void> _submit(String? selected) async {
    if (_revealed || _submitting || !_hasCurrent) return;
    _timer?.cancel();
    final word = _currentWord;
    if (word == null) return;
    _submitting = true;
    final correctAnswer = _quizKind == null
        ? (widget.mode == StudyMode.writingVietnameseEnglish ||
                  widget.mode == StudyMode.listeningTyping
              ? word.word
              : word.meaning)
        : _questions[_index].answer;
    final accepted = widget.mode == StudyMode.writingEnglishVietnamese
        ? [word.meaning, ...word.alternateMeanings]
        : [correctAnswer];
    final isCorrect = selected != null && answerMatches(selected, accepted);
    final saved = await _record(isCorrect, mode: widget.mode.name);
    if (!mounted) return;
    setState(() {
      _submitting = false;
      if (saved) {
        _selectedChoice = selected;
        _revealed = true;
        _lastCorrect = isCorrect;
      }
    });
  }

  void _next() {
    _timer?.cancel();
    setState(() {
      _index++;
      _revealed = false;
      _submitting = false;
      _lastCorrect = null;
      _selectedChoice = null;
      _showMeaning = false;
      _answer.clear();
    });
    if (widget.timed && !_isFlashcard && _hasCurrent) {
      _startTimer();
    }
  }

  Future<void> _flashcardAnswer(bool knew) async {
    if (_submitting) return;
    setState(() => _submitting = true);
    final saved = await _record(knew, mode: 'flashcard');
    if (!mounted || !saved) {
      if (mounted) setState(() => _submitting = false);
      return;
    }
    _next();
  }

  void _repeatWrong() {
    setState(() {
      _words = [..._wrongWords]..shuffle();
      _questions = _quizKind == null
          ? []
          : buildQuiz(_words, kind: _quizKind!, limit: null);
      _wrongWords.clear();
      _index = 0;
      _correct = 0;
      _revealed = false;
      _submitting = false;
      _lastCorrect = null;
      _selectedChoice = null;
    });
  }

  Future<void> _speak(String text) async {
    try {
      await SpeechService.instance.speak(text);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không phát được giọng đọc tiếng Anh: $error'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = switch (widget.mode) {
      StudyMode.flashcards => 'Flashcard',
      StudyMode.writingEnglishVietnamese => 'Luyện viết Anh → Việt',
      StudyMode.writingVietnameseEnglish => 'Luyện viết Việt → Anh',
      StudyMode.listeningTyping => 'Nghe và nhập lại',
      StudyMode.quizEnglishVietnamese => 'Trắc nghiệm Anh → Việt',
      StudyMode.quizVietnameseEnglish => 'Trắc nghiệm Việt → Anh',
      StudyMode.listeningChoice => 'Nghe và chọn từ',
      StudyMode.fillBlank => 'Điền từ vào câu',
    };
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : !_hasCurrent
          ? _SummaryView(
              correct: _correct,
              total: _total,
              wrongWords: _wrongWords,
              onRepeatWrong: _wrongWords.isEmpty ? null : _repeatWrong,
            )
          : _buildSession(context),
    );
  }

  Widget _buildSession(BuildContext context) {
    final word = _currentWord!;
    final progress = _total == 0 ? 0.0 : (_index + 1) / _total;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(5),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 8,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text('${_index + 1}/$_total'),
                ],
              ),
              if (widget.timed && !_isFlashcard)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text('Còn $_secondsLeft giây'),
                ),
            ],
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
            child: _isFlashcard
                ? _flashcard(context, word)
                : _isWriting
                ? _writing(context, word)
                : _quiz(context, word),
          ),
        ),
      ],
    );
  }

  Widget _flashcard(BuildContext context, VocabularyWord word) => Column(
    children: [
      GestureDetector(
        onTap: () => setState(() => _showMeaning = !_showMeaning),
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 280),
          transitionBuilder: (child, animation) =>
              Rotation3DTransition(animation: animation, child: child),
          child: Container(
            key: ValueKey(_showMeaning),
            height: 355,
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(28),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _showMeaning ? word.meaning : word.word,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (_showMeaning && word.ipa.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(word.ipa),
                  ],
                  if (_showMeaning && word.example.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(word.example, textAlign: TextAlign.center),
                    if (word.exampleTranslation.isNotEmpty)
                      Text(
                        word.exampleTranslation,
                        textAlign: TextAlign.center,
                      ),
                  ],
                  const SizedBox(height: 14),
                  Text(_showMeaning ? 'Chạm để xem từ' : 'Chạm để lật thẻ'),
                ],
              ),
            ),
          ),
        ),
      ),
      const SizedBox(height: 16),
      OutlinedButton.icon(
        onPressed: () => _speak(word.word),
        icon: const Icon(Icons.volume_up_rounded),
        label: const Text('Nghe phát âm'),
      ),
      IconButton(
        onPressed: SpeechService.instance.stop,
        icon: const Icon(Icons.stop_circle_outlined),
        tooltip: 'Dừng phát âm',
      ),
      if (_showMeaning && word.example.isNotEmpty)
        OutlinedButton.icon(
          onPressed: () => _speak(word.example),
          icon: const Icon(Icons.record_voice_over_outlined),
          label: const Text('Nghe ví dụ'),
        ),
      if (_showMeaning) ...[
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _flashcardAnswer(false),
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Chưa thuộc'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: FilledButton.icon(
                onPressed: () => _flashcardAnswer(true),
                icon: const Icon(Icons.check_rounded),
                label: const Text('Đã thuộc'),
              ),
            ),
          ],
        ),
      ],
    ],
  );

  Widget _writing(BuildContext context, VocabularyWord word) {
    final englishToVietnamese =
        widget.mode == StudyMode.writingEnglishVietnamese;
    final listeningTyping = widget.mode == StudyMode.listeningTyping;
    final prompt = listeningTyping
        ? 'Nghe từ tiếng Anh và nhập lại'
        : englishToVietnamese
        ? word.word
        : word.meaning;
    final expected = englishToVietnamese ? word.meaning : word.word;
    return Column(
      children: [
        const SizedBox(height: 40),
        Text(
          listeningTyping
              ? 'Nghe và nhập từ'
              : englishToVietnamese
              ? 'Viết nghĩa tiếng Việt'
              : 'Viết từ tiếng Anh',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 18),
        Text(
          prompt,
          textAlign: TextAlign.center,
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        if (listeningTyping)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton.filledTonal(
                  onPressed: () => _speak(word.word),
                  icon: const Icon(Icons.volume_up_rounded),
                  tooltip: 'Nghe từ',
                ),
                IconButton(
                  onPressed: SpeechService.instance.stop,
                  icon: const Icon(Icons.stop_circle_outlined),
                  tooltip: 'Dừng phát âm',
                ),
              ],
            ),
          ),
        if (!englishToVietnamese && !listeningTyping)
          TextButton(
            onPressed: () => setState(() => _showMeaning = true),
            child: Text(
              _showMeaning
                  ? 'Gợi ý: ${word.word.substring(0, 1)}…'
                  : 'Gợi ý chữ cái đầu',
            ),
          ),
        const SizedBox(height: 22),
        TextField(
          controller: _answer,
          enabled: !_revealed,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _submit(_answer.text),
          decoration: InputDecoration(
            hintText: englishToVietnamese
                ? 'Nhập nghĩa tiếng Việt'
                : 'Nhập từ tiếng Anh',
            prefixIcon: const Icon(Icons.edit_rounded),
          ),
        ),
        const SizedBox(height: 16),
        if (!_revealed)
          FilledButton(
            onPressed: () => _submit(_answer.text),
            child: const Text('Kiểm tra'),
          )
        else ...[
          _AnswerResult(correct: _lastCorrect ?? false, expected: expected),
          const SizedBox(height: 12),
          FilledButton(onPressed: _next, child: const Text('Câu tiếp theo')),
        ],
      ],
    );
  }

  Widget _quiz(BuildContext context, VocabularyWord word) {
    final question = _questions[_index];
    return Column(
      children: [
        const SizedBox(height: 28),
        if (widget.mode == StudyMode.listeningChoice)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton.filledTonal(
                iconSize: 48,
                onPressed: () => _speak(word.word),
                icon: const Icon(Icons.volume_up_rounded),
                tooltip: 'Nghe lại từ',
              ),
              IconButton(
                onPressed: SpeechService.instance.stop,
                icon: const Icon(Icons.stop_circle_outlined),
                tooltip: 'Dừng phát âm',
              ),
            ],
          )
        else
          Text(
            question.prompt,
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
        const SizedBox(height: 24),
        ...question.choices.map((choice) {
          final isAnswer = choice == question.answer;
          final isSelected = choice == _selectedChoice;
          final color = !_revealed || (!isAnswer && !isSelected)
              ? null
              : isAnswer
              ? Colors.green.withValues(alpha: .16)
              : Colors.red.withValues(alpha: .14);
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  backgroundColor: color,
                  padding: const EdgeInsets.symmetric(
                    vertical: 15,
                    horizontal: 14,
                  ),
                  alignment: Alignment.centerLeft,
                ),
                onPressed: _revealed ? null : () => _submit(choice),
                child: Text(choice, style: const TextStyle(fontSize: 16)),
              ),
            ),
          );
        }),
        if (_revealed) ...[
          _AnswerResult(
            correct: _lastCorrect ?? false,
            expected: question.answer,
          ),
          const SizedBox(height: 12),
          FilledButton(onPressed: _next, child: const Text('Câu tiếp theo')),
        ],
      ],
    );
  }
}

class Rotation3DTransition extends StatelessWidget {
  const Rotation3DTransition({
    super.key,
    required this.animation,
    required this.child,
  });
  final Animation<double> animation;
  final Widget child;

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: animation,
    child: child,
    builder: (context, child) {
      final value = animation.value;
      return Transform(
        alignment: Alignment.center,
        transform: Matrix4.identity()
          ..setEntry(3, 2, 0.001)
          ..rotateY(3.14159 * (1 - value)),
        child: Opacity(
          opacity: value < 0.5 ? value * 2 : (1 - value) * 2,
          child: child,
        ),
      );
    },
  );
}

class _AnswerResult extends StatelessWidget {
  const _AnswerResult({required this.correct, required this.expected});
  final bool correct;
  final String expected;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: correct
          ? Colors.green.withValues(alpha: .12)
          : Colors.orange.withValues(alpha: .12),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Text(
      correct ? 'Chính xác!' : 'Đáp án: $expected',
      style: TextStyle(
        color: correct ? Colors.green.shade800 : Colors.orange.shade900,
        fontWeight: FontWeight.bold,
      ),
    ),
  );
}

class _SummaryView extends StatelessWidget {
  const _SummaryView({
    required this.correct,
    required this.total,
    required this.wrongWords,
    required this.onRepeatWrong,
  });
  final int correct;
  final int total;
  final List<VocabularyWord> wrongWords;
  final VoidCallback? onRepeatWrong;

  @override
  Widget build(BuildContext context) => Center(
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            total == 0 ? Icons.info_outline_rounded : Icons.celebration_rounded,
            size: 64,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 14),
          Text(
            total == 0 ? 'Chưa thể bắt đầu buổi học' : 'Hoàn thành buổi học!',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            total == 0
                ? 'Cần thêm từ có đủ nghĩa hoặc câu ví dụ phù hợp trong kho.'
                : 'Đúng $correct / $total câu',
          ),
          const SizedBox(height: 18),
          if (wrongWords.isNotEmpty) ...[
            const Text(
              'Từ cần ôn lại',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            ...wrongWords.map(
              (word) => ListTile(
                title: Text(word.word),
                subtitle: Text(word.meaning),
              ),
            ),
            FilledButton.tonal(
              onPressed: onRepeatWrong,
              child: const Text('Làm lại từ sai'),
            ),
          ],
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Đóng'),
          ),
        ],
      ),
    ),
  );
}
