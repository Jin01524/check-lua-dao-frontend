/**
 * Phân tích màu sắc ảnh bằng Canvas API để phát hiện ảnh chụp màn hình giao diện chat.
 *
 * Dùng 2 chỉ số kết hợp:
 *
 * 1. GLOBAL DOMINANT COLORS (3-bit quantize):
 *    - Quá ít (< 3): ảnh trắng/blank → từ chối
 *    - Quá nhiều (> 20): ảnh chụp thật phức tạp → từ chối
 *
 * 2. PATCH COMPLEXITY (4-bit quantize, chia ảnh thành ô 8×8):
 *    - Tính trung bình số màu khác nhau trong mỗi ô nhỏ
 *    - Screenshot UI: ô nào cũng khá đồng màu → avg thấp (1–4)
 *    - Ảnh thật: ô nhỏ nào cũng có gradient, texture → avg cao (5–15)
 *    - Nếu avg > MAX_AVG_PATCH → từ chối
 */

const SAMPLE_SIZE   = 100;    // thu nhỏ về 100×100 px (10000 px) để xử lý nhanh

// ── Chỉ số 1: Global dominant colors ──────────────────────────────────
const GLOBAL_BITS   = 3;      // 3-bit/channel = 8 levels → 512 màu khả dĩ
const GLOBAL_THRESH = 0.005;  // màu phải chiếm ≥ 0.5% pixel mới tính
const MIN_DOMINANT  = 3;      // < 3 → ảnh quá đơn sắc (blank)
const MAX_DOMINANT  = 20;     // > 20 → ảnh chụp thật quá nhiều màu

// ── Chỉ số 2: Patch complexity ────────────────────────────────────────
const PATCH_SIZE    = 10;     // chia thành ô 10×10 px (10×10 = 100 ô)
const PATCH_BITS    = 4;      // 4-bit/channel = 16 levels → 4096 màu khả dĩ
const MAX_AVG_PATCH = 5.0;    // avg colors/ô > 5.0 → ảnh thật

// ─────────────────────────────────────────────────────────────────────

function getGlobalDominantCount(data, totalPx) {
  const shift   = 8 - GLOBAL_BITS;
  const minPx   = totalPx * GLOBAL_THRESH;
  const colorMap = new Map();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]     >> shift;
    const g = data[i + 1] >> shift;
    const b = data[i + 2] >> shift;
    const key = (r << (GLOBAL_BITS * 2)) | (g << GLOBAL_BITS) | b;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  return [...colorMap.values()].filter((c) => c >= minPx).length;
}

function getAvgPatchComplexity(data, width, height) {
  const shift      = 8 - PATCH_BITS;
  const patchesX   = Math.floor(width  / PATCH_SIZE);
  const patchesY   = Math.floor(height / PATCH_SIZE);
  let   totalScore = 0;
  let   count      = 0;

  for (let py = 0; py < patchesY; py++) {
    for (let px = 0; px < patchesX; px++) {
      const seen = new Set();

      for (let dy = 0; dy < PATCH_SIZE; dy++) {
        for (let dx = 0; dx < PATCH_SIZE; dx++) {
          const x = px * PATCH_SIZE + dx;
          const y = py * PATCH_SIZE + dy;
          const i = (y * width + x) * 4;

          const r = data[i]     >> shift;
          const g = data[i + 1] >> shift;
          const b = data[i + 2] >> shift;
          seen.add((r << (PATCH_BITS * 2)) | (g << PATCH_BITS) | b);
        }
      }

      totalScore += seen.size;
      count++;
    }
  }

  return count > 0 ? totalScore / count : 0;
}

/**
 * Phân tích một ảnh và trả về kết quả hợp lệ hay không.
 * @param {File|Blob} imageFile
 * @returns {Promise<{ valid: boolean, reason: string, dominantCount: number, avgPatch: number }>}
 */
export function analyzeImageColors(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const totalPx  = SAMPLE_SIZE * SAMPLE_SIZE;

        const dominantCount = getGlobalDominantCount(data, totalPx);
        const avgPatch      = getAvgPatchComplexity(data, SAMPLE_SIZE, SAMPLE_SIZE);

        URL.revokeObjectURL(url);

        let valid  = true;
        let reason = '';

        if (dominantCount < MIN_DOMINANT) {
          valid  = false;
          reason = 'Ảnh quá đơn sắc. Vui lòng chụp màn hình giao diện tin nhắn thực sự.';
        } else if (dominantCount > MAX_DOMINANT || avgPatch > MAX_AVG_PATCH) {
          valid  = false;
          reason = 'Ảnh có vẻ là ảnh chụp thật (không phải screenshot tin nhắn). Vui lòng gửi ảnh chụp màn hình cuộc hội thoại.';
        }

        resolve({ valid, reason, dominantCount, avgPatch: +avgPatch.toFixed(2) });
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
 * Phân tích toàn bộ danh sách ảnh đã upload.
 * @param {Array<{file?: File, compressed: Blob}>} fileItems
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<{ valid: boolean, reason: string }>}
 */
export async function validateImageList(fileItems, onProgress) {
  const total = fileItems.length;

  for (let i = 0; i < total; i++) {
    const src    = fileItems[i].file ?? fileItems[i].compressed;
    const result = await analyzeImageColors(src);

    if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));

    if (!result.valid) {
      console.debug('[ColorAnalysis]', result);
      return { valid: false, reason: result.reason };
    }

    console.debug(`[ColorAnalysis] img${i + 1}: dominant=${result.dominantCount}, avgPatch=${result.avgPatch}`);
  }

  return { valid: true, reason: '' };
}
