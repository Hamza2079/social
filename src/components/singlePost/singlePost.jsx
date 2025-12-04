import React from 'react'

export default function SinglePost({post}) {
  return (
    <div className="space-y-4">
      {/* USER */}
      <div className="flex items-center gap-4">
        <img
          src={post.user?.photo}
          alt="user"
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-sky-400/70 object-cover shadow-[0_8px_30px_rgba(56,189,248,0.35)]"
        />
        <div>
          <p className="font-semibold text-slate-50 text-base md:text-lg">
            {post.user?.name}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* BODY */}
      <p className="text-sm md:text-base leading-relaxed text-slate-200">
        {post.body}
      </p>

      {/* IMAGE */}
      {post.image && (
        <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.95)]">
          <img
            src={post.image}
            alt="post"
            className="w-full max-h-[420px] object-cover hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      )}
    </div>
  )
}
