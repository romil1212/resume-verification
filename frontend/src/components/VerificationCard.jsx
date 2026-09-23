import React from 'react';

const VerificationCard = ({ label, isFound, icon }) => {
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
      isFound 
        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' 
        : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          isFound ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {icon || (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-100">{label}</span>
          <p className="text-[11px] text-slate-400">
            {isFound ? 'Validated in document' : 'Section missing'}
          </p>
        </div>
      </div>

      {isFound ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Found
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Not Found
        </span>
      )}
    </div>
  );
};

export default VerificationCard;