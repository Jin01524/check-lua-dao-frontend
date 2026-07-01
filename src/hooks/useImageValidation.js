import { useState, useCallback } from 'react';
import API from '../api/api';

/**
 * Hook gửi ảnh lên backend để phân tích cấu trúc chat bằng Canny Edge Detection.
 * status: 'idle' | 'scanning' | 'ok' | 'warn'
 */
export function useImageValidation() {
  const [status, setStatus]   = useState('idle');
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState('');

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setWarning('');
  }, []);

  /**
   * @param {Array<{file?: File, compressed: Blob}>} fileItems
   */
  const validate = useCallback(async (fileItems) => {
    if (!fileItems || fileItems.length === 0) { reset(); return; }

    setStatus('scanning');
    setProgress(0);
    setWarning('');

    const total = fileItems.length;

    try {
      for (let i = 0; i < total; i++) {
        const src = fileItems[i].file ?? fileItems[i].compressed;

        const formData = new FormData();
        formData.append('image', src, `img_${i}.jpg`);

        const { data } = await API.post('/api/validate-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setProgress(Math.round(((i + 1) / total) * 100));

        if (!data.valid) {
          setStatus('warn');
          setWarning(data.reason || 'Ảnh không hợp lệ. Vui lòng gửi ảnh chụp màn hình cuộc trò chuyện.');
          return;
        }
      }

      setStatus('ok');
      setWarning('');
    } catch (err) {
      console.warn('[ImageValidation] Lỗi kết nối backend:', err.message);
      // Nếu backend lỗi → không block người dùng
      reset();
    }
  }, [reset]);

  return { status, progress, warning, validate, reset };
}
