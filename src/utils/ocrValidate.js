import { createWorker } from 'tesseract.js';

// Ngưỡng tối thiểu
const MIN_WORD_COUNT = 5;      // số từ hợp lệ tối thiểu
const MIN_CONFIDENCE = 60;     // % độ tin cậy tối thiểu của từng từ (lọc ảo giác)
const MIN_WORD_LENGTH = 2;     // độ dài tối thiểu của từ (loại ký tự đơn lẻ)

/**
 * Kiểm tra danh sách words từ Tesseract (có confidence score).
 * Chỉ đếm từ có confidence >= MIN_CONFIDENCE VÀ có ít nhất MIN_WORD_LENGTH ký tự chữ liền nhau.
 *
 * @param {Array<{ text: string, confidence: number }>} words
 * @returns {{ valid: boolean, wordCount: number }}
 */
function validateOcrWords(words) {
  const validWords = words.filter(
    (w) =>
      w.confidence >= MIN_CONFIDENCE &&
      w.text.length >= MIN_WORD_LENGTH &&
      /[a-zA-ZÀ-ỹ]{2,}/.test(w.text) // phải có ít nhất 2 ký tự chữ liên tiếp
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
    // data.words là mảng { text, confidence, ... } – chính xác hơn data.text
    if (Array.isArray(data.words)) {
      allWords = allWords.concat(data.words);
    }
    if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));
  }

  await worker.terminate();

  const { valid, wordCount } = validateOcrWords(allWords);
  return { valid, wordCount };
}
