import { getAllPosts } from "../api/allpost";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Loader from "../loader/loader";
import PostSkeleton from "../PostSkeleton/PostSkeleton";
import SinglePost from "../singlePost/singlePost";
import Commentitem from "../commentitem/commentitem";
import CreatePost from "../createPost/createPost";
import FollowSuggestions from "../FollowSuggestions/FollowSuggestions";

export default function Home() {
  const observerTarget = useRef(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);

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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.meta?.pagination || lastPage?.pagination;
      if (pagination && pagination.currentPage < pagination.numberOfPages) {
        return pagination.currentPage + 1;
      }
      return undefined;
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage)
          fetchNextPage();
      },
      { threshold: 0.1 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <p className="text-center text-error py-10">Error: {error.message}</p>
    );

  const allPosts =
    data?.pages.flatMap((page) => page.data?.posts || page.posts || []) || [];

  return (
    <div className="min-h-screen lg:ml-[220px] pb-16 lg:pb-0">
      <div className="max-w-[935px] mx-auto px-0 sm:px-5 py-4 lg:py-8 flex gap-8">
        {/* Feed */}
        <div className="flex-1 max-w-[470px] mx-auto space-y-0">
          {/* Create post - compact */}
          <div className="px-3 sm:px-0 mb-4">
            <CreatePost query="all posts" />
          </div>

          {/* Posts */}
          {allPosts.map((post) => (
            <article
              key={post._id}
              className="bg-base-100 border-y sm:border sm:rounded-lg border-base-300 mb-3"
            >
              <SinglePost
                post={post}
                onCommentClick={() =>
                  setOpenCommentsPostId((prev) =>
                    prev === post._id ? null : post._id,
                  )
                }
              />
              <Commentitem
                post={post}
                externalOpen={openCommentsPostId === post._id}
              />
            </article>
          ))}

          {isFetchingNextPage && (
            <div className="space-y-3">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          )}

          <div ref={observerTarget} className="h-10" />

          {!hasNextPage && allPosts.length > 0 && (
            <p className="text-center text-xs text-base-content/30 py-8">
              You're all caught up
            </p>
          )}

          {allPosts.length === 0 && (
            <p className="text-center text-base-content/40 py-16">
              No posts yet
            </p>
          )}
        </div>

        {/* Sidebar - desktop */}
        <div className="hidden xl:block w-[320px] shrink-0 pt-4">
          <FollowSuggestions />
          <p className="text-xs text-base-content/20 mt-6 px-1">
            © 2026 Linked/Post
          </p>
        </div>
      </div>
    </div>
  );
}
