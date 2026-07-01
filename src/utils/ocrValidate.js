import { createWorker } from 'tesseract.js';

const MIN_WORD_COUNT = 5;

/**
 * Kiểm tra xem text được nhận diện có đủ từ ngữ không.
 * @param {string} text
 * @returns {{ valid: boolean, wordCount: number }}
 */
function validateOcrText(text) {
  // Lọc ra các từ có ít nhất 1 ký tự chữ cái (Latin hoặc tiếng Việt)
  const words = text
    .split(/\s+/)
    .filter((w) => /[a-zA-ZÀ-ỹ]/.test(w));
  return { valid: words.length >= MIN_WORD_COUNT, wordCount: words.length };
}

/**
 * Quét OCR toàn bộ các ảnh, trả về kết quả tổng hợp.
 * @param {File[]} imageFiles - mảng File gốc
 * @param {(progress: number) => void} onProgress - callback cập nhật tiến trình 0–100
 * @returns {Promise<{ valid: boolean, wordCount: number, text: string }>}
 */
export async function runOcrValidation(imageFiles, onProgress) {
  const worker = await createWorker('vie+eng', 1, {
    logger: () => {}, // tắt log console
  });

  let combinedText = '';
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    const { data } = await worker.recognize(imageFiles[i]);
    combinedText += ' ' + data.text;
    if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));
  }

  await worker.terminate();

  const { valid, wordCount } = validateOcrText(combinedText);
  return { valid, wordCount, text: combinedText.trim() };
}
