import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen
                    bg-base-100 text-base-content px-4">
      <div className="relative">
        <h1 className="text-[96px] md:text-[124px] font-black tracking-tight text-primary drop-shadow-[0_0_28px_rgba(var(--p),0.7)]">
          404
        </h1>
        <div className="absolute inset-0 blur-3xl bg-primary/20 -z-10" />
      </div>

      <h2 className="text-2xl md:text-3xl font-semibold mt-2 text-base-content">
        Page not found
      </h2>

      <p className="text-sm md:text-base opacity-60 mt-3 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved to another timeline.
      </p>

      <button
        onClick={() => navigate('/home')}
        className="btn btn-primary mt-7 px-8 rounded-full text-primary-content font-bold shadow-lg"
      >
        Back to Home
      </button>
    </div>
  );
}

