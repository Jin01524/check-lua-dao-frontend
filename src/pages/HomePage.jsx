import { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import PlatformSelector from '../components/PlatformSelector';
import ResultCard from '../components/ResultCard';
import API from '../api/api';

export default function HomePage() {
  const [files, setFiles]       = useState([]);
  const [platform, setPlatform] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    setError('');

    // Ràng buộc giới hạn 3 lượt kiểm tra trong vòng 30 phút
    const now = Date.now();
    const LIMIT_MINUTES = 30;
    const LIMIT_COUNT = 3;
    const LIMIT_MS = LIMIT_MINUTES * 60 * 1000;

    let checkTimestamps = [];
    try {
      const stored = localStorage.getItem('check_limit_timestamps');
      if (stored) {
        checkTimestamps = JSON.parse(stored).filter(t => typeof t === 'number');
      }
    } catch (e) {
      checkTimestamps = [];
    }

    // Lọc lại các mốc thời gian trong vòng 30 phút qua
    checkTimestamps = checkTimestamps.filter(t => now - t < LIMIT_MS);

    if (checkTimestamps.length >= LIMIT_COUNT) {
      const oldest = checkTimestamps[0];
      const remainingMs = (oldest + LIMIT_MS) - now;
      const minutes = Math.floor(remainingMs / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
      setError(`Bạn đã vượt quá giới hạn 3 lượt kiểm tra trong 30 phút. Vui lòng quay lại sau ${minutes} phút ${seconds} giây.`);
      return;
    }

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

      // Thêm timestamp check thành công
      checkTimestamps.push(Date.now());
      localStorage.setItem('check_limit_timestamps', JSON.stringify(checkTimestamps));

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
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                Đang phân tích...
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
