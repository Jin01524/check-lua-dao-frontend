import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBubble from '../components/ChatBubble';
import API from '../api/api';

/* =====================================================================
   AdminDashboardPage – Tab 1: API Keys | Tab 2: Mẫu tin nhắn
   ===================================================================== */

// ── Modal xem chi tiết mẫu ──────────────────────────────────────────
function TemplateModal({ template, onClose }) {
  if (!template) return null;

  let messages = [];
  try {
    messages = typeof template.messages_json === 'string'
      ? JSON.parse(template.messages_json)
      : template.messages_json || [];
  } catch { messages = []; }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Chi tiết mẫu: {template.title || 'Không có tiêu đề'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {messages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg, idx) => (
                <ChatBubble
                  key={idx}
                  sender={msg.sender || 'unknown'}
                  text={msg.text || msg.content || ''}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Không có nội dung tin nhắn
            </p>
          )}

          {template.analysis && (
            <div style={{ marginTop: 20, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
              <strong>Phân tích:</strong>
              <p style={{ marginTop: 8, fontSize: '0.9rem', lineHeight: 1.6 }}>{template.analysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: Quản lý API Key ───────────────────────────────────────────
function ApiKeysTab() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchKeys = async () => {
    try {
      const res = await API.get('/api/admin/api-keys');
      setKeys(res.data || []);
    } catch {
      setError('Không thể tải danh sách API key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleToggle = async (id, current) => {
    try {
      await API.patch(`/api/admin/api-keys/${id}`, { isActive: !current });
      setKeys(keys.map(k => k.id === id || k._id === id ? { ...k, isActive: !current } : k));
    } catch {
      alert('Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa API key này không?')) return;
    try {
      await API.delete(`/api/admin/api-keys/${id}`);
      setKeys(keys.filter(k => k.id !== id && k._id !== id));
    } catch {
      alert('Không thể xóa API key.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newKey.trim()) {
      setError('Vui lòng nhập nhãn và giá trị API key.');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const res = await API.post('/api/admin/api-keys', { label: newLabel, key: newKey });
      setKeys([...keys, res.data]);
      setNewLabel('');
      setNewKey('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm API key.');
    } finally {
      setAdding(false);
    }
  };

  const maskKey = (key) => {
    if (!key || key.length < 8) return '••••••••';
    return '••••••••' + key.slice(-4);
  };

  return (
    <div>
      {/* Add form */}
      <div className="add-key-form">
        <div className="add-key-form-title">➕ Thêm API Key mới</div>
        <form onSubmit={handleAdd}>
          <div className="add-key-fields">
            <input
              className="form-input"
              placeholder="Nhãn (ví dụ: Gemini Pro)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              disabled={adding}
            />
            <input
              className="form-input"
              placeholder="Giá trị key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              disabled={adding}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-md)', padding: '12px 20px', minHeight: 48 }}
              disabled={adding}
            >
              {adding ? '...' : 'Thêm'}
            </button>
          </div>
        </form>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: 8 }}>⚠️ {error}</p>}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : keys.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔑</div>
          <div className="empty-state-text">Chưa có API key nào</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nhãn</th>
                <th>Key</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const id = k.id || k._id;
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600 }}>{k.label}</td>
                    <td>
                      <span className="key-masked">{maskKey(k.key)}</span>
                    </td>
                    <td>
                      <label className="toggle-switch" title={k.isActive ? 'Đang bật' : 'Đang tắt'}>
                        <input
                          type="checkbox"
                          checked={!!k.isActive}
                          onChange={() => handleToggle(id, k.isActive)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(id)}
                        >
                          🗑 Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Quản lý mẫu tin nhắn ─────────────────────────────────────
function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchTemplates = async () => {
    try {
      const res = await API.get('/api/admin/templates');
      setTemplates(res.data || []);
    } catch {
      // fallback: try public endpoint
      try {
        const res = await API.get('/api/templates?all=true');
        setTemplates(res.data || []);
      } catch {
        setTemplates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleApprove = async (id) => {
    try {
      await API.patch(`/api/admin/templates/${id}/approve`);
      setTemplates(templates.map(t =>
        (t.id === id || t._id === id) ? { ...t, status: 'approved', isApproved: true } : t
      ));
    } catch {
      alert('Không thể duyệt mẫu này.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mẫu này không?')) return;
    try {
      await API.delete(`/api/admin/templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id && t._id !== id));
    } catch {
      alert('Không thể xóa mẫu này.');
    }
  };

  const isApproved = (t) => t.isApproved || t.status === 'approved';

  return (
    <div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">Chưa có mẫu nào</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Nền tảng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => {
                const id = t.id || t._id;
                const approved = isApproved(t);
                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600, maxWidth: 240 }}>
                      {t.title || 'Không có tiêu đề'}
                    </td>
                    <td>{t.platform || '—'}</td>
                    <td>
                      {approved ? (
                        <span className="badge badge-success">✅ Đã duyệt</span>
                      ) : (
                        <span className="badge badge-warning">⏳ Chờ duyệt</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelectedTemplate(t)}
                        >
                          👁 Xem
                        </button>
                        {!approved && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(id)}
                          >
                            ✔ Duyệt
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(id)}
                        >
                          🗑 Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('keys');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <main className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">⚙️ Quản trị hệ thống</h1>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            🔑 Quản lý API Key
          </button>
          <button
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            📋 Quản lý mẫu tin nhắn
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'keys' && <ApiKeysTab />}
        {activeTab === 'templates' && <TemplatesTab />}
      </div>
    </main>
  );
}
