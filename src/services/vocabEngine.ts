import { PartOfSpeech, Word } from '../types';

export interface VocabDictionaryEntry {
  word: string;
  ipa: string;
  meaning: string;
  partOfSpeech: PartOfSpeech;
  example?: string;
  exampleMeaning?: string;
}

export interface ParsedVocabItem {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: PartOfSpeech;
  meaning: string;
  example?: string;
  exampleMeaning?: string;
  selected: boolean;
  isExisting: boolean;
  confidence?: 'high' | 'medium' | 'low';
}

// Từ điển từ vựng chuẩn phong phú: TOEIC, IELTS, Giao tiếp, Công việc
export const COMPREHENSIVE_DICTIONARY: Record<string, VocabDictionaryEntry> = {
  // Các từ xuất hiện trong ảnh của người dùng và các từ trọng điểm
  abroad: {
    word: 'abroad',
    ipa: '/əˈbrɔːd/',
    meaning: 'ở nước ngoài, ra nước ngoài',
    partOfSpeech: 'adverb',
    example: 'He decided to study abroad to improve his English.',
    exampleMeaning: 'Anh ấy quyết định du học ở nước ngoài để nâng cao trình độ tiếng Anh.',
  },
  culinary: {
    word: 'culinary',
    ipa: '/ˈkʌlɪnəri/',
    meaning: '(thuộc về) ẩm thực, nấu nướng',
    partOfSpeech: 'adjective',
    example: 'She has excellent culinary skills in traditional cuisine.',
    exampleMeaning: 'Cô ấy có kỹ năng ẩm thực tuyệt vời về các món ăn truyền thống.',
  },
  decision: {
    word: 'decision',
    ipa: '/dɪˈsɪʒn/',
    meaning: 'quyết định, sự quyết định',
    partOfSpeech: 'noun',
    example: 'Making the right decision takes careful thought.',
    exampleMeaning: 'Đưa ra quyết định đúng đắn cần phải suy nghĩ cẩn thận.',
  },
  criticize: {
    word: 'criticize',
    ipa: '/ˈkrɪtɪsaɪz/',
    meaning: 'chỉ trích, phê bình',
    partOfSpeech: 'verb',
    example: 'The board criticized the delay in delivering the project.',
    exampleMeaning: 'Ban giám đốc chỉ trích việc chậm trễ bàn giao dự án.',
  },
  justify: {
    word: 'justify',
    ipa: '/ˈdʒʌstɪfaɪ/',
    meaning: 'biện minh, giải thích lý do hợp lý',
    partOfSpeech: 'verb',
    example: 'He could not justify his absence from the meeting.',
    exampleMeaning: 'Anh ấy không thể biện minh cho sự vắng mặt của mình trong cuộc họp.',
  },
  eggplant: {
    word: 'eggplant',
    ipa: '/ˈeɡplɑːnt/',
    meaning: 'cà tím',
    partOfSpeech: 'noun',
    example: 'Roasted eggplant is delicious with garlic sauce.',
    exampleMeaning: 'Cà tím nướng ăn cùng sốt tỏi rất ngon.',
  },
  'keep in mind': {
    word: 'keep in mind',
    ipa: '/kiːp ɪn maɪnd/',
    meaning: 'ghi nhớ, lưu ý',
    partOfSpeech: 'phrase',
    example: 'Please keep in mind that the office closes at 5 PM.',
    exampleMeaning: 'Xin vui lòng lưu ý rằng văn phòng đóng cửa lúc 5 giờ chiều.',
  },
  preorder: {
    word: 'preorder',
    ipa: '/ˌpriːˈɔːrdər/',
    meaning: 'đặt hàng trước',
    partOfSpeech: 'verb',
    example: 'Customers can preorder the new smartphone online.',
    exampleMeaning: 'Khách hàng có thể đặt hàng trước điện thoại thông minh mới trên mạng.',
  },
  'be released': {
    word: 'be released',
    ipa: '/biː rɪˈliːst/',
    meaning: 'được phát hành, ra mắt',
    partOfSpeech: 'verb',
    example: 'The new version will be released next Monday.',
    exampleMeaning: 'Phiên bản mới sẽ được phát hành vào thứ Hai tới.',
  },
  'product line': {
    word: 'product line',
    ipa: '/ˈprɒdʌkt laɪn/',
    meaning: 'dòng sản phẩm',
    partOfSpeech: 'phrase',
    example: 'The company launched an eco-friendly product line.',
    exampleMeaning: 'Công ty đã cho ra mắt một dòng sản phẩm thân thiện với môi trường.',
  },
  cookbook: {
    word: 'cookbook',
    ipa: '/ˈkʊkbʊk/',
    meaning: 'sách dạy nấu ăn',
    partOfSpeech: 'noun',
    example: 'She bought a new Italian cookbook yesterday.',
    exampleMeaning: 'Hôm qua cô ấy đã mua một cuốn sách dạy nấu món Ý mới.',
  },
  passenger: {
    word: 'passenger',
    ipa: '/ˈpæsɪndʒər/',
    meaning: 'hành khách',
    partOfSpeech: 'noun',
    example: 'All passengers must fasten their seatbelts.',
    exampleMeaning: 'Tất cả hành khách phải thắt dây an toàn.',
  },
  newsletter: {
    word: 'newsletter',
    ipa: '/ˈnuːzletər/',
    meaning: 'bản tin',
    partOfSpeech: 'noun',
    example: 'Subscribe to our monthly newsletter for special offers.',
    exampleMeaning: 'Đăng ký nhận bản tin hàng tháng của chúng tôi để nhận các ưu đãi đặc biệt.',
  },
  'in case': {
    word: 'in case',
    ipa: '/ɪn keɪs/',
    meaning: 'phòng khi, trong trường hợp',
    partOfSpeech: 'phrase',
    example: 'Take an umbrella in case it rains.',
    exampleMeaning: 'Hãy mang theo ô phòng khi trời mưa.',
  },
  upload: {
    word: 'upload',
    ipa: '/ˈʌpləʊd/',
    meaning: 'tải lên, đăng tải',
    partOfSpeech: 'verb',
    example: 'Please upload your resume to the portal.',
    exampleMeaning: 'Vui lòng tải lên sơ yếu lý lịch của bạn lên cổng thông tin.',
  },
  whole: {
    word: 'whole',
    ipa: '/həʊl/',
    meaning: 'toàn bộ, toàn thể',
    partOfSpeech: 'adjective',
    example: 'He spent the whole day preparing the report.',
    exampleMeaning: 'Anh ấy đã dành toàn bộ cả ngày để chuẩn bị báo cáo.',
  },
  entire: {
    word: 'entire',
    ipa: '/ɪnˈtaɪər/',
    meaning: 'toàn bộ, toàn thể',
    partOfSpeech: 'adjective',
    example: 'The entire staff attended the annual conference.',
    exampleMeaning: 'Toàn bộ nhân viên đã tham dự hội nghị thường niên.',
  },
  'whole - entire': {
    word: 'whole - entire',
    ipa: '/həʊl - ɪnˈtaɪər/',
    meaning: 'toàn bộ, toàn thể',
    partOfSpeech: 'adjective',
    example: 'The whole and entire team supported the decision.',
    exampleMeaning: 'Toàn bộ đội ngũ đã ủng hộ quyết định này.',
  },
  voicemail: {
    word: 'voicemail',
    ipa: '/ˈvɔɪsmeɪl/',
    meaning: 'tin nhắn thoại',
    partOfSpeech: 'noun',
    example: 'I left a message on your voicemail yesterday.',
    exampleMeaning: 'Hôm qua tôi đã để lại một tin nhắn trong hộp thư thoại của bạn.',
  },
  'catering company': {
    word: 'catering company',
    ipa: '/ˈkeɪtərɪŋ ˈkʌmpəni/',
    meaning: 'công ty cung cấp dịch vụ ăn uống',
    partOfSpeech: 'phrase',
    example: 'We hired a professional catering company for the banquet.',
    exampleMeaning: 'Chúng tôi đã thuê một công ty dịch vụ ăn uống chuyên nghiệp cho bữa tiệc.',
  },
  caterer: {
    word: 'caterer',
    ipa: '/ˈkeɪtərər/',
    meaning: 'nhà cung cấp dịch vụ ăn uống',
    partOfSpeech: 'noun',
    example: 'The caterer prepared a wonderful buffet.',
    exampleMeaning: 'Nhà cung cấp dịch vụ ăn uống đã chuẩn bị một bữa tiệc tự chọn tuyệt vời.',
  },
  method: {
    word: 'method',
    ipa: '/ˈmeθəd/',
    meaning: 'phương pháp, cách thức',
    partOfSpeech: 'noun',
    example: 'This new teaching method has proven very effective.',
    exampleMeaning: 'Phương pháp giảng dạy mới này đã chứng minh rất hiệu quả.',
  },
  'thoughts on': {
    word: 'thoughts on',
    ipa: '/θɔːts ɒn/',
    meaning: 'ý kiến về, suy nghĩ về',
    partOfSpeech: 'phrase',
    example: 'What are your thoughts on this new marketing proposal?',
    exampleMeaning: 'Ý kiến của bạn về đề xuất tiếp thị mới này là gì?',
  },
  necklace: {
    word: 'necklace',
    ipa: '/ˈnekləs/',
    meaning: 'vòng cổ, dây chuyền',
    partOfSpeech: 'noun',
    example: 'She received a diamond necklace as a graduation gift.',
    exampleMeaning: 'Cô nhận được một chiếc vòng cổ kim cương làm quà tốt nghiệp.',
  },
  earring: {
    word: 'earring',
    ipa: '/ˈɪərɪŋ/',
    meaning: 'bông tai, hoa tai',
    partOfSpeech: 'noun',
    example: 'She bought a pair of silver earrings at the market.',
    exampleMeaning: 'Cô ấy đã mua một đôi bông tai bạc ở chợ.',
  },
  occasion: {
    word: 'occasion',
    ipa: '/əˈkeɪʒn/',
    meaning: 'dịp, cơ hội, sự kiện',
    partOfSpeech: 'noun',
    example: 'A wedding is a very special occasion for families.',
    exampleMeaning: 'Đám cưới là một dịp rất đặc biệt đối với các gia đình.',
  },

  // Contracts (Bài 1)
  contract: {
    word: 'contract',
    ipa: '/ˈkɒntrækt/',
    meaning: 'hợp đồng, giao kèo',
    partOfSpeech: 'noun',
    example: 'Please sign the employment contract today.',
    exampleMeaning: 'Vui lòng ký hợp đồng lao động trong ngày hôm nay.',
  },
  'abide by': {
    word: 'abide by',
    ipa: '/əˈbaɪd baɪ/',
    meaning: 'tuân theo, tôn trọng',
    partOfSpeech: 'verb',
    example: 'Both sides must abide by the terms of the agreement.',
    exampleMeaning: 'Cả hai bên phải tuân thủ các điều khoản thỏa thuận.',
  },
  agreement: {
    word: 'agreement',
    ipa: '/əˈɡriːmənt/',
    meaning: 'sự đồng ý, thỏa thuận',
    partOfSpeech: 'noun',
    example: 'We finally reached a mutual agreement.',
    exampleMeaning: 'Chúng tôi cuối cùng đã đạt được sự thỏa thuận chung.',
  },
  cancellation: {
    word: 'cancellation',
    ipa: '/ˌkænsəˈleɪʃn/',
    meaning: 'sự hủy bỏ, bãi bỏ',
    partOfSpeech: 'noun',
    example: 'The cancellation of the flight caused major inconvenience.',
    exampleMeaning: 'Việc hủy chuyến bay đã gây ra nhiều bất tiện lớn.',
  },
  determine: {
    word: 'determine',
    ipa: '/dɪˈtɜːmɪn/',
    meaning: 'xác định, định rõ, quyết định',
    partOfSpeech: 'verb',
    example: 'We need to determine the root cause of the error.',
    exampleMeaning: 'Chúng ta cần xác định nguyên nhân cốt lõi của lỗi.',
  },
  assurance: {
    word: 'assurance',
    ipa: '/əˈʃʊərəns/',
    meaning: 'sự bảo đảm, cam đoan, trấn an',
    partOfSpeech: 'noun',
    example: 'The director gave us full assurance of project quality.',
    exampleMeaning: 'Giám đốc đã cho chúng tôi sự cam đoan trọn vẹn về chất lượng dự án.',
  },
  engage: {
    word: 'engage',
    ipa: '/ɪnˈɡeɪdʒ/',
    meaning: 'tham gia, cam kết, thuê',
    partOfSpeech: 'verb',
    example: 'They engaged an outside consultant to assist with audit.',
    exampleMeaning: 'Họ đã thuê một chuyên gia tư vấn bên ngoài để hỗ trợ kiểm toán.',
  },
  establish: {
    word: 'establish',
    ipa: '/ɪˈstæblɪʃ/',
    meaning: 'thành lập, thiết lập',
    partOfSpeech: 'verb',
    example: 'The company was established in 2010.',
    exampleMeaning: 'Công ty được thành lập vào năm 2010.',
  },
  influence: {
    word: 'influence',
    ipa: '/ˈɪnfluəns/',
    meaning: 'ảnh hưởng, tác động',
    partOfSpeech: 'noun',
    example: 'Social media has a huge influence on consumer behavior.',
    exampleMeaning: 'Mạng xã hội có ảnh hưởng rất lớn đến hành vi tiêu dùng.',
  },
  obligated: {
    word: 'obligated',
    ipa: '/ˈɒblɪɡeɪtɪd/',
    meaning: 'bắt buộc, có nghĩa vụ',
    partOfSpeech: 'adjective',
    example: 'You are obligated to notify us within 24 hours.',
    exampleMeaning: 'Bạn có nghĩa vụ phải thông báo cho chúng tôi trong vòng 24 giờ.',
  },
  'be obligated': {
    word: 'be obligated',
    ipa: '/biː ˈɒblɪɡeɪtɪd/',
    meaning: 'bắt buộc phải làm gì, có nghĩa vụ',
    partOfSpeech: 'phrase',
    example: 'Contractors are obligated to finish on time.',
    exampleMeaning: 'Các nhà thầu bắt buộc phải hoàn thành đúng hạn.',
  },
  party: {
    word: 'party',
    ipa: '/ˈpɑːti/',
    meaning: 'bên (tham gia hợp đồng), đảng phái, bữa tiệc',
    partOfSpeech: 'noun',
    example: 'Both parties agreed to the confidential clause.',
    exampleMeaning: 'Cả hai bên đều đồng ý với điều khoản bảo mật.',
  },
  provision: {
    word: 'provision',
    ipa: '/prəˈvɪʒn/',
    meaning: 'điều khoản, điều kiện, sự cung cấp',
    partOfSpeech: 'noun',
    example: 'Under the provisions of the contract, payment is due in 30 days.',
    exampleMeaning: 'Theo các điều khoản hợp đồng, hạn thanh toán là trong 30 ngày.',
  },
  resolve: {
    word: 'resolve',
    ipa: '/rɪˈzɒlv/',
    meaning: 'giải quyết, dàn xếp',
    partOfSpeech: 'verb',
    example: 'We must resolve this customer dispute promptly.',
    exampleMeaning: 'Chúng ta phải giải quyết tranh chấp của khách hàng này ngay lập tức.',
  },
  specific: {
    word: 'specific',
    ipa: '/spəˈsɪfɪk/',
    meaning: 'cụ thể, rõ ràng, đặc trưng',
    partOfSpeech: 'adjective',
    example: 'Please provide specific instructions for the team.',
    exampleMeaning: 'Xin vui lòng đưa ra hướng dẫn cụ thể cho cả nhóm.',
  },
  signature: {
    word: 'signature',
    ipa: '/ˈsɪɡnətʃər/',
    meaning: 'chữ ký',
    partOfSpeech: 'noun',
    example: 'Put your signature at the bottom of the page.',
    exampleMeaning: 'Hãy đặt chữ ký của bạn ở cuối trang.',
  },
  consent: {
    word: 'consent',
    ipa: '/kənˈsent/',
    meaning: 'sự đồng ý, chấp thuận',
    partOfSpeech: 'noun',
    example: 'We cannot proceed without client consent.',
    exampleMeaning: 'Chúng tôi không thể tiếp tục nếu không có sự chấp thuận của khách hàng.',
  },
  remedy: {
    word: 'remedy',
    ipa: '/ˈremədi/',
    meaning: 'biện pháp bồi thường, phương thuốc giải quyết',
    partOfSpeech: 'noun',
    example: 'The court provided an equitable remedy for the breach.',
    exampleMeaning: 'Tòa án đã đưa ra biện pháp bồi thường công bằng cho vi phạm.',
  },
  witness: {
    word: 'witness',
    ipa: '/ˈwɪtnəs/',
    meaning: 'nhân chứng, người làm chứng',
    partOfSpeech: 'noun',
    example: 'A legal witness is required during the contract signing.',
    exampleMeaning: 'Cần có một nhân chứng hợp pháp trong khi ký kết hợp đồng.',
  },
  dispute: {
    word: 'dispute',
    ipa: '/dɪˈspjuːt/',
    meaning: 'tranh chấp, mâu thuẫn',
    partOfSpeech: 'noun',
    example: 'The dispute was settled out of court.',
    exampleMeaning: 'Tranh chấp đã được hòa giải bên ngoài tòa án.',
  },
  commitment: {
    word: 'commitment',
    ipa: '/kəˈmɪtmənt/',
    meaning: 'sự cam kết, tận tụy',
    partOfSpeech: 'noun',
    example: 'Our commitment to quality remains strong.',
    exampleMeaning: 'Cam kết về chất lượng của chúng tôi luôn vững chắc.',
  },
  validity: {
    word: 'validity',
    ipa: '/vəˈlɪdəti/',
    meaning: 'tính hợp pháp, giá trị hiệu lực',
    partOfSpeech: 'noun',
    example: 'Check the validity of your passport before booking tickets.',
    exampleMeaning: 'Hãy kiểm tra thời hạn hiệu lực hộ chiếu trước khi đặt vé.',
  },
  renew: {
    word: 'renew',
    ipa: '/rɪˈnjuː/',
    meaning: 'gia hạn, làm mới',
    partOfSpeech: 'verb',
    example: 'He plans to renew his gym membership next month.',
    exampleMeaning: 'Anh ấy dự định gia hạn thẻ tập thể hình vào tháng tới.',
  },
  terminate: {
    word: 'terminate',
    ipa: '/ˈtɜːmɪneɪt/',
    meaning: 'chấm dứt, kết thúc',
    partOfSpeech: 'verb',
    example: 'The agreement terminates at the end of the fiscal year.',
    exampleMeaning: 'Thỏa thuận sẽ chấm dứt vào cuối năm tài chính.',
  },
  breach: {
    word: 'breach',
    ipa: '/briːtʃ/',
    meaning: 'sự vi phạm (hợp đồng, quy định)',
    partOfSpeech: 'noun',
    example: 'Failure to deliver goods is a serious breach of contract.',
    exampleMeaning: 'Việc không giao hàng là một sự vi phạm hợp đồng nghiêm trọng.',
  },
  expire: {
    word: 'expire',
    ipa: '/ɪkˈspaɪər/',
    meaning: 'hết hạn, mất hiệu lực',
    partOfSpeech: 'verb',
    example: 'The warranty will expire in three months.',
    exampleMeaning: 'Thời hạn bảo hành sẽ hết hạn trong ba tháng nữa.',
  },
  compensation: {
    word: 'compensation',
    ipa: '/ˌkɒmpenˈseɪʃn/',
    meaning: 'tiền bồi thường, sự đền bù',
    partOfSpeech: 'noun',
    example: 'The airline offered compensation for the lost luggage.',
    exampleMeaning: 'Hãng hàng không đã đề nghị bồi thường cho hành lý thất lạc.',
  },
  draft: {
    word: 'draft',
    ipa: '/drɑːft/',
    meaning: 'bản nháp, bản phác thảo',
    partOfSpeech: 'noun',
    example: 'I have finished the first draft of the proposal.',
    exampleMeaning: 'Tôi đã hoàn thành bản phác thảo đầu tiên của đề xuất.',
  },
  include: {
    word: 'include',
    ipa: '/ɪnˈkluːd/',
    meaning: 'bao gồm, tính cả',
    partOfSpeech: 'verb',
    example: 'The price includes breakfast and airport transfer.',
    exampleMeaning: 'Giá đã bao gồm bữa sáng và dịch vụ đưa đón sân bay.',
  },
  exclude: {
    word: 'exclude',
    ipa: '/ɪkˈskluːd/',
    meaning: 'loại trừ, không tính',
    partOfSpeech: 'verb',
    example: 'The cost excludes value-added tax.',
    exampleMeaning: 'Chi phí chưa bao gồm thuế giá trị gia tăng.',
  },
  document: {
    word: 'document',
    ipa: '/ˈdɒkjumənt/',
    meaning: 'tài liệu, văn bản',
    partOfSpeech: 'noun',
    example: 'Keep all important documents in a safe place.',
    exampleMeaning: 'Hãy giữ mọi tài liệu quan trọng ở nơi an toàn.',
  },
  schedule: {
    word: 'schedule',
    ipa: '/ˈskedʒuːl/',
    meaning: 'lịch trình, kế hoạch thời gian',
    partOfSpeech: 'noun',
    example: 'The conference schedule is posted on the website.',
    exampleMeaning: 'Lịch trình hội nghị đã được đăng tải trên trang web.',
  },
  folder: {
    word: 'folder',
    ipa: '/ˈfəʊldər/',
    meaning: 'thư mục, kẹp tài liệu',
    partOfSpeech: 'noun',
    example: 'Create a new folder for the client invoices.',
    exampleMeaning: 'Tạo một thư mục mới cho hóa đơn của khách hàng.',
  },
  finalize: {
    word: 'finalize',
    ipa: '/ˈfaɪnəlaɪz/',
    meaning: 'hoàn tất, chốt lần cuối',
    partOfSpeech: 'verb',
    example: 'We are ready to finalize the project contract.',
    exampleMeaning: 'Chúng tôi đã sẵn sàng hoàn tất hợp đồng dự án.',
  },

  // Conferences (Bài 2)
  conference: {
    word: 'conference',
    ipa: '/ˈkɒnfərəns/',
    meaning: 'hội nghị, hội thảo',
    partOfSpeech: 'noun',
    example: 'The annual medical conference attracts experts worldwide.',
    exampleMeaning: 'Hội nghị y khoa thường niên thu hút các chuyên gia toàn cầu.',
  },
  accommodate: {
    word: 'accommodate',
    ipa: '/əˈkɒmədeɪt/',
    meaning: 'chứa được, đáp ứng nhu cầu, bố trí chỗ ở',
    partOfSpeech: 'verb',
    example: 'The hall can accommodate up to 500 guests.',
    exampleMeaning: 'Hội trường có thể chứa được tới 500 khách mời.',
  },
  arrangement: {
    word: 'arrangement',
    ipa: '/əˈreɪndʒmənt/',
    meaning: 'sự sắp xếp, thu xếp',
    partOfSpeech: 'noun',
    example: 'All travel arrangements have been confirmed.',
    exampleMeaning: 'Mọi sắp xếp cho chuyến đi đều đã được xác nhận.',
  },
  attend: {
    word: 'attend',
    ipa: '/əˈtend/',
    meaning: 'tham dự, có mặt',
    partOfSpeech: 'verb',
    example: 'More than 200 members attended the annual meeting.',
    exampleMeaning: 'Hơn 200 thành viên đã tham dự cuộc họp thường niên.',
  },
  'get in touch': {
    word: 'get in touch',
    ipa: '/ɡet ɪn tʌtʃ/',
    meaning: 'giữ liên lạc, liên hệ',
    partOfSpeech: 'phrase',
    example: 'Feel free to get in touch if you have any questions.',
    exampleMeaning: 'Đừng ngần ngại liên hệ nếu bạn có bất kỳ thắc mắc nào.',
  },
  'be held': {
    word: 'be held',
    ipa: '/biː held/',
    meaning: 'được tổ chức, diễn ra',
    partOfSpeech: 'verb',
    example: 'The seminar will be held in Hall A.',
    exampleMeaning: 'Hội thảo sẽ được tổ chức tại Hội trường A.',
  },
  location: {
    word: 'location',
    ipa: '/ləʊˈkeɪʃn/',
    meaning: 'địa điểm, vị trí',
    partOfSpeech: 'noun',
    example: 'The hotel is in a prime downtown location.',
    exampleMeaning: 'Khách sạn nằm ở một vị trí đắc địa tại trung tâm thành phố.',
  },
  overcrowded: {
    word: 'overcrowded',
    ipa: '/ˌəʊvəˈkraʊdɪd/',
    meaning: 'quá đông đúc, chật chội',
    partOfSpeech: 'adjective',
    example: 'The subway station is always overcrowded at rush hour.',
    exampleMeaning: 'Ga tàu điện ngầm luôn quá đông đúc vào giờ cao điểm.',
  },
  'register for': {
    word: 'register for',
    ipa: '/ˈredʒɪstər fɔːr/',
    meaning: 'đăng ký tham gia',
    partOfSpeech: 'verb',
    example: 'You should register for the workshop early.',
    exampleMeaning: 'Bạn nên đăng ký hội thảo sớm.',
  },
  select: {
    word: 'select',
    ipa: '/sɪˈlekt/',
    meaning: 'lựa chọn, tuyển chọn',
    partOfSpeech: 'verb',
    example: 'Please select one of the following payment options.',
    exampleMeaning: 'Vui lòng chọn một trong các phương thức thanh toán sau.',
  },
  session: {
    word: 'session',
    ipa: '/ˈseʃn/',
    meaning: 'phiên họp, kỳ họp, buổi tập',
    partOfSpeech: 'noun',
    example: 'The morning session starts at 9:00 AM sharp.',
    exampleMeaning: 'Phiên họp buổi sáng bắt đầu đúng 9 giờ.',
  },
  'take part in': {
    word: 'take part in',
    ipa: '/teɪk pɑːt ɪn/',
    meaning: 'tham gia, tham dự',
    partOfSpeech: 'phrase',
    example: 'Many students take part in community activities.',
    exampleMeaning: 'Nhiều sinh viên tham gia các hoạt động cộng đồng.',
  },
  participate: {
    word: 'participate',
    ipa: '/pɑːˈtɪsɪpeɪt/',
    meaning: 'tham gia, góp phần',
    partOfSpeech: 'verb',
    example: 'Everyone is invited to participate in the discussion.',
    exampleMeaning: 'Mọi người đều được mời tham gia vào cuộc thảo luận.',
  },
  seminar: {
    word: 'seminar',
    ipa: '/ˈsemɪnɑːr/',
    meaning: 'hội thảo chuyên đề',
    partOfSpeech: 'noun',
    example: 'She gave an inspiring presentation at the business seminar.',
    exampleMeaning: 'Cô ấy đã có bài thuyết trình truyền cảm hứng tại hội thảo kinh doanh.',
  },
  'convention center': {
    word: 'convention center',
    ipa: '/kənˈvenʃn ˈsentər/',
    meaning: 'trung tâm hội nghị',
    partOfSpeech: 'noun',
    example: 'The event takes place at the national convention center.',
    exampleMeaning: 'Sự kiện diễn ra tại trung tâm hội nghị quốc gia.',
  },
  agenda: {
    word: 'agenda',
    ipa: '/əˈdʒendə/',
    meaning: 'chương trình nghị sự, nội dung cuộc họp',
    partOfSpeech: 'noun',
    example: 'Item one on today’s agenda is budget allocation.',
    exampleMeaning: 'Mục đầu tiên trong chương trình nghị sự hôm nay là phân bổ ngân sách.',
  },
  attendee: {
    word: 'attendee',
    ipa: '/əˌtenˈdiː/',
    meaning: 'người tham dự, người có mặt',
    partOfSpeech: 'noun',
    example: 'Over 500 attendees registered for the webinar.',
    exampleMeaning: 'Hơn 500 người tham dự đã đăng ký hội thảo trực tuyến.',
  },
  attendance: {
    word: 'attendance',
    ipa: '/əˈtendəns/',
    meaning: 'sự tham dự, số lượng người có mặt',
    partOfSpeech: 'noun',
    example: 'High attendance reflects great public interest.',
    exampleMeaning: 'Số lượng tham dự cao phản ánh sự quan tâm lớn của công chúng.',
  },
  'be present': {
    word: 'be present',
    ipa: '/biː ˈpreznt/',
    meaning: 'có mặt, hiện diện',
    partOfSpeech: 'phrase',
    example: 'All committee members must be present.',
    exampleMeaning: 'Tất cả các thành viên ủy ban phải có mặt.',
  },
  'be absent': {
    word: 'be absent',
    ipa: '/biː ˈæbsənt/',
    meaning: 'vắng mặt',
    partOfSpeech: 'phrase',
    example: 'He will be absent due to a medical emergency.',
    exampleMeaning: 'Anh ấy sẽ vắng mặt vì lý do cấp cứu y tế.',
  },
  speaker: {
    word: 'speaker',
    ipa: '/ˈspiːkər/',
    meaning: 'diễn giả, loa phát thanh',
    partOfSpeech: 'noun',
    example: 'The keynote speaker shared valuable insights.',
    exampleMeaning: 'Diễn giả chính đã chia sẻ những góc nhìn rất giá trị.',
  },
  presentation: {
    word: 'presentation',
    ipa: '/ˌpreznˈteɪʃn/',
    meaning: 'bài thuyết trình, bài trình bày',
    partOfSpeech: 'noun',
    example: 'Her presentation was praised by the executive team.',
    exampleMeaning: 'Bài thuyết trình của cô được ban điều hành khen ngợi.',
  },
  host: {
    word: 'host',
    ipa: '/həʊst/',
    meaning: 'người chủ trì, đăng cai tổ chức',
    partOfSpeech: 'noun',
    example: 'Vietnam is the host country for this international conference.',
    exampleMeaning: 'Việt Nam là nước chủ nhà đăng cai hội nghị quốc tế này.',
  },
  conduct: {
    word: 'conduct',
    ipa: '/kənˈdʌkt/',
    meaning: 'tiến hành, chỉ đạo, thực hiện',
    partOfSpeech: 'verb',
    example: 'They will conduct a survey on customer satisfaction.',
    exampleMeaning: 'Họ sẽ tiến hành khảo sát về mức độ hài lòng của khách hàng.',
  },
  postpone: {
    word: 'postpone',
    ipa: '/pəˈspəʊn/',
    meaning: 'trì hoãn, dời lịch lại',
    partOfSpeech: 'verb',
    example: 'The match was postponed due to torrential rain.',
    exampleMeaning: 'Trận đấu đã bị hoãn lại do mưa xối xả.',
  },
  confirm: {
    word: 'confirm',
    ipa: '/kənˈfɜːm/',
    meaning: 'xác nhận, khẳng định',
    partOfSpeech: 'verb',
    example: 'Please confirm your flight details by replying to this email.',
    exampleMeaning: 'Vui lòng xác nhận chi tiết chuyến bay bằng cách trả lời email này.',
  },
  upcoming: {
    word: 'upcoming',
    ipa: '/ˈʌpkʌmɪŋ/',
    meaning: 'sắp tới, chuẩn bị diễn ra',
    partOfSpeech: 'adjective',
    example: 'We are preparing for the upcoming product launch.',
    exampleMeaning: 'Chúng tôi đang chuẩn bị cho đợt ra mắt sản phẩm sắp tới.',
  },
  professional: {
    word: 'professional',
    ipa: '/prəˈfeʃənl/',
    meaning: 'chuyên nghiệp, lành nghề',
    partOfSpeech: 'adjective',
    example: 'She always maintains a polite and professional attitude.',
    exampleMeaning: 'Cô luôn duy trì thái độ lịch sự và chuyên nghiệp.',
  },
  'in-person': {
    word: 'in-person',
    ipa: '/ˌɪn ˈpɜːsn/',
    meaning: 'trực tiếp, mặt đối mặt',
    partOfSpeech: 'adjective',
    example: 'We prefer an in-person meeting for critical negotiations.',
    exampleMeaning: 'Chúng tôi ưu tiên cuộc gặp mặt trực tiếp cho các cuộc đàm phán quan trọng.',
  },
  assistant: {
    word: 'assistant',
    ipa: '/əˈsɪstənt/',
    meaning: 'trợ lý, phụ tá',
    partOfSpeech: 'noun',
    example: 'The administrative assistant manages executive schedules.',
    exampleMeaning: 'Trợ lý hành chính quản lý lịch trình của ban lãnh đạo.',
  },
  candidate: {
    word: 'candidate',
    ipa: '/ˈkændɪdət/',
    meaning: 'ứng cử viên, ứng viên',
    partOfSpeech: 'noun',
    example: 'Three qualified candidates were shortlisted for interviews.',
    exampleMeaning: 'Ba ứng viên đủ tiêu chuẩn đã được chọn vào danh sách phỏng vấn.',
  },
  venue: {
    word: 'venue',
    ipa: '/ˈvenjuː/',
    meaning: 'địa điểm tổ chức, nơi gặp gỡ',
    partOfSpeech: 'noun',
    example: 'The exhibition venue is conveniently near the train station.',
    exampleMeaning: 'Địa điểm tổ chức triển lãm nằm rất thuận tiện gần ga tàu.',
  },
  'registration fee': {
    word: 'registration fee',
    ipa: '/ˌredʒɪˈstreɪʃn fiː/',
    meaning: 'phí đăng ký',
    partOfSpeech: 'noun',
    example: 'The registration fee includes lunch and study materials.',
    exampleMeaning: 'Lệ phí đăng ký đã bao gồm bữa trưa và tài liệu học tập.',
  },
  itinerary: {
    word: 'itinerary',
    ipa: '/aɪˈtɪnərəri/',
    meaning: 'lịch trình chi tiết, hành trình',
    partOfSpeech: 'noun',
    example: 'The travel agent sent us the complete tour itinerary.',
    exampleMeaning: 'Đại lý du lịch đã gửi cho chúng tôi lịch trình tour đầy đủ.',
  },
  announcement: {
    word: 'announcement',
    ipa: '/əˈnaʊnsmənt/',
    meaning: 'thông báo, lời tuyên bố',
    partOfSpeech: 'noun',
    example: 'The company made an announcement regarding the merger.',
    exampleMeaning: 'Công ty đã đưa ra thông báo liên quan đến vụ sáp nhập.',
  },
  capacity: {
    word: 'capacity',
    ipa: '/kəˈpæsəti/',
    meaning: 'sức chứa, dung lượng, năng lực',
    partOfSpeech: 'noun',
    example: 'The stadium was filled to full capacity.',
    exampleMeaning: 'Sân vận động đã được lấp đầy toàn bộ sức chứa.',
  },
  reputation: {
    word: 'reputation',
    ipa: '/ˌrepjuˈteɪʃn/',
    meaning: 'danh tiếng, uy tín',
    partOfSpeech: 'noun',
    example: 'The university has an outstanding international reputation.',
    exampleMeaning: 'Trường đại học có danh tiếng quốc tế vượt trội.',
  },
  require: {
    word: 'require',
    ipa: '/rɪˈkwaɪər/',
    meaning: 'yêu cầu, đòi hỏi',
    partOfSpeech: 'verb',
    example: 'The job requires fluency in both English and French.',
    exampleMeaning: 'Công việc đòi hỏi thành thạo cả tiếng Anh lẫn tiếng Pháp.',
  },
  'a variety of': {
    word: 'a variety of',
    ipa: '/ə vəˈraɪəti əv/',
    meaning: 'nhiều loại, đa dạng các',
    partOfSpeech: 'phrase',
    example: 'The store offers a variety of organic foods.',
    exampleMeaning: 'Cửa hàng cung cấp nhiều loại thực phẩm hữu cơ.',
  },
  replace: {
    word: 'replace',
    ipa: '/rɪˈpleɪs/',
    meaning: 'thay thế, thế chỗ',
    partOfSpeech: 'verb',
    example: 'We need to replace the outdated equipment soon.',
    exampleMeaning: 'Chúng ta cần sớm thay thế các thiết bị lỗi thời.',
  },
  process: {
    word: 'process',
    ipa: '/ˈprəʊses/',
    meaning: 'quy trình, tiến trình xử lý',
    partOfSpeech: 'noun',
    example: 'The visa application process usually takes two weeks.',
    exampleMeaning: 'Quy trình xin thị thực thường mất hai tuần.',
  },
  authorized: {
    word: 'authorized',
    ipa: '/ˈɔːθəraɪzd/',
    meaning: 'được ủy quyền, có thẩm quyền',
    partOfSpeech: 'adjective',
    example: 'Only authorized personnel are permitted in this area.',
    exampleMeaning: 'Chỉ nhân sự được ủy quyền mới được phép vào khu vực này.',
  },
  promise: {
    word: 'promise',
    ipa: '/ˈprɒmɪs/',
    meaning: 'hứa hẹn, lời hứa',
    partOfSpeech: 'verb',
    example: 'She promised to deliver the financial report by Friday.',
    exampleMeaning: 'Cô ấy đã hứa sẽ nộp báo cáo tài chính trước thứ Sáu.',
  },
  reserve: {
    word: 'reserve',
    ipa: '/rɪˈzɜːv/',
    meaning: 'đặt trước, giữ chỗ',
    partOfSpeech: 'verb',
    example: 'I would like to reserve a table for four tonight.',
    exampleMeaning: 'Tôi muốn đặt trước một bàn bốn người cho tối nay.',
  },
  reservation: {
    word: 'reservation',
    ipa: '/ˌrezəˈveɪʃn/',
    meaning: 'sự đặt phòng, đặt chỗ trước',
    partOfSpeech: 'noun',
    example: 'Do you have a reservation under the name Nguyen?',
    exampleMeaning: 'Bạn có đặt chỗ trước dưới tên Nguyễn không?',
  },
  facility: {
    word: 'facility',
    ipa: '/fəˈsɪləti/',
    meaning: 'cơ sở vật chất, tiện nghi',
    partOfSpeech: 'noun',
    example: 'The campus boasts state-of-the-art sports facilities.',
    exampleMeaning: 'Khuôn viên trường sở hữu các cơ sở thể thao hiện đại bậc nhất.',
  },
  seating: {
    word: 'seating',
    ipa: '/ˈsiːtɪŋ/',
    meaning: 'chỗ ngồi, sự sắp xếp ghế',
    partOfSpeech: 'noun',
    example: 'The theater provides ample comfortable seating.',
    exampleMeaning: 'Nhà hát cung cấp rất nhiều chỗ ngồi thoải mái.',
  },
  summary: {
    word: 'summary',
    ipa: '/ˈsʌməri/',
    meaning: 'bản tóm tắt, sơ lược',
    partOfSpeech: 'noun',
    example: 'Here is a brief summary of the main points.',
    exampleMeaning: 'Dưới đây là bản tóm tắt ngắn gọn các điểm chính.',
  },
  'scheduling conflict': {
    word: 'scheduling conflict',
    ipa: '/ˈskedʒuːlɪŋ ˈkɒnflɪkt/',
    meaning: 'trùng lịch, xung đột lịch hẹn',
    partOfSpeech: 'noun',
    example: 'Due to a scheduling conflict, the meeting has been moved to 3 PM.',
    exampleMeaning: 'Do bị trùng lịch, cuộc họp đã được chuyển sang 3 giờ chiều.',
  },
};

