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

export default function SinglePost({ post, onCommentClick }) {
  const queryclient = useQueryClient();
  const navigate = useNavigate();
  const { userData } = useContext(tokencontext);
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
  const [isBookmarked, setIsBookmarked] = useState(
    post.bookmarks?.includes(userData?._id) || false,
  );
  const [shareCount, setShareCount] = useState(post.sharesCount || 0);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setIsLiked(post.likes?.includes(userData?._id) || false);
    setLikeCount(post.likes?.length || 0);
    setIsBookmarked(post.bookmarks?.includes(userData?._id) || false);
    setShareCount(post.sharesCount || 0);
  }, [post, userData]);

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
    onSuccess: () => queryclient.invalidateQueries({ queryKey: ["all posts"] }),
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
    onMutate: () => setIsFollowing((prev) => !prev),
    onSuccess: () => {
      queryclient.invalidateQueries({ queryKey: ["all posts"] });
      queryclient.invalidateQueries({ queryKey: ["follow-suggestions"] });
    },
    onError: () => {
      setIsFollowing((prev) => !prev);
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
                    followMutation.mutate();
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
            onClick={() => setShowImageModal(true)}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLiked) likeMutation.mutate();
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
            className={`transition-transform active:scale-75 ${isBookmarked ? "text-base-content" : "text-base-content"}`}
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
            <div className="p-4">
              <textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="Add a message..."
                className="w-full bg-transparent text-sm resize-none outline-none min-h-[80px] placeholder:text-base-content/30"
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
                  "Share"
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
