import { useState } from 'react';
import ChatBubble from './ChatBubble';

export default function ResultCard({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const {
    isChatScreenshot = true,
    isScam,
    scamType,
    confidenceScore: dangerLevel = 0,
    warningPoints = [],
    messages = [],
    analysis: summary,
    recommendations = [],
    extractedUrls = []
  } = result;

  const caseId = `#CK-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Cảnh báo lừa đảo: ${scamType || 'CheckLuaDao'}`,
        text: `Hệ thống AI CheckLuaDao vừa phát hiện tin nhắn lừa đảo nguy hiểm (${dangerLevel}%). Xem chi tiết tại CheckLuaDao.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `[CẢNH BÁO LỪA ĐẢO - CheckLuaDao]\nLoại: ${scamType || 'Chưa rõ'}\nMức độ: ${dangerLevel}%\nChi tiết: ${summary || ''}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isChatScreenshot === false) {
    return (
      <div className="bg-surface-container rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md border border-white/5">
        <div className="flex items-center gap-space-xs p-space-md bg-warning/15 border border-warning/30 rounded-xl text-warning">
          <span className="material-symbols-outlined text-[28px]">image_not_supported</span>
          <div>
            <div className="font-title-md text-title-md font-bold">
              Ảnh không chứa tin nhắn nhận diện được
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {summary || 'Ảnh tải lên không hiển thị rõ nội dung hộp thoại tin nhắn. Vui lòng chụp lại màn hình rõ ràng hơn.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isHighRisk = isScam && dangerLevel >= 70;
  const isMediumRisk = isScam && dangerLevel < 70;

  return (
    <div className="bg-surface-container rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md border border-white/10 animate-fadeIn">
      {/* Risk Header Badge */}
      <div className="flex items-center justify-between pb-space-xs border-b border-white/5">
        <div className="flex items-center gap-space-2xs">
          <span
            className={`w-3 h-3 rounded-full ${
              isHighRisk ? 'bg-error animate-pulse' : isMediumRisk ? 'bg-warning animate-pulse' : 'bg-[#10b981]'
            }`}
          ></span>
          <span
            className={`font-label-badge text-label-badge uppercase tracking-wider ${
              isHighRisk ? 'text-error' : isMediumRisk ? 'text-warning' : 'text-[#10b981]'
            }`}
          >
            KẾT QUẢ PHÂN TÍCH PHÁP Y SỐ
          </span>
        </div>
        <span className="font-code-telemetry text-code-telemetry text-secondary">
          MÃ ĐƠN: {caseId}
        </span>
      </div>

      {/* Risk Status Banner */}
      <div
        className={`p-space-md rounded-xl shadow-md flex flex-col gap-space-2xs border ${
          isScam
            ? 'bg-error-container/40 border-error/30 text-on-error-container'
            : 'bg-[#10b981]/15 border-[#10b981]/30 text-white'
        }`}
      >
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[28px] ${isScam ? 'text-error' : 'text-[#10b981]'}`}>
              {isScam ? 'warning' : 'verified_user'}
            </span>
            <span className="font-headline-sm text-headline-sm font-bold uppercase tracking-tight">
              {isScam
                ? isHighRisk
                  ? `RỦI RO RẤT CAO (${dangerLevel}%)`
                  : `CẢNH BÁO NGHI VẤN (${dangerLevel}%)`
                : 'AN TOÀN / KHÔNG PHÁT HIỆN LỪA ĐẢO'}
            </span>
          </div>
        </div>

        <p className="font-title-md text-title-md font-semibold text-on-surface">
          {isScam
            ? scamType
              ? `THỦ ĐOẠN: ${scamType.toUpperCase()}`
              : 'DẤU HIỆU TẤN CÔNG PHI KỸ THUẬT NGUY HIỂM'
            : 'Nội dung tin nhắn không có các đặc trưng thao túng tài chính hay đường dẫn độc hại'}
        </p>

        {/* Progress gauge bar */}
        <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden mt-1.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isHighRisk ? 'bg-error' : isMediumRisk ? 'bg-warning' : 'bg-[#10b981]'
            }`}
            style={{ width: `${Math.max(dangerLevel, 10)}%` }}
          ></div>
        </div>
      </div>

      {/* Forensic Summary */}
      {summary && (
        <div className="p-space-sm bg-surface-container-low rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 font-label-badge text-[11px] text-tertiary uppercase mb-1">
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Đánh giá từ AI DeepScan</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Psychological manipulation & Warning Indicators */}
      {warningPoints.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-label-badge text-[11px] text-error uppercase">
            <span className="material-symbols-outlined text-[16px]">flag</span>
            <span>Các dấu hiệu vi phạm nhận diện ({warningPoints.length})</span>
          </div>
          <div className="space-y-2">
            {warningPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 bg-surface-container-high/60 rounded-lg border border-error/20 text-on-surface"
              >
                <span className="material-symbols-outlined text-error text-[18px] flex-shrink-0 mt-0.5">
                  report
                </span>
                <span className="font-body-sm text-body-sm text-on-surface leading-snug">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Chat Messages if any */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 font-label-badge text-[11px] text-secondary uppercase">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>Đoạn trích xuất từ tin nhắn</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-surface-container-lowest rounded-lg">
            {messages.map((msg, i) => (
              <ChatBubble key={i} sender={msg.sender} text={msg.text} />
            ))}
          </div>
        </div>
      )}

      {/* Safety recommendations */}
      <div className="p-space-sm bg-surface-container-low rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5 font-label-badge text-[11px] text-primary uppercase mb-1">
          <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
          <span>Khuyến nghị an toàn tức thì</span>
        </div>
        <ul className="space-y-1 font-body-sm text-body-sm text-on-surface-variant list-disc pl-4">
          <li>Tuyệt đối KHÔNG nhấp vào bất kỳ liên kết nào trong tin nhắn.</li>
          <li>Không cung cấp mã OTP, mật khẩu hay thông tin căn cước công dân.</li>
          <li>Chặn số điện thoại/tài khoản người gửi và thông báo cho người thân.</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2 px-3 bg-surface-bright hover:bg-surface-container-highest text-on-surface rounded-lg font-title-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
        >
          <span className="material-symbols-outlined text-[16px]">share</span>
          <span>{copied ? 'Đã sao chép cảnh báo!' : 'Chia sẻ cảnh báo'}</span>
        </button>

        <a
          href="tel:18001031"
          className="py-2 px-3 bg-error-container hover:bg-error text-white rounded-lg font-title-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          title="Tổng đài An toàn mạng quốc gia"
        >
          <span className="material-symbols-outlined text-[16px]">e911_emergency</span>
          <span>Tổng đài 1800.1031</span>
        </a>
      </div>
    </div>
  );
}