// Từ điển loại từ thông dụng tiếng Anh để đối chiếu siêu nhanh
const COMMON_ADVERBS = new Set([
  'abroad', 'always', 'never', 'often', 'sometimes', 'usually', 'rarely', 'seldom',
  'together', 'ahead', 'away', 'back', 'down', 'here', 'there', 'everywhere', 'nowhere',
  'anywhere', 'now', 'then', 'soon', 'today', 'tomorrow', 'yesterday', 'tonight',
  'early', 'late', 'fast', 'hard', 'well', 'quite', 'too', 'very', 'extremely',
  'almost', 'nearly', 'enough', 'hardly', 'scarcely', 'barely', 'indeed', 'perhaps',
  'maybe', 'probably', 'certainly', 'definitely', 'clearly', 'actually', 'already',
  'still', 'yet', 'even', 'only', 'just', 'also', 'furthermore', 'however', 'moreover',
  'meanwhile', 'instead', 'otherwise', 'therefore', 'thus', 'afterward', 'upstairs',
  'downstairs', 'outdoors', 'indoors', 'anyway',
]);

const COMMON_PREPOSITIONS = new Set([
  'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at',
  'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by',
  'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'near', 'of',
  'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'through', 'throughout',
  'to', 'toward', 'towards', 'under', 'underneath', 'until', 'up', 'upon', 'with',
  'within', 'without',
]);

