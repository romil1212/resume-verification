import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    if (API.defaults?.headers?.common?.['Authorization']) {
      delete API.defaults.headers.common['Authorization'];
    }

    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Resumes', path: '/resumes' },
    { name: 'Upload Resume', path: '/upload' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link
            to={token ? '/dashboard' : '/login'}
            className="flex items-center gap-3 text-decoration-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                ResumeVerify
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-none">
                Verification & ATS Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {token ? (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-5 w-[1px] bg-slate-200 mx-2" />

              {/* User Pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                title="View Profile"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {user.name || 'Student'}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors ml-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {token && (
              <span className="text-xs font-medium text-slate-600">
                {user.name ? user.name.split(' ')[0] : 'User'}
              </span>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg">
          {token ? (
            <>
              <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name || 'Student'}</p>
                  <p className="text-xs text-slate-500">{user.email || ''}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
                </div>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;