import React from 'react'

export default function Errorpage({title, message}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-base-100 px-6">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-error/10 border border-error/40
                        flex items-center justify-center shadow-lg">
          <span className="text-5xl font-black text-error">!</span>
        </div>
        <div className="absolute inset-0 blur-3xl opacity-20 bg-error/30 rounded-3xl -z-10" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-error text-center">
        {title}
      </h1>

      <p className="text-sm md:text-base opacity-70 mt-3 text-center max-w-md text-base-content">
        {message}
      </p>

      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="btn btn-error px-8 rounded-full text-error-content font-bold shadow-lg"
        >
          Try again
        </button>

        <button
          onClick={() => window.history.back()}
          className="btn btn-ghost border-error/40 text-error px-8 rounded-full"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
