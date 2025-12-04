import React from 'react'

export default function Errorpage({title, message}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-slate-950 px-6">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-rose-900/70 border border-rose-400/60
                        flex items-center justify-center shadow-[0_0_40px_rgba(248,113,113,0.7)]">
          <span className="text-5xl font-black text-rose-100">!</span>
        </div>
        <div className="absolute inset-0 blur-3xl opacity-40 bg-rose-500/60 rounded-3xl -z-10" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-rose-100 text-center">
        {title}
      </h1>

      <p className="text-sm md:text-base text-slate-200/90 mt-3 text-center max-w-md">
        {message}
      </p>

      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-full bg-rose-500 text-slate-950 text-sm font-semibold
                     hover:bg-rose-400 transition-colors"
        >
          Try again
        </button>

        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 rounded-full bg-slate-950/80 border border-rose-300/60
                     text-rose-100 text-sm hover:bg-slate-900 transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
