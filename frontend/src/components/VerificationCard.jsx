import React from 'react';

const VerificationCard = ({ label, isFound, icon }) => {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-150 flex items-center justify-between ${
        isFound
          ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
          : 'bg-amber-50/60 border-amber-200 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isFound
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {icon || (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-900 block">{label}</span>
          <p className="text-xs text-slate-500">
            {isFound ? 'Detected in document' : 'Section missing or not detected'}
          </p>
        </div>
      </div>

      {isFound ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-md shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Detected
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100/80 border border-amber-300 px-2.5 py-1 rounded-md shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Missing
        </span>
      )}
    </div>
  );
};

export default VerificationCard;