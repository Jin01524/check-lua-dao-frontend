import { useState, useCallback } from 'react';
import { runOcrValidation } from '../utils/ocrValidate';

/**
 * Hook quản lý toàn bộ trạng thái OCR validation.
 * Trả về: { ocrStatus, ocrProgress, ocrWarning, validateImages, resetOcr }
 *
 * ocrStatus: 'idle' | 'scanning' | 'ok' | 'warn'
 */
export function useOcrValidation() {
  const [ocrStatus, setOcrStatus] = useState('idle'); // idle | scanning | ok | warn
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrWarning, setOcrWarning] = useState('');

  const resetOcr = useCallback(() => {
    setOcrStatus('idle');
    setOcrProgress(0);
    setOcrWarning('');
  }, []);

  /**
   * Chạy OCR validation cho danh sách các file item (có trường .file gốc).
   * @param {Array<{file: File, compressed: Blob}>} fileItems
   */
  const validateImages = useCallback(async (fileItems) => {
    if (!fileItems || fileItems.length === 0) {
      resetOcr();
      return;
    }

    setOcrStatus('scanning');
    setOcrProgress(0);
    setOcrWarning('');

    try {
      // Lấy file gốc để OCR (chất lượng tốt hơn compressed)
      const rawFiles = fileItems.map((item) => item.file ?? item.compressed);

      const { valid, wordCount } = await runOcrValidation(rawFiles, setOcrProgress);

      if (valid) {
        setOcrStatus('ok');
        setOcrWarning('');
      } else {
        setOcrStatus('warn');
        setOcrWarning(
          wordCount === 0
            ? 'Không tìm thấy chữ trong ảnh. Vui lòng chọn ảnh chụp màn hình tin nhắn có nội dung chữ rõ ràng.'
            : `Ảnh có quá ít chữ (${wordCount} từ). Vui lòng chọn ảnh chụp màn hình có đủ nội dung để AI phân tích.`
        );
      }
    } catch {
      // Nếu OCR lỗi (thiếu worker, v.v.) → cho phép tiếp tục nhưng không khóa
      setOcrStatus('ok');
      setOcrWarning('');
    }
  }, [resetOcr]);

  return { ocrStatus, ocrProgress, ocrWarning, validateImages, resetOcr };
}
