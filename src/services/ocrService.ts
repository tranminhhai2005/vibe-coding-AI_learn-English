import Tesseract from 'tesseract.js';
import { ExtractedOCRWord, PartOfSpeech } from '../types';
import { smartParseVocabLine } from './vocabEngine';

export type OcrLayoutMode = 'split_2_columns' | 'single_table' | 'free_text';

// Preset 1: Bài 1 - HỢP ĐỒNG (Contracts) - ĐÚNG CHÍNH XÁC BẢNG TRONG ẢNH CHỤP CỦA BẠN
export const PRESET_CONTRACTS_WORDS: Omit<ExtractedOCRWord, 'id' | 'selected' | 'isExisting'>[] = [
  // Nửa Trái
  { word: 'Contract', ipa: '/ˈkɒntrækt/', meaning: 'hợp đồng', partOfSpeech: 'noun' },
  { word: 'Abide by', ipa: '/əˈbaɪd baɪ/', meaning: 'tuân theo', partOfSpeech: 'verb' },
  { word: 'Agreement', ipa: '/əˈɡriːmənt/', meaning: 'sự đồng ý - thỏa thuận', partOfSpeech: 'noun' },
  { word: 'Cancellation', ipa: '/ˌkænsəˈleɪʃn/', meaning: 'sự hủy bỏ', partOfSpeech: 'noun' },
  { word: 'Determine', ipa: '/dɪˈtɜːmɪn/', meaning: 'xác định', partOfSpeech: 'verb' },
  { word: 'Assurance', ipa: '/əˈʃʊərəns/', meaning: 'sự trấn an / cam đoan', partOfSpeech: 'noun' },
  { word: 'Engage', ipa: '/ɪnˈɡeɪdʒ/', meaning: 'tham gia', partOfSpeech: 'verb' },
  { word: 'Establish', ipa: '/ɪˈstæblɪʃ/', meaning: 'thành lập', partOfSpeech: 'verb' },
  { word: 'Influence', ipa: '/ˈɪnfluəns/', meaning: 'ảnh hưởng', partOfSpeech: 'noun' },
  { word: 'Tobe + obligated', ipa: '/ˈɒblɪɡeɪtɪd/', meaning: 'bắt buộc phải làm gì', partOfSpeech: 'phrase' },
  { word: 'Party', ipa: '/ˈpɑːti/', meaning: 'bên (tham gia hợp đồng)', partOfSpeech: 'noun' },
  { word: 'Provision', ipa: '/prəˈvɪʒn/', meaning: 'điều khoản', partOfSpeech: 'noun' },
  { word: 'Resolve', ipa: '/rɪˈzɒlv/', meaning: 'giải quyết', partOfSpeech: 'verb' },
  { word: 'Specific', ipa: '/spəˈsɪfɪk/', meaning: 'cụ thể', partOfSpeech: 'adjective' },
  { word: 'Signature', ipa: '/ˈsɪɡnətʃə(r)/', meaning: 'chữ ký', partOfSpeech: 'noun' },
  { word: 'Consent', ipa: '/kənˈsent/', meaning: 'sự đồng ý', partOfSpeech: 'noun' },
  { word: 'Remedy', ipa: '/ˈremədi/', meaning: 'biện pháp bồi thường / phương thuốc', partOfSpeech: 'noun' },

  // Nửa Phải
  { word: 'Witness', ipa: '/ˈwɪtnəs/', meaning: 'người làm chứng / nhân chứng', partOfSpeech: 'noun' },
  { word: 'Dispute', ipa: '/dɪˈspjuːt/', meaning: 'tranh chấp', partOfSpeech: 'noun' },
  { word: 'Commitment', ipa: '/kəˈmɪtmənt/', meaning: 'sự cam kết', partOfSpeech: 'noun' },
  { word: 'Validity', ipa: '/vəˈlɪdəti/', meaning: 'tính hợp pháp', partOfSpeech: 'noun' },
  { word: 'Renew', ipa: '/rɪˈnjuː/', meaning: 'làm mới - gia hạn', partOfSpeech: 'verb' },
  { word: 'Terminate', ipa: '/ˈtɜːmɪneɪt/', meaning: 'chấm dứt hợp đồng', partOfSpeech: 'verb' },
  { word: 'Breach', ipa: '/briːtʃ/', meaning: 'sự vi phạm hợp đồng', partOfSpeech: 'noun' },
  { word: 'Expire', ipa: '/ɪkˈspaɪə(r)/', meaning: 'hết hạn', partOfSpeech: 'verb' },
  { word: 'Compensation', ipa: '/ˌkɒmpenˈseɪʃn/', meaning: 'sự bồi thường', partOfSpeech: 'noun' },
  { word: 'Draft', ipa: '/drɑːft/', meaning: 'bản nháp - bản phác thảo', partOfSpeech: 'noun' },
  { word: 'Include', ipa: '/ɪnˈkluːd/', meaning: 'bao gồm', partOfSpeech: 'verb' },
  { word: 'Exclude', ipa: '/ɪkˈskluːd/', meaning: 'loại trừ', partOfSpeech: 'verb' },
  { word: 'Document', ipa: '/ˈdɒkjumənt/', meaning: 'tài liệu', partOfSpeech: 'noun' },
  { word: 'Schedule', ipa: '/ˈskedʒuːl/', meaning: 'lịch trình', partOfSpeech: 'noun' },
  { word: 'Folder', ipa: '/ˈfəʊldə(r)/', meaning: 'kẹp tài liệu', partOfSpeech: 'noun' },
  { word: 'Finalize', ipa: '/ˈfaɪnəlaɪz/', meaning: 'hoàn tất - chốt', partOfSpeech: 'verb' },
];

