import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState(0); // 1: Upload, 2: Processing, 3: AI Analysis, 4: Completed
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  // Progress simulation during backend upload and parsing
  useEffect(() => {
    let timer1;
    let timer2;
    if (uploading) {
      timer1 = setTimeout(() => setUploadStage(2), 700); // Processing
      timer2 = setTimeout(() => setUploadStage(3), 1500); // AI Analysis
    } else {
      setUploadStage(0);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [uploading]);

  const validateAndSetFile = (selected) => {
    if (!selected) return;

    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are allowed.');
      setFile(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit. Please select a smaller document.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return setError('Please select a PDF or DOCX file to upload.');
    }

    setUploading(true);
    setUploadStage(1);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await API.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadStage(4); // Completed
      setSuccess('Resume uploaded and verified successfully!');

      const newId = res.data?.data?._id;
      setTimeout(() => {
        if (newId) {
          navigate(`/resume/${newId}`);
        } else {
          navigate('/dashboard');
        }
      }, 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Failed to parse and verify resume. Please ensure the file contains legible text.'
      );
      setUploading(false);
    }
  };

  const stages = [
    { num: 1, title: 'Upload', desc: 'Transferring document' },
    { num: 2, title: 'Processing', desc: 'Text & formatting extraction' },
    { num: 3, title: 'AI Analysis', desc: 'ATS scoring & section checks' },
    { num: 4, title: 'Completed', desc: 'Evaluation saved' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Upload Resume</span>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Resume for Verification</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Select a candidate resume in PDF or Word (.docx) format for automated text extraction, section completeness checking, and ATS evaluation.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-start gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Upload Process Stepper */}
        {uploading && (
          <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 text-center">
              Processing Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stages.map((stage) => {
                const isActive = uploadStage === stage.num;
                const isPassed = uploadStage > stage.num;
                return (
                  <div
                    key={stage.num}
                    className={`p-3 rounded-lg border text-center transition ${
                      isActive
                        ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20'
                        : isPassed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPassed ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                          ✓
                        </span>
                      ) : isActive ? (
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center">
                          {stage.num}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold block">{stage.title}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition relative cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              id="fileInput"
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                <span className="text-blue-600">Click to browse file</span> or drag & drop here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accepted formats: <strong>PDF</strong> or <strong>DOCX</strong> (Maximum size: 5 MB)
              </p>
            </div>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {file.name.split('.').pop()}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • Document Ready
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
                  Ready to verify
                </span>
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-slate-200 transition"
                    title="Remove file"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Evaluating Resume Structure...
              </>
            ) : (
              <>
                Start Automated Verification & ATS Analysis
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