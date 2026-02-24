import 'package:flutter/material.dart';

import '../database/app_database.dart';
import '../models/vocabulary_word.dart';
import 'ocr_import_screen.dart';
import 'study_session_screen.dart';

class LearningHomeScreen extends StatefulWidget {
  const LearningHomeScreen({super.key});

  @override
  State<LearningHomeScreen> createState() => _LearningHomeScreenState();
}

class _LearningHomeScreenState extends State<LearningHomeScreen> {
  String? _deck;
  int? _limit = 10;
  bool _timed = false;

  Future<List<VocabularyWord>> _words() =>
      AppDatabase.instance.getWords(deck: _deck);

  Future<void> _start(StudyMode mode) async {
    try {
      final words = await _words();
      if (!mounted) return;
      if (words.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Hãy thêm từ vựng trước khi bắt đầu học.'),
          ),
        );
        return;
      }
      await Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => StudySessionScreen(
            words: words,
            mode: mode,
            limit: _limit,
            timed: _timed,
          ),
        ),
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể bắt đầu buổi học: $error')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Học tập')),
    body: ListView(
      padding: const EdgeInsets.fromLTRB(18, 4, 18, 30),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tùy chọn buổi học',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                FutureBuilder<List<String>>(
                  future: AppDatabase.instance.getDecks(),
                  builder: (context, snapshot) {
                    if (snapshot.hasError) {
                      return Text('Không tải được bộ từ: ${snapshot.error}');
                    }
                    final decks = snapshot.data ?? const [];
                    return DropdownButtonFormField<String?>(
                      initialValue: decks.contains(_deck) ? _deck : null,
                      decoration: const InputDecoration(
                        labelText: 'Bộ từ vựng',
                      ),
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Tất cả các bộ'),
                        ),
                        ...decks.map(
                          (deck) => DropdownMenuItem<String?>(
                            value: deck,
                            child: Text(deck),
                          ),
                        ),
                      ],
                      onChanged: (value) => setState(() => _deck = value),
                    );
                  },
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<int?>(
                  initialValue: _limit,
                  decoration: const InputDecoration(
                    labelText: 'Số lượng câu / thẻ',
                  ),
                  items: const [
                    DropdownMenuItem(value: 10, child: Text('10')),
                    DropdownMenuItem(value: 20, child: Text('20')),
                    DropdownMenuItem(value: null, child: Text('Tất cả')),
                  ],
                  onChanged: (value) => setState(() => _limit = value),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Giới hạn 20 giây mỗi câu'),
                  value: _timed,
                  onChanged: (value) => setState(() => _timed = value),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Thẻ ghi nhớ',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.style_rounded,
          title: 'Flashcard',
          subtitle: 'Lật thẻ, nghe phát âm và đánh dấu mức độ nhớ.',
          onTap: () => _start(StudyMode.flashcards),
        ),
        const SizedBox(height: 8),
        Text(
          'Luyện viết',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.translate_rounded,
          title: 'Anh → Việt',
          subtitle: 'Nhập nghĩa tiếng Việt của từ tiếng Anh.',
          onTap: () => _start(StudyMode.writingEnglishVietnamese),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.edit_note_rounded,
          title: 'Việt → Anh',
          subtitle: 'Nhớ và viết chính xác từ tiếng Anh.',
          onTap: () => _start(StudyMode.writingVietnameseEnglish),
        ),
        const SizedBox(height: 8),
        Text(
          'Trắc nghiệm và nghe',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.quiz_outlined,
          title: 'Tiếng Anh chọn nghĩa',
          subtitle: 'Chọn nghĩa tiếng Việt phù hợp.',
          onTap: () => _start(StudyMode.quizEnglishVietnamese),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.quiz_rounded,
          title: 'Tiếng Việt chọn từ',
          subtitle: 'Chọn từ tiếng Anh phù hợp.',
          onTap: () => _start(StudyMode.quizVietnameseEnglish),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.headphones_rounded,
          title: 'Nghe và chọn từ',
          subtitle: 'Nghe giọng đọc tiếng Anh native rồi chọn.',
          onTap: () => _start(StudyMode.listeningChoice),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.mic_none_rounded,
          title: 'Nghe và nhập lại',
          subtitle: 'Nghe từ tiếng Anh rồi tự viết đáp án.',
          onTap: () => _start(StudyMode.listeningTyping),
        ),
        const SizedBox(height: 8),
        _StudyTile(
          icon: Icons.short_text_rounded,
          title: 'Điền từ vào câu',
          subtitle: 'Chỉ dùng câu ví dụ có sẵn trong kho.',
          onTap: () => _start(StudyMode.fillBlank),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const OcrImportScreen()),
          ),
          icon: const Icon(Icons.document_scanner_outlined),
          label: const Text('Trích xuất từ vựng từ file'),
        ),
      ],
    ),
  );
}

class _StudyTile extends StatelessWidget {
  const _StudyTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        child: Icon(icon),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
    ),
  );
}
