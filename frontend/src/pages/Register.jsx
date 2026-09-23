import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Submit Form & Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await API.post('/auth/send-otp', { email: formData.email });
      setStep('OTP');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit OTP, Verify & Redirect to Dashboard
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      return setError('Please enter a complete 6-digit OTP');
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/verify-register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp,
      });

      // Save token and user info
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));

      // Redirect immediately to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111827]/90 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl backdrop-blur-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {step === 'FORM' ? 'Create Account' : 'Verify Email'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 'FORM'
              ? 'Register to start verifying candidate resumes'
              : `Enter the 6-digit code sent to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm rounded-xl">
            {error}
          </div>
        )}

        {step === 'FORM' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="FullName"
                className="w-full px-4 py-2.5 bg-[#1a2333] border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                className="w-full px-4 py-2.5 bg-[#1a2333] border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#1a2333] border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#1a2333] border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition"
            >
              {loading ? 'Sending Code...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder=""
                autoFocus
                className="w-full tracking-widest text-center text-3xl font-extrabold py-3 bg-[#1a2333] border border-slate-700/80 rounded-xl text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Enter Dashboard'}
            </button>

            <div className="flex justify-between items-center text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-slate-400 hover:text-white"
              >
                &larr; Back to edit details
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-sky-400 hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs sm:text-sm text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-sky-400 font-bold hover:text-sky-300 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;