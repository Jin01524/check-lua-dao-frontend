import { useState, useEffect, useCallback } from 'react';
import ImageUploader from '../components/ImageUploader';
import PlatformSelector from '../components/PlatformSelector';
import ResultCard from '../components/ResultCard';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [platform, setPlatform] = useState('sms');
  const [additionalText, setAdditionalText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalScans: 0,
    warnedScans: 0,
    maxConfidence: 0,
  });
  const { isAdmin, isLoggedIn } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get('/api/stats');
      if (res.data) {
        setStats({
          totalScans: res.data.totalScans || 0,
          warnedScans: res.data.warnedScans || 0,
          maxConfidence: res.data.maxConfidence || 0,
        });
      }
    } catch (err) {
      console.warn('Could not fetch stats:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSubmit = async () => {
    setError('');

    // Limit check: 3 checks in 30 mins for non-admins
    const isUserAdmin = isAdmin || isLoggedIn;
    const now = Date.now();
    const LIMIT_MINUTES = 30;
    const LIMIT_COUNT = 3;
    const LIMIT_MS = LIMIT_MINUTES * 60 * 1000;

    let checkTimestamps = [];
    if (!isUserAdmin) {
      try {
        const stored = localStorage.getItem('check_limit_timestamps');
        if (stored) {
          checkTimestamps = JSON.parse(stored).filter(t => typeof t === 'number');
        }
      } catch (e) {
        checkTimestamps = [];
      }

      checkTimestamps = checkTimestamps.filter(t => now - t < LIMIT_MS);

      if (checkTimestamps.length >= LIMIT_COUNT) {
        const oldest = checkTimestamps[0];
        const remainingMs = (oldest + LIMIT_MS) - now;
        const minutes = Math.floor(remainingMs / (60 * 1000));
        const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
        setError(`Bạn đã đạt giới hạn 3 lượt kiểm tra trong 30 phút. Vui lòng quay lại sau ${minutes} phút ${seconds} giây.`);
        return;
      }
    }

    if (files.length === 0 && !additionalText.trim()) {
      setError('Vui lòng tải lên ít nhất 1 ảnh chụp màn hình hoặc dán nội dung tin nhắn nghi vấn.');
      return;
    }
    if (!platform) {
      setError('Vui lòng chọn nền tảng bạn nhận được tin nhắn.');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((item, idx) => {
        formData.append('images', item.compressed, `image_${idx}.jpg`);
      });
      formData.append('platform', platform);
      if (additionalText.trim()) {
        formData.append('text', additionalText.trim());
      }

      const response = await API.post('/api/check', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
      fetchStats();

      if (!isUserAdmin) {
        checkTimestamps.push(Date.now());
        localStorage.setItem('check_limit_timestamps', JSON.stringify(checkTimestamps));
      }

      files.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      setFiles([]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(`Có lỗi xảy ra khi phân tích: ${msg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="w-full pt-6 sm:pt-10 pb-16 bg-surface relative overflow-hidden">
      {/* Ambient Cyber Lighting Backdrops */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-gradient-to-b from-primary-container/20 via-tertiary-container/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>
      <div className="absolute top-96 -right-24 w-96 h-96 bg-error-container/15 blur-3xl pointer-events-none rounded-full"></div>
      <div className="absolute top-[700px] -left-20 w-80 h-80 bg-primary/10 blur-3xl pointer-events-none rounded-full"></div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* HERO HEADER SECTION */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-space-2xl">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container-high border border-white/10 rounded-full mb-space-md shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
            <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
            <span className="font-label-badge text-label-badge text-tertiary uppercase tracking-wider">
              Phân tích đa nền tảng thời gian thực • DeepScan 4.1
            </span>
          </div>

          <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-display-hero text-on-surface tracking-tight mb-space-sm">
            AI Kiểm Tra & Nhận Diện{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-primary-fixed">
              Lừa Đảo Trực Tuyến
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-lg">
            Lá chắn trí tuệ nhân tạo chuyên biệt bảo vệ công dân Việt Nam trước các thủ đoạn chiếm đoạt tài khoản ngân hàng, giả mạo cơ quan pháp luật và đường link độc hại.
          </p>

          {/* Quick Live Telemetry Stat Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm w-full max-w-3xl">
            <div className="p-space-sm bg-surface-container-low border border-white/5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
              <span className="font-label-badge text-label-badge text-tertiary uppercase">Tổng tin nhắn quét</span>
              <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                {stats.totalScans.toLocaleString('vi-VN')}
              </span>
              <span className="font-label-caption text-label-caption text-secondary">Số liệu thực tế hệ thống</span>
            </div>

            <div className="p-space-sm bg-surface-container-low border border-white/5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
              <span className="font-label-badge text-label-badge text-primary uppercase line-clamp-1">
                Mức độ cảnh báo cao nhất được ghi nhận
              </span>
              <span className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
                {stats.maxConfidence > 0 ? `${stats.maxConfidence}%` : 'Chưa ghi nhận'}
              </span>
              <span className="font-label-caption text-label-caption text-secondary">Chỉ số rủi ro nguy cấp nhất</span>
            </div>

            <div className="p-space-sm bg-surface-container-low border border-white/5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
              <span className="font-label-badge text-label-badge text-error uppercase">Số tin nhắn được cảnh báo</span>
              <span className="font-headline-md text-headline-md text-error font-bold tracking-tight">
                {stats.warnedScans.toLocaleString('vi-VN')}
              </span>
              <span className="font-label-caption text-label-caption text-secondary">Phát hiện thủ đoạn lừa đảo</span>
            </div>
          </div>
        </section>

        {/* TWO-PANE SCANNER / ANALYTICAL SUITE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT INPUT SUITE (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md border border-white/5 flex flex-col gap-space-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[24px]">document_scanner</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Tải Lên Mẫu Tin Nhắn
                  </span>
                </div>
                <span className="font-label-badge text-label-badge px-space-xs py-space-2xs bg-surface-container-highest text-primary-fixed rounded border border-primary/20">
                  OCR + NLP ENGINE
                </span>
              </div>

              {/* Platform Selector */}
              <PlatformSelector value={platform} onChange={setPlatform} />

              {/* Image Uploader */}
              <ImageUploader files={files} onChange={setFiles} />

              {/* Text / URL Secondary Extraction Field */}
              <div className="flex flex-col gap-space-2xs">
                <div className="flex justify-between items-center">
                  <label className="font-title-md text-title-md text-on-surface font-medium" htmlFor="scam-text-input">
                    Nhập bổ sung nội dung tin nhắn hoặc URL nghi vấn:
                  </label>
                  <span className="font-label-caption text-label-caption text-secondary">
                    Tùy chọn
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="scam-text-input"
                    rows="3"
                    value={additionalText}
                    onChange={(e) => setAdditionalText(e.target.value)}
                    placeholder="Ví dụ: http://vcb-digi-bank.vip/login hoặc dán toàn bộ đoạn văn bản tin nhắn nhận được..."
                    className="w-full bg-surface-container text-on-surface font-code-telemetry text-code-telemetry p-space-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-primary border border-white/5 resize-none placeholder-on-surface-variant/40"
                  />
                  {additionalText && (
                    <button
                      type="button"
                      onClick={() => setAdditionalText('')}
                      className="absolute bottom-2.5 right-2.5 text-on-surface-variant hover:text-on-surface p-1 rounded bg-surface-container-high text-xs"
                      title="Xóa nội dung"
                    >
                      <span className="material-symbols-outlined text-[16px]">clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/40 rounded-xl text-error text-body-sm">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Primary Cyber Scan Action */}
              <div className="pt-space-2xs">
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={handleSubmit}
                  className={`w-full py-space-sm px-space-md font-title-md text-title-md rounded-xl transition-all flex items-center justify-center gap-space-xs group ${
                    analyzing
                      ? 'bg-primary-container/50 text-white cursor-wait'
                      : 'bg-primary-container hover:bg-inverse-primary text-on-primary-container shadow-[0_0_24px_-4px_rgba(37,99,235,0.65)] active:scale-[0.99]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] ${analyzing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}>
                    {analyzing ? 'progress_activity' : 'radar'}
                  </span>
                  <span className="tracking-wide font-bold">
                    {analyzing ? 'ĐANG QUÉT VÀ PHÂN TÍCH VỚI AI...' : 'KIỂM TRA NGAY VỚI AI VÀ NHẬN BÁO CÁO'}
                  </span>
                  {!analyzing && (
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-space-md mt-space-xs text-on-surface-variant font-label-caption text-label-caption">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[14px]">lock</span>
                    Bảo mật chuẩn SHA-256
                  </span>
                </div>
              </div>
            </div>

            {/* Educational Visual Highlight */}
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-white/5 flex flex-col sm:flex-row items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/30 text-tertiary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[28px]">shield_with_heart</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-tertiary font-label-badge text-label-badge mb-1 uppercase">
                  <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  Cơ chế quét thông minh đa lớp
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  CheckLuaDao kết hợp OCR trích xuất ký tự tiếng Việt, kiểm tra Whois tên miền thời gian thực, và phân tích các chỉ số thao túng tâm lý (Urgency & Fear Induction) để bảo vệ bạn trong từng giây.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PERSISTENT TELEMETRY & REPORT SUITE (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg sticky top-24">
            {analyzing ? (
              /* Loading State */
              <div className="bg-surface-container rounded-xl p-space-xl shadow-xl border border-white/10 flex flex-col items-center justify-center text-center gap-4 min-h-[420px]">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <span className="material-symbols-outlined text-tertiary text-[28px] absolute inset-0 m-auto flex items-center justify-center animate-pulse">
                    radar
                  </span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Đang giải phẫu mẫu tin...
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
                    Đang kích hoạt mô hình Gemini Vision & tra cứu cơ sở dữ liệu các chiến dịch lừa đảo đang hoạt động...
                  </p>
                </div>
                <div className="flex flex-col gap-1 w-full max-w-xs text-xs font-label-badge text-secondary mt-2">
                  <div className="flex justify-between">
                    <span>OCR Extractor:</span>
                    <span className="text-[#10b981]">Hoàn thành</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threat Intelligence:</span>
                    <span className="text-primary animate-pulse">Đang đối chiếu...</span>
                  </div>
                </div>
              </div>
            ) : result ? (
              /* Real-time Forensic Result */
              <ResultCard result={result} />
            ) : (
              /* Ready State */
              <div className="bg-surface-container-low rounded-xl p-space-xl border border-white/5 shadow-md flex flex-col items-center justify-center text-center min-h-[380px] gap-3">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary/80 mb-1 border border-white/5">
                  <span className="material-symbols-outlined text-[36px]">radar</span>
                </div>
                <div className="font-headline-sm text-on-surface font-semibold">
                  Hệ Thống Sẵn Sàng Phân Tích
                </div>
                <p className="font-body-sm text-on-surface-variant max-w-sm leading-relaxed">
                  Tải lên ảnh chụp màn hình hoặc dán nội dung tin nhắn nghi vấn ở cột bên trái, sau đó nhấn <span className="text-primary font-medium">"Kiểm tra ngay với AI"</span> để nhận báo cáo bóc tách chi tiết.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-xs text-on-surface-variant border border-white/5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span>Mô hình Gemini Vision & Threat Intelligence trực tuyến</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