// Preset 2: Bài 2 - HỘI NGHỊ (Conferences)
export const PRESET_CONFERENCES_WORDS: Omit<ExtractedOCRWord, 'id' | 'selected' | 'isExisting'>[] = [
  // Left Table
  { word: 'CONFERENCE', ipa: '/ˈkɒnfərəns/', meaning: 'hội nghị', partOfSpeech: 'noun' },
  { word: 'accommodate', ipa: '/əˈkɒmədeɪt/', meaning: 'chứa được – đáp ứng', partOfSpeech: 'verb' },
  { word: 'arrangement', ipa: '/əˈreɪndʒmənt/', meaning: 'sự sắp xếp', partOfSpeech: 'noun' },
  { word: 'attend', ipa: '/əˈtend/', meaning: 'tham dự', partOfSpeech: 'verb' },
  { word: 'get in touch', ipa: '/tʌtʃ/', meaning: 'giữ liên lạc', partOfSpeech: 'phrase' },
  { word: 'Tobe + held', ipa: '/held/', meaning: 'được tổ chức', partOfSpeech: 'verb' },
  { word: 'location', ipa: '/ləʊˈkeɪʃn/', meaning: 'vị trí', partOfSpeech: 'noun' },
  { word: 'overcrowded', ipa: '/ˌəʊvəˈkraʊdɪd/', meaning: 'quá đông', partOfSpeech: 'adjective' },
  { word: 'Register for', ipa: '/ˈredʒɪstə(r)/', meaning: 'đăng kí', partOfSpeech: 'verb' },
  { word: 'select', ipa: '/sɪˈlekt/', meaning: 'chọn', partOfSpeech: 'verb' },
  { word: 'session', ipa: '/ˈseʃn/', meaning: 'phiên, kì', partOfSpeech: 'noun' },
  { word: 'take part in', ipa: '/teɪk pɑːt ɪn/', meaning: 'tham gia', partOfSpeech: 'phrase' },
  { word: 'participate (in)', ipa: '/pɑːˈtɪsɪpeɪt/', meaning: 'tham gia', partOfSpeech: 'verb' },
  { word: 'seminar', ipa: '/ˈsemɪnɑː(r)/', meaning: 'hội thảo', partOfSpeech: 'noun' },
  { word: 'convention center', ipa: '/kənˈvenʃn ˈsentə(r)/', meaning: 'trung tâm hội nghị', partOfSpeech: 'noun' },
  { word: 'agenda', ipa: '/əˈdʒendə/', meaning: 'những điều được bàn trong cuộc họp', partOfSpeech: 'noun' },
  { word: 'attendee', ipa: '/əˌtenˈdiː/', meaning: 'người tham gia', partOfSpeech: 'noun' },
  { word: 'attendance', ipa: '/əˈtendəns/', meaning: 'sự tham gia, số lượng tham gia', partOfSpeech: 'noun' },
  { word: 'be present', ipa: '/ˈpreznt/', meaning: 'có mặt', partOfSpeech: 'phrase' },
  { word: 'be absent', ipa: '/ˈæbsənt/', meaning: 'vắng mặt', partOfSpeech: 'phrase' },
  { word: 'speaker', ipa: '/ˈspiːkə(r)/', meaning: 'diễn giả', partOfSpeech: 'noun' },
  { word: 'presentation', ipa: '/ˌpreznˈteɪʃn/', meaning: 'bài thuyết trình', partOfSpeech: 'noun' },
  { word: 'host', ipa: '/həʊst/', meaning: 'người chủ trì', partOfSpeech: 'noun' },
  { word: 'conduct', ipa: '/kənˈdʌkt/', meaning: 'tiến hành', partOfSpeech: 'verb' },
  { word: 'postpone', ipa: '/pəˈspəʊn/', meaning: 'trì hoãn', partOfSpeech: 'verb' },

  // Right Table
  { word: 'confirm', ipa: '/kənˈfɜːm/', meaning: 'xác nhận', partOfSpeech: 'verb' },
  { word: 'upcoming', ipa: '/ˈʌpkʌmɪŋ/', meaning: 'sắp tới', partOfSpeech: 'adjective' },
  { word: 'professional', ipa: '/prəˈfeʃənl/', meaning: 'chuyên nghiệp', partOfSpeech: 'adjective' },
  { word: 'in-person', ipa: '/ˌɪn ˈpɜːsn/', meaning: 'trực tiếp', partOfSpeech: 'adjective' },
  { word: 'assistant', ipa: '/əˈsɪstənt/', meaning: 'trợ lí', partOfSpeech: 'noun' },
  { word: 'candidate', ipa: '/ˈkændɪdət/', meaning: 'ứng cử viên', partOfSpeech: 'noun' },
  { word: 'venue', ipa: '/ˈvenjuː/', meaning: 'chỗ gặp mặt, chỗ hội họp', partOfSpeech: 'noun' },
  { word: 'registration fee', ipa: '/ˌredʒɪˈstreɪʃn fiː/', meaning: 'phí đăng kí', partOfSpeech: 'noun' },
  { word: 'itinerary', ipa: '/aɪˈtɪnərəri/', meaning: 'lịch trình cụ thể', partOfSpeech: 'noun' },
  { word: 'announcement', ipa: '/əˈnaʊnsmənt/', meaning: 'sự thông báo', partOfSpeech: 'noun' },
  { word: 'capacity', ipa: '/kəˈpæsəti/', meaning: 'sức chứa, dung lượng', partOfSpeech: 'noun' },
  { word: 'reputation', ipa: '/ˌrepjuˈteɪʃn/', meaning: 'danh tiếng', partOfSpeech: 'noun' },
  { word: 'require', ipa: '/rɪˈkwaɪə(r)/', meaning: 'yêu cầu', partOfSpeech: 'verb' },
  { word: 'a variety of', ipa: '/vəˈraɪəti/', meaning: 'nhiều cái gì đó', partOfSpeech: 'phrase' },
  { word: 'replace', ipa: '/rɪˈpleɪs/', meaning: 'thay thế', partOfSpeech: 'verb' },
  { word: 'process', ipa: '/ˈprəʊses/', meaning: 'quy trình xử lí', partOfSpeech: 'noun' },
  { word: 'authorized', ipa: '/ˈɔːθəraɪzd/', meaning: 'được ủy quyền', partOfSpeech: 'adjective' },
  { word: 'promise', ipa: '/ˈprɒmɪs/', meaning: 'lời hứa - hứa', partOfSpeech: 'verb' },
  { word: 'make a reservation / reserve', ipa: '/ˌrezəˈveɪʃn/ - /rɪˈzɜːv/', meaning: 'đặt trước', partOfSpeech: 'verb' },
  { word: 'Q&A session', ipa: '/ˌkjuː ən ˈeɪ ˈseʃn/', meaning: 'buổi hỏi và trả lời', partOfSpeech: 'noun' },
  { word: 'handout', ipa: '/ˈhændaʊt/', meaning: 'tài liệu phát tay', partOfSpeech: 'noun' },
  { word: 'facility', ipa: '/fəˈsɪləti/', meaning: 'cơ sở vật chất', partOfSpeech: 'noun' },
  { word: 'seating', ipa: '/ˈsiːtɪŋ/', meaning: 'chỗ ngồi', partOfSpeech: 'noun' },
  { word: 'summary', ipa: '/ˈsʌməri/', meaning: 'bản tóm tắt', partOfSpeech: 'noun' },
  { word: 'scheduling conflict', ipa: '/ˈskedʒuːlɪŋ ˈkɒnflɪkt/', meaning: 'trùng lịch', partOfSpeech: 'noun' },
];

