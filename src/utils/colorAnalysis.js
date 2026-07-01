/**
 * Phân tích màu sắc ảnh bằng Canvas API (browser-side, không cần network).
 *
 * Nguyên lý: Ảnh chụp màn hình giao diện chat luôn có một tập màu đặc trưng:
 *   - Nền (trắng/xám nhạt/tối)
 *   - Bong bóng tin nhắn của mình (màu thương hiệu: xanh, lục, v.v.)
 *   - Bong bóng của người kia (xám/trắng)
 *   - Thanh điều hướng / status bar
 *   - Văn bản (tối/sáng)
 *
 * → Ảnh chat luôn tạo ra ít nhất 3–5 "vùng màu" (color clusters) có diện tích đáng kể.
 * → Ảnh trắng/blank: chỉ 1–2 vùng màu → từ chối.
 * → Ảnh ảnh chụp thật (selfie, cảnh vật): 50+ vùng màu → từ chối (không phải screenshot).
 */

const SAMPLE_SIZE = 80;           // Thu nhỏ xuống 80x80 để xử lý nhanh (6400 pixel)
const QUANTIZE_BITS = 5;          // 5 bit/channel = 32 level → 32768 màu khả dĩ
const DOMINANCE_THRESHOLD = 0.004; // Màu chiếm ≥ 0.4% pixel mới tính là "dominant"
const MIN_DOMINANT_COLORS = 3;    // Tối thiểu 3 vùng màu → ảnh có nội dung UI
const MAX_DOMINANT_COLORS = 120;  // Quá nhiều màu → ảnh thật (ảnh chụp, không phải screenshot)

/**
 * Phân tích số lượng vùng màu nổi bật trong ảnh.
 * @param {File|Blob} imageFile
 * @returns {Promise<{ dominantCount: number, valid: boolean, reason: string }>}
 */
export function analyzeImageColors(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const totalPixels = SAMPLE_SIZE * SAMPLE_SIZE;
        const shift = 8 - QUANTIZE_BITS; // rút gọn từng channel xuống QUANTIZE_BITS bit

        // Đếm pixel theo từng "bucket" màu sau quantize
        const colorMap = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] >> shift;
          const g = data[i + 1] >> shift;
          const b = data[i + 2] >> shift;
          const key = (r << (QUANTIZE_BITS * 2)) | (g << QUANTIZE_BITS) | b;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        // Chỉ giữ lại các màu có diện tích đủ lớn (dominant)
        const minPixels = totalPixels * DOMINANCE_THRESHOLD;
        const dominantCount = [...colorMap.values()].filter((c) => c >= minPixels).length;

        URL.revokeObjectURL(url);

        let valid = true;
        let reason = '';

        if (dominantCount < MIN_DOMINANT_COLORS) {
          valid = false;
          reason = `Ảnh quá đơn sắc (chỉ ${dominantCount} vùng màu). Vui lòng chụp màn hình giao diện tin nhắn thực sự.`;
        } else if (dominantCount > MAX_DOMINANT_COLORS) {
          valid = false;
          reason = 'Ảnh có quá nhiều màu sắc, có vẻ là ảnh chụp thật chứ không phải screenshot tin nhắn.';
        }

        resolve({ dominantCount, valid, reason });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể tải ảnh để phân tích'));
    };

    img.src = url;
  });
}

/**
 * Phân tích toàn bộ danh sách ảnh, trả về kết quả tổng hợp.
 * @param {Array<{file?: File, compressed: Blob}>} fileItems
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<{ valid: boolean, dominantCount: number, reason: string }>}
 */
export async function validateImageList(fileItems, onProgress) {
  const total = fileItems.length;
  let minDominant = Infinity;
  let firstFailReason = '';
  let allValid = true;

  for (let i = 0; i < total; i++) {
    const src = fileItems[i].file ?? fileItems[i].compressed;
    const result = await analyzeImageColors(src);

    if (!result.valid) {
      allValid = false;
      if (!firstFailReason) firstFailReason = result.reason;
    }

    minDominant = Math.min(minDominant, result.dominantCount);
    if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));
  }

  return {
    valid: allValid,
    dominantCount: minDominant === Infinity ? 0 : minDominant,
    reason: firstFailReason,
  };
}
