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
    <header className="sticky top-0 w-full z-50 bg-[#0a0e17]/85 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="h-16 max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none group" onClick={close}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary-container/20 border border-primary/30 group-hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-[22px]">shield</span>
              <span className="material-symbols-outlined text-tertiary text-[12px] absolute inset-0 m-auto flex items-center justify-center font-bold">bolt</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-[18px] tracking-tight text-on-surface font-bold leading-none">
                  Check<span className="text-primary">LuaDao</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-label-badge bg-surface-container-highest border border-outline-variant/40 text-primary-fixed leading-none">
                  v3.2 PROD
                </span>
              </div>
              <span className="font-label-badge text-[10px] text-tertiary tracking-wider uppercase mt-0.5">
                AI Defense VN
              </span>
            </div>
          </Link>

          {/* Central Navigation for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-surface-container-low/80 border border-white/5 rounded-xl">
            <Link
              to="/"
              className={`px-3 py-1.5 font-title-md text-sm flex items-center gap-1.5 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">radar</span>
              <span>Kiểm tra tin nhắn</span>
            </Link>

            <Link
              to="/templates"
              className={`px-3 py-1.5 font-title-md text-sm flex items-center gap-1.5 rounded-lg transition-all ${
                isActive('/templates')
                  ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">database</span>
              <span>Kho mẫu lừa đảo</span>
            </Link>

            {isLoggedIn && isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 font-title-md text-sm flex items-center gap-1.5 rounded-lg transition-all ${
                  isActive('/admin/dashboard')
                    ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Quản trị hệ thống</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Suite */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* AI Online Widget */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low/80 border border-white/5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span className="font-label-badge text-[10px] text-tertiary tracking-wide uppercase font-semibold">
              AI Online 24/7
            </span>
          </div>

          {/* Hotline Pill */}
          <a
            href="tel:19006868"
            className="border border-error/40 bg-error-container/15 text-error hover:bg-error-container/30 hover:border-error/70 transition-all text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
            title="Đường dây nóng khẩn cấp"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
            </span>
            <span className="material-symbols-outlined text-[16px]">e911_emergency</span>
            <span className="hidden sm:inline font-title-md text-xs">Cứu trợ khẩn</span>
          </a>

          {/* User Auth Info / Actions */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-surface-container-low/80 border border-white/5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-primary-container/40 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
                A
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="font-label-caption text-[11px] text-on-surface font-semibold leading-tight">
                  Quản trị viên
                </span>
                <span className="font-label-badge text-[9px] text-primary uppercase leading-tight">
                  SOC Tier-2
                </span>
              </div>
              <button
                onClick={logout}
                className="text-on-surface-variant hover:text-error p-1 rounded transition-colors text-xs ml-1 flex items-center gap-1"
                title="Đăng xuất"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors flex items-center gap-1.5 border border-white/10"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              <span className="hidden sm:inline">Quản trị</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-white/5 rounded-lg"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {open ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="lg:hidden px-4 py-3 bg-surface-container-low/95 border-b border-white/10 flex flex-col gap-2">
          <Link
            to="/"
            onClick={close}
            className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
              isActive('/') ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">radar</span>
            <span>Kiểm tra tin nhắn</span>
          </Link>
          <Link
            to="/templates"
            onClick={close}
            className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
              isActive('/templates') ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">database</span>
            <span>Kho mẫu lừa đảo</span>
          </Link>
          {isLoggedIn && isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={close}
              className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                isActive('/admin/dashboard') ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Quản trị hệ thống</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
