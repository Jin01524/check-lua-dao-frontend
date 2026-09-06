import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import API from '../api/api';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { normalizeThreatScore, getConsistentThreatScore, getThreatLevel } from '../utils/threatUtils';

export default function TemplateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedTemplate = location.state?.template;
  const passedDanger = location.state?.danger;

  const [template, setTemplate] = useState(() => {
    if (passedTemplate) return passedTemplate;
    return DEFAULT_TEMPLATES.find((t) => String(t.id).toLowerCase() === String(id).toLowerCase()) || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/api/templates/${id}`);
        if (res.data?.data) {
          setTemplate(res.data.data);
          setError('');
          return;
        }
      } catch (err) {
        console.warn('[TemplateDetailPage] API lookup failed, checking local database:', err.message);
      }

      const localFound = DEFAULT_TEMPLATES.find(
        (t) => String(t.id).toLowerCase() === String(id).toLowerCase()
      );
      if (localFound) {
        setTemplate(localFound);
        setError('');
      } else {
        setError('Không tìm thấy hồ sơ này hoặc đã được ẩn.');
        setTemplate(null);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  let messages = [];
  if (template?.messages_json) {
    try {
      messages =
        typeof template.messages_json === 'string'
          ? JSON.parse(template.messages_json)
          : template.messages_json;
    } catch {
      messages = [];
    }
  }

  let warningPoints = [];
  if (template?.warning_points) {
    try {
      warningPoints =
        typeof template.warning_points === 'string'
          ? JSON.parse(template.warning_points)
          : template.warning_points;
    } catch {
      warningPoints = [template.warning_points];
    }
  }

  const danger = passedDanger || getConsistentThreatScore(template);
  const threat = getThreatLevel(danger);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="w-full pt-8 pb-20 bg-surface min-h-screen relative overflow-hidden">
      {/* Background Cyber Orbs */}
      <div className="absolute -top-32 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-space-lg">
          <Link
            to="/templates"
            reloadDocument
            className="inline-flex items-center gap-1.5 text-sm font-title-md text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded-none bg-surface-container-low border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Quay lại Kho mẫu</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="py-1.5 px-3 rounded-none bg-surface-container hover:bg-surface-container-high text-xs font-title-md text-on-surface flex items-center gap-1 border border-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>{copied ? 'Đã sao chép liên kết!' : 'Chia sẻ hồ sơ'}</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-surface-container-low rounded-none p-space-2xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
            <div className="text-on-surface font-title-md">Đang tải hồ sơ phân tích số...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-error-container/20 border border-error/40 rounded-none text-error mb-6">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Detail Content */}
        {template && !loading && (
          <div className="flex flex-col gap-space-lg">
            {/* Header Card */}
            <div className="bg-surface-container-low rounded-none p-space-lg border border-white/5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-space-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-label-badge text-label-badge px-2.5 py-0.5 rounded-none font-bold border ${threat.badgeClass}`}
                  >
                    {threat.level} - {danger}%
                  </span>
                  <span className="font-label-badge text-label-badge px-2 py-0.5 bg-surface-container text-primary rounded-none border border-primary/30 uppercase">
                    {template.platform || 'SMS'}
                  </span>
                  {template.scam_type && (
                    <span className="font-label-badge text-label-badge px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-none">
                      {template.scam_type}
                    </span>
                  )}
                </div>

                <span className="font-code-telemetry text-code-telemetry text-secondary">
                  #CASE-{String(template.id || id).slice(-6).toUpperCase()}
                </span>
              </div>

              <h1 className="font-headline-md text-2xl lg:text-headline-md text-on-surface font-bold mb-space-2xs">
                {template.title || 'Mẫu tin nhắn lừa đảo'}
              </h1>

              <div className="flex items-center gap-4 text-xs font-label-caption text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  <span>{new Date(template.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#10b981]">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Đã kiểm định thông tin</span>
                </span>
              </div>
            </div>

            {/* Grid 2 Cols */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column: Message Evidence & Previews (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="bg-surface-container-low rounded-none p-space-md border border-white/5">
                  <div className="flex items-center gap-1.5 font-label-badge text-xs text-primary uppercase mb-space-xs font-semibold">
                    <span className="material-symbols-outlined text-[18px]">chat_error</span>
                    <span>Nội dung tin nhắn lừa đảo</span>
                  </div>

                  {/* Message box */}
                  <div className="bg-surface-container-high p-4 rounded-none border border-white/5 font-code-telemetry text-sm text-on-surface leading-relaxed shadow-inner">
                    {template.content || template.message || template.analysis || (
                      <span className="text-on-surface-variant italic">Không có văn bản tin nhắn thô</span>
                    )}
                  </div>

                  {/* Extracted bubbles */}
                  {messages.length > 0 && (
                    <div className="mt-space-sm space-y-2">
                      <div className="text-xs font-label-badge text-secondary">CHI TIẾT HỘP THOẠI:</div>
                      {messages.map((m, idx) => (
                        <ChatBubble key={idx} sender={m.sender} text={m.text} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Warning Points Checklist */}
                {warningPoints.length > 0 && (
                  <div className="bg-surface-container-low rounded-none p-space-md border border-white/5">
                    <div className="flex items-center gap-1.5 font-label-badge text-xs text-error uppercase mb-space-xs font-semibold">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      <span>Dấu hiệu vi phạm cốt lõi</span>
                    </div>
                    <ul className="space-y-2">
                      {warningPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                          <span className="material-symbols-outlined text-error text-[18px] mt-0.5">
                            cancel
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: AI Forensic Breakdown (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-space-md">
                <div className="bg-surface-container-low rounded-none p-space-md border border-white/5 flex flex-col gap-space-md">
                  <div className="flex items-center gap-1.5 font-label-badge text-xs text-tertiary uppercase font-semibold">
                    <span className="material-symbols-outlined text-[18px]">analytics</span>
                    <span>Phân tích kịch bản lừa đảo</span>
                  </div>

                  {/* AI Analysis Narrative */}
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {template.analysis || 'Hệ thống nhận diện chiến dịch này sử dụng kỹ thuật giả mạo định danh ngân hàng kết hợp trạm BTS giả mạo để tiếp cận nạn nhân trên diện rộng.'}
                  </p>

                  {/* Forensic Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-surface-container rounded-none border border-white/5">
                      <span className="text-on-surface-variant block font-label-caption mb-1">Mục tiêu tấn công</span>
                      <span className="font-semibold text-primary">Tài khoản & Mã OTP</span>
                    </div>
                    <div className="p-3 bg-surface-container rounded-none border border-white/5">
                      <span className="text-on-surface-variant block font-label-caption mb-1">Cơ chế thao túng</span>
                      <span className="font-semibold text-error">Hối thúc / Đe dọa khóa</span>
                    </div>
                    <div className="p-3 bg-surface-container rounded-none border border-white/5">
                      <span className="text-on-surface-variant block font-label-caption mb-1">Kênh phát tán</span>
                      <span className="font-semibold text-tertiary">{template.platform || 'SMS'}</span>
                    </div>
                    <div className="p-3 bg-surface-container rounded-none border border-white/5">
                      <span className="text-on-surface-variant block font-label-caption mb-1">Mức độ nguy hiểm</span>
                      <span className="font-semibold text-error">{danger}% ({threat.textDesc})</span>
                    </div>
                  </div>

                  {/* Recommended countermeasures */}
                  <div className="p-3 bg-surface-container rounded-none border border-white/5 space-y-1">
                    <div className="font-title-md text-xs font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">shield</span>
                      Khuyến nghị xử lý:
                    </div>
                    <ul className="text-xs text-on-surface-variant list-disc pl-4 space-y-1">
                      <li>Không làm theo hướng dẫn hoặc đăng nhập vào link trong tin nhắn.</li>
                      <li>Liên hệ hotline chính thức của đơn vị được nhắc tới để xác thực.</li>
                      <li>Chia sẻ cảnh báo này đến bạn bè và người thân.</li>
                    </ul>
                  </div>
                </div>

                {/* Report Helpline Action */}
                <div className="p-4 bg-error-container/20 border border-error/30 rounded-none flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <div className="font-bold text-error">Bạn đã lỡ chuyển tiền hoặc cung cấp mã OTP?</div>
                    <div className="text-on-surface-variant mt-0.5">Hãy gọi ngay tổng đài An toàn mạng quốc gia.</div>
                  </div>
                  <a
                    href="tel:18001031"
                    title="Tổng đài An toàn mạng quốc gia 1800.1031"
                    className="py-2 px-3 bg-error text-white font-bold text-xs rounded-none flex items-center gap-1 shadow-sm hover:opacity-90 transition-opacity flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>1800.1031</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
