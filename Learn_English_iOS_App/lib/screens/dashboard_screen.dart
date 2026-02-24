import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../database/app_database.dart';
import '../models/study_stats.dart';
import '../models/vocabulary_word.dart';
import '../services/speech_service.dart';
import 'study_session_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Future<void> _refresh() async {
    setState(() {});
    await Future<void>.delayed(const Duration(milliseconds: 100));
  }

  Future<void> _startReview(List<VocabularyWord> due) async {
    if (due.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Hiện chưa có từ nào cần ôn.')),
      );
      return;
    }
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            StudySessionScreen(words: due, mode: StudyMode.flashcards),
      ),
    );
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return RefreshIndicator(
      onRefresh: _refresh,
      child: FutureBuilder<StudyStats>(
        future: AppDatabase.instance.getStats(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return _ErrorState(
              message: 'Không tải được thống kê: ${snapshot.error}',
              retry: () => setState(() {}),
            );
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final stats = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
            children: [
              Text(
                DateFormat('EEEE, d MMMM', 'vi').format(DateTime.now()),
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                'Xin chào, cùng học nhé!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 20),
              _HeroCard(
                stats: stats,
                onLearn: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) =>
                        const StudySessionScreen(mode: StudyMode.flashcards),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.52,
                children: [
                  _StatCard(
                    icon: Icons.menu_book_rounded,
                    label: 'Tổng số từ',
                    value: '${stats.totalWords}',
                    color: colors.primary,
                  ),
                  _StatCard(
                    icon: Icons.verified_rounded,
                    label: 'Đã thuộc',
                    value: '${stats.masteredWords}',
                    color: const Color(0xFF14866D),
                  ),
                  _StatCard(
                    icon: Icons.replay_rounded,
                    label: 'Cần ôn tập',
                    value: '${stats.dueWords}',
                    color: const Color(0xFFE58A25),
                  ),
                  _StatCard(
                    icon: Icons.today_rounded,
                    label: 'Đã học hôm nay',
                    value: '${stats.learnedToday}',
                    color: const Color(0xFF8057C7),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tiến độ học tập',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 112,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            for (var i = 0; i < stats.dailyActivity.length; i++)
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 5,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      Text(
                                        '${stats.dailyActivity[i]}',
                                        style: Theme.of(
                                          context,
                                        ).textTheme.labelSmall,
                                      ),
                                      const SizedBox(height: 5),
                                      Flexible(
                                        child: FractionallySizedBox(
                                          heightFactor:
                                              stats.dailyActivity.reduce(
                                                    (a, b) => a > b ? a : b,
                                                  ) ==
                                                  0
                                              ? 0.08
                                              : stats.dailyActivity[i] /
                                                    stats.dailyActivity.reduce(
                                                      (a, b) => a > b ? a : b,
                                                    ),
                                          child: Container(
                                            width: double.infinity,
                                            decoration: BoxDecoration(
                                              color: stats.dailyActivity[i] == 0
                                                  ? colors
                                                        .surfaceContainerHighest
                                                  : colors.primary,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        DateFormat('EE', 'vi').format(
                                          DateTime.now().subtract(
                                            Duration(days: 6 - i),
                                          ),
                                        ),
                                        style: Theme.of(
                                          context,
                                        ).textTheme.labelSmall,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      const Divider(height: 24),
                      Row(
                        children: [
                          const Icon(Icons.quiz_outlined),
                          const SizedBox(width: 9),
                          const Expanded(child: Text('Câu hỏi đã làm')),
                          Text(
                            '${stats.questionCount}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.check_circle_outline),
                          const SizedBox(width: 9),
                          const Expanded(child: Text('Tỷ lệ trả lời đúng')),
                          Text(
                            '${(stats.accuracy * 100).round()}%',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.local_fire_department_outlined),
                          const SizedBox(width: 9),
                          const Expanded(
                            child: Text('Chuỗi ngày học liên tục'),
                          ),
                          Text(
                            '${stats.streakDays} ngày',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),
              FutureBuilder<List<VocabularyWord>>(
                future: AppDatabase.instance.getWordsToReview(),
                builder: (context, wordsSnapshot) {
                  final due = wordsSnapshot.data ?? const <VocabularyWord>[];
                  if (wordsSnapshot.hasError) {
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(18),
                        child: Text(
                          'Không tải được danh sách ôn tập: ${wordsSnapshot.error}',
                        ),
                      ),
                    );
                  }
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  'Từ cần ôn tập',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                              ),
                              TextButton(
                                onPressed: () => _startReview(due),
                                child: const Text('Ôn ngay'),
                              ),
                            ],
                          ),
                          if (stats.totalWords == 0)
                            const _EmptyVocabulary()
                          else if (due.isEmpty)
                            const Text('Tuyệt vời! Bạn chưa có từ đến hạn ôn.')
                          else
                            ...due
                                .take(4)
                                .map(
                                  (word) => ListTile(
                                    contentPadding: EdgeInsets.zero,
                                    title: Text(word.word),
                                    subtitle: Text(word.meaning),
                                    trailing: IconButton(
                                      tooltip: 'Nghe phát âm',
                                      onPressed: () async {
                                        try {
                                          await SpeechService.instance.speak(
                                            word.word,
                                          );
                                        } catch (error) {
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(
                                              context,
                                            ).showSnackBar(
                                              SnackBar(
                                                content: Text(
                                                  'Không phát được âm thanh: $error',
                                                ),
                                              ),
                                            );
                                          }
                                        }
                                      },
                                      icon: const Icon(Icons.volume_up_rounded),
                                    ),
                                  ),
                                ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.stats, required this.onLearn});
  final StudyStats stats;
  final VoidCallback onLearn;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colors.primary, colors.primary.withValues(alpha: 0.78)],
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Mỗi ngày một chút',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: colors.onPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  stats.totalWords == 0
                      ? 'Thêm từ đầu tiên để bắt đầu hành trình.'
                      : 'Bạn đã có ${stats.totalWords} từ trong kho.',
                  style: TextStyle(
                    color: colors.onPrimary.withValues(alpha: .88),
                  ),
                ),
                const SizedBox(height: 14),
                FilledButton.tonal(
                  onPressed: onLearn,
                  child: const Text('Bắt đầu học'),
                ),
              ],
            ),
          ),
          Icon(
            Icons.auto_stories_rounded,
            size: 48,
            color: colors.onPrimary.withValues(alpha: .9),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    ),
  );
}

class _EmptyVocabulary extends StatelessWidget {
  const _EmptyVocabulary();

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 15),
    child: Column(
      children: [
        Icon(
          Icons.library_add_outlined,
          size: 36,
          color: Theme.of(context).colorScheme.primary,
        ),
        const SizedBox(height: 10),
        const Text('Kho từ đang trống. Thêm từ vựng hoặc nhập từ tài liệu.'),
      ],
    ),
  );
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.retry});
  final String message;
  final VoidCallback retry;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 14),
          FilledButton(onPressed: retry, child: const Text('Thử lại')),
        ],
      ),
    ),
  );
}
