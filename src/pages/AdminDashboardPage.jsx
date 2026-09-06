import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBubble from '../components/ChatBubble';
import API from '../api/api';

// Modal xem chi tiết mẫu
function TemplateModal({ template, onClose }) {
  if (!template) return null;

  let messages = [];
  try {
    messages = typeof template.messages_json === 'string'
      ? JSON.parse(template.messages_json)
      : template.messages_json || [];
  } catch { messages = []; }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-surface-container-low border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">description</span>
            <span className="font-headline-sm text-sm font-bold text-on-surface">
              Chi tiết hồ sơ: {template.title || 'Mẫu không tên'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-label-badge bg-primary-container/20 text-primary border border-primary/30 px-2 py-0.5 rounded uppercase">
              {template.platform || 'SMS'}
            </span>
            <span className="font-label-badge bg-error-container/20 text-error border border-error/30 px-2 py-0.5 rounded">
              {template.scam_type || 'Lừa đảo'}
            </span>
          </div>

          {/* Raw / Extracted Messages */}
          <div>
            <div className="text-xs font-label-badge text-secondary mb-2 uppercase">
              Nội dung tin nhắn ghi nhận:
            </div>
            {messages.length > 0 ? (
              <div className="p-3 bg-surface-container rounded-xl space-y-2 border border-white/5">
                {messages.map((msg, idx) => (
                  <ChatBubble
                    key={idx}
                    sender={msg.sender || 'unknown'}
                    text={msg.text || msg.content || ''}
                  />
                ))}
              </div>
            ) : (
              <div className="p-3 bg-surface-container rounded-xl font-code-telemetry text-sm text-on-surface border border-white/5">
                {template.content || template.message || 'Không có tin nhắn thô'}
              </div>
            )}
          </div>

          {/* Analysis */}
          {template.analysis && (
            <div className="p-3 bg-surface-container rounded-xl border border-white/5">
              <div className="font-label-badge text-xs text-tertiary uppercase mb-1">
                Phân tích giám định AI:
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {template.analysis}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tab 1: Quản lý API Key
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
      setKeys(res.data.data || []);
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
      setKeys(keys.map(k => (k.id === id || k._id === id) ? { ...k, is_active: !current } : k));
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
    if (!newKey.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await API.post('/api/admin/api-keys', {
        label: newLabel.trim() || 'Gemini Key',
        apiKey: newKey.trim()
      });
      setKeys([...keys, res.data.data]);
      setNewLabel('');
      setNewKey('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm API key.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add key form */}
      <div className="bg-surface-container-low p-space-md rounded-xl border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h3 className="font-title-md text-sm font-bold text-on-surface">Thêm Gemini API Key Mới</h3>
        </div>

        {error && (
          <div className="p-2 mb-3 text-xs bg-error-container/20 border border-error/30 rounded text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Nhãn (VD: Key dự phòng 02)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-surface-container text-xs text-on-surface px-3 py-2 rounded-lg border border-white/5 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-6">
            <input
              type="password"
              placeholder="Nhập API Key (AIzaSy...)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full bg-surface-container text-xs text-on-surface px-3 py-2 rounded-lg border border-white/5 focus:outline-none focus:border-primary font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="w-full h-full py-2 bg-primary-container hover:bg-inverse-primary text-on-primary-container text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>{adding ? 'Đang thêm...' : 'Lưu Key'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Keys List */}
      <div className="bg-surface-container-low p-space-md rounded-xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-title-md text-sm font-bold text-on-surface">
            Danh Sách API Keys ({keys.length})
          </h3>
          <span className="font-label-badge text-[11px] text-tertiary">
            HỆ THỐNG XOAY VÒNG KEY TỰ ĐỘNG
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-on-surface-variant">Đang tải...</div>
        ) : keys.length === 0 ? (
          <div className="p-6 text-center text-xs text-on-surface-variant">Chưa cấu hình API key nào.</div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => {
              const id = k.id || k._id;
              const isActive = k.is_active !== false;
              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#10b981]' : 'bg-secondary'}`}></span>
                    <div>
                      <div className="font-semibold text-on-surface">{k.label || 'Gemini Key'}</div>
                      <div className="font-mono text-[11px] text-on-surface-variant">
                        {k.api_key_masked || (k.api_key ? `••••${k.api_key.slice(-6)}` : '••••••••')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(id, isActive)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        isActive ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-secondary/20 text-secondary'
                      }`}
                    >
                      {isActive ? 'Kích hoạt' : 'Tạm tắt'}
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-1 text-on-surface-variant hover:text-error transition-colors"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Tab 2: Quản lý mẫu tin nhắn (Moderation)
function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await API.get('/api/admin/templates');
      setTemplates(res.data.data || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id, currentApproved) => {
    try {
      await API.put(`/api/admin/templates/${id}`, { isApproved: !currentApproved });
      setTemplates(templates.map(t => (t.id === id || t._id === id) ? { ...t, is_approved: !currentApproved } : t));
    } catch {
      alert('Không thể cập nhật trạng thái duyệt.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mẫu này?')) return;
    try {
      await API.delete(`/api/admin/templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id && t._id !== id));
    } catch {
      alert('Không thể xóa mẫu.');
    }
  };

  return (
    <div className="bg-surface-container-low p-space-md rounded-xl border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title-md text-sm font-bold text-on-surface">
            Bàn Kiểm Duyệt Mẫu Tin Nghi Vấn ({templates.length})
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Duyệt các mẫu tin nhắn người dùng gửi lên để bổ sung vào Kho dữ liệu cảnh báo quốc gia
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-on-surface-variant">Đang tải danh sách mẫu...</div>
      ) : templates.length === 0 ? (
        <div className="p-8 text-center text-xs text-on-surface-variant">Chưa có mẫu nào cần kiểm duyệt.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant font-label-badge">
                <th className="py-2.5 px-3">TIÊU ĐỀ & THỦ ĐOẠN</th>
                <th className="py-2.5 px-3">NỀN TẢNG</th>
                <th className="py-2.5 px-3">RỦI RO</th>
                <th className="py-2.5 px-3">TRẠNG THÁI</th>
                <th className="py-2.5 px-3 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {templates.map((tpl) => {
                const id = tpl.id || tpl._id;
                const isApproved = tpl.is_approved === true;
                const danger = tpl.confidence_score || tpl.danger_level || 90;

                return (
                  <tr key={id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-on-surface max-w-xs truncate">
                        {tpl.title || tpl.scam_type || 'Mẫu tin nhắn'}
                      </div>
                      <div className="text-[11px] text-on-surface-variant truncate max-w-xs">
                        {tpl.content || tpl.analysis || 'Không có mô tả'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-label-badge bg-surface-container px-2 py-0.5 rounded uppercase">
                        {tpl.platform || 'SMS'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-error font-mono">
                      {danger}%
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-label-badge px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApproved
                            ? 'bg-[#10b981]/20 text-[#10b981]'
                            : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {isApproved ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedTemplate(tpl)}
                          className="p-1 hover:text-primary transition-colors"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleApprove(id, isApproved)}
                          className={`p-1 transition-colors ${
                            isApproved ? 'hover:text-warning text-[#10b981]' : 'hover:text-[#10b981] text-warning'
                          }`}
                          title={isApproved ? 'Thu hồi duyệt' : 'Duyệt mẫu'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isApproved ? 'published_with_changes' : 'check_circle'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="p-1 hover:text-error text-on-surface-variant transition-colors"
                          title="Xóa mẫu"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
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

// Main Page
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('moderation');
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="w-full pt-8 pb-20 bg-surface min-h-screen relative overflow-hidden">
      {/* Ambient Orb */}
      <div className="absolute -top-32 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-badge text-xs text-primary bg-primary-container/20 border border-primary/30 px-2 py-0.5 rounded">
                SOC TIER-2 OPERATIONAL CONSOLE
              </span>
            </div>
            <h1 className="font-headline-sm text-2xl font-bold text-on-surface">
              Quản Trị Hệ Thống & Kiểm Duyệt An Ninh
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="py-1.5 px-3 bg-surface-container hover:bg-error/20 hover:text-error text-on-surface-variant text-xs font-title-md rounded-lg border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-surface-container-low border border-white/5 rounded-xl w-fit mb-space-lg">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-lg text-xs font-title-md flex items-center gap-2 transition-all ${
              activeTab === 'moderation'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Bàn Kiểm Duyệt Tin</span>
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            className={`px-4 py-2 rounded-lg text-xs font-title-md flex items-center gap-2 transition-all ${
              activeTab === 'apikeys'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            <span>Quản Lý API Key Gemini</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'moderation' ? <TemplatesTab /> : <ApiKeysTab />}
      </div>
    </main>
  );
}
