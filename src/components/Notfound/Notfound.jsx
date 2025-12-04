import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen
                    bg-slate-950 text-slate-50 px-4">
      <div className="relative">
        <h1 className="text-[96px] md:text-[124px] font-black tracking-tight text-sky-400 drop-shadow-[0_0_28px_rgba(56,189,248,0.7)]">
          404
        </h1>
        <div className="absolute inset-0 blur-3xl bg-sky-500/30 -z-10" />
      </div>

      <h2 className="text-2xl md:text-3xl font-semibold mt-2 text-slate-50">
        Page not found
      </h2>

      <p className="text-sm md:text-base text-slate-300 mt-3 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved to another timeline.
      </p>

      <button
        onClick={() => navigate('/home')}
        className="mt-7 px-6 py-3 rounded-full bg-sky-500
                   text-slate-950 font-semibold text-sm shadow-[0_12px_30px_rgba(15,23,42,0.9)]
                   hover:bg-sky-400 transition-all"
      >
        Back to Home
      </button>
    </div>
  );
}

