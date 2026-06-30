import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';

export default function RegisterPage() {
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
      const res = await API.post('/api/auth/register', { username, password });
      const token = res.data?.token || res.data?.accessToken;
      const user = res.data?.user;
      
      if (!token) throw new Error('Không nhận được thông tin xác thực.');
      login(token, user);
      
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg || 'Đã có lỗi xảy ra khi tạo tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">🛡️</div>
        <h1 className="login-title">Tạo tài khoản</h1>

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
              autoComplete="new-password"
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
                Đang tạo tài khoản...
              </>
            ) : (
              '📝 Tạo tài khoản'
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          Đã có tài khoản? <Link to="/admin/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
