import React, { useState, useContext, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { getUserProfile } from "../api/getUserProfile";
import { getUserPosts } from "../api/getuserpost";
import { followUser } from "../api/followUser";
import { tokencontext } from "../../context/tokenContext";
import Loader from "../loader/loader";
import Errorpage from "../errorpage/errorpage";
import SinglePost from "../singlePost/singlePost";
import Commentitem from "../commentitem/commentitem";
import PostSkeleton from "../PostSkeleton/PostSkeleton";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft, HiOutlineXMark } from "react-icons/hi2";

export default function UserProfile() {
  const { userId } = useParams();
  const { userData, refreshUser } = useContext(tokencontext);
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErr,
  } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId),
  });

  useEffect(() => {
    if (profileData) {
      const p =
        profileData?.data?.user || profileData?.user || profileData?.data;
      const myId = userData?._id;
      const isF = p?.followers?.some(
        (f) => (typeof f === "string" ? f : f._id) === myId,
      );
      setIsFollowing(isF || false);
    }
  }, [profileData, userData]);

  const observerTarget = React.useRef(null);

  const {
    data: postsData,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user posts", "infinite", userId],
    queryFn: ({ pageParam = 1 }) =>
      getUserPosts(userId, { page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.meta?.pagination || lastPage?.pagination;
      if (pagination && pagination.currentPage < pagination.numberOfPages) {
        return pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: !!userId,
  });

  React.useEffect(() => {
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

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: () => setIsFollowing((p) => !p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", userData?._id],
      });
      queryClient.invalidateQueries({ queryKey: ["follow-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["all posts"] });
      refreshUser?.();
    },
    onError: () => {
      setIsFollowing((p) => !p);
      toast.error("Failed");
    },
  });

  const [followModalConfig, setFollowModalConfig] = useState({
    isOpen: false,
    title: "",
    users: [],
  });

  const navigate = useNavigate();

  if (profileError)
    return <Errorpage title="Error" message={profileErr.message} />;

  const ProfileHeaderSkeleton = () => (
    <div className="flex items-center gap-8 sm:gap-16 mb-10">
      <div className="w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-base-300 animate-pulse shrink-0"></div>
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-6 w-32 bg-base-300 animate-pulse rounded-md"></div>
          <div className="h-8 w-24 bg-base-300 animate-pulse rounded-lg"></div>
        </div>
        <div className="flex gap-8 mb-4">
          <div className="h-5 w-16 bg-base-300 animate-pulse rounded-md"></div>
          <div className="h-5 w-20 bg-base-300 animate-pulse rounded-md"></div>
          <div className="h-5 w-24 bg-base-300 animate-pulse rounded-md"></div>
        </div>
        <div className="h-5 w-40 bg-base-300 animate-pulse rounded-md mb-2"></div>
      </div>
    </div>
  );

  const profile =
    profileData?.data?.user || profileData?.user || profileData?.data || {};
  const posts =
    postsData?.pages?.flatMap(
      (page) => page?.data?.posts || page?.posts || [],
    ) || [];

  const openFollowModal = (title, usersList) => {
    if (!usersList || usersList.length === 0) return;
    setFollowModalConfig({
      isOpen: true,
      title,
      users: usersList,
    });
  };

  const closeFollowModal = () => {
    setFollowModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen lg:ml-[220px] pb-16 lg:pb-0">
      <div className="max-w-[935px] mx-auto px-4 sm:px-8 py-8">
        {/* Back */}
        <Link
          to="/home"
          className="flex items-center gap-1 text-sm text-base-content/40 hover:text-base-content mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back
        </Link>

        {!profileData || profileLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          <div className="flex items-center gap-8 sm:gap-16 mb-10">
            <div className="w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-linear-to-br from-primary to-secondary p-[3px] shrink-0">
              <img
                src={profile.photo}
                alt=""
                className="w-full h-full rounded-full object-cover bg-base-100"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <h1 className="text-xl font-normal">{profile.name}</h1>
                {userData?._id !== userId && (
                  <button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={`btn btn-sm font-semibold text-sm rounded-lg ${isFollowing ? "btn-ghost bg-base-200" : "btn-primary"}`}
                  >
                    {followMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </div>

              <div className="flex gap-8 text-sm mb-4">
                <span>
                  <b>{posts.length}</b> posts
                </span>
                <span
                  onClick={() =>
                    openFollowModal("Followers", profile.followers)
                  }
                  className={
                    profile.followers?.length > 0
                      ? "cursor-pointer hover:underline"
                      : "opacity-70"
                  }
                >
                  <b>
                    {profile.followersCount || profile.followers?.length || 0}
                  </b>{" "}
                  followers
                </span>
                <span
                  onClick={() =>
                    openFollowModal("Following", profile.following)
                  }
                  className={
                    profile.following?.length > 0
                      ? "cursor-pointer hover:underline"
                      : "opacity-70"
                  }
                >
                  <b>
                    {profile.followingCount || profile.following?.length || 0}
                  </b>{" "}
                  following
                </span>
              </div>

              <p className="text-sm font-semibold">{profile.name}</p>
              {profile.gender && (
                <p className="text-sm text-base-content/70 capitalize">
                  {profile.gender}
                </p>
              )}
              {profile.dateOfBirth && (
                <p className="text-sm text-base-content/70">
                  Born{" "}
                  {new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
              {profile.createdAt && (
                <p className="text-sm text-base-content/50 mt-1">
                  Joined{" "}
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-base-300"></div>
        <div className="flex justify-center gap-12 text-xs font-semibold tracking-wider uppercase text-base-content/40 -mt-px">
          <span className="border-t border-base-content py-3">Posts</span>
        </div>

        <div className="max-w-[470px] mx-auto space-y-0 mt-4">
          {!postsData || postsLoading ? (
            <div className="space-y-3">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post._id}
                className="bg-base-100 border border-base-300 sm:rounded-lg mb-3"
              >
                <SinglePost
                  post={post}
                  isFollowingUser={isFollowing}
                  onFollowToggle={() => followMutation.mutate()}
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
            ))
          ) : (
            <p className="text-center text-base-content/30 py-16 text-sm">
              No posts yet
            </p>
          )}

          {isFetchingNextPage && (
            <div className="space-y-3">
              <div className="animate-pulse bg-base-300 h-64 rounded-lg"></div>
              <div className="animate-pulse bg-base-300 h-64 rounded-lg"></div>
            </div>
          )}

          <div
            ref={observerTarget}
            className="h-10 w-full flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <span className="loading loading-spinner text-primary loading-md"></span>
            )}
          </div>

          {!hasNextPage && posts.length > 0 && (
            <p className="text-center text-xs text-base-content/30 py-8">
              You're all caught up
            </p>
          )}
        </div>
      </div>

      {/* Follow / Following Modal */}
      {followModalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
              <span className="w-5"></span>
              <h3 className="font-bold text-base">{followModalConfig.title}</h3>
              <button
                onClick={closeFollowModal}
                className="hover:bg-base-300 p-1 rounded-full transition-colors"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4 shadow-inner">
              {followModalConfig.users.map((u) => (
                <FollowModalRow
                  key={u._id}
                  user={u}
                  currentUserId={userData?._id}
                  userData={userData}
                  onNavigate={(path) => {
                    closeFollowModal();
                    navigate(path);
                  }}
                  onFollowChanged={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["user-profile", userId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["user-profile", userData?._id],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["follow-suggestions"],
                    });
                    queryClient.invalidateQueries({ queryKey: ["all posts"] });
                    refreshUser?.();
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FollowModalRow({
  user,
  currentUserId,
  userData,
  onNavigate,
  onFollowChanged,
}) {
  const isMe = currentUserId === user._id;
  const [isFollowingThis, setIsFollowingThis] = useState(() => {
    return (
      userData?.following?.some(
        (f) => (typeof f === "string" ? f : f._id) === user._id,
      ) || false
    );
  });
  const [isPending, setIsPending] = useState(false);

  // Sync state when userData updates (e.g. after another follow action)
  useEffect(() => {
    setIsFollowingThis(
      userData?.following?.some(
        (f) => (typeof f === "string" ? f : f._id) === user._id,
      ) || false,
    );
  }, [userData, user._id]);

  const handleFollow = async () => {
    setIsPending(true);
    setIsFollowingThis((prev) => !prev);
    try {
      await followUser(user._id);
      onFollowChanged?.();
    } catch {
      setIsFollowingThis((prev) => !prev);
      toast.error("Failed");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div
        onClick={() => onNavigate(isMe ? "/profile" : `/user/${user._id}`)}
        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
      >
        <img
          src={
            user.photo ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
          }
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border border-base-300 group-hover:border-primary transition-colors shrink-0"
        />
        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
          {user.name}
        </p>
      </div>
      {!isMe && (
        <button
          onClick={handleFollow}
          disabled={isPending}
          className={`btn btn-sm font-semibold text-xs rounded-lg ml-2 min-w-[90px] ${
            isFollowingThis ? "btn-ghost bg-base-200" : "btn-primary"
          }`}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : isFollowingThis ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}
    </div>
  );
}
