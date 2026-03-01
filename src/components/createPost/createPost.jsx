import React, { useContext, useEffect, useState } from "react";
import { tokencontext } from "../../context/tokenContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/createpost";
import { updatePost } from "../api/updatepost";
import toast from "react-hot-toast";
import { convertToWebP } from "../../utils/convertToWebP";
export default function CreatePost({
  query = "all posts",
  mode = "create",
  post = null,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { userData } = useContext(tokencontext);
  const [postBody, setPostBody] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showcreatepost, setShowcreatepost] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [image, setImage] = useState(null);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const queryclient = useQueryClient();
  const isControlled = typeof isOpen === "boolean";
  const isEditMode = mode === "edit" && post?._id;

  useEffect(() => {
    if (isEditMode && post) {
      setPostBody(post.body || "");
      setImagePreview(post.image || null);
      setImage(null);
    }
  }, [isEditMode, post]);

  const { isPending, mutate } = useMutation({
    mutationFn: (payload) => {
      if (isEditMode) {
        return updatePost(payload.formdata, payload.postid);
      }
      return createPost(payload.formdata);
    },
    onSuccess: () => {
      // Show success toast
      toast.success(
        isEditMode
          ? "Post updated successfully!"
          : "Post created successfully!",
        {
          icon: "✅",
        },
      );

      // Reset form
      setPostBody("");
      setImagePreview(null);
      setImage(null);
      if (!isControlled) {
        setShowcreatepost(false);
      }
      handleClose();

      // Invalidate queries to refresh the feed
      queryclient.invalidateQueries({
        queryKey: [query],
      });
      queryclient.invalidateQueries({
        queryKey: ["all posts"],
      });
      queryclient.invalidateQueries({
        queryKey: ["user posts"],
      });
      if (isEditMode && post?._id) {
        queryclient.invalidateQueries({
          queryKey: ["single post", post._id],
        });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      // Show error toast
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create post. Please try again.";
      toast.error(errorMessage);
    },
  });
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsConvertingImage(true);
      try {
        const { dataUrl, blob } = await convertToWebP(file);
        const webpFile = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, ".webp"),
          { type: "image/webp" },
        );
        setImage(webpFile);
        setImagePreview(dataUrl);
      } catch {
        toast.error("Failed to process image");
      } finally {
        setIsConvertingImage(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImage(null);
  };

  const handleOpen = () => {
    if (isControlled) return;
    setIsClosing(false);
    setShowcreatepost(true);
  };

  const handleClose = () => {
    if (isControlled) {
      if (onClose) onClose();
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      setShowcreatepost(false);
      setIsClosing(false);
    }, 300);
  };

  function handleSubmit() {
    const formdata = new FormData();
    if (postBody) {
      formdata.append("body", postBody);
    }
    if (image) {
      formdata.append("image", image);
    }
    if (isEditMode) {
      mutate({ formdata, postid: post._id });
    } else {
      mutate({ formdata });
    }
  }

  return (
    <>
      {(isControlled ? isOpen : showcreatepost) ? (
        <div
          className={`py-6 md:py-10 transition-all duration-300 ease-out ${
            isClosing ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="max-w-3xl mx-auto px-4">
            <div
              className={`bg-base-200 border border-base-300 rounded-3xl p-5 md:p-7
                        shadow-xl
                        hover:border-primary/50 transition-all duration-300 ease-out ${
                          isClosing
                            ? "opacity-0 scale-95"
                            : "opacity-100 scale-100"
                        }`}
            >
              {/* Header with user info */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={userData?.photo}
                  alt="user"
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-sky-400/70 object-cover shadow-[0_8px_30px_rgba(56,189,248,0.35)]"
                />
                <div>
                  <p className="font-semibold text-base-content text-base md:text-lg">
                    {userData?.name}
                  </p>
                  <p className="text-xs opacity-60">Create a new post</p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-6 ml-auto py-2 rounded-xl bg-primary text-primary-content text-sm font-semibold
            hover:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200"
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

              {/* Textarea for post content */}
              <div className="mb-4">
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[120px] md:min-h-[150px] p-4 rounded-2xl
                         bg-base-100 border border-base-300
                         text-base-content placeholder:text-base-content/50
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                         resize-none transition-all duration-200"
                />
                <p className="mt-2 text-xs opacity-60 text-right">
                  {postBody.length} characters
                </p>
              </div>

              {/* Image preview */}
              {(imagePreview || isConvertingImage) && (
                <div className="mb-4 relative rounded-2xl overflow-hidden border border-base-300 bg-base-300 shadow-md">
                  {isConvertingImage && !imagePreview ? (
                    <div className="w-full h-[200px] flex items-center justify-center gap-2">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                      <span className="text-sm text-base-content/50">
                        Converting image...
                      </span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-[420px] object-cover"
                      />
                      {isConvertingImage && (
                        <div className="absolute inset-0 bg-base-300/60 flex items-center justify-center">
                          <span className="loading loading-spinner loading-md text-primary"></span>
                        </div>
                      )}
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
                    </>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-base-300">
                {/* Image upload button */}
                <label
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                            bg-base-300 border border-base-300 text-base-content text-sm
                            hover:bg-base-200 cursor-pointer
                            transition-all duration-200"
                >
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
                  disabled={!postBody.trim() || isPending || isConvertingImage}
                  className="px-6 py-2 rounded-xl bg-primary text-primary-content text-sm font-semibold
                         hover:shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
                >
                  {isPending
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update"
                      : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !isControlled && (
          <div
            className={`flex-col my-6 max-w-3xl mx-auto justify-center transition-all duration-300 ease-out opacity-100 translate-y-0`}
          >
            <button
              onClick={handleOpen}
              className="flex items-center justify-between px-6 w-full py-2 rounded-xl bg-base-200 text-base-content text-sm font-semibold
        hover:border border-primary transition-all duration-200"
            >
              <input
                className="input rounded-2xl border border-base-300 disabled:opacity-50 disabled:cursor-not-allowed w-7/8 bg-base-100 text-base-content placeholder:text-base-content/50"
                type="text"
                placeholder="What's on your mind?"
              />
              <img
                src={userData?.photo}
                alt="user"
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-base-300 object-cover shadow-md"
              />
            </button>
          </div>
        )
      )}
    </>
  );
}
