import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const ResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/resumes/${id}`);
        setResume(res.data.data);
      } catch (err) {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await API.delete(`/resumes/${id}`);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to delete resume');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading document details...</p>
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-[#111827] border border-slate-800 px-4 py-2 rounded-xl shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl hover:bg-rose-500/20 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Document
        </button>
      </div>

      {/* Metadata Card */}
      <div className="bg-[#111827]/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inspected Document</span>
            <h2 className="text-xl sm:text-2xl font-black text-white break-words mt-0.5">{resume.fileName}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
              <p className="text-xl font-black text-sky-400">{resume.verificationScore}%</p>
            </div>
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase ${
                resume.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {resume.verificationStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6 text-sm">
          <div className="p-4 rounded-2xl bg-[#1a2333] border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Candidate Name</span>
            <p className="font-semibold text-slate-100 text-base mt-1">{resume.name || 'Not detected'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#1a2333] border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</span>
            <p className="font-semibold text-slate-100 text-base mt-1 break-words">{resume.email || 'Not detected'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#1a2333] border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone Number</span>
            <p className="font-semibold text-slate-100 text-base mt-1">{resume.phone || 'Not detected'}</p>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827]/90 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <h3 className="font-bold text-white text-base">Identified Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.skills.length > 0 ? (
                resume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2.5 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No skills detected</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#111827]/90 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <h3 className="font-bold text-white text-base">Education Badges</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.education.length > 0 ? (
                resume.education.map((edu, index) => (
                  <span
                    key={index}
                    className="text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg"
                  >
                    {edu}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No academic degrees found</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#111827]/90 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="font-bold text-white text-base">Experience / Projects</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume.experience.length > 0 ? (
                resume.experience.map((exp, index) => (
                  <span
                    key={index}
                    className="text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
                  >
                    {exp}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No experience markers found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails;