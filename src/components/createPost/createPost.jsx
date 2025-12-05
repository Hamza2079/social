import React, { useContext, useState } from 'react'
import { tokencontext } from '../../context/tokenContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost } from '../api/createpost'
import toast from 'react-hot-toast'
export default function CreatePost({query}) {
  const { userData } = useContext(tokencontext)
  const [postBody, setPostBody] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [showcreatepost,setShowcreatepost] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [image, setImage] = useState(null)
  const queryclient = useQueryClient()
  const {isLoading, mutate} = useMutation({
    mutationFn:createPost,
    onSuccess:()=>{
      // Show success toast
      toast.success('Post created successfully!', {
        icon: '✅',
      })
      
      // Reset form
      setPostBody('')
      setImagePreview(null)
      setImage(null)
      setShowcreatepost(false)
      handleClose()
      
      // Invalidate queries to refresh the feed
      queryclient.invalidateQueries({
        queryKey:[query]
      })
    },
    onError: (error) => {
      // Show error toast
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create post. Please try again.'
      toast.error(errorMessage)
    }
  })
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
  setImagePreview(null);
  setImage(null);   
};


  const handleOpen = () => {
    setIsClosing(false)
    setShowcreatepost(true)
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowcreatepost(false)
      setIsClosing(false)
    }, 300)
  }

  function handleSubmit() {
    const formdata = new FormData();
    if (postBody) {
      formdata.append('body', postBody);
    }
        if (image) {
      formdata.append('image', image);
    }
    mutate(formdata);
    }

  return (
    
    <>
    {
      showcreatepost ? (
      <div className={`py-6 md:py-10 transition-all duration-300 ease-out ${
        isClosing ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className={`bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-7
                        shadow-[0_18px_45px_rgba(15,23,42,0.9)]
                        hover:border-sky-400 transition-all duration-300 ease-out ${
                          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}>
          
          {/* Header with user info */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={userData?.photo}
              alt="user"
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-sky-400/70 object-cover shadow-[0_8px_30px_rgba(56,189,248,0.35)]"
            />
            <div>
              <p className="font-semibold text-slate-50 text-base md:text-lg">
                {userData?.name}
              </p>
              <p className="text-xs text-slate-400">
                Create a new post
              </p>
            </div>
            <button onClick={handleClose} className="px-6 ml-auto py-2 fle rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold
            hover:bg-sky-400 hover:shadow-[0_12px_30px_rgba(56,189,248,0.4)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            </button>
          </div>

          {/* Textarea for post content */}
          <div className="mb-4">
            <textarea
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] md:min-h-[150px] p-4 rounded-2xl
                         bg-slate-950/60 border border-slate-700/80
                         text-slate-50 placeholder:text-slate-500
                         focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20
                         resize-none transition-all duration-200"
            />
            <p className="mt-2 text-xs text-slate-400 text-right">
              {postBody.length} characters
            </p>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="mb-4 relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.95)]">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-[420px] object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/90 backdrop-blur-sm
                           border border-red-400/50 text-red-400 hover:bg-red-500/20
                           transition-all duration-200 shadow-lg"
                title="Remove image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-700/60">
            {/* Image upload button */}
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl
                            bg-slate-900/80 border border-sky-400/50 text-sky-100 text-sm
                            hover:bg-slate-800 hover:border-sky-400 cursor-pointer
                            transition-all duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">Add Image</span>
              <span className="sm:hidden">Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Submit button */}
            <button
            onClick={handleSubmit}
              disabled={!postBody.trim() || isLoading}
              className="px-6 py-2 rounded-xl bg-sky-500 text-slate-950 text-sm font-semibold
                         hover:bg-sky-400 hover:shadow-[0_12px_30px_rgba(56,189,248,0.4)]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
    ) : (
      <div className={`flex-col my-6 max-w-3xl mx-auto justify-center transition-all duration-300 ease-out opacity-100 translate-y-0`}>   
      <button onClick={handleOpen} className="flex items-center justify-between px-6 w-full py-2 fle rounded-xl bg-slate-900 text-slate-950 text-sm font-semibold
      hover:border border-sky-400/70 hover:shadow-[0_12px_30px_rgba(56,189,248,0.4)]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200">
<input className='input rounded-2xl border border-sky-400/70 disabled:opacity-50 disabled:cursor-not-allowed w-7/8 bg-slate-900/60 text-slate-50 placeholder:text-slate-500' type="text" placeholder="What's on your mind?" />
<img src={userData?.photo} alt="user" className='w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-sky-400/70 object-cover shadow-[0_8px_30px_rgba(56,189,248,0.35)]' />
</button>
</div>
   
    )
    }
    
    </>
  )
}