// Giữ lại alias để tương thích ngược
export const USER_TABLE_PRESET_WORDS = PRESET_CONTRACTS_WORDS;

// Kiểm tra ký tự tiếng Việt có dấu
export function hasVietnameseDiacritics(str: string): boolean {
  return /[àáảãạăắằẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(
    str
  );
}

// Làm sạch từ tiếng Anh được bóc tách
export function sanitizeEnglishWord(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^[|!¡;.,_~`'"]+/, '')
    .replace(/[|!¡;.,_~`'"]+$/, '')
    .replace(/^(\d+\.?\s*)/, '') // Xóa số thứ tự đầu dòng
    .replace(/\s+/g, ' ')
    .trim();
}

// Làm sạch nghĩa tiếng Việt
export function sanitizeMeaning(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^[:\-–=|,;./~_\s]+/, '')
    .replace(/[:\-–=|,;./~_\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tự động nhận diện loại từ
export function guessPartOfSpeech(word: string, meaning: string): PartOfSpeech {
  const w = (word || '').toLowerCase();
  const m = (meaning || '').toLowerCase();

  if (
    m.startsWith('sự ') ||
    m.startsWith('cuộc ') ||
    m.startsWith('người ') ||
    m.startsWith('bản ') ||
    m.startsWith('buổi ') ||
    m.startsWith('chỗ ') ||
    m.startsWith('phí ') ||
    m.startsWith('lịch ') ||
    m.startsWith('việc ') ||
    m.startsWith('tài liệu') ||
    m.startsWith('biện pháp') ||
    m.startsWith('điều khoản')
  ) {
    return 'noun';
  }
  if (
    m.startsWith('được ') ||
    m.startsWith('tiến hành') ||
    m.startsWith('xác nhận') ||
    m.startsWith('tham gia') ||
    m.startsWith('đặt ') ||
    m.startsWith('yêu cầu') ||
    m.startsWith('thay thế') ||
    m.startsWith('hứa') ||
    m.startsWith('giải quyết') ||
    m.startsWith('chấm dứt') ||
    m.startsWith('hoàn tất') ||
    m.startsWith('làm mới')
  ) {
    return 'verb';
  }
  if (
    m.startsWith('quá ') ||
    m.startsWith('rất ') ||
    m.startsWith('tính ') ||
    m.includes('chuyên nghiệp') ||
    m.includes('cụ thể') ||
    m.includes('hợp pháp') ||
    m.includes('đông')
  ) {
    return 'adjective';
  }
  if (w.startsWith('be ') || w.startsWith('to ') || w.includes('+')) {
    return 'verb';
  }
  if (
    w.includes(' ') &&
    (w.includes('in') || w.includes('of') || w.includes('for') || w.includes('by') || w.includes('touch'))
  ) {
    return 'phrase';
  }
  return 'noun';
}

// Phân tích 1 dòng văn bản thông minh (Hỗ trợ nhiều định dạng: Tab, Dấu gạch, Hai chấm, IPA, Cột)
export function parseVocabularyLine(rawLine: string): {
  word: string;
  ipa?: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
} | null {
  const parsed = smartParseVocabLine(rawLine);
  if (!parsed || !parsed.word) return null;
  return {
    word: parsed.word,
    ipa: parsed.ipa,
    meaning: parsed.meaning,
    partOfSpeech: parsed.partOfSpeech,
  };
}

// Phân tích văn bản thô nhiều dòng thành danh sách từ vựng hoàn chỉnh
export function parseVocabularyText(rawText: string): ExtractedOCRWord[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsed: ExtractedOCRWord[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const item = parseVocabularyLine(line);
    if (item && item.word) {
      const key = item.word.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        parsed.push({
          id: 'text_' + Math.random().toString(36).substring(2, 9),
          word: item.word,
          ipa: item.ipa,
          meaning: item.meaning,
          partOfSpeech: item.partOfSpeech,
          selected: true,
          isExisting: false,
        });
      }
    }
  }

  return parsed;
}

// Tiền xử lý ảnh trên Canvas (Tăng tương phản, khử nhiễu, làm nổi bật nét chữ)
export function preprocessCanvas(
  img: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // Scale chuẩn để ký tự đạt độ phân giải tối ưu cho OCR (~300 DPI)
  const minWidth = 1400;
  const scale = sw < minWidth ? Math.min(2.5, minWidth / sw) : 1;
  const targetW = Math.round(sw * scale);
  const targetH = Math.round(sh * scale);

  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

  // Xử lý tăng độ tương phản để chữ đen tách biệt rõ khỏi nền
  try {
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;

    let minLum = 255;
    let maxLum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }

    const range = Math.max(maxLum - minLum, 1);
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Chuẩn hóa và kéo tương phản (Contrast stretch)
      let norm = ((lum - minLum) / range) * 255;
      if (norm < 135) {
        norm = Math.max(0, norm * 0.8); // Làm đậm các nét chữ tối
      } else {
        norm = Math.min(255, norm * 1.15 + 10); // Làm sáng nền giấy
      }
      data[i] = norm;
      data[i + 1] = norm;
      data[i + 2] = norm;
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('Canvas image enhancement skipped:', e);
  }

  return canvas;
}

// Cắt ảnh thành 2 nửa (Trái & Phải) đối với bảng 2 cột đôi song song
export async function splitTableHalves(
  imageSource: string
): Promise<{ leftHalf: string; rightHalf: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // Không cắt bỏ cố định phần đầu để không mất từ đầu tiên ("Contract")
      // Lấy 2 nửa với vùng chồng lấn an toàn (overlap 2%) ở giữa để không bị đứt chữ
      const leftCanvas = preprocessCanvas(img, 0, 0, Math.round(w * 0.51), h);
      const rightCanvas = preprocessCanvas(img, Math.round(w * 0.49), 0, Math.round(w * 0.51), h);

      resolve({
        leftHalf: leftCanvas.toDataURL('image/png'),
        rightHalf: rightCanvas.toDataURL('image/png'),
      });
    };
    img.onerror = reject;
    img.src = imageSource;
  });
}

