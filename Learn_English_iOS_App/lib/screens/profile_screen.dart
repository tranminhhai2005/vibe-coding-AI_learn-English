import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../app.dart';
import '../database/app_database.dart';
import '../models/vocabulary_word.dart';
import '../services/data_transfer_service.dart';
import '../services/speech_service.dart';
import 'ocr_import_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _transfer = const DataTransferService();
  final _speech = SpeechService.instance;
  bool _busy = false;
  String _locale = 'en-US';
  double _rate = 0.45;
  List<String> _voices = [];

  @override
  void initState() {
    super.initState();
    _speech.configure(locale: _locale, rate: _rate);
    _loadVoices();
  }

  Future<void> _loadVoices() async {
    try {
      final voices = await _speech.availableEnglishVoices();
      if (mounted) setState(() => _voices = voices);
    } catch (error) {
      if (mounted) _message('Không tải được danh sách giọng đọc: $error');
    }
  }

  void _message(String text) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }

  Future<void> _runTransfer(
    Future<void> Function() action,
    String success,
  ) async {
    setState(() => _busy = true);
    try {
      await action();
      if (mounted) _message(success);
    } catch (error) {
      if (mounted) _message('Thao tác thất bại: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _restore() async {
    final files = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['json'],
    );
    if (files.isEmpty || !mounted) return;
    final accepted = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Khôi phục bản sao?'),
        content: const Text(
          'Các từ chưa có sẽ được thêm vào kho. Từ trùng tên hiện có sẽ được giữ nguyên.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Khôi phục'),
          ),
        ],
      ),
    );
    if (accepted != true) return;
    await _runTransfer(
      () => _transfer.restoreJson(files.single),
      'Đã khôi phục dữ liệu. Từ trùng lặp được bỏ qua.',
    );
  }

  Future<void> _clearData() async {
    final accepted = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa toàn bộ dữ liệu?'),
        content: const Text(
          'Thao tác này xóa từ vựng, lịch sử và thống kê khỏi thiết bị. Hãy xuất bản sao lưu trước nếu cần.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa dữ liệu'),
          ),
        ],
      ),
    );
    if (accepted == true) {
      await _runTransfer(
        AppDatabase.instance.clearAll,
        'Đã xóa toàn bộ dữ liệu trên thiết bị.',
      );
    }
  }

  Future<void> _loadSamples() async {
    const sampleRows = <(String, String, String, String)>[
      ('apple', 'quả táo', 'noun', 'I eat an apple every morning.'),
      ('beautiful', 'đẹp', 'adjective', 'The garden is beautiful.'),
      ('book', 'quyển sách', 'noun', 'She reads a book before bed.'),
      ('bright', 'sáng; thông minh', 'adjective', 'The room is bright.'),
      (
        'careful',
        'cẩn thận',
        'adjective',
        'Be careful when you cross the road.',
      ),
      ('choose', 'lựa chọn', 'verb', 'Choose the answer you think is right.'),
      ('city', 'thành phố', 'noun', 'This city is busy at night.'),
      ('comfortable', 'thoải mái', 'adjective', 'These shoes are comfortable.'),
      ('delicious', 'ngon', 'adjective', 'The soup smells delicious.'),
      ('different', 'khác nhau', 'adjective', 'We have different ideas.'),
      ('early', 'sớm', 'adverb', 'He gets up early every day.'),
      ('family', 'gia đình', 'noun', 'My family lives near the sea.'),
      ('friendly', 'thân thiện', 'adjective', 'Our neighbors are friendly.'),
      ('garden', 'khu vườn', 'noun', 'They grow vegetables in the garden.'),
      (
        'important',
        'quan trọng',
        'adjective',
        'Sleep is important for your health.',
      ),
      ('journey', 'hành trình', 'noun', 'The journey takes three hours.'),
      ('listen', 'lắng nghe', 'verb', 'Listen to the question carefully.'),
      ('practice', 'luyện tập', 'verb', 'I practice English after work.'),
      ('remember', 'ghi nhớ', 'verb', 'Remember to bring your notebook.'),
      ('wonderful', 'tuyệt vời', 'adjective', 'We had a wonderful weekend.'),
    ];
    await _runTransfer(() async {
      await AppDatabase.instance.insertWordsSkippingDuplicates([
        for (final row in sampleRows)
          VocabularySample.word(
            word: row.$1,
            meaning: row.$2,
            partOfSpeech: row.$3,
            example: row.$4,
          ),
      ]);
    }, 'Đã thêm bộ từ mẫu; mỗi mục được đánh dấu là dữ liệu mẫu.');
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Cá nhân')),
    body: _busy
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 30),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Giao diện',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<ThemeMode>(
                        initialValue: ref.watch(themeModeProvider),
                        decoration: const InputDecoration(
                          labelText: 'Chế độ màu',
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: ThemeMode.system,
                            child: Text('Theo thiết bị'),
                          ),
                          DropdownMenuItem(
                            value: ThemeMode.light,
                            child: Text('Sáng'),
                          ),
                          DropdownMenuItem(
                            value: ThemeMode.dark,
                            child: Text('Tối'),
                          ),
                        ],
                        onChanged: (mode) {
                          if (mode != null) {
                            ref.read(themeModeProvider.notifier).setTheme(mode);
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Giọng đọc tiếng Anh',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        initialValue: _locale,
                        decoration: const InputDecoration(
                          labelText: 'Biến thể',
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'en-US',
                            child: Text('en-US (Mỹ)'),
                          ),
                          DropdownMenuItem(
                            value: 'en-GB',
                            child: Text('en-GB (Anh)'),
                          ),
                        ],
                        onChanged: (value) {
                          if (value != null) {
                            setState(() => _locale = value);
                            _speech.configure(locale: _locale, rate: _rate);
                          }
                        },
                      ),
                      Text('Tốc độ: ${_rate.toStringAsFixed(2)}'),
                      Slider(
                        value: _rate,
                        min: 0.25,
                        max: 0.65,
                        onChanged: (value) {
                          setState(() => _rate = value);
                          _speech.configure(locale: _locale, rate: _rate);
                        },
                      ),
                      OutlinedButton.icon(
                        onPressed: () async {
                          try {
                            await _speech.speak(
                              'Hello, this is an English voice sample.',
                              locale: _locale,
                              rate: _rate,
                            );
                          } catch (error) {
                            if (mounted) {
                              _message('Giọng đọc không khả dụng: $error');
                            }
                          }
                        },
                        icon: const Icon(Icons.volume_up_rounded),
                        label: const Text('Nghe thử'),
                      ),
                      if (_voices.isEmpty)
                        const Text(
                          'Danh sách giọng en-* chưa được hệ thống trả về.',
                        ),
                      if (_voices.isNotEmpty)
                        Text(
                          'Giọng khả dụng: ${_voices.join(', ')}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                    ],
                  ),
                ),
              ),
              _sectionHeader(context, 'Dữ liệu'),
              _action(
                icon: Icons.upload_file_rounded,
                title: 'Trích xuất từ vựng',
                subtitle: 'Ảnh, PDF, TXT hoặc CSV — không dùng camera',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const OcrImportScreen(),
                  ),
                ),
              ),
              _action(
                icon: Icons.file_download_outlined,
                title: 'Xuất bản sao JSON',
                subtitle: 'Từ vựng và lịch sử học tập',
                onTap: () => _runTransfer(
                  _transfer.exportJson,
                  'Đã mở tùy chọn chia sẻ bản sao JSON.',
                ),
              ),
              _action(
                icon: Icons.table_view_outlined,
                title: 'Xuất từ vựng CSV',
                subtitle: 'Tệp có thể mở bằng ứng dụng bảng tính',
                onTap: () => _runTransfer(
                  _transfer.exportCsv,
                  'Đã mở tùy chọn chia sẻ CSV.',
                ),
              ),
              _action(
                icon: Icons.settings_backup_restore_rounded,
                title: 'Khôi phục bản sao JSON',
                subtitle: 'Từ trùng lặp được bỏ qua, không ghi đè',
                onTap: _restore,
              ),
              _action(
                icon: Icons.auto_awesome_outlined,
                title: 'Thêm bộ từ mẫu',
                subtitle: 'Dữ liệu mẫu được gắn nhãn rõ ràng',
                onTap: _loadSamples,
              ),
              _action(
                icon: Icons.delete_forever_outlined,
                title: 'Xóa toàn bộ dữ liệu',
                subtitle: 'Yêu cầu xác nhận trước khi xóa',
                onTap: _clearData,
                destructive: true,
              ),
              const SizedBox(height: 12),
              FutureBuilder(
                future: AppDatabase.instance.getStats(),
                builder: (context, snapshot) => Center(
                  child: Text(
                    snapshot.hasError
                        ? 'Không tải được thống kê: ${snapshot.error}'
                        : 'Learn English • dữ liệu lưu cục bộ trên thiết bị'
                              '${snapshot.hasData ? '\n${snapshot.data!.totalWords} từ vựng' : ''}',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ),
            ],
          ),
  );

  Widget _sectionHeader(BuildContext context, String title) => Padding(
    padding: const EdgeInsets.fromLTRB(8, 14, 8, 6),
    child: Text(
      title,
      style: Theme.of(
        context,
      ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
    ),
  );

  Widget _action({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool destructive = false,
  }) => Card(
    child: ListTile(
      leading: Icon(icon, color: destructive ? Colors.red : null),
      title: Text(
        title,
        style: TextStyle(color: destructive ? Colors.red : null),
      ),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
    ),
  );
}

class VocabularySample {
  static VocabularyWord word({
    required String word,
    required String meaning,
    required String partOfSpeech,
    required String example,
  }) => VocabularyWord(
    word: word,
    meaning: meaning,
    partOfSpeech: partOfSpeech,
    example: example,
    deck: 'Người mới bắt đầu • Mẫu',
    isSample: true,
  );
}
