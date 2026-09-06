import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBubble from '../components/ChatBubble';
import API from '../api/api';
import { getConsistentThreatScore, getThreatLevel } from '../utils/threatUtils';

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
            <span className="font-label-badge px-2 py-0.5 rounded font-mono font-bold text-error bg-error-container/20 border border-error/30">
              RỦI RO: {getConsistentThreatScore(template)}%
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
                const danger = getConsistentThreatScore(tpl);

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

      {/* Modal */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

// Modal đổi tên tài khoản
function RenameUserModal({ user, onClose, onUpdated }) {
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setError('Vui lòng nhập tên tài khoản mới.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.patch(`/api/admin/users/${user.id}`, { new_username: newUsername.trim() });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đổi tên tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-low border border-white/10 p-5 rounded-none shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">Đổi Tên Tài Khoản</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-none"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2 rounded-none">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Tên tài khoản hiện tại: <span className="font-bold text-on-surface">{user.username}</span>
            </label>
            <label className="block text-xs font-medium text-on-surface mb-1 mt-3">
              Tên tài khoản mới
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="ví dụ: mod_thao_soc..."
              className="w-full bg-surface-container text-on-surface text-xs px-3 py-2 rounded-none border border-white/10 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface rounded-none border border-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-primary-container hover:bg-inverse-primary text-on-primary-container rounded-none transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal đổi mật khẩu
function ChangePasswordModal({ user, onClose, onUpdated }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.patch(`/api/admin/users/${user.id}`, { password });
      onUpdated('Đã đổi mật khẩu thành công!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-low border border-white/10 p-5 rounded-none shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">lock_reset</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">Đặt Lại Mật Khẩu</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-none"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2 rounded-none">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Đổi mật khẩu cho: <span className="font-bold text-on-surface">{user.username}</span>
            </label>
            <label className="block text-xs font-medium text-on-surface mb-1 mt-3">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự..."
              className="w-full bg-surface-container text-on-surface text-xs px-3 py-2 rounded-none border border-white/10 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface rounded-none border border-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-primary-container hover:bg-inverse-primary text-on-primary-container rounded-none transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Tab 3: Quản lý phân quyền & Tạo tài khoản kiểm duyệt viên
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('moderator');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [renamingUser, setRenamingUser] = useState(null);
  const [passUser, setPassUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const toggleShowPassword = (userId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/api/admin/users');
      setUsers(res.data.data || []);
    } catch {
      setError('Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim()) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setCreating(true);
    try {
      const res = await API.post('/api/admin/users', {
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
      });
      setSuccess(res.data?.message || 'Đã tạo tài khoản thành công!');
      setNewUsername('');
      setNewPassword('');
      setNewRole('moderator');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Tạo tài khoản thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (userId, currentActive, username) => {
    if (username?.toLowerCase() === 'admin') {
      alert('Không thể khóa tài khoản Quản trị viên mặc định.');
      return;
    }
    const willLock = currentActive !== false;
    const actionText = willLock ? 'KHÓA' : 'MỞ KHÓA';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản "${username}" không?`)) return;

    try {
      await API.patch(`/api/admin/users/${userId}`, { is_active: !willLock });
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !willLock } : u)));
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể thay đổi trạng thái tài khoản.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (username?.toLowerCase() === 'admin') {
      alert('Không thể xóa tài khoản Quản trị viên mặc định.');
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${username}" không? Hành động này không thể hoàn tác.`)) return;

    try {
      await API.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể xóa tài khoản.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
      {/* Cột trái: Form tạo tài khoản kiểm duyệt viên (5 cols) */}
      <div className="lg:col-span-5 bg-surface-container-low p-space-md rounded-none border border-white/5 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <h3 className="font-title-md text-sm font-bold text-on-surface">
              Tạo Tài Khoản Phân Quyền
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant">
            Cấp tài khoản kiểm duyệt viên (chỉ có quyền kiểm duyệt tin nhắn lừa đảo để đưa lên kho mẫu)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container/20 border border-error/30 rounded-none text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-[#10b981]/20 border border-[#10b981]/30 rounded-none text-[#10b981] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Tên tài khoản (Username)
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="ví dụ: mod_thao, kiemduyet_01..."
              className="w-full bg-surface-container text-on-surface text-xs px-3 py-2 rounded-none border border-white/10 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Mật khẩu khởi tạo
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự..."
              className="w-full bg-surface-container text-on-surface text-xs px-3 py-2 rounded-none border border-white/10 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">
              Phân quyền tài khoản
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full bg-surface-container text-on-surface text-xs px-3 py-2 rounded-none border border-white/10 focus:outline-none focus:border-primary"
            >
              <option value="moderator">Kiểm duyệt viên (Moderator) - Duyệt tin nhắn lừa đảo</option>
              <option value="admin">Quản trị viên (Admin) - Toàn quyền hệ thống</option>
            </select>
            <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
              * Tài khoản Kiểm duyệt viên chỉ có quyền truy cập vào Bàn kiểm duyệt tin nhắn lừa đảo để phê duyệt đưa lên trang mẫu tin. Không thể truy cập Quản trị API Key hay Quản lý phân quyền.
            </p>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 px-3 bg-primary-container hover:bg-inverse-primary text-on-primary-container font-semibold text-xs rounded-none transition-all flex items-center justify-center gap-1.5 shadow-sm mt-2 disabled:opacity-50"
          >
            {creating ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                <span>Đang khởi tạo...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">add_moderator</span>
                <span>Tạo Tài Khoản Ngay</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Cột phải: Bảng danh sách tài khoản (7 cols) */}
      <div className="lg:col-span-7 bg-surface-container-low p-space-md rounded-none border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-title-md text-sm font-bold text-on-surface">
              Danh Sách Nhân Sự Phân Quyền ({users.length})
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Quản lý tài khoản kiểm duyệt: đổi tên, đổi mật khẩu, khóa/mở khóa hoặc xóa tài khoản
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="p-1.5 text-on-surface-variant hover:text-primary rounded-none transition-colors"
            title="Làm mới"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-on-surface-variant">Đang tải danh sách tài khoản...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant">Chưa có tài khoản nào khác.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-badge text-[11px]">
                  <th className="py-2.5 px-3">TÀI KHOẢN</th>
                  <th className="py-2.5 px-3">MẬT KHẨU</th>
                  <th className="py-2.5 px-3">VAI TRÒ</th>
                  <th className="py-2.5 px-3">TRẠNG THÁI</th>
                  <th className="py-2.5 px-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  const isMaster = u.username?.toLowerCase() === 'admin';
                  const isAdminRole = u.role === 'admin';
                  const isActive = u.is_active !== false;
                  const isPassVisible = !!showPasswords[u.id];
                  const rawPass = u.password_display || (isMaster ? '123456' : '••••••');

                  return (
                    <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-none bg-primary/20 text-primary flex items-center justify-center font-bold text-[11px] uppercase border border-primary/30">
                            {u.username ? u.username[0] : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {isMaster && (
                                <span className="font-label-badge text-[9px] bg-primary-container text-on-primary-container px-1 rounded-none">
                                  GỐC
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : 'Mặc định'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột Mật khẩu: Cho phép xem mật khẩu */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-surface-container px-2 py-0.5 border border-white/5">
                          <span>{isPassVisible ? rawPass : '••••••'}</span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(u.id)}
                            className="text-on-surface-variant hover:text-primary transition-colors p-0.5"
                            title={isPassVisible ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isPassVisible ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`font-label-badge px-2 py-0.5 rounded-none text-[10px] font-bold ${
                            isAdminRole
                              ? 'bg-primary-container/20 text-primary border border-primary/30'
                              : 'bg-tertiary-container/20 text-tertiary border border-tertiary/30'
                          }`}
                        >
                          {isAdminRole ? 'QUẢN TRỊ VIÊN' : 'KIỂM DUYỆT VIÊN'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-label-badge px-2 py-0.5 rounded-none text-[10px] font-bold ${
                            isActive
                              ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                              : 'bg-error-container/20 text-error border border-error/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-[#10b981]' : 'bg-error'
                            }`}
                          ></span>
                          {isActive ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {!isMaster ? (
                          <div className="inline-flex items-center gap-1">
                            {/* Đổi tên */}
                            <button
                              onClick={() => setRenamingUser(u)}
                              className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-none border border-transparent hover:border-white/10"
                              title="Đổi tên tài khoản"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>

                            {/* Đổi mật khẩu */}
                            <button
                              onClick={() => setPassUser(u)}
                              className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-none border border-transparent hover:border-white/10"
                              title="Đổi mật khẩu"
                            >
                              <span className="material-symbols-outlined text-[16px]">key</span>
                            </button>

                            {/* Khóa / Mở khóa */}
                            <button
                              onClick={() => handleToggleActive(u.id, u.is_active, u.username)}
                              className={`p-1.5 transition-colors rounded-none border border-transparent hover:border-white/10 ${
                                isActive
                                  ? 'text-on-surface-variant hover:text-warning'
                                  : 'text-error hover:text-[#10b981]'
                              }`}
                              title={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isActive ? 'lock' : 'lock_open'}
                              </span>
                            </button>

                            {/* Xóa tài khoản */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-none border border-transparent hover:border-white/10"
                              title="Xóa tài khoản"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant italic">Mặc định</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {renamingUser && (
        <RenameUserModal
          user={renamingUser}
          onClose={() => setRenamingUser(null)}
          onUpdated={() => {
            fetchUsers();
            setSuccess('Đã cập nhật tên tài khoản thành công!');
          }}
        />
      )}

      {passUser && (
        <ChangePasswordModal
          user={passUser}
          onClose={() => setPassUser(null)}
          onUpdated={(msg) => {
            fetchUsers();
            if (msg) setSuccess(msg);
          }}
        />
      )}
    </div>
  );
}

// Main Page
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('moderation');
  const { isAdmin, isModerator, logout } = useAuth();
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
                {isAdmin ? 'SOC TIER-2 OPERATIONAL CONSOLE' : 'KIỂM DUYỆT VIÊN (MODERATOR CONSOLE)'}
              </span>
            </div>
            <h1 className="font-headline-sm text-2xl font-bold text-on-surface">
              {isAdmin ? 'Quản Trị Hệ Thống & Kiểm Duyệt An Ninh' : 'Bàn Làm Việc Kiểm Duyệt Viên'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="py-1.5 px-3 bg-surface-container hover:bg-error/20 hover:text-error text-on-surface-variant text-xs font-title-md rounded-lg border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        {isAdmin && (
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

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs font-title-md flex items-center gap-2 transition-all ${
                activeTab === 'users'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              <span>Quản Lý Phân Quyền</span>
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'moderation' && <TemplatesTab />}
        {isAdmin && activeTab === 'apikeys' && <ApiKeysTab />}
        {isAdmin && activeTab === 'users' && <UsersTab />}
      </div>
    </main>
  );
}