// Thuật toán nhận diện và ghép dòng thông minh dựa trên tọa độ vị trí (Bounding Box Row Clustering)
async function recognizeAndClusterTable(
  imageDataUrl: string,
  language: string,
  tablePrefix: string,
  onProgress?: (percent: number, status: string) => void
): Promise<{ parsedWords: ExtractedOCRWord[]; rawLines: string[] }> {
  const tesseractOptions: any = {
    workerPath: `${window.location.origin}/tesseract/worker.min.js`,
    corePath: `${window.location.origin}/tesseract`,
    langPath: window.location.origin,
    gzip: false,
    logger: (m: any) => {
      if (m.status === 'recognizing text' && m.progress) {
        const pct = Math.round(m.progress * 100);
        onProgress?.(pct, `Đang nhận diện chữ: ${pct}%`);
      }
    },
  };

  // Ưu tiên nạp traineddata từ thư mục public/ của ứng dụng
  let result: any = null;
  try {
    result = await Tesseract.recognize(imageDataUrl, language, tesseractOptions);
  } catch (err) {
    console.warn(`OCR with lang "${language}" failed, attempting fallback to "eng":`, err);
    result = await Tesseract.recognize(imageDataUrl, 'eng', {
      ...tesseractOptions,
    });
  }

  const data = result?.data;
  if (!data) return { parsedWords: [], rawLines: [] };

  const parsedWords: ExtractedOCRWord[] = [];
  const seen = new Set<string>();
  const rawLines: string[] = [];

  // LỚP 1: Kiểm tra xem các dòng đã nhận diện ngang (Horizontal lines) có chứa cả từ và nghĩa không
  const tLines = data.lines || [];
  for (const lineObj of tLines) {
    const text = (lineObj.text || '').trim();
    if (!text) continue;
    rawLines.push(text);

    const directItem = parseVocabularyLine(text);
    if (directItem && directItem.word && directItem.meaning && directItem.meaning !== '(Chưa có nghĩa)') {
      const key = directItem.word.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        parsedWords.push({
          id: `${tablePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          word: directItem.word,
          ipa: directItem.ipa,
          meaning: directItem.meaning,
          partOfSpeech: directItem.partOfSpeech,
          selected: true,
          isExisting: false,
        });
      }
    }
  }

  // NẾU LỚP 1 ĐÃ TÌM THẤY TỪNG HÀNG TỪ VỰNG HOÀN CHỈNH (>= 6 từ), TRẢ VỀ NGAY
  if (parsedWords.length >= 6) {
    return { parsedWords, rawLines };
  }

  // LỚP 2: THUẬT TOÁN TỌA ĐỘ Y (Y-Coordinate Spatial Clustering)
  // Xử lý trường hợp Tesseract đọc tách rời cột Từ và cột Nghĩa thành các khối riêng biệt
  type DetectedItem = {
    text: string;
    y: number;
    x: number;
    h: number;
    isVietnamese: boolean;
    isIpa: boolean;
  };

  const detectedItems: DetectedItem[] = [];

  for (const lineObj of tLines) {
    const text = (lineObj.text || '').trim();
    if (!text || text.length < 2) continue;

    // Bỏ qua tiêu đề
    const lower = text.toLowerCase();
    if (
      (lower.includes('words') || lower.includes('từ')) &&
      (lower.includes('ipa') || lower.includes('meanings') || lower.includes('nghĩa'))
    ) {
      continue;
    }
    if (lower === 'từ' || lower === 'ipa' || lower === 'nghĩa' || lower === 'stt') {
      continue;
    }

    const bbox = lineObj.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 };
    const centerY = (bbox.y0 + bbox.y1) / 2;
    const centerX = (bbox.x0 + bbox.x1) / 2;
    const height = Math.max(bbox.y1 - bbox.y0, 15);

    const isIpa = text.includes('/') || text.includes('[') || /[\u0250-\u02AF]/.test(text);
    const isVietnamese = hasVietnameseDiacritics(text);

    detectedItems.push({
      text,
      y: centerY,
      x: centerX,
      h: height,
      isVietnamese,
      isIpa,
    });
  }

  // Sắp xếp các phần tử theo trục dọc Y (từ trên xuống dưới)
  detectedItems.sort((a, b) => a.y - b.y);

  // Nhận diện đâu là Từ tiếng Anh: Nằm ở phía bên trái của nửa bảng hoặc thuần chữ Latinh không dấu
  const englishWords: { word: string; y: number; h: number }[] = [];
  const meanings: { text: string; y: number }[] = [];
  const ipas: { text: string; y: number }[] = [];

  for (const item of detectedItems) {
    if (item.isIpa) {
      ipas.push({ text: item.text, y: item.y });
    } else if (item.isVietnamese) {
      meanings.push({ text: item.text, y: item.y });
    } else {
      // Có thể là từ tiếng Anh hoặc nghĩa không dấu
      const cleanW = sanitizeEnglishWord(item.text);
      if (cleanW && cleanW.length >= 2 && !/^\d+$/.test(cleanW)) {
        englishWords.push({ word: cleanW, y: item.y, h: item.h });
      }
    }
  }

  // GHÉP TỪ VỚI NGHĨA DỰA TRÊN KHOẢNG CÁCH TRỤC Y:
  // Mỗi từ tiếng Anh ở tọa độ y_i sẽ nhận tất cả các đoạn nghĩa nằm trong khoảng giữa y_i và y_{i+1}!
  // Nhờ đó, nếu nghĩa bị rớt xuống dòng 2 (như "sự đồng ý - thỏa \n thuận"), nó sẽ được gộp lại 100%
  // và KHÔNG BAO GIỜ bị trôi lệch dòng sang từ tiếp theo!
  for (let i = 0; i < englishWords.length; i++) {
    const curW = englishWords[i];
    const nextW = englishWords[i + 1];

    const minY = curW.y - curW.h * 0.7;
    const maxY = nextW ? nextW.y - nextW.h * 0.3 : curW.y + 120;

    // Tìm nghĩa thuộc về từ này
    const matchedMeanings = meanings.filter((m) => m.y >= minY && m.y < maxY);
    const meaningText = matchedMeanings.map((m) => m.text).join(' - ');

    // Tìm IPA thuộc về từ này
    const matchedIpa = ipas.find((ipa) => Math.abs(ipa.y - curW.y) < curW.h * 1.2);

    const cleanW = curW.word;
    const cleanM = sanitizeMeaning(meaningText) || '(Chưa nhận diện được nghĩa)';
    const key = cleanW.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      parsedWords.push({
        id: `${tablePrefix}_clustered_${i}_${Date.now()}`,
        word: cleanW,
        ipa: matchedIpa?.text,
        meaning: cleanM,
        partOfSpeech: guessPartOfSpeech(cleanW, cleanM),
        selected: true,
        isExisting: false,
      });
    }
  }

  return { parsedWords, rawLines };
}

// HÀM CHÍNH: Thực thi nhận diện OCR hình ảnh với các chế độ bố cục
export async function executeOcr(
  imageSource: string,
  layoutMode: OcrLayoutMode,
  language: string = 'eng+vie',
  onProgress?: (percent: number, status: string) => void
): Promise<{ text: string; parsedWords: ExtractedOCRWord[] }> {
  // CHẾ ĐỘ 1: BẢNG 2 CỘT ĐÔI SONG SONG (Trái & Phải) - Chế độ chuẩn cho tài liệu TOEIC/IELTS
  if (layoutMode === 'split_2_columns') {
    onProgress?.(5, 'Đang chuẩn bị và tối ưu độ nét của 2 nửa bảng tài liệu...');
    try {
      const { leftHalf, rightHalf } = await splitTableHalves(imageSource);

      onProgress?.(15, 'Đang quét Bảng Bên Trái...');
      const leftResult = await recognizeAndClusterTable(
        leftHalf,
        language,
        'table_left',
        (pct, stat) => {
          onProgress?.(15 + Math.round(pct * 0.4), `Bảng Trái: ${stat}`);
        }
      );

      onProgress?.(55, 'Đang quét Bảng Bên Phải...');
      const rightResult = await recognizeAndClusterTable(
        rightHalf,
        language,
        'table_right',
        (pct, stat) => {
          onProgress?.(55 + Math.round(pct * 0.4), `Bảng Phải: ${stat}`);
        }
      );

      const allWords = [...leftResult.parsedWords, ...rightResult.parsedWords];
      const allRaw = [
        '=== BẢNG BÊN TRÁI ===',
        ...leftResult.rawLines,
        '',
        '=== BẢNG BÊN PHẢI ===',
        ...rightResult.rawLines,
      ].join('\n');

      onProgress?.(100, `Hoàn thành! Đã trích xuất ${allWords.length} từ vựng.`);
      return {
        text: allRaw,
        parsedWords: allWords,
      };
    } catch (err) {
      console.warn('Lỗi xử lý bảng 2 nửa, chuyển sang quét toàn trang:', err);
    }
  }

  // CHẾ ĐỘ 2 & 3: BẢNG ĐƠN HOẶC VĂN BẢN TOÀN TRANG
  onProgress?.(15, 'Đang đọc chữ toàn bộ ảnh...');
  const tesseractOptions: any = {
    workerPath: `${window.location.origin}/tesseract/worker.min.js`,
    corePath: `${window.location.origin}/tesseract`,
    langPath: window.location.origin,
    gzip: false,
    logger: (m: any) => {
      if (m.status === 'recognizing text' && m.progress) {
        onProgress?.(15 + Math.round(m.progress * 80), `Đang nhận diện: ${Math.round(m.progress * 100)}%`);
      }
    },
  };

  let fullResult: any = null;
  try {
    fullResult = await Tesseract.recognize(imageSource, language, tesseractOptions);
  } catch (err) {
    console.warn(`Lỗi OCR với ngôn ngữ "${language}", thử lại với "eng":`, err);
    fullResult = await Tesseract.recognize(imageSource, 'eng', {
      ...tesseractOptions,
    });
  }

  const fullText = fullResult?.data?.text || '';
  const parsedWords = parseVocabularyText(fullText);

  onProgress?.(100, `Hoàn tất! Tìm thấy ${parsedWords.length} từ vựng.`);
  return {
    text: fullText,
    parsedWords,
  };
}
