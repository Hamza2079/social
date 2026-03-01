import React, { useState, useContext, useRef } from "react";
import { convertToWebP } from "../../utils/convertToWebP";
import { createComment } from "../api/addcomment";
import { updateComment } from "../api/updatecomment";
import { deleteComment } from "../api/deletecomment";
import { getPostComments } from "../api/getpostcomments";
import { likeComment } from "../api/likeComment";
import {
  createReply,
  getReplies,
  updateReply,
  deleteReply,
  likeReply,
} from "../api/replies";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tokencontext } from "../../context/tokenContext";
import { Link } from "react-router-dom";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineXMark,
  HiOutlinePhoto,
} from "react-icons/hi2";

export default function Commentitem({ post, externalOpen }) {
  const { userData } = useContext(tokencontext);
  const [openComments, setOpenComments] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  React.useEffect(() => {
    if (externalOpen) {
      setOpenComments(post._id);
    }
  }, [externalOpen, post._id]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCommentImage, setEditCommentImage] = useState("");
  const [editCommentImageFile, setEditCommentImageFile] = useState(null);
  const [isConvertingEditComment, setIsConvertingEditComment] = useState(false);
  const editCommentImageRef = useRef(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [commentImage, setCommentImage] = useState("");
  const [commentImageFile, setCommentImageFile] = useState(null);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const commentImageRef = useRef(null);
  const queryclient = useQueryClient();

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["post comments", post._id],
    queryFn: () => getPostComments(post._id),
    enabled: openComments === post._id,
  });

  const displayComments =
    commentsData?.data?.comments || commentsData?.comments || post.comments;

  const likeCommentMutation = useMutation({
    mutationFn: (commentId) => likeComment(post._id, commentId),
    onMutate: async (commentId) => {
      await queryclient.cancelQueries({
        queryKey: ["post comments", post._id],
      });
      const prev = queryclient.getQueryData(["post comments", post._id]);
      queryclient.setQueryData(["post comments", post._id], (old) => {
        if (!old) return old;
        const updateLikes = (comments) =>
          comments?.map((c) => {
            if (c._id !== commentId) return c;
            const liked = c.likes?.includes(userData?._id);
            return {
              ...c,
              likes: liked
                ? c.likes.filter((id) => id !== userData?._id)
                : [...(c.likes || []), userData?._id],
            };
          });
        if (old?.data?.comments)
          return {
            ...old,
            data: { ...old.data, comments: updateLikes(old.data.comments) },
          };
        if (old?.comments)
          return { ...old, comments: updateLikes(old.comments) };
        return old;
      });
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev)
        queryclient.setQueryData(["post comments", post._id], ctx.prev);
      toast.error("Failed");
    },
    onSettled: () =>
      queryclient.invalidateQueries({ queryKey: ["post comments", post._id] }),
  });

  const replyMutation = useMutation({
    mutationFn: ({ commentId, formData }) =>
      createReply(post._id, commentId, formData),
    onSuccess: (_, vars) => {
      toast.success("Reply posted!");
      setReplyingTo(null);
      setReplyText("");
      queryclient.invalidateQueries({
        queryKey: ["replies", post._id, vars.commentId],
      });
      queryclient.invalidateQueries({ queryKey: ["post comments", post._id] });
    },
    onError: (e) => toast.error(e?.response?.data?.error || "Failed"),
  });

  const { isPending: isAddingComment, mutate } = useMutation({
    mutationFn: (payload) => createComment(payload),
    onSuccess: () => {
      toast.success("Comment posted!");
      setCommentText("");
      setCommentImage("");
      setCommentImageFile(null);
      queryclient.invalidateQueries({ queryKey: ["post comments", post._id] });
      queryclient.invalidateQueries({ queryKey: ["all posts"] });
      queryclient.invalidateQueries({ queryKey: ["single post", post._id] });
    },
    onError: (e) => toast.error(e?.response?.data?.error || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ formData, commentId }) =>
      updateComment(formData, commentId, post._id),
    onSuccess: () => {
      toast.success("Updated!");
      setEditingCommentId(null);
      setEditText("");
      queryclient.invalidateQueries({ queryKey: ["post comments", post._id] });
    },
    onError: (e) => toast.error(e?.response?.data?.error || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId, post._id),
    onSuccess: () => {
      toast.success("Deleted!");
      setDeleteConfirmId(null);
      queryclient.invalidateQueries({ queryKey: ["post comments", post._id] });
    },
    onError: (e) => {
      setDeleteConfirmId(null);
      toast.error(e?.response?.data?.error || "Failed");
    },
  });

  function ReplySection({ comment }) {
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editReplyText, setEditReplyText] = useState("");
    const [editReplyImage, setEditReplyImage] = useState("");
    const [editReplyImageFile, setEditReplyImageFile] = useState(null);
    const [isConvertingEditReply, setIsConvertingEditReply] = useState(false);
    const [deleteReplyConfirmId, setDeleteReplyConfirmId] = useState(null);
    const [replyImagePreview, setReplyImagePreview] = useState("");
    const [replyImageFile, setReplyImageFile] = useState(null);
    const [isConvertingReplyImage, setIsConvertingReplyImage] = useState(false);
    const replyImageInputRef = useRef(null);
    const editReplyImageRef = useRef(null);

    const { data: repliesData, isLoading: repliesLoading } = useQuery({
      queryKey: ["replies", post._id, comment._id],
      queryFn: () => getReplies(post._id, comment._id),
      enabled: !!expandedReplies[comment._id],
    });
    const replies = repliesData?.data?.replies || repliesData?.replies || [];

    const updateReplyMutation = useMutation({
      mutationFn: ({ replyId, formData }) =>
        updateReply(post._id, comment._id, replyId, formData),
      onSuccess: () => {
        toast.success("Reply updated!");
        setEditingReplyId(null);
        queryclient.invalidateQueries({
          queryKey: ["replies", post._id, comment._id],
        });
      },
      onError: (e) => toast.error(e?.response?.data?.error || "Failed"),
    });

    const deleteReplyMutation = useMutation({
      mutationFn: (replyId) => deleteReply(post._id, comment._id, replyId),
      onSuccess: () => {
        toast.success("Reply deleted!");
        setDeleteReplyConfirmId(null);
        queryclient.invalidateQueries({
          queryKey: ["replies", post._id, comment._id],
        });
        queryclient.invalidateQueries({
          queryKey: ["post comments", post._id],
        });
      },
      onError: (e) => {
        setDeleteReplyConfirmId(null);
        toast.error(e?.response?.data?.error || "Failed");
      },
    });

    const likeReplyMutation = useMutation({
      mutationFn: (replyId) => likeReply(post._id, comment._id, replyId),
      onMutate: async (replyId) => {
        const qk = ["replies", post._id, comment._id];
        await queryclient.cancelQueries({ queryKey: qk });
        const prev = queryclient.getQueryData(qk);
        queryclient.setQueryData(qk, (old) => {
          if (!old) return old;
          const updateLikes = (replies) =>
            replies?.map((r) => {
              if (r._id !== replyId) return r;
              const liked = r.likes?.includes(userData?._id);
              return {
                ...r,
                likes: liked
                  ? r.likes.filter((id) => id !== userData?._id)
                  : [...(r.likes || []), userData?._id],
              };
            });
          if (old?.data?.replies)
            return {
              ...old,
              data: { ...old.data, replies: updateLikes(old.data.replies) },
            };
          if (old?.replies)
            return { ...old, replies: updateLikes(old.replies) };
          return old;
        });
        return { prev };
      },
      onError: (_, __, ctx) => {
        const qk = ["replies", post._id, comment._id];
        if (ctx?.prev) queryclient.setQueryData(qk, ctx.prev);
        toast.error("Failed");
      },
      onSettled: () =>
        queryclient.invalidateQueries({
          queryKey: ["replies", post._id, comment._id],
        }),
    });

    const handleReplySubmit = () => {
      if (!replyText.trim() && !replyImageFile) return;
      const fd = new FormData();
      if (replyText.trim()) fd.append("content", replyText);
      if (replyImageFile) fd.append("image", replyImageFile);
      replyMutation.mutate({ commentId: comment._id, formData: fd });
      setReplyImagePreview("");
      setReplyImageFile(null);
    };

    return (
      <div className="ml-11">
        {(comment.replies?.length > 0 || comment.repliesCount > 0) && (
          <button
            onClick={() =>
              setExpandedReplies((p) => ({
                ...p,
                [comment._id]: !p[comment._id],
              }))
            }
            className="text-xs text-base-content/40 font-semibold my-1 flex items-center gap-2"
          >
            <span className="w-6 border-t border-base-content/20"></span>
            {expandedReplies[comment._id]
              ? "Hide replies"
              : `View ${comment.replies?.length || comment.repliesCount || 0} replies`}
          </button>
        )}

        {expandedReplies[comment._id] && (
          <div className="space-y-2 mt-1">
            {repliesLoading ? (
              <span className="loading loading-spinner loading-xs text-base-content/30 ml-4"></span>
            ) : (
              replies.map((r, i) => {
                const replyLiked = r.likes?.includes(userData?._id);
                const creatorId = r.user?._id || r.commentCreator?._id;
                return (
                  <div key={r._id || i}>
                    <div className="flex items-start gap-2">
                      <img
                        src={
                          r.user?.photo ||
                          r.commentCreator?.photo ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                        }
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        {editingReplyId === r._id ? (
                          <div className="space-y-1.5">
                            {(editReplyImage || isConvertingEditReply) && (
                              <div className="relative inline-block">
                                {isConvertingEditReply ? (
                                  <div className="w-14 h-14 rounded-lg border border-base-300 bg-base-300 flex items-center justify-center">
                                    <span className="loading loading-spinner loading-xs text-primary"></span>
                                  </div>
                                ) : (
                                  <>
                                    <img
                                      src={editReplyImage}
                                      alt=""
                                      className="w-14 h-14 object-cover rounded-lg border border-base-300"
                                    />
                                    <button
                                      onClick={() => {
                                        setEditReplyImage("");
                                        setEditReplyImageFile(null);
                                      }}
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-base-300 rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                                    >
                                      <HiOutlineXMark className="w-2.5 h-2.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                            <input
                              value={editReplyText}
                              onChange={(e) => setEditReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  (editReplyText.trim() || editReplyImageFile)
                                ) {
                                  const fd = new FormData();
                                  if (editReplyText.trim())
                                    fd.append("content", editReplyText);
                                  if (editReplyImageFile)
                                    fd.append("image", editReplyImageFile);
                                  updateReplyMutation.mutate({
                                    replyId: r._id,
                                    formData: fd,
                                  });
                                }
                              }}
                              className="w-full bg-transparent outline-none border-b border-base-300 py-0.5"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <input
                                ref={editReplyImageRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setIsConvertingEditReply(true);
                                    try {
                                      const { dataUrl, blob } =
                                        await convertToWebP(file);
                                      setEditReplyImage(dataUrl);
                                      setEditReplyImageFile(
                                        new File([blob], "reply.webp", {
                                          type: "image/webp",
                                        }),
                                      );
                                    } catch {
                                      toast.error("Failed");
                                    } finally {
                                      setIsConvertingEditReply(false);
                                    }
                                  }
                                  e.target.value = "";
                                }}
                              />
                              <button
                                onClick={() =>
                                  editReplyImageRef.current?.click()
                                }
                                className="text-base-content/40 hover:text-base-content"
                              >
                                <HiOutlinePhoto className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const fd = new FormData();
                                  if (editReplyText.trim())
                                    fd.append("content", editReplyText);
                                  if (editReplyImageFile)
                                    fd.append("image", editReplyImageFile);
                                  updateReplyMutation.mutate({
                                    replyId: r._id,
                                    formData: fd,
                                  });
                                }}
                                disabled={
                                  updateReplyMutation.isPending ||
                                  isConvertingEditReply
                                }
                                className="text-primary font-bold disabled:text-primary/30"
                              >
                                {updateReplyMutation.isPending ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReplyId(null);
                                  setEditReplyText("");
                                  setEditReplyImage("");
                                  setEditReplyImageFile(null);
                                }}
                                className="text-base-content/40"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>
                              <span className="font-semibold">
                                {r.user?.name ||
                                  r.commentCreator?.name ||
                                  "User"}
                              </span>{" "}
                              <span className="text-base-content/70">
                                {r.content}
                              </span>
                            </p>
                            {r.image && (
                              <button
                                onClick={() => setLightboxImage(r.image)}
                                className="block mt-1 focus:outline-none"
                              >
                                <img
                                  src={r.image}
                                  alt=""
                                  className="max-w-[160px] max-h-[120px] object-cover rounded-lg border border-base-300 hover:opacity-80 transition-opacity"
                                />
                              </button>
                            )}
                            <div className="flex items-center gap-3 mt-0.5 text-base-content/35">
                              <span>
                                {new Date(r.createdAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                              {r.likes?.length > 0 && (
                                <span className="font-semibold">
                                  {r.likes.length}{" "}
                                  {r.likes.length === 1 ? "like" : "likes"}
                                </span>
                              )}
                              {userData?._id === creatorId && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingReplyId(r._id);
                                      setEditReplyText(r.content || "");
                                      setEditReplyImage(r.image || "");
                                      setEditReplyImageFile(null);
                                    }}
                                    className="hover:text-base-content/60"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteReplyConfirmId(r._id)
                                    }
                                    className="hover:text-error"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {editingReplyId !== r._id && (
                        <button
                          onClick={() => likeReplyMutation.mutate(r._id)}
                          className="mt-1 shrink-0"
                        >
                          {replyLiked ? (
                            <HiHeart className="w-3 h-3 text-error" />
                          ) : (
                            <HiOutlineHeart className="w-3 h-3 text-base-content/30 hover:text-base-content/50" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {replyingTo === comment._id && (
          <div className="mt-1 space-y-1">
            {(replyImagePreview || isConvertingReplyImage) && (
              <div className="relative inline-block ml-8">
                {isConvertingReplyImage ? (
                  <div className="w-14 h-14 rounded-lg border border-base-300 bg-base-300 flex items-center justify-center">
                    <span className="loading loading-spinner loading-xs text-primary"></span>
                  </div>
                ) : (
                  <>
                    <img
                      src={replyImagePreview}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg border border-base-300"
                    />
                    <button
                      onClick={() => {
                        setReplyImagePreview("");
                        setReplyImageFile(null);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-base-300 rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                    >
                      <HiOutlineXMark className="w-2.5 h-2.5" />
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReplySubmit()}
                className="flex-1 bg-transparent text-xs outline-none border-b border-base-300 py-1 placeholder:text-base-content/30"
                placeholder="Reply..."
                autoFocus
              />
              <input
                ref={replyImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setIsConvertingReplyImage(true);
                    try {
                      const { dataUrl, blob } = await convertToWebP(file);
                      setReplyImagePreview(dataUrl);
                      setReplyImageFile(
                        new File([blob], "reply.webp", { type: "image/webp" }),
                      );
                    } catch {
                      toast.error("Failed");
                    } finally {
                      setIsConvertingReplyImage(false);
                    }
                  }
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => replyImageInputRef.current?.click()}
                className="text-base-content/40 hover:text-base-content transition-colors"
              >
                <HiOutlinePhoto className="w-4 h-4" />
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={
                  (!replyText.trim() && !replyImageFile) ||
                  replyMutation.isPending ||
                  isConvertingReplyImage
                }
                className="text-xs font-bold text-primary disabled:text-primary/30"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {deleteReplyConfirmId && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-xl w-full max-w-xs overflow-hidden text-center">
              <div className="px-6 py-5 border-b border-base-300">
                <h3 className="font-bold">Delete reply?</h3>
              </div>
              <button
                onClick={() => deleteReplyMutation.mutate(deleteReplyConfirmId)}
                disabled={deleteReplyMutation.isPending}
                className="w-full py-3 text-error font-bold text-sm border-b border-base-300"
              >
                {deleteReplyMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                onClick={() => setDeleteReplyConfirmId(null)}
                className="w-full py-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      {/* View all comments link */}
      {(displayComments?.length || 0) > 0 && openComments !== post._id && (
        <button
          onClick={() => setOpenComments(post._id)}
          className="text-sm text-base-content/40 mt-1 block"
        >
          View all {displayComments.length} comments
        </button>
      )}

      {/* Comments section */}
      {openComments === post._id && (
        <div className="mt-2 space-y-3">
          {commentsLoading ? (
            <div className="flex justify-center py-3">
              <span className="loading loading-spinner loading-sm text-base-content/30"></span>
            </div>
          ) : displayComments?.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {displayComments.map((c, i) => {
                const liked = c.likes?.includes(userData?._id);
                return (
                  <div key={c._id || i}>
                    <div className="flex items-start gap-2">
                      <Link
                        to={
                          userData?._id === c.commentCreator?._id
                            ? "/profile"
                            : `/user/${c.commentCreator?._id}`
                        }
                      >
                        <img
                          src={
                            c.commentCreator?.photo ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover mt-0.5"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        {editingCommentId === c._id ? (
                          <div className="space-y-1.5">
                            {(editCommentImage || isConvertingEditComment) && (
                              <div className="relative inline-block">
                                {isConvertingEditComment ? (
                                  <div className="w-16 h-16 rounded-lg border border-base-300 bg-base-300 flex items-center justify-center">
                                    <span className="loading loading-spinner loading-sm text-primary"></span>
                                  </div>
                                ) : (
                                  <>
                                    <img
                                      src={editCommentImage}
                                      alt=""
                                      className="w-16 h-16 object-cover rounded-lg border border-base-300"
                                    />
                                    <button
                                      onClick={() => {
                                        setEditCommentImage("");
                                        setEditCommentImageFile(null);
                                      }}
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-base-300 rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                                    >
                                      <HiOutlineXMark className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  (editText.trim() || editCommentImageFile)
                                ) {
                                  const fd = new FormData();
                                  if (editText.trim())
                                    fd.append("content", editText);
                                  if (editCommentImageFile)
                                    fd.append("image", editCommentImageFile);
                                  updateMutation.mutate({
                                    formData: fd,
                                    commentId: c._id,
                                  });
                                }
                              }}
                              className="w-full bg-transparent text-sm outline-none border-b border-base-300 py-1"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <input
                                ref={editCommentImageRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setIsConvertingEditComment(true);
                                    try {
                                      const { dataUrl, blob } =
                                        await convertToWebP(file);
                                      setEditCommentImage(dataUrl);
                                      setEditCommentImageFile(
                                        new File([blob], "comment.webp", {
                                          type: "image/webp",
                                        }),
                                      );
                                    } catch {
                                      toast.error("Failed to process image");
                                    } finally {
                                      setIsConvertingEditComment(false);
                                    }
                                  }
                                  e.target.value = "";
                                }}
                              />
                              <button
                                onClick={() =>
                                  editCommentImageRef.current?.click()
                                }
                                className="text-base-content/40 hover:text-base-content transition-colors"
                              >
                                <HiOutlinePhoto className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const fd = new FormData();
                                  if (editText.trim())
                                    fd.append("content", editText);
                                  if (editCommentImageFile)
                                    fd.append("image", editCommentImageFile);
                                  updateMutation.mutate({
                                    formData: fd,
                                    commentId: c._id,
                                  });
                                }}
                                disabled={
                                  updateMutation.isPending ||
                                  isConvertingEditComment
                                }
                                className="text-xs font-bold text-primary disabled:text-primary/30"
                              >
                                {updateMutation.isPending ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditText("");
                                  setEditCommentImage("");
                                  setEditCommentImageFile(null);
                                }}
                                className="text-xs text-base-content/40"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">
                              <Link
                                to={
                                  userData?._id === c.commentCreator?._id
                                    ? "/profile"
                                    : `/user/${c.commentCreator?._id}`
                                }
                                className="font-semibold hover:text-base-content/70 transition-colors"
                              >
                                {c.commentCreator?.name || "User"}
                              </Link>{" "}
                              <span className="text-base-content/80">
                                {c.content}
                              </span>
                            </p>
                            {c.image && (
                              <button
                                onClick={() => setLightboxImage(c.image)}
                                className="block mt-1.5 focus:outline-none"
                              >
                                <img
                                  src={c.image}
                                  alt=""
                                  className="max-w-[200px] max-h-[150px] object-cover rounded-lg border border-base-300 hover:opacity-80 transition-opacity"
                                />
                              </button>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-base-content/35">
                              <span>
                                {new Date(c.createdAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                              {c.likes?.length > 0 && (
                                <span className="font-semibold">
                                  {c.likes.length}{" "}
                                  {c.likes.length === 1 ? "like" : "likes"}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setReplyingTo((p) =>
                                    p === c._id ? null : c._id,
                                  );
                                  setReplyText("");
                                }}
                                className="font-semibold hover:text-base-content/60"
                              >
                                Reply
                              </button>
                              {userData?._id === c.commentCreator?._id && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(c._id);
                                      setEditText(c.content);
                                      setEditCommentImage(c.image || "");
                                      setEditCommentImageFile(null);
                                    }}
                                    className="hover:text-base-content/60"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(c._id)}
                                    className="hover:text-error"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Like icon on right side — Instagram style */}
                      {editingCommentId !== c._id && (
                        <button
                          onClick={() => likeCommentMutation.mutate(c._id)}
                          className="mt-2 shrink-0"
                        >
                          {liked ? (
                            <HiHeart className="w-3.5 h-3.5 text-error" />
                          ) : (
                            <HiOutlineHeart className="w-3.5 h-3.5 text-base-content/30 hover:text-base-content/50" />
                          )}
                        </button>
                      )}
                    </div>
                    <ReplySection comment={c} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-base-content/30">No comments yet.</p>
          )}

          {/* Hide comments */}
          <button
            onClick={() => setOpenComments(null)}
            className="text-xs text-base-content/30 hover:text-base-content/50"
          >
            Hide comments
          </button>
        </div>
      )}

      {/* Add comment — Instagram style bottom input */}
      <div className="mt-2 pt-2 border-t border-base-300">
        {/* Image preview / converting indicator */}
        {(commentImage || isConvertingImage) && (
          <div className="relative inline-block mb-2 ml-9">
            {isConvertingImage ? (
              <div className="w-16 h-16 rounded-lg border border-base-300 bg-base-300 flex items-center justify-center">
                <span className="loading loading-spinner loading-sm text-primary"></span>
              </div>
            ) : (
              <>
                <img
                  src={commentImage}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-base-300"
                />
                <button
                  onClick={() => {
                    setCommentImage("");
                    setCommentImageFile(null);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-base-300 rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                >
                  <HiOutlineXMark className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <img
            src={userData?.photo}
            alt=""
            className="w-7 h-7 rounded-full object-cover"
          />
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              commentText.trim() &&
              mutate({
                content: commentText,
                post: post._id,
                image: commentImageFile || undefined,
              })
            }
            disabled={isAddingComment}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/30"
            placeholder="Add a comment..."
          />
          <input
            ref={commentImageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                setIsConvertingImage(true);
                try {
                  const { dataUrl, blob } = await convertToWebP(file);
                  setCommentImage(dataUrl);
                  setCommentImageFile(
                    new File([blob], "comment.webp", { type: "image/webp" }),
                  );
                } catch {
                  toast.error("Failed to process image");
                } finally {
                  setIsConvertingImage(false);
                }
              }
              e.target.value = "";
            }}
          />
          <button
            onClick={() => commentImageRef.current?.click()}
            className="text-base-content/40 hover:text-base-content transition-colors"
            title="Add image"
          >
            <HiOutlinePhoto className="w-5 h-5" />
          </button>
          {(commentText.trim() || commentImage) && (
            <button
              onClick={() =>
                mutate({
                  content: commentText,
                  post: post._id,
                  image: commentImageFile || undefined,
                })
              }
              disabled={isAddingComment || isConvertingImage}
              className="text-sm font-bold text-primary disabled:text-primary/30"
            >
              {isAddingComment ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Post"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Delete modal — Instagram style stacked buttons */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-xs overflow-hidden text-center">
            <div className="px-6 py-5 border-b border-base-300">
              <h3 className="font-bold">Delete comment?</h3>
            </div>
            <button
              onClick={() =>
                deleteConfirmId && deleteMutation.mutate(deleteConfirmId)
              }
              disabled={deleteMutation.isPending}
              className="w-full py-3 text-sm font-bold text-error border-b border-base-300 hover:bg-error/5"
            >
              {deleteMutation.isPending ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Delete"
              )}
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="w-full py-3 text-sm hover:bg-base-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-100 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
          >
            <HiOutlineXMark className="w-7 h-7" />
          </button>
          <div
            className="max-w-4xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt=""
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
