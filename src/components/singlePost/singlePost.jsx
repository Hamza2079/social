import React, { useContext, useState, useRef, useEffect } from 'react'
import { tokencontext } from '../../context/tokenContext'
import styles from './singlePost.module.css'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../api/deletepost'
import CreatePost from '../createPost/createPost'
import toast from 'react-hot-toast'

export default function SinglePost({post}) {
  const queryclient = useQueryClient()
  
  const {userData} = useContext(tokencontext)
  const [showMenu, setShowMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef(null)
  console.log(post);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])
  const {isPending: isDeleting, mutate} = useMutation({
    mutationFn:(postid) => deletePost(postid),
    onSuccess: () => {
      toast.success('Post deleted successfully!', { icon: '🗑️' });
      
      // Close modal
      setShowDeleteConfirm(false);
      
      // Invalidate queries
      queryclient.invalidateQueries({ queryKey: ['all posts'] });
      queryclient.invalidateQueries({ queryKey: ['user posts'] });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to delete post.';
      toast.error(errorMessage);
      
      // Close modal on error
      setShowDeleteConfirm(false);
    }
  })
  const handleEdit = () => {
    setShowMenu(false)
    setShowEditModal(true)
  }

  const handleDelete = () => {
    setShowMenu(false)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    mutate(post._id)
    // Don't close modal here - let onSuccess/onError handle it
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }
  
  return (
    <div className="space-y-4">
      {/* USER */}
      <div className='flex items-center justify-between'>
        <div className="flex items-center gap-4">
        <img
          src={post.user?.photo}
          alt="user"
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-sky-400/70 object-cover shadow-[0_8px_30px_rgba(56,189,248,0.35)]"
        />
        <div>
          <p className="font-semibold text-base-content text-base md:text-lg">
            {post.user?.name}
          </p>
          <p className="text-xs opacity-60">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        </div>
        {userData?._id === post?.user?._id && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-2 rounded-lg hover:bg-base-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Post options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 opacity-60 hover:opacity-100 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {showMenu && (
              <div className={`absolute right-0 top-10 z-10 w-40 bg-base-200 border border-base-300 rounded-xl shadow-xl overflow-hidden ${styles.animateFadeIn}`}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEdit()
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm text-base-content hover:bg-base-300 transition-colors duration-150 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-sky-400 group-hover:text-sky-300 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDelete()
                  }}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors duration-150 group border-t border-base-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>
                    {isDeleting ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Delete Post'
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
  
      {/* BODY */}
      <p className="text-sm md:text-base leading-relaxed text-base-content whitespace-pre-wrap">
        {post.body}
      </p>

      {/* IMAGE */}
      {post.image && (
        <div className="rounded-2xl overflow-hidden border border-base-300 bg-base-300 shadow-md">
          <img
            src={post.image}
            alt="post"
            className="w-full max-h-[420px] object-cover hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      )}
      {showEditModal && (
        <div className="mt-4">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card bg-base-200 border border-base-300 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-error/10 border border-error/40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">Delete Post</h3>
                <p className="text-sm opacity-60">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm opacity-70 mb-6">Are you sure you want to delete this post? All comments will also be deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="btn btn-ghost border-base-300 flex-1 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="btn btn-error flex-1 rounded-xl text-error-content"
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
