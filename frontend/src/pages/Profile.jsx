import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/resumes/my-resume');
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : (res.data?.data ? [res.data.data] : []);
        setResumes(list);
      } catch (_err) {
        setResumes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const totalResumes = resumes.length;
  const verifiedCount = resumes.filter((r) => r.verificationStatus === 'VERIFIED').length;
  const avgScore =
    totalResumes > 0
      ? Math.round(resumes.reduce((acc, curr) => acc + (curr.verificationScore || 0), 0) / totalResumes)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Account details and verification portfolio overview.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 text-center shadow-xs flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-extrabold text-2xl flex items-center justify-center mb-4 border-2 border-blue-200">
            {storedUser.name ? storedUser.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>

          <h2 className="text-lg font-bold text-slate-900">{storedUser.name || 'Student Candidate'}</h2>
          <p className="text-xs text-slate-500 mt-0.5 break-all">{storedUser.email || 'No email registered'}</p>

          <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">
            Active Student Account
          </span>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-2 text-left text-xs">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Account Type:</span>
              <span className="font-semibold text-slate-800">Candidate / Student</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>System Role:</span>
              <span className="font-semibold text-slate-800">Resume Submitter</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-6 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Right Column: Account & Portfolio Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Information Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                  Full Name
                </span>
                <span className="font-semibold text-slate-900 mt-1 block">
                  {storedUser.name || 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                  Email Address
                </span>
                <span className="font-semibold text-slate-900 mt-1 block break-all">
                  {storedUser.email || 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                  Phone Number
                </span>
                <span className="font-semibold text-slate-900 mt-1 block">
                  {storedUser.phoneNumber || 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                  Account ID
                </span>
                <span className="font-mono text-xs text-slate-700 mt-1 block truncate">
                  {storedUser.id || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Portfolio Statistics */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100">
              Resume Portfolio Summary
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400">Loading portfolio metrics...</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-2xl font-bold text-slate-900 block">{totalResumes}</span>
                  <span className="text-xs text-slate-500 mt-1 block">Total Resumes</span>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <span className="text-2xl font-bold text-emerald-700 block">{verifiedCount}</span>
                  <span className="text-xs text-emerald-600 mt-1 block">Verified</span>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
                  <span className="text-2xl font-bold text-blue-700 block">{avgScore}%</span>
                  <span className="text-xs text-blue-600 mt-1 block">Average ATS</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <Link
                to="/resumes"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                View My Resumes
              </Link>
              <Link
                to="/upload"
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Upload New Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
