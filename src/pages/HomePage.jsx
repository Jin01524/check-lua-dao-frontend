import { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import PlatformSelector from '../components/PlatformSelector';
import ResultCard from '../components/ResultCard';
import API from '../api/api';
import { useOcrValidation } from '../hooks/useOcrValidation';

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [platform, setPlatform] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const { ocrStatus, ocrProgress, ocrWarning, validateImages, resetOcr } = useOcrValidation();

  // Khi danh sách ảnh thay đổi → chạy OCR validation
  useEffect(() => {
    if (files.length === 0) {
      resetOcr();
      return;
    }
    validateImages(files);
  }, [files]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nút bị tắt nếu: đang analyze, hoặc đang scan OCR, hoặc OCR phát hiện ít chữ
  const submitDisabled = analyzing || ocrStatus === 'scanning' || ocrStatus === 'warn';

  const handleSubmit = async () => {
    setError('');

    if (files.length === 0) {
      setError('Vui lòng chọn ít nhất 1 ảnh chụp màn hình.');
      return;
    }
    if (!platform) {
      setError('Vui lòng chọn nơi bạn nhận tin nhắn.');
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

      const response = await API.post('/api/check', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);

      // Thu hồi (revoke) các Object URL của ảnh cũ để tránh rò rỉ bộ nhớ
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
    <main className="home-page">
      <div className="page-wrapper">
        {/* Hero */}
        <section className="home-hero">
          <h1 className="home-hero-title">🛡️ Kiểm tra tin nhắn lừa đảo</h1>
          <p className="home-hero-sub">
            Tải ảnh chụp màn hình lên để AI phân tích và cảnh báo ngay
          </p>
        </section>

        {/* Form Card */}
        <div className="form-card">
          {/* Bước 1 */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="step-number">1</span>
              Tải ảnh chụp màn hình lên
            </div>
            <ImageUploader files={files} onChange={setFiles} />

            {/* OCR scanning progress */}
            {ocrStatus === 'scanning' && (
              <div className="ocr-progress-wrap">
                <div className="ocr-progress-header">
                  <span className="spinner spinner-sm" style={{ borderTopColor: '#3498db', borderColor: 'rgba(52,152,219,0.3)' }} />
                  <span className="ocr-progress-label">Đang quét nội dung ảnh... {ocrProgress}%</span>
                </div>
                <div className="ocr-progress-bar-bg">
                  <div className="ocr-progress-bar-fill" style={{ width: `${ocrProgress}%` }} />
                </div>
              </div>
            )}

            {/* OCR warning */}
            {ocrStatus === 'warn' && (
              <div className="info-box danger ocr-warning" style={{ marginTop: 12 }}>
                <span>🖼️</span>
                <span>{ocrWarning}</span>
              </div>
            )}

            {/* OCR ok confirmation (subtle) */}
            {ocrStatus === 'ok' && files.length > 0 && (
              <div className="info-box success ocr-ok" style={{ marginTop: 12 }}>
                <span>✅</span>
                <span>Ảnh có nội dung chữ rõ ràng, sẵn sàng phân tích!</span>
              </div>
            )}
          </div>

          {/* Bước 2 */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="step-number">2</span>
              Bạn nhận tin nhắn này từ đâu?
            </div>
            <PlatformSelector value={platform} onChange={setPlatform} />
          </div>

          {/* Error */}
          {error && (
            <div className="info-box danger" style={{ marginBottom: 16 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            className="check-btn"
            onClick={handleSubmit}
            disabled={submitDisabled}
            title={
              ocrStatus === 'scanning'
                ? 'Đang quét nội dung ảnh, vui lòng chờ...'
                : ocrStatus === 'warn'
                ? 'Ảnh không đủ nội dung chữ để phân tích'
                : ''
            }
          >
            {analyzing ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                Đang phân tích...
              </>
            ) : ocrStatus === 'scanning' ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                Đang quét ảnh...
              </>
            ) : (
              <>🔍 Kiểm tra ngay</>
            )}
          </button>
        </div>

        {/* Analyzing state */}
        {analyzing && (
          <div className="analyzing-state">
            <div className="spinner" />
            <p className="analyzing-text">AI đang phân tích tin nhắn...</p>
            <p className="analyzing-sub">Quá trình này có thể mất 10–20 giây</p>
          </div>
        )}

        {/* Result */}
        {result && !analyzing && (
          <ResultCard result={result} />
        )}

        {/* Info section */}
        {!result && !analyzing && (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="info-box info">
              <span>💡</span>
              <span>
                <strong>Mẹo:</strong> Chụp màn hình toàn bộ cuộc trò chuyện để AI phân tích chính xác hơn
              </span>
            </div>
            <div className="info-box success">
              <span>🔒</span>
              <span>
                Ảnh của bạn chỉ dùng để phân tích và không lưu trữ thông tin cá nhân
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
