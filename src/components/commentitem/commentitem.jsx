import React, { useState } from 'react'

export default function Commentitem({post}) {
  const [openComments, setOpenComments] = useState(null); // postId

  function toggleComments(postId) {
    setOpenComments((prev) => (prev === postId ? null : postId));
  }

  function handleShare(post) {
  const shareData = {
    title: post.title || "Post",
    text: post.body || "Check this post!",
    url: `${window.location.origin}/postDetails/${post._id}`,
  };

  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log("Shared successfully"))
      .catch((error) => console.log("Error sharing:", error));
  } else {
    // fallback لو الجهاز مش بيدعم الشير
    navigator.clipboard.writeText(shareData.url);
    alert("Link copied to clipboard 📋");
  }
}


  return (
    <>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/70 text-xs md:text-sm">


        <button
          onClick={() => toggleComments(post._id)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full
                     bg-slate-900/70 border border-sky-500/50 text-sky-300
                     hover:bg-sky-500/15 hover:border-sky-400 hover:text-sky-100
                     transition-all duration-200"
        >
          💬 <span className="font-semibold">{post.comments.length}</span> Comments
        </button>

        <button
          onClick={() => handleShare(post)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full
                     bg-slate-900/70 border border-emerald-500/40 text-emerald-300
                     hover:bg-emerald-500/15 hover:border-emerald-400 hover:text-emerald-100
                     transition-all duration-200"
        >
          🔗 Share
        </button>
      </div>

      {openComments === post._id && (
        <div className="mt-5 bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 md:p-5">
          <h3 className="font-semibold text-slate-100 mb-3 text-sm md:text-base">
            Comments
          </h3>

          {/* WRITE COMMENT (UI ONLY) */}
          <div className="flex items-center gap-2 mb-4">
            <input
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-600
                         text-slate-100 placeholder:text-slate-500 text-xs md:text-sm
                         focus:outline-none focus:ring-2 focus:ring-sky-400/80"
              placeholder="Write a comment..."
            />
            <button
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs md:text-sm font-semibold
                         hover:bg-sky-400 transition-colors"
            >
              Send
            </button>
          </div>

          {/* COMMENTS LIST */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 md:pr-2">
            {post.comments.map((comment, index) => {
              const avatar =
                comment.commentCreator?.photo &&
                !comment.commentCreator.photo.includes("undefined")
                  ? comment.commentCreator.photo
                  : "https://i.pravatar.cc/150?img=12";

              return (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs md:text-sm"
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-9 h-9 rounded-xl object-cover border border-slate-600"
                  />
                  <div>
                    <p className="font-semibold text-slate-100">
                      {comment.commentCreator?.name || "Unknown User"}
                    </p>
                    <p className="text-slate-300 text-xs">
                      {comment.content}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  )
}
