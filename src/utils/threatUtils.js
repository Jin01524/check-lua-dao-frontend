/**
 * Tiện ích chuẩn hóa điểm rủi ro (% nguy hiểm) và phân loại mức độ cảnh báo bằng tiếng Việt
 */

/**
 * Chuẩn hóa điểm rủi ro (% nguy hiểm)
 * Hỗ trợ cả định dạng số thập phân (0.95 -> 95) và số nguyên (95 -> 95)
 */
export function normalizeThreatScore(score, fallback = 90) {
  if (score === null || score === undefined || score === '') return fallback;
  const num = Number(score);
  if (isNaN(num)) return fallback;
  if (num > 0 && num <= 1) return Math.round(num * 100);
  return Math.min(100, Math.max(0, Math.round(num)));
}

/**
 * Trả về thông tin mức độ cảnh báo chuẩn hóa bằng tiếng Việt
 */
export function getThreatLevel(score, fallback = 90) {
  const s = normalizeThreatScore(score, fallback);

  if (s >= 85) {
    return {
      score: s,
      level: 'CỰC KỲ NGUY HIỂM',
      shortLevel: 'Nguy cấp',
      textDesc: 'Rất cao',
      badgeClass: 'text-error bg-error-container/20 border border-error/30',
      dotColor: 'bg-error',
    };
  }
  if (s >= 70) {
    return {
      score: s,
      level: 'NGUY CƠ CAO',
      shortLevel: 'Nguy cơ cao',
      textDesc: 'Cao',
      badgeClass: 'text-error bg-error-container/20 border border-error/30',
      dotColor: 'bg-error',
    };
  }
  if (s >= 40) {
    return {
      score: s,
      level: 'CẢNH BÁO NGHI VẤN',
      shortLevel: 'Nghi vấn',
      textDesc: 'Trung bình',
      badgeClass: 'text-warning bg-warning/20 border border-warning/30',
      dotColor: 'bg-warning',
    };
  }
  return {
    score: s,
    level: 'AN TOÀN',
    shortLevel: 'An toàn',
    textDesc: 'Thấp',
    badgeClass: 'text-[#10b981] bg-[#10b981]/20 border border-[#10b981]/30',
    dotColor: 'bg-[#10b981]',
  };
}
