import { getAllPosts } from "../api/allpost";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Loader from "../loader/loader";
import PostSkeleton from "../PostSkeleton/PostSkeleton";
import SinglePost from "../singlePost/singlePost";
import { Link } from "react-router-dom";
import Commentitem from "../commentitem/commentitem";
import CreatePost from "../createPost/createPost";

export default function Home() {
  const observerTarget = useRef(null);

  const {
    data,
    isError,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["all posts"],
    queryFn: ({ pageParam = 1 }) => getAllPosts({ page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      // Use the API's pagination info to determine next page
      const nextPage = lastPage?.paginationInfo?.nextPage;
      // Return undefined if nextPage doesn't exist or is not a valid number
      return nextPage && typeof nextPage === "number" ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <h1 className="text-red-600">Error: {error.message}</h1>;
  }

  // Flatten all pages into a single array of posts
  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="min-h-[calc(100vh-80px)] py-6 md:py-10">
      <CreatePost query="all posts" />

      <div className="max-w-3xl mx-auto space-y-8 md:space-y-10">
        {allPosts.map((post) => (
          <div
            key={post._id}
            className="card bg-base-200 border border-base-300 shadow-xl
                       hover:border-primary/50 transition-all duration-300"
          >
            <div className="card-body p-5 md:p-7">
              <Link to={`/postDetails/${post._id}`} className="block">
                <SinglePost post={post} />
              </Link>

              <div className="mt-4 border-t border-base-300 pt-3">
                <Commentitem post={post} />
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator while fetching next page */}
        {isFetchingNextPage && (
          <div className="space-y-8">
            <PostSkeleton />
          </div>
        )}

        {/* Observer target for infinite scroll */}
        <div ref={observerTarget} className="h-10" />

        {/* No more posts message */}
        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center py-8 text-base-content/50">
            <p className="text-sm">You've reached the end! 🎉</p>
          </div>
        )}

        {/* No posts at all */}
        {allPosts.length === 0 && (
          <div className="text-center py-12 text-base-content/50">
            <p className="text-lg">No posts yet. Be the first to post! ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}
