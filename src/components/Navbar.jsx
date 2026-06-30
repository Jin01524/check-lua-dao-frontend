import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/Logo-checkluadao.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAdmin, isLoggedIn, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={close}>
          <img src={logoImg} alt="CheckLưaĐảo" style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }} />
        </Link>

        {/* Hamburger */}
        <button
          className={`navbar-hamburger ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Mở menu"
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>

        {/* Menu links */}
        <ul className={`navbar-menu ${open ? 'open' : ''}`}>
          <li>
            <Link
              to="/"
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
              onClick={close}
            >
              🔍 Kiểm tra tin nhắn
            </Link>
          </li>
          <li>
            <Link
              to="/templates"
              className={`navbar-link ${isActive('/templates') ? 'active' : ''}`}
              onClick={close}
            >
              📋 Mẫu lừa đảo
            </Link>
          </li>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={`navbar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    onClick={close}
                  >
                    ⚙️ Quản trị
                  </Link>
                </li>
              )}
              <li>
                <button
                  className="navbar-link nav-btn-logout"
                  onClick={() => {
                    logout();
                    close();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    font: 'inherit',
                    cursor: 'pointer',
                    color: '#FF4757',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem 1rem'
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/admin/login"
                className={`navbar-link ${isActive('/admin/login') ? 'active' : ''}`}
                onClick={close}
              >
                🔒 Đăng nhập
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
