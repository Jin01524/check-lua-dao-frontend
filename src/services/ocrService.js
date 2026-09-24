import Tesseract from 'tesseract.js';

/**
 * Trích xuất văn bản từ danh sách ảnh chụp màn hình bằng Edge OCR (Tesseract.js WebAssembly)
 * Chạy 100% trên trình duyệt người dùng (Client-side Edge Computing), không tốn tài nguyên server.
 *
 * @param {Array<Object|File|Blob>} items - Danh sách ảnh ({ compressed, file } hoặc Blob/File)
 * @param {Function} onProgress - Callback cập nhật trạng thái ({ progress, current, total, status })
 * @returns {Promise<{ text: string, confidence: number, count: number }>}
 */
export async function extractTextFromImages(items = [], onProgress = null) {
  if (!items || items.length === 0) {
    return { text: '', confidence: 0, count: 0 };
  }

  const results = [];
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const imageSource = item?.compressed || item?.file || item;

    try {
      const res = await Tesseract.recognize(imageSource, 'vie+eng', {
        logger: (m) => {
          if (onProgress && m.status === 'recognizing text') {
            const currentItemProgress = typeof m.progress === 'number' ? m.progress : 0;
            const overallProgress = Math.min(
              99,
              Math.round(((i + currentItemProgress) / total) * 100)
            );
            onProgress({
              progress: overallProgress,
              current: i + 1,
              total,
              status: 'Đang trích xuất văn bản...',
            });
          }
        },
      });

      if (res && res.data) {
        const cleaned = (res.data.text || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .join('\n');

        results.push({
          text: cleaned,
          confidence: Math.round(res.data.confidence || 0),
        });
      }
    } catch (err) {
      console.warn(`[Edge OCR] Lỗi khi nhận diện ảnh ${i + 1}:`, err.message);
    }
  }

  if (onProgress) {
    onProgress({ progress: 100, current: total, total, status: 'Hoàn tất trích xuất' });
  }

  const combinedText = results
    .map((r) => r.text)
    .filter(Boolean)
    .join('\n\n---\n\n');

  const avgConfidence = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + r.confidence, 0) / results.length)
    : 0;

  return {
    text: combinedText,
    confidence: avgConfidence,
    count: results.length,
  };
}
