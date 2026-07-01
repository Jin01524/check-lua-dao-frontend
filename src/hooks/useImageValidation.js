import { useState, useCallback } from 'react';
import { validateImageList } from '../utils/colorAnalysis';

/**
 * Hook quản lý trạng thái phân tích màu sắc ảnh.
 * Thay thế useOcrValidation (đã bỏ Tesseract.js).
 *
 * status: 'idle' | 'scanning' | 'ok' | 'warn'
 */
export function useImageValidation() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState('');

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setWarning('');
  }, []);

  /**
   * Phân tích danh sách ảnh đã upload.
   * @param {Array<{file?: File, compressed: Blob}>} fileItems
   */
  const validate = useCallback(async (fileItems) => {
    if (!fileItems || fileItems.length === 0) {
      reset();
      return;
    }

    setStatus('scanning');
    setProgress(0);
    setWarning('');

    try {
      const result = await validateImageList(fileItems, setProgress);

      if (result.valid) {
        setStatus('ok');
        setWarning('');
      } else {
        setStatus('warn');
        setWarning(result.reason);
      }
    } catch (err) {
      console.warn('[ColorAnalysis] Lỗi phân tích ảnh:', err);
      // Lỗi kỹ thuật → không chặn người dùng, reset về idle
      reset();
    }
  }, [reset]);

  return { status, progress, warning, validate, reset };
}
