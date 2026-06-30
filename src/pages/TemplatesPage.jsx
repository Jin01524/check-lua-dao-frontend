import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const PLATFORM_ICONS = {
  sms: '📱',
  zalo: '💬',
  facebook: '📘',
};

function getPlatformIcon(platform) {
  if (!platform) return '✉️';
  const key = platform.toLowerCase();
  return PLATFORM_ICONS[key] || '✏️';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await API.get('/api/templates');
        setTemplates(res.data.data || []);
      } catch (err) {
        setError('Không thể tải danh sách mẫu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <main className="templates-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📋 Mẫu tin nhắn lừa đảo thường gặp</h1>
          <p className="page-desc">
            Tổng hợp các mẫu tin nhắn lừa đảo đã được xác minh giúp bạn nhận biết và phòng tránh
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="info-box danger" style={{ maxWidth: 500, margin: '0 auto' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && templates.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">Chưa có mẫu nào được xác minh</div>
            <div className="empty-state-sub">
              Hãy quay lại sau — chúng tôi đang liên tục cập nhật thêm mẫu mới
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && templates.length > 0 && (
          <div className="templates-grid">
            {templates.map((tpl) => (
              <article
                key={tpl.id || tpl._id}
                className="template-card"
                onClick={() => navigate(`/templates/${tpl.id || tpl._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/templates/${tpl.id || tpl._id}`);
                }}
              >
                <span className="template-card-icon">
                  {getPlatformIcon(tpl.platform)}
                </span>
                <h2 className="template-card-title">
                  {tpl.title || 'Mẫu lừa đảo'}
                </h2>
                <div className="template-card-meta">
                  {tpl.platform && (
                    <span className="badge badge-danger">{tpl.platform}</span>
                  )}
                  {tpl.scamType && (
                    <span className="badge badge-gray">{tpl.scamType}</span>
                  )}
                </div>
                {tpl.createdAt && (
                  <div className="template-card-date">
                    📅 {formatDate(tpl.createdAt)}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
