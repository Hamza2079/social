import React, { useEffect, useState } from "react";
import { getAllPosts } from "../api/allpost";

function Spinner() {
  return (
    <div className="w-14 h-14 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin"></div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>

      <div className="h-4 bg-gray-200 rounded mb-3 w-full" />
      <div className="h-4 bg-gray-200 rounded mb-3 w-5/6" />

      <div className="mt-4 w-full h-48 bg-gray-200 rounded-xl" />

      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // يتحكم بظهور اللودنج
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllPosts(signal);
        // افتراضياً الرد فيه data.posts
        setPosts(data.posts || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          // request cancelled — هنفعلش حاجة
        } else {
          console.error(err);
          setError("حدث خطأ أثناء جلب البوستات");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();

    // تنظيف عند unmount لإلغاء الطلب
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-sky-700 text-center mb-8">Creative Feed ✨</h1>

        {/* ===== Spinner overlay option (اختياري) ===== */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-40">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <p className="text-white font-medium">Loading posts...</p>
            </div>
          </div>
        )}

        {/* ===== Error ===== */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        {/* ===== Posts list or skeletons ===== */}
        <div className="space-y-8">
          {loading
            ? // show 3 skeletons while loading
              [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            : posts.length === 0
            ? (
              <div className="bg-white p-8 rounded-xl text-center border shadow-sm">
                <p className="text-gray-600">لا توجد منشورات حتى الآن.</p>
              </div>
            )
            : posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-white/90 backdrop-blur rounded-3xl p-6 border border-gray-100 shadow-md hover:shadow-xl transition-transform duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={post.user?.photo || "https://i.pravatar.cc/150?u="+post.user?._id}
                      alt={post.user?.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-100"
                    />
                    <div>
                      <h3 className="font-semibold text-sky-900">{post.user?.name}</h3>
                      <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-line">{post.body}</p>

                  {post.image && (
                    <div className="overflow-hidden rounded-2xl mb-4">
                      <img src={post.image} alt="post" className="w-full max-h-[420px] object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-gray-600 text-sm">❤️ {post.likes?.length || 0} Likes</div>
                    <button className="px-4 py-2 bg-sky-600 text-white rounded-full text-sm hover:bg-sky-700 transition">
                      Like
                    </button>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </div>
  );
}
