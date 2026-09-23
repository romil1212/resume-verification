import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token in URL.');
        return;
      }

      try {
        const res = await API.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message);

        // Auto-login user if token was returned
        if (res.data.data?.token) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link failed or expired');
      }
    };

    confirmToken();
  }, [token, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111827] rounded-3xl p-8 border border-slate-800 text-center shadow-2xl">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-bold text-white">Verifying Email...</h2>
            <p className="text-xs text-slate-400">Validating your digital JWT security signature.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white">Email Verified!</h2>
            <p className="text-sm text-slate-300">{message}</p>
            <p className="text-xs text-slate-500">Redirecting to your dashboard in a moment...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-xl">
              ✕
            </div>
            <h2 className="text-xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-rose-400">{message}</p>
            <Link
              to="/register"
              className="inline-block mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Back to Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;