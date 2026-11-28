import React from 'react';

interface PageLoadingSpinnerProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function PageLoadingSpinner({
  title = 'Memuat Halaman...',
  subtitle = 'Mohon tunggu sebentar, sistem sedang menyiapkan data Anda. Tidak perlu refresh halaman.',
  fullScreen = false,
}: PageLoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${
        fullScreen ? 'min-h-screen bg-slate-50' : 'py-16 bg-white rounded-2xl border border-slate-200/80 shadow-2xs'
      }`}
    >
      <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        {/* Inner reverse pulse ring */}
        <div className="absolute inset-2 rounded-full border-2 border-indigo-100 border-b-indigo-500 animate-spin [animation-direction:reverse] [animation-duration:1.4s]" />
        {/* Center badge */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm animate-pulse">
          Rx
        </div>
      </div>

      <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
        {title}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
        {subtitle}
      </p>

      {/* Smooth animated progress bar */}
      <div className="mt-5 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
