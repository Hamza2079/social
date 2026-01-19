import React, { useState, useContext } from 'react'
import { createComment } from '../api/addcomment'
import { updateComment } from '../api/updatecomment'
import { deleteComment } from '../api/deletecomment'
import { getPostComments } from '../api/getpostcomments'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { tokencontext } from '../../context/tokenContext'

export default function Commentitem({post}) {
  const { userData } = useContext(tokencontext);
  const [openComments, setOpenComments] = useState(null); // postId
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const queryclient = useQueryClient();

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['post comments', post._id],
    queryFn: () => getPostComments(post._id),
    enabled: openComments === post._id,
  });

  const displayComments = commentsData?.comments || post.comments;

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
    navigator.clipboard.writeText(shareData.url);
    alert("Link copied to clipboard 📋");
  }
}

  const { isPending: isAddingComment, mutate } = useMutation({
    mutationFn: (payload) => createComment(payload),
    onSuccess: () => {
      // Show success toast
      toast.success('Comment posted successfully!', {
        icon: '💬',
      });
      
      // Clear input after successful post
      setCommentText('');
      
      // Invalidate queries to refresh comments
      queryclient.invalidateQueries({
        queryKey: ['post comments', post._id]
      });
      queryclient.invalidateQueries({
        queryKey: ['all posts']
      });
      queryclient.invalidateQueries({
        queryKey: ['single post', post._id]
      });
    },
    onError: (error) => {
      // Show error toast
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to post comment. Please try again.';
      toast.error(errorMessage);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ content, commentId }) => updateComment(content, commentId),
    onSuccess: () => {
      toast.success('Comment updated successfully!', { icon: '✏️' });
      setEditingCommentId(null);
      setEditText('');
      
      // Invalidate queries
      queryclient.invalidateQueries({ queryKey: ['post comments', post._id] });
      queryclient.invalidateQueries({ queryKey: ['all posts'] });
      queryclient.invalidateQueries({ queryKey: ['single post', post._id] });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to update comment.';
      toast.error(errorMessage);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      toast.success('Comment deleted successfully!', { icon: '🗑️' });
      
      // Clear delete confirmation
      setDeleteConfirmId(null);
      
      // Invalidate queries
      queryclient.invalidateQueries({ queryKey: ['post comments', post._id] });
      queryclient.invalidateQueries({ queryKey: ['all posts'] });
      queryclient.invalidateQueries({ queryKey: ['single post', post._id] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to delete comment.';
      
      // Clear delete confirmation on error
      setDeleteConfirmId(null);
      
      // Check if it's a 401 error
      if (error?.response?.status === 401) {
        toast.error('Unable to delete comment. The API server is not allowing this action. Please contact support.', {
          duration: 5000
        });
      } else {
        toast.error(errorMessage);
      }
    }
  });

  function handleSendComment() {
    if (!commentText.trim()) return;
    
    mutate({
      content: commentText,
      post: post._id
    });
  }

  function handleEditComment(comment) {
    setEditingCommentId(comment._id);
    setEditText(comment.content);
  }

  function handleUpdateComment(commentId) {
    if (!editText.trim()) return;
    
    updateMutation.mutate({
      content: editText,
      commentId: commentId
    });
  }

  function handleDeleteComment(commentId) {
    setDeleteConfirmId(commentId);
  }

  function confirmDelete() {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
      // Don't clear deleteConfirmId here - let onSuccess/onError handle it
    }
  }

  function cancelDelete() {
    setDeleteConfirmId(null);
  }

  function handleCancelEdit() {
    setEditingCommentId(null);
    setEditText('');
  }



  return (
    <>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-base-300 text-xs md:text-sm">


        <button
          onClick={() => toggleComments(post._id)}
          className="btn btn-sm btn-ghost gap-2 rounded-full border border-primary/50 text-primary hover:bg-primary/10"
        >
          💬 <span className="font-semibold">{displayComments?.length || 0}</span> Comments
        </button>

        <button
          onClick={() => handleShare(post)}
          className="btn btn-sm btn-ghost gap-2 rounded-full border border-success/40 text-success hover:bg-success/10"
        >
          🔗 Share
        </button>
      </div>

      {openComments === post._id && (
        <div className="mt-5 bg-base-200 border border-base-300 rounded-2xl p-4 md:p-5">
          <h3 className="font-semibold text-base-content mb-3 text-sm md:text-base">
            Comments
          </h3>

          {/* WRITE COMMENT */}
          <div className="flex items-center gap-2 mb-4">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
              disabled={isAddingComment}
              className="input input-sm flex-1 bg-base-100 border-base-300
                         text-base-content placeholder:text-base-content/40
                         focus:outline-none focus:ring-primary/20
                         disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Write a comment..."
            />
            <button 
              onClick={handleSendComment}
              disabled={isAddingComment || !commentText.trim()}
              className="btn btn-sm btn-primary text-primary-content"
            >
              {isAddingComment ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* COMMENTS LIST */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 md:pr-2">
            {commentsLoading ? (
              <div className="flex justify-center p-4">
                <span className="loading loading-spinner loading-sm text-primary"></span>
              </div>
            ) : (
              displayComments?.map((comment, index) => {
              // Gender-based avatar fallback
              const getDefaultAvatar = (gender) => {
                if (gender === 'female') {
                  return 'https://i.pravatar.cc/150?img=47'; // Female avatar
                } else {
                  return 'https://i.pravatar.cc/150?img=12'; // Male avatar
                }
              };

              const avatar =
                comment.commentCreator?.photo &&
                !comment.commentCreator.photo.includes("undefined")
                  ? comment.commentCreator.photo
                  : getDefaultAvatar(comment.commentCreator?.gender);

              return (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-xl bg-base-100 border border-base-300 text-xs md:text-sm"
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-9 h-9 rounded-xl object-cover border border-slate-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-base-content">
                      {comment.commentCreator?.name || "Unknown User"}
                    </p>
                    
                    {editingCommentId === comment._id ? (
                      // Edit mode
                      <div className="mt-2 text-base-content">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateComment(comment._id)}
                          disabled={updateMutation.isPending}
                          className="input input-xs w-full bg-base-200 border-base-300
                                     text-base-content focus:outline-none focus:ring-primary/20"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateComment(comment._id)}
                            disabled={updateMutation.isPending || !editText.trim()}
                            className="btn btn-xs btn-primary text-primary-content"
                          >
                            {updateMutation.isPending ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={updateMutation.isPending}
                            className="btn btn-xs btn-ghost border-base-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <p className="text-base-content/80 text-xs mt-1 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <p className="text-base-content/40 text-[10px] mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Edit/Delete buttons - only show for comment owner */}
                  {userData?._id === comment.commentCreator?._id && editingCommentId !== comment._id && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="btn btn-xs btn-ghost btn-circle border-primary/20 text-primary"
                        title="Edit comment"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        disabled={deleteMutation.isPending}
                        className="btn btn-xs btn-ghost btn-circle border-error/20 text-error"
                        title="Delete comment"
                      >
                        {deleteMutation.isPending && deleteConfirmId === comment._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card bg-base-200 border border-base-300 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/10 border border-error/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">Delete Comment</h3>
                <p className="text-sm opacity-60">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm opacity-70 mb-6">Are you sure you want to delete this comment?</p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteMutation.isPending}
                className="btn btn-ghost border-base-300 flex-1 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="btn btn-error flex-1 rounded-xl text-error-content"
              >
                {deleteMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