const COMMON_CONJUNCTIONS = new Set([
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since',
  'unless', 'while', 'whereas', 'whether', 'as', 'if', 'though', 'even though',
]);

// Kiểm tra ký tự tiếng Việt có dấu
export function hasVietnameseDiacritics(str: string): boolean {
  return /[àáảãạăắằẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(str);
}

// Làm sạch từ tiếng Anh
export function cleanEnglishWord(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^[\d\.\-\*\•\+\>\~\s\:\;\,\/\[\]\(\)\"\'\`\|]+/, '')
    .replace(/[\:\;\,\/\[\]\(\)\"\'\`\|]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Chuẩn hóa và làm sạch chuỗi IPA
export function cleanIpaString(raw: string): string {
  if (!raw) return '';
  let ipa = raw.trim();
  // Bỏ dấu ngoặc ngoài nếu có
  ipa = ipa.replace(/^[\[\/\s]+/, '').replace(/[\]\/\s]+$/, '').trim();
  if (!ipa) return '';
  // Đóng gói lại chuẩn /.../
  return `/${ipa}/`;
}

// Làm sạch nghĩa tiếng Việt
export function cleanVietnameseMeaning(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^[\:\=\-\–\—\s\|\.\,\;\/]+/, '')
    .replace(/[\:\=\-\–\—\s\|\.\,\;\/]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tạo phiên âm IPA thông minh tự động nếu từ vựng chưa có
export function generateAutoIpa(englishWord: string): string {
  const clean = englishWord.toLowerCase().trim();
  if (!clean) return '';

  // 1. Tra cứu trực tiếp từ điển
  if (COMPREHENSIVE_DICTIONARY[clean]) {
    return COMPREHENSIVE_DICTIONARY[clean].ipa;
  }

  // Nếu là cụm từ (có khoảng trắng): ghép IPA của từng từ thành phần
  if (clean.includes(' ')) {
    const parts = clean.split(/\s+/);
    const ipaParts = parts.map((p) => {
      if (COMPREHENSIVE_DICTIONARY[p]) {
        return COMPREHENSIVE_DICTIONARY[p].ipa.replace(/\//g, '');
      }
      return generateSingleWordIpa(p).replace(/\//g, '');
    });
    return `/${ipaParts.join(' ')}/`;
  }

  return generateSingleWordIpa(clean);
}

// Tạo IPA gần đúng theo quy tắc ngữ âm tiếng Anh cho 1 từ
function generateSingleWordIpa(word: string): string {
  if (COMPREHENSIVE_DICTIONARY[word]) {
    return COMPREHENSIVE_DICTIONARY[word].ipa;
  }

  // Khử các tiền tố và hậu tố thông dụng
  let stem = word;
  let prefix = '';
  let suffix = '';

  if (stem.startsWith('un')) {
    prefix = 'ʌn';
    stem = stem.slice(2);
  } else if (stem.startsWith('dis')) {
    prefix = 'dɪs';
    stem = stem.slice(3);
  } else if (stem.startsWith('re')) {
    prefix = 'riː';
    stem = stem.slice(2);
  } else if (stem.startsWith('pre')) {
    prefix = 'priː';
    stem = stem.slice(3);
  }

  if (stem.endsWith('tion')) {
    suffix = 'ʃn';
    stem = stem.slice(0, -4);
  } else if (stem.endsWith('sion')) {
    suffix = 'ʒn';
    stem = stem.slice(0, -4);
  } else if (stem.endsWith('ment')) {
    suffix = 'mənt';
    stem = stem.slice(0, -4);
  } else if (stem.endsWith('able')) {
    suffix = 'əbl';
    stem = stem.slice(0, -4);
  } else if (stem.endsWith('ible')) {
    suffix = 'əbl';
    stem = stem.slice(0, -4);
  } else if (stem.endsWith('ness')) {
    suffix = 'nəs';
    stem = stem.slice(0, -4);
  } else if (stem.endsWith('ing')) {
    suffix = 'ɪŋ';
    stem = stem.slice(0, -3);
  } else if (stem.endsWith('ly')) {
    suffix = 'li';
    stem = stem.slice(0, -2);
  }

  // Nếu phần gốc có trong từ điển
  if (COMPREHENSIVE_DICTIONARY[stem]) {
    const baseIpa = COMPREHENSIVE_DICTIONARY[stem].ipa.replace(/\//g, '');
    return `/${prefix}${baseIpa}${suffix}/`;
  }

  // Quy tắc gần đúng âm vị học cơ bản
  let ipaBody = word
    .replace(/tion/g, 'ʃn')
    .replace(/sion/g, 'ʒn')
    .replace(/ph/g, 'f')
    .replace(/ch/g, 'tʃ')
    .replace(/sh/g, 'ʃ')
    .replace(/th/g, 'θ')
    .replace(/qu/g, 'kw')
    .replace(/ck/g, 'k')
    .replace(/ee/g, 'iː')
    .replace(/ea/g, 'iː')
    .replace(/oo/g, 'uː')
    .replace(/ou/g, 'aʊ')
    .replace(/ow/g, 'aʊ')
    .replace(/ai/g, 'eɪ')
    .replace(/ay/g, 'eɪ')
    .replace(/igh/g, 'aɪ')
    .replace(/igh/g, 'aɪ')
    .replace(/al/g, 'əl')
    .replace(/er$/g, 'ər')
    .replace(/or$/g, 'ər');

  return `/ˈ${ipaBody}/`;
}

// Phân loại từ chuẩn xác dựa trên hình thái học tiếng Anh và nghĩa tiếng Việt
export function classifyPartOfSpeech(englishWord: string, meaning: string): PartOfSpeech {
  const w = cleanEnglishWord(englishWord).toLowerCase();
  const m = cleanVietnameseMeaning(meaning).toLowerCase();

  // 1. Kiểm tra từ điển từ chuẩn đã biết
  if (COMPREHENSIVE_DICTIONARY[w]) {
    return COMPREHENSIVE_DICTIONARY[w].partOfSpeech;
  }

  // 2. Kiểm tra cụm từ
  if (w.includes(' ') || w.includes('-')) {
    if (w.startsWith('be ') || w.startsWith('to ')) return 'verb';
    if (w.startsWith('take ') || w.startsWith('get ') || w.startsWith('look ') || w.startsWith('keep ') || w.startsWith('put ')) {
      return 'phrase';
    }
    return 'phrase';
  }

  // 3. Phân tích ngữ cảnh tiếng Anh chuyên biệt
  if (COMMON_ADVERBS.has(w) || w.endsWith('ly') || w.endsWith('ward') || w.endsWith('wise')) {
    return 'adverb';
  }

  if (COMMON_PREPOSITIONS.has(w)) {
    return 'preposition';
  }

  if (COMMON_CONJUNCTIONS.has(w)) {
    return 'conjunction';
  }

  // Hậu tố Tính từ tiếng Anh
  if (
    w.endsWith('ary') ||
    w.endsWith('al') ||
    w.endsWith('ic') ||
    w.endsWith('ical') ||
    w.endsWith('able') ||
    w.endsWith('ible') ||
    w.endsWith('ful') ||
    w.endsWith('less') ||
    w.endsWith('ous') ||
    w.endsWith('ive') ||
    w.endsWith('ish') ||
    w.endsWith('ent') ||
    w.endsWith('ant')
  ) {
    return 'adjective';
  }

  // Hậu tố Động từ tiếng Anh
  if (
    w.endsWith('ize') ||
    w.endsWith('ise') ||
    w.endsWith('ify') ||
    w.endsWith('ate') ||
    w.endsWith('en') ||
    w.startsWith('pre') ||
    w.startsWith('re')
  ) {
    // Lưu ý loại trừ một số danh từ kết thúc bằng -ate hoặc -en
    if (!w.endsWith('candidate') && !w.endsWith('climate') && !w.endsWith('kitchen')) {
      return 'verb';
    }
  }

  // Hậu tố Danh từ tiếng Anh
  if (
    w.endsWith('tion') ||
    w.endsWith('sion') ||
    w.endsWith('ment') ||
    w.endsWith('ness') ||
    w.endsWith('ity') ||
    w.endsWith('ance') ||
    w.endsWith('ence') ||
    w.endsWith('er') ||
    w.endsWith('or') ||
    w.endsWith('ist') ||
    w.endsWith('ism') ||
    w.endsWith('ship') ||
    w.endsWith('hood') ||
    w.endsWith('book') ||
    w.endsWith('line') ||
    w.endsWith('plant') ||
    w.endsWith('room')
  ) {
    return 'noun';
  }

  // 4. Phân tích theo nghĩa tiếng Việt
  if (
    m.startsWith('ở ') ||
    m.startsWith('một cách ') ||
    m.startsWith('luôn ') ||
    m.startsWith('thường ') ||
    m.startsWith('rất ')
  ) {
    return 'adverb';
  }

  if (
    m.startsWith('(thuộc') ||
    m.startsWith('thuộc ') ||
    m.startsWith('có tính') ||
    m.startsWith('mang tính') ||
    m.includes('chuyên nghiệp') ||
    m.includes('cụ thể') ||
    m.includes('hợp pháp') ||
    m.includes('đông đúc') ||
    m.includes('đẹp') ||
    m.includes('ngon')
  ) {
    return 'adjective';
  }

  if (
    m.startsWith('được ') ||
    m.startsWith('bị ') ||
    m.startsWith('làm ') ||
    m.startsWith('tiến hành') ||
    m.startsWith('thực hiện') ||
    m.startsWith('xác nhận') ||
    m.startsWith('chỉ trích') ||
    m.startsWith('phê bình') ||
    m.startsWith('biện minh') ||
    m.startsWith('giải thích') ||
    m.startsWith('đặt ') ||
    m.startsWith('yêu cầu') ||
    m.startsWith('thay thế') ||
    m.startsWith('hứa') ||
    m.startsWith('giải quyết') ||
    m.startsWith('chấm dứt') ||
    m.startsWith('hoàn tất') ||
    m.startsWith('tham gia') ||
    m.startsWith('gia hạn') ||
    m.startsWith('phát hành') ||
    m.startsWith('học') ||
    m.startsWith('nói') ||
    m.startsWith('viết') ||
    m.startsWith('đọc')
  ) {
    return 'verb';
  }

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
    m.startsWith('điều khoản') ||
    m.startsWith('hợp đồng') ||
    m.startsWith('cà ') ||
    m.startsWith('sách ') ||
    m.startsWith('dòng ') ||
    m.startsWith('hành khách')
  ) {
    return 'noun';
  }

  return 'noun';
}

// Bóc tách siêu thông minh 1 dòng văn bản bất kỳ
export function smartParseVocabLine(rawLine: string): {
  word: string;
  ipa: string;
  partOfSpeech: PartOfSpeech;
  meaning: string;
} | null {
  let line = rawLine.trim();
  if (!line || line.length < 2) return null;

  // Bỏ qua dòng tiêu đề
  const lower = line.toLowerCase();
  if (
    (lower.includes('stt') || lower.includes('no.')) &&
    (lower.includes('word') || lower.includes('từ'))
  ) {
    return null;
  }
  if (lower === 'word' || lower === 'từ' || lower === 'meanings' || lower === 'nghĩa' || lower === 'ipa') {
    return null;
  }

  // 1. Tìm và bóc tách phiên âm IPA nếu có trong cặp /.../ hoặc [...]
  let extractedIpa = '';
  const ipaRegex = /([\/\[][a-zA-Z0-9\s:;,'\u0250-\u02AF\u1D00-\u1D7F\u02C8\u02CC\(\)\/\-]+[\/\]])/;
  const ipaMatch = line.match(ipaRegex);

  let wordPart = '';
  let meaningPart = '';

  if (ipaMatch && ipaMatch.index !== undefined) {
    extractedIpa = cleanIpaString(ipaMatch[0]);
    const beforeIpa = line.slice(0, ipaMatch.index).trim();
    const afterIpa = line.slice(ipaMatch.index + ipaMatch[0].length).trim();

    wordPart = beforeIpa;
    meaningPart = afterIpa;

    // Kiểm tra xem phần trước IPA có bị rỗng không (ví dụ IPA đứng đầu)
    if (!wordPart && meaningPart) {
      // Tìm từ tiếng Anh trong phần sau
      const tokens = meaningPart.split(/\s+/);
      wordPart = tokens[0];
      meaningPart = tokens.slice(1).join(' ');
    }
  } else {
    // 2. Không có cặp ngoặc IPA rõ ràng: Tách theo các ký tự phân cách (Tab, Dấu hai chấm, Gạch ngang, Phẩy)
    if (line.includes('\t')) {
      const parts = line.split('\t').map((p) => p.trim()).filter(Boolean);
      wordPart = parts[0] || '';
      meaningPart = parts.slice(1).join(' - ');
    } else if (line.includes(' : ') || line.includes(':')) {
      const parts = line.split(':');
      wordPart = parts[0].trim();
      meaningPart = parts.slice(1).join(':').trim();
    } else if (line.includes(' - ') || line.includes(' – ') || line.includes(' — ')) {
      const sep = line.includes(' - ') ? ' - ' : line.includes(' – ') ? ' – ' : ' — ';
      const parts = line.split(sep);
      wordPart = parts[0].trim();
      meaningPart = parts.slice(1).join(' - ').trim();
    } else {
      // 3. Phân tách ranh giới bằng tiếng Việt có dấu
      const wordsInLine = line.split(/\s+/);
      let splitIdx = -1;
      for (let i = 1; i < wordsInLine.length; i++) {
        if (hasVietnameseDiacritics(wordsInLine[i])) {
          splitIdx = i;
          break;
        }
      }

      if (splitIdx > 0) {
        wordPart = wordsInLine.slice(0, splitIdx).join(' ');
        meaningPart = wordsInLine.slice(splitIdx).join(' ');
      } else {
        // Chỉ có 1 từ tiếng Anh hoặc đoạn ngắn
        wordPart = line;
        meaningPart = '';
      }
    }
  }

  // 4. Kiểm tra xem trong wordPart có bị lọt IPA hay ký tự rác không
  if (wordPart.includes('/') || wordPart.includes('[')) {
    const innerIpaMatch = wordPart.match(ipaRegex);
    if (innerIpaMatch && innerIpaMatch.index !== undefined) {
      if (!extractedIpa) {
        extractedIpa = cleanIpaString(innerIpaMatch[0]);
      }
      const leftover = wordPart.slice(innerIpaMatch.index + innerIpaMatch[0].length).trim();
      wordPart = wordPart.slice(0, innerIpaMatch.index).trim();
      if (leftover && hasVietnameseDiacritics(leftover)) {
        // Tiếng Việt bị lọt vào phần từ tiếng Anh (ví dụ "... ghi" trong "keep in mind /.../ ghi")
        meaningPart = leftover + (meaningPart ? ' ' + meaningPart : '');
      }
    }
  }

  // 5. Kiểm tra xem phần cuối của wordPart có tiếng Việt không (ví dụ "keep in mind ghi")
  const wordTokens = wordPart.split(/\s+/);
  if (wordTokens.length > 1) {
    const vietnameseTrailing: string[] = [];
    while (wordTokens.length > 1 && hasVietnameseDiacritics(wordTokens[wordTokens.length - 1])) {
      vietnameseTrailing.unshift(wordTokens.pop()!);
    }
    if (vietnameseTrailing.length > 0) {
      wordPart = wordTokens.join(' ');
      meaningPart = vietnameseTrailing.join(' ') + (meaningPart ? ' ' + meaningPart : '');
    }
  }

  const cleanWord = cleanEnglishWord(wordPart);
  let cleanMeaning = cleanVietnameseMeaning(meaningPart);

  if (!cleanWord || cleanWord.length < 1) return null;

  // 6. Tự động nhận diện / Bổ sung thông tin từ từ điển nếu thiếu
  const dictMatch = COMPREHENSIVE_DICTIONARY[cleanWord.toLowerCase()];

  if (!cleanMeaning && dictMatch) {
    cleanMeaning = dictMatch.meaning;
  }

  if (!extractedIpa) {
    extractedIpa = dictMatch ? dictMatch.ipa : generateAutoIpa(cleanWord);
  }

  const partOfSpeech = classifyPartOfSpeech(cleanWord, cleanMeaning);

  return {
    word: cleanWord,
    ipa: extractedIpa,
    partOfSpeech,
    meaning: cleanMeaning || '(Chưa có nghĩa tiếng Việt)',
  };
}

// Chuẩn hóa và sửa chữa toàn diện 1 từ vựng trong cơ sở dữ liệu
export function repairAndStandardizeWord(wordItem: Word): {
  repairedWord: Word;
  changed: boolean;
  fixes: string[];
} {
  const fixes: string[] = [];
  let isChanged = false;

  let currentWord = wordItem.word || '';
  let currentIpa = wordItem.ipa || '';
  let currentMeaning = wordItem.meaning || '';
  let currentPos = wordItem.partOfSpeech || 'noun';

  // 1. Tách IPA nếu đang bị dính trong trường `word` (Lỗi phổ biến nhất!)
  const ipaRegex = /([\/\[][a-zA-Z0-9\s:;,'\u0250-\u02AF\u1D00-\u1D7F\u02C8\u02CC\(\)\/\-]+[\/\]])/;
  const ipaMatch = currentWord.match(ipaRegex);

  if (ipaMatch && ipaMatch.index !== undefined) {
    const detectedIpa = cleanIpaString(ipaMatch[0]);
    const beforeIpa = currentWord.slice(0, ipaMatch.index).trim();
    const afterIpa = currentWord.slice(ipaMatch.index + ipaMatch[0].length).trim();

    currentWord = beforeIpa;
    if (!currentIpa || currentIpa.trim() === '' || currentIpa === detectedIpa) {
      currentIpa = detectedIpa;
    }

    if (afterIpa && (hasVietnameseDiacritics(afterIpa) || afterIpa.length > 0)) {
      // Từ tiếng Việt bị dính (như "ghi" trong "keep in mind /.../ ghi")
      currentMeaning = afterIpa + (currentMeaning ? ' ' + currentMeaning : '');
      fixes.push(`Tách phần nghĩa "${afterIpa}" về đúng cột Nghĩa`);
    }

    fixes.push(`Tách phiên âm ${detectedIpa} ra khỏi cột Từ`);
    isChanged = true;
  }

  // 2. Tách từ tiếng Việt bị dính ở cuối trường `word` nếu có
  const tokens = currentWord.split(/\s+/);
  if (tokens.length > 1) {
    const trailingVie: string[] = [];
    while (tokens.length > 1 && hasVietnameseDiacritics(tokens[tokens.length - 1])) {
      trailingVie.unshift(tokens.pop()!);
    }
    if (trailingVie.length > 0) {
      currentWord = tokens.join(' ');
      const joinedVie = trailingVie.join(' ');
      currentMeaning = joinedVie + (currentMeaning ? ' ' + currentMeaning : '');
      fixes.push(`Chuyển từ "${joinedVie}" sang nghĩa tiếng Việt`);
      isChanged = true;
    }
  }

  // 3. Làm sạch từ tiếng Anh
  const cleanedWord = cleanEnglishWord(currentWord);
  if (cleanedWord !== currentWord) {
    currentWord = cleanedWord;
    fixes.push('Xóa ký tự thừa trong từ');
    isChanged = true;
  }

  // 4. Đối chiếu từ điển chuẩn
  const lower = currentWord.toLowerCase();
  const dict = COMPREHENSIVE_DICTIONARY[lower];

  // 5. Chuẩn hóa phiên âm IPA
  if ((!currentIpa || currentIpa.length < 2) && dict) {
    currentIpa = dict.ipa;
    fixes.push(`Bổ sung phiên âm chuẩn ${dict.ipa}`);
    isChanged = true;
  } else if (!currentIpa || currentIpa.length < 2) {
    currentIpa = generateAutoIpa(currentWord);
    fixes.push(`Tự động tạo phiên âm ${currentIpa}`);
    isChanged = true;
  } else {
    const cleanedIpa = cleanIpaString(currentIpa);
    if (cleanedIpa !== currentIpa) {
      currentIpa = cleanedIpa;
      fixes.push('Chuẩn hóa định dạng /.../');
      isChanged = true;
    }
  }

  // 6. Sửa loại từ (Part of Speech) - Cực kỳ quan trọng vì trước đây hầu hết đều bị gán là "noun" (Danh từ)
  const accuratePos = dict ? dict.partOfSpeech : classifyPartOfSpeech(currentWord, currentMeaning);
  if (accuratePos !== currentPos) {
    fixes.push(`Sửa loại từ từ "${currentPos}" thành "${accuratePos}"`);
    currentPos = accuratePos;
    isChanged = true;
  }

  // 7. Sửa và chuẩn hóa nghĩa tiếng Việt
  let cleanedMeaning = cleanVietnameseMeaning(currentMeaning);
  if (dict && (!cleanedMeaning || cleanedMeaning === '(Chưa có nghĩa)' || cleanedMeaning.length < 2)) {
    cleanedMeaning = dict.meaning;
    fixes.push(`Bổ sung nghĩa tiếng Việt từ chuẩn: "${dict.meaning}"`);
    isChanged = true;
  }

  if (cleanedMeaning !== currentMeaning) {
    currentMeaning = cleanedMeaning;
    fixes.push('Chuẩn hóa dấu câu trong nghĩa');
    isChanged = true;
  }

  return {
    repairedWord: {
      ...wordItem,
      word: currentWord,
      ipa: currentIpa,
      partOfSpeech: currentPos,
      meaning: currentMeaning,
    },
    changed: isChanged,
    fixes,
  };
}

// Quét và sửa toàn bộ danh sách từ vựng trong cơ sở dữ liệu
export function repairAllWords(words: Word[]): {
  repairedWords: Word[];
  changedCount: number;
  report: { word: string; fixes: string[] }[];
} {
  let changedCount = 0;
  const report: { word: string; fixes: string[] }[] = [];

  const repairedWords = words.map((w) => {
    const result = repairAndStandardizeWord(w);
    if (result.changed) {
      changedCount++;
      report.push({
        word: result.repairedWord.word,
        fixes: result.fixes,
      });
      return result.repairedWord;
    }
    return w;
  });

  return {
    repairedWords,
    changedCount,
    report,
  };
}
