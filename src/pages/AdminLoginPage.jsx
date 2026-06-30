import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', { username, password });
      const token = res.data?.token || res.data?.accessToken;
      if (!token) throw new Error('Không nhận được thông tin xác thực.');
      login(token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg || 'Tên đăng nhập hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">🛡️</div>
        <h1 className="login-title">Đăng nhập Quản trị</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Nhập tên đăng nhập..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="form-error">⚠️ {error}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: 20 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner spinner-sm"
                  style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
                Đang đăng nhập...
              </>
            ) : (
              '🔑 Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
