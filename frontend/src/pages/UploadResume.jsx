import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return setError('Please select a PDF or DOCX file');
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await API.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse and verify resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-[#111827]/90 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white">Upload & Verify Resume</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Choose a PDF or DOCX resume document for instant parsing and section analysis.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-8 sm:p-10 text-center bg-[#1a2333]/50 hover:bg-[#1a2333] transition cursor-pointer relative group">
            <input
              type="file"
              accept=".pdf,.docx"
              id="fileInput"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                <span className="text-sky-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF or DOCX format (Max size: 5 MB)</p>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-[#1a2333] border border-slate-700 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                  {file.name.split('.').pop()}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-200 truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Ready
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Extracting & Verifying Content...
              </>
            ) : (
              <>
                Start Verification
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadResume;