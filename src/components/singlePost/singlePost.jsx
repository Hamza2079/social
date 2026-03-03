import React, { useContext, useState, useRef, useEffect } from "react";
import { tokencontext } from "../../context/tokenContext";
import styles from "./singlePost.module.css";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getPostLikes } from "../api/getPostLikes";
import { deletePost } from "../api/deletepost";
import { likePost } from "../api/likePost";
import { bookmarkPost } from "../api/bookmarkPost";
import { sharePost } from "../api/sharePost";
import { followUser } from "../api/followUser";
import { getUserBookmarks } from "../api/getUserBookmarks";
import CreatePost from "../createPost/createPost";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlinePaperAirplane,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineEllipsisHorizontal,
  HiOutlineXMark,
} from "react-icons/hi2";

export default function SinglePost({
  post,
  onCommentClick,
  isFollowingUser,
  onFollowToggle,
}) {
  const queryclient = useQueryClient();
  const navigate = useNavigate();
  const { userData, refreshUser } = useContext(tokencontext);
  const [showMenu, setShowMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [shareText, setShareText] = useState("");
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(userData?._id) || false,
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  // Fetch the user's bookmarks list (shared/cached across all SinglePost instances)
  const { data: bookmarksQueryData } = useQuery({
    queryKey: ["user-bookmarks"],
    queryFn: getUserBookmarks,
    staleTime: 30000,
  });
  const myBookmarkedPostIds = (
    bookmarksQueryData?.data?.bookmarks ||
    bookmarksQueryData?.bookmarks ||
    bookmarksQueryData?.data?.posts ||
    bookmarksQueryData?.posts ||
    []
  ).map((p) => (typeof p === "string" ? p : p._id));

  const [isBookmarked, setIsBookmarked] = useState(() => {
    const fromPost = post.bookmarks?.some(
      (b) => (typeof b === "string" ? b : b._id) === userData?._id,
    );
    const fromQuery = myBookmarkedPostIds.includes(post._id);
    return fromPost || fromQuery || false;
  });
  const [shareCount, setShareCount] = useState(post.sharesCount || 0);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [isFollowingLocal, setIsFollowingLocal] = useState(() => {
    const myId = userData?._id;
    const postUserId = post.user?._id;
    // Check post.user.followers (available on profile pages)
    const fromPostFollowers = post.user?.followers?.some(
      (f) => (typeof f === "string" ? f : f._id) === myId,
    );
    // Check userData.following (the logged-in user's following list)
    const fromMyFollowing = userData?.following?.some(
      (f) => (typeof f === "string" ? f : f._id) === postUserId,
    );
    return fromPostFollowers || fromMyFollowing || false;
  });
  // Use parent-provided state when available (e.g. on UserProfile page)
  const isFollowing =
    isFollowingUser !== undefined ? isFollowingUser : isFollowingLocal;
  const menuRef = useRef(null);

  useEffect(() => {
    setIsLiked(post.likes?.includes(userData?._id) || false);
    setLikeCount(post.likes?.length || 0);
    const fromPost = post.bookmarks?.some(
      (b) => (typeof b === "string" ? b : b._id) === userData?._id,
    );
    const fromQuery = myBookmarkedPostIds.includes(post._id);
    setIsBookmarked(fromPost || fromQuery || false);
    setShareCount(post.sharesCount || 0);
    const myId = userData?._id;
    const postUserId = post.user?._id;
    const fromPostFollowers = post.user?.followers?.some(
      (f) => (typeof f === "string" ? f : f._id) === myId,
    );
    const fromMyFollowing = userData?.following?.some(
      (f) => (typeof f === "string" ? f : f._id) === postUserId,
    );
    setIsFollowingLocal(fromPostFollowers || fromMyFollowing || false);
  }, [post, userData, bookmarksQueryData]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const { isPending: isDeleting, mutate } = useMutation({
    mutationFn: (postid) => deletePost(postid),
    onSuccess: () => {
      toast.success("Post deleted");
      setShowDeleteConfirm(false);
      queryclient.invalidateQueries({ queryKey: ["all posts"] });
      queryclient.invalidateQueries({ queryKey: ["user posts"] });
    },
    onError: (e) => {
      toast.error(e?.response?.data?.error || "Failed");
      setShowDeleteConfirm(false);
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => likePost(post._id),
    onMutate: () => {
      if (!isLiked) {
        setLikeAnimation(true);
        setTimeout(() => setLikeAnimation(false), 600);
      }
      setIsLiked((p) => !p);
      setLikeCount((p) => (isLiked ? p - 1 : p + 1));
    },
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["all posts"] });
      queryclient.invalidateQueries({ queryKey: ["single post", post._id] });
    },
    onError: () => {
      setIsLiked((p) => !p);
      setLikeCount((p) => (isLiked ? p + 1 : p - 1));
      toast.error("Failed");
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkPost(post._id),
    onMutate: () => setIsBookmarked((p) => !p),
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["all posts"] });
      queryclient.invalidateQueries({ queryKey: ["user-bookmarks"] });
    },
    onError: () => {
      setIsBookmarked((p) => !p);
      toast.error("Failed");
    },
  });

  const shareMutation = useMutation({
    mutationFn: (body) => sharePost(post._id, body),
    onSuccess: () => {
      toast.success("Shared!");
      setShareCount((prev) => prev + 1);
      setShowShareModal(false);
      setShareText("");
      queryclient.invalidateQueries({ queryKey: ["all posts"] });
      queryclient.invalidateQueries({ queryKey: ["user posts"] });
    },
    onError: (e) => {
      if (e?.response?.status === 409) {
        toast.error("You have already shared this post");
      } else {
        toast.error(e?.response?.data?.error || "Failed to share post");
      }
      setShowShareModal(false);
    },
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(post.user?._id),
    onMutate: () => setIsFollowingLocal((prev) => !prev),
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["all posts"] });
      queryclient.invalidateQueries({ queryKey: ["user posts"] });
      queryclient.invalidateQueries({ queryKey: ["user-profile"] });
      queryclient.invalidateQueries({ queryKey: ["follow-suggestions"] });
      refreshUser?.();
    },
    onError: () => {
      setIsFollowingLocal((prev) => !prev);
      toast.error("Failed to update follow status");
    },
  });

  return (
    <>
      {/* Header: avatar + username + menu */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          <Link
            to={
              userData?._id === post.user?._id
                ? "/profile"
                : `/user/${post.user?._id}`
            }
            className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary p-[2px] shrink-0"
          >
            <img
              src={
                post.user?.photo ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              alt=""
              className="w-full h-full rounded-full object-cover bg-base-100"
            />
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              to={
                userData?._id === post.user?._id
                  ? "/profile"
                  : `/user/${post.user?._id}`
              }
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-base-content hover:text-base-content/70 transition-colors"
            >
              {post.user?.name}
            </Link>
            {userData?._id !== post.user?._id && (
              <>
                <span className="text-base-content/30">·</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onFollowToggle) {
                      onFollowToggle();
                    } else {
                      followMutation.mutate();
                    }
                  }}
                  className={`text-xs font-bold transition-colors ${
                    isFollowing
                      ? "text-base-content/40 hover:text-base-content/60"
                      : "text-primary hover:text-primary/70"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </>
            )}
            <span className="text-base-content/30">·</span>
            <span className="text-xs text-base-content/40">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {userData?._id === post?.user?._id && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-base-content/40 hover:text-base-content transition-colors"
            >
              <HiOutlineEllipsisHorizontal className="w-6 h-6" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-10 w-48 bg-base-100 border border-base-300 rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowEditModal(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-base-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-error hover:bg-error/5 transition-colors border-t border-base-300"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-base-200 transition-colors border-t border-base-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption: username + body */}
      {post.body && (
        <div
          className="px-3 py-2 cursor-pointer"
          onClick={() => navigate(`/postDetails/${post._id}`)}
        >
          <p className="text-sm">
            <span className="text-base-content font-medium">{post.body}</span>
          </p>
        </div>
      )}

      {/* Shared Post content */}
      {post.isShare && post.sharedPost && (
        <div
          className="mx-3 my-2 border border-base-300 rounded-lg overflow-hidden cursor-pointer hover:bg-base-200/50 transition-colors"
          onClick={() => navigate(`/postDetails/${post.sharedPost._id}`)}
        >
          <div className="flex items-center gap-3 px-3 py-2 border-b border-base-300 bg-base-200/30">
            <img
              src={
                post.sharedPost.user?.photo ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {post.sharedPost.user?.name || "Unknown User"}
              </span>
              <span className="text-xs text-base-content/60">
                {new Date(post.sharedPost.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  },
                )}
              </span>
            </div>
          </div>
          {post.sharedPost.body && (
            <div className="px-3 py-2 text-sm">{post.sharedPost.body}</div>
          )}
          {post.sharedPost.image && (
            <div className="bg-base-300 relative">
              <img
                src={post.sharedPost.image}
                alt=""
                className="w-full aspect-square object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Image - full width (only if the outer post has an image) */}
      {post.image && !post.isShare && (
        <div className="rounded relative bg-base-300">
          <img
            src={post.image}
            alt=""
            className="w-full rounded aspect-square object-cover cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (window.clickTimeout) {
                // It's a double click
                clearTimeout(window.clickTimeout);
                window.clickTimeout = null;
                if (!isLiked) likeMutation.mutate();
              } else {
                // It's a single click (so far)
                window.clickTimeout = setTimeout(() => {
                  setShowImageModal(true);
                  window.clickTimeout = null;
                }, 250);
              }
            }}
          />
          {likeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <HiHeart className="w-20 h-20 text-white drop-shadow-lg animate-ping" />
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between">
          {/* Left icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                likeMutation.mutate();
              }}
              className={`transition-transform active:scale-75 ${isLiked ? "text-error" : "text-base-content"}`}
            >
              {isLiked ? (
                <HiHeart className="w-7 h-7" />
              ) : (
                <HiOutlineHeart className="w-7 h-7" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCommentClick?.();
              }}
              className="text-base-content flex items-center gap-1"
            >
              <HiOutlineChatBubbleOvalLeft className="w-7 h-7" />
              {(post.commentsCount || 0) > 0 && (
                <span className="text-sm font-medium">
                  {post.commentsCount}
                </span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="text-base-content flex items-center gap-1"
            >
              <HiOutlinePaperAirplane className="w-6 h-6 -rotate-12" />
              {shareCount > 0 && (
                <span className="text-sm font-medium">{shareCount}</span>
              )}
            </button>
          </div>
          {/* Right bookmark */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              bookmarkMutation.mutate();
            }}
            className={`transition-transform active:scale-75 ${isBookmarked ? "text-error" : "text-base-content"}`}
          >
            {isBookmarked ? (
              <HiBookmark className="w-7 h-7" />
            ) : (
              <HiOutlineBookmark className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Like count */}
        {likeCount > 0 && (
          <button
            onClick={() => setShowLikesModal(true)}
            className="text-sm font-bold mt-2 hover:text-base-content/60 transition-colors text-left"
          >
            {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
          </button>
        )}
      </div>

      {showEditModal && (
        <div className="px-3">
          <CreatePost
            mode="edit"
            post={post}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => setShowEditModal(false)}
            query="all posts"
          />
        </div>
      )}

      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-base-100 rounded-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
              <span></span>
              <h3 className="text-base font-bold">Share</h3>
              <button onClick={() => setShowShareModal(false)}>
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            {/* External sharing options */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
                Share to
              </p>
              <div className="flex items-center gap-3 justify-center">
                {/* Copy Link */}
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/postDetails/${post._id}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied!");
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-base-300 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-base-content/70"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-base-content/60 font-medium">
                    Copy link
                  </span>
                </button>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check this out: ${window.location.origin}/postDetails/${post._id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-base-content/60 font-medium">
                    WhatsApp
                  </span>
                </a>

                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/postDetails/${post._id}`)}&text=${encodeURIComponent(post.body?.slice(0, 100) || "Check this out")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-base-content/5 flex items-center justify-center group-hover:bg-base-content/10 transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4.5 h-4.5"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-base-content/60 font-medium">
                    X
                  </span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/postDetails/${post._id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center group-hover:bg-[#1877F2]/20 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-base-content/60 font-medium">
                    Facebook
                  </span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/postDetails/${post._id}`)}&text=${encodeURIComponent(post.body?.slice(0, 100) || "Check this out")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0088cc]/10 flex items-center justify-center group-hover:bg-[#0088cc]/20 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0088cc">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-base-content/60 font-medium">
                    Telegram
                  </span>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="flex-1 h-px bg-base-300"></div>
              <span className="text-xs text-base-content/40 font-medium">
                or repost
              </span>
              <div className="flex-1 h-px bg-base-300"></div>
            </div>

            {/* Internal share (repost) */}
            <div className="p-4 pt-2">
              <textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="Add a message..."
                className="w-full bg-transparent text-sm resize-none outline-none min-h-[60px] placeholder:text-base-content/30"
              />
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => shareMutation.mutate(shareText)}
                disabled={shareMutation.isPending}
                className="btn btn-primary btn-sm w-full rounded-lg"
              >
                {shareMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Repost"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-sm overflow-hidden text-center">
            <div className="px-8 py-6 border-b border-base-300">
              <h3 className="text-lg font-bold mb-1">Delete post?</h3>
              <p className="text-sm text-base-content/50">
                This can't be undone.
              </p>
            </div>
            <button
              onClick={() => mutate(post._id)}
              disabled={isDeleting}
              className="w-full py-3 text-sm font-bold text-error border-b border-base-300 hover:bg-error/5 transition-colors"
            >
              {isDeleting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Delete"
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-3 text-sm hover:bg-base-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Likes list modal */}
      {showLikesModal && (
        <LikesModal
          postId={post._id}
          onClose={() => setShowLikesModal(false)}
          currentUserId={userData?._id}
        />
      )}

      {/* Image lightbox */}
      {showImageModal && post.image && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
          >
            <HiOutlineXMark className="w-7 h-7" />
          </button>
          <div
            className="max-w-4xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={post.image}
              alt=""
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
            {post.body && (
              <p className="text-white/80 text-sm text-center max-w-lg">
                {post.body}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function LikesModal({ postId, onClose, currentUserId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["post likes", postId],
    queryFn: () => getPostLikes(postId),
    enabled: true,
  });
  const users = data?.data?.likes || data?.likes || [];

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
          <span></span>
          <h3 className="font-bold text-sm">Likes</h3>
          <button onClick={onClose}>
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-[350px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-sm text-base-content/30"></span>
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y divide-base-300">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={
                    currentUserId === user._id
                      ? "/profile"
                      : `/user/${user._id}`
                  }
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors"
                >
                  <img
                    src={
                      user.photo ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                    }
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold">{user.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-base-content/30 py-8 text-sm">
              No likes yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
