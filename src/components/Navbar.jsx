import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={close}>
          🛡️ CheckLưaĐảo
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
        </ul>
      </div>
    </nav>
  );
}
