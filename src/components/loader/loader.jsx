import React from 'react'
import { PulseLoader } from 'react-spinners'

export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-slate-950 text-sky-100">
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-full bg-slate-900/80 border border-sky-500/50
                        shadow-[0_0_50px_rgba(56,189,248,0.7)] flex items-center justify-center">
          <PulseLoader color="#38bdf8" size={10} />
        </div>
        <div className="absolute inset-0 blur-3xl opacity-40 bg-sky-500/50 rounded-full -z-10" />
      </div>
      <p className="text-xs tracking-[0.25em] uppercase text-slate-400 mb-1">
        Syncing feed
      </p>
      <p className="text-sm text-slate-300">
        Loading your experience…
      </p>
    </div>
  )
}
