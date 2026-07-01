import { createWorker } from 'tesseract.js';

// Ngưỡng tối thiểu - điều chỉnh phù hợp với tiếng Việt
const MIN_WORD_COUNT = 5;    // số từ hợp lệ tối thiểu
const MIN_CONFIDENCE = 20;   // tiếng Việt có dấu thường đạt 20–50%, không dùng ngưỡng cao
const MIN_WORD_LENGTH = 2;   // bỏ ký tự đơn lẻ / noise

/**
 * Kiểm tra danh sách words từ Tesseract.
 * Dùng ngưỡng confidence thấp để không bỏ sót tiếng Việt có dấu.
 * Dùng \p{L} (Unicode letter) thay vì ASCII range để nhận diện đúng.
 * @param {Array<{ text: string, confidence: number }>} words
 * @returns {{ valid: boolean, wordCount: number }}
 */
function validateOcrWords(words) {
  const validWords = words.filter(
    (w) =>
      w.confidence >= MIN_CONFIDENCE &&
      w.text.length >= MIN_WORD_LENGTH &&
      /\p{L}/u.test(w.text) // bất kỳ ký tự chữ Unicode nào (Latin, tiếng Việt, v.v.)
  );
  return { valid: validWords.length >= MIN_WORD_COUNT, wordCount: validWords.length };
}

/**
 * Quét OCR toàn bộ các ảnh bằng Tesseract.js, lọc theo confidence score.
 * @param {File[]} imageFiles - mảng File/Blob gốc
 * @param {(progress: number) => void} onProgress - callback tiến trình 0–100
 * @returns {Promise<{ valid: boolean, wordCount: number }>}
 */
export async function runOcrValidation(imageFiles, onProgress) {
  const worker = await createWorker('vie+eng', 1, {
    logger: () => {}, // tắt log nội bộ Tesseract
  });

  let allWords = [];
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    const { data } = await worker.recognize(imageFiles[i]);
    if (Array.isArray(data.words)) {
      allWords = allWords.concat(data.words);
    }
    if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));
  }

  await worker.terminate();

  const { valid, wordCount } = validateOcrWords(allWords);
  return { valid, wordCount };
}
