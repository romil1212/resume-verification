import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111827]/90 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-lg">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Sign in to manage and verify candidate resumes</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm rounded-xl flex items-center gap-2.5">
            <svg className="w-4 h-4 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a2333] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a2333] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-slate-400 mt-6 relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 font-bold hover:text-sky-300 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;