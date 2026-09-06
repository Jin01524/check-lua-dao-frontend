import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/Logo-checkluadao.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAdmin, isModerator, isLoggedIn, user, logout } = useAuth();
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
                <span className="font-display-hero text-xl font-bold tracking-tight text-on-surface">
                  Check<span className="text-primary">LuaDao</span>
                </span>
                <span className="font-label-badge text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-container text-tertiary border border-tertiary/20">
                  AI v4.1
                </span>
              </div>
              <span className="font-label-caption text-[10px] text-on-surface-variant hidden sm:inline -mt-0.5">
                Lá chắn phát hiện tin nhắn lừa đảo quốc gia
              </span>
            </div>
          </Link>

          {/* Nav Links */}
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

            {isLoggedIn && (isAdmin || isModerator) && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 font-title-md text-sm flex items-center gap-1.5 rounded-lg transition-all ${
                  isActive('/admin/dashboard')
                    ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>{isAdmin ? 'Quản trị hệ thống' : 'Kiểm duyệt tin'}</span>
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
            href="tel:18001031"
            className="border border-error/40 bg-error-container/15 text-error hover:bg-error-container/30 hover:border-error/70 transition-all text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
            title="Tổng đài An toàn mạng quốc gia 1800.1031"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
            </span>
            <span className="material-symbols-outlined text-[16px]">e911_emergency</span>
            <span className="hidden sm:inline font-title-md text-xs">Cứu trợ 1800.1031</span>
          </a>

          {/* User Auth Info / Actions */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-surface-container-low/80 border border-white/5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-primary-container/40 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user?.username ? user.username[0] : (isAdmin ? 'A' : 'M')}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="font-label-caption text-[11px] text-on-surface font-semibold leading-tight truncate max-w-[100px]">
                  {user?.username || (isAdmin ? 'Admin' : 'Kiểm duyệt')}
                </span>
                <span className="font-label-badge text-[9px] text-primary uppercase leading-tight">
                  {isAdmin ? 'Quản trị viên' : 'Kiểm duyệt viên'}
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
              <span>Đăng nhập</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {open ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#0a0e17] px-4 py-3 space-y-2 animate-fadeIn">
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
          {isLoggedIn && (isAdmin || isModerator) && (
            <Link
              to="/admin/dashboard"
              onClick={close}
              className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                isActive('/admin/dashboard') ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>{isAdmin ? 'Quản trị hệ thống' : 'Kiểm duyệt tin'}</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
