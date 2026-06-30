import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
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

export default function TemplateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/api/templates/${id}`);
        setTemplate(res.data);
      } catch (err) {
        setError('Không tìm thấy mẫu này hoặc đã bị xóa.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Parse messages_json safely
  let messages = [];
  if (template?.messages_json) {
    try {
      messages = typeof template.messages_json === 'string'
        ? JSON.parse(template.messages_json)
        : template.messages_json;
    } catch {
      messages = [];
    }
  }

  const platformLabel = template?.platform || 'Không rõ';
  const platformIcon = getPlatformIcon(template?.platform);

  return (
    <main className="detail-page">
      <div className="page-wrapper" style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Back button */}
        <button className="back-btn" onClick={() => navigate('/templates')}>
          ← Quay lại
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="info-box danger">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {template && !loading && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '2rem' }}>{platformIcon}</span>
                <span className="badge badge-danger">{platformLabel}</span>
                {template.scamType && (
                  <span className="badge badge-gray">{template.scamType}</span>
                )}
              </div>
              <h1 className="detail-title">{template.title || 'Mẫu lừa đảo'}</h1>
              <div className="detail-meta">
                {template.createdAt && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📅 {formatDate(template.createdAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Chat mock frame */}
            {messages.length > 0 && (
              <div className="chat-mock-frame" style={{ marginBottom: 24 }}>
                <div className="chat-mock-header">
                  <span>{platformIcon}</span>
                  <span>{platformLabel} Chat</span>
                </div>
                <div className="chat-mock-body">
                  {messages.map((msg, idx) => (
                    <ChatBubble
                      key={idx}
                      sender={msg.sender || 'unknown'}
                      text={msg.text || msg.content || ''}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Analysis */}
            {template.analysis && (
              <div className="detail-analysis-card">
                <div className="detail-analysis-title">
                  🤖 Phân tích của hệ thống
                </div>
                <p className="detail-analysis-text">{template.analysis}</p>
              </div>
            )}

            {/* Warning points */}
            {template.warningPoints && template.warningPoints.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="result-section-title" style={{ marginBottom: 10 }}>
                  Dấu hiệu nhận biết
                </div>
                <ul className="warning-list">
                  {template.warningPoints.map((point, idx) => (
                    <li key={idx} className="warning-item">
                      <span className="warning-item-icon">❌</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
