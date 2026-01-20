import React, { useContext, useRef, useEffect } from "react";
import { tokencontext } from "../../context/tokenContext";
import { useNavigate } from "react-router-dom";
import { getUserPosts } from "../api/getuserpost";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../loader/loader";
import PostSkeleton from "../PostSkeleton/PostSkeleton";
import Errorpage from "../errorpage/errorpage";
import SinglePost from "../singlePost/singlePost";
import CreatePost from "../createPost/createPost";
import Commentitem from "../commentitem/commentitem";
import { uploadProfilePhoto } from "../api/uploadprofilephoto";
import { changePassword } from "../api/changepassword";
import toast from "react-hot-toast";

export default function Profile() {
  const { userData, setToken } = useContext(tokencontext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({
    password: "",
    newPassword: "",
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user posts", userData?._id],
    queryFn: () => getUserPosts(userData?._id, { limit: 50 }),
    enabled: !!userData?._id,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: (data) => {
      toast.success("Profile picture updated successfully!", {
        icon: "📸",
      });
      queryClient.invalidateQueries(["loggedUser"]);
      queryClient.invalidateQueries(["user posts", userData?._id]);
    },
    onError: (error) => {
      console.error("❌ Profile photo upload failed:", error);
      console.error("Error response:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to upload profile picture. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show loading toast
      toast.loading("Uploading profile picture...", {
        id: "upload-photo",
      });

      const formData = new FormData();
      formData.append("photo", file);

      uploadPhotoMutation.mutate(formData, {
        onSettled: () => {
          // Dismiss loading toast when done (success or error)
          toast.dismiss("upload-photo");
        },
      });
    }
  };

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success("Password changed successfully! Logging out...", {
        icon: "🔒",
      });
      setShowPasswordModal(false);
      setPasswordData({ password: "", newPassword: "" });

      // Logout after password change
      setTimeout(() => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/");
      }, 1500); // Give time for user to see the success message
    },
    onError: (error) => {
      console.error("❌ Password change failed:", error);
      console.error("Error response:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to change password. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwordData.password || !passwordData.newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate new password
    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error(
        "Password must contain: uppercase, lowercase, number, and special character (#?!@$%^&*-)",
      );
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return <Loader />;
  }
  if (isError) {
    return <Errorpage title="Error" message={error.message} />;
  }
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="relative h-52 md:h-64 overflow-hidden bg-base-300">
        <div className="absolute inset-0 bg-base-200" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--primary),transparent_60%)] opacity-20" />
        <img
          src="https://images.pexels.com/photos/8386365/pexels-photo-8386365.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Cover"
          className="w-full h-full object-cover mix-blend-overlay opacity-30"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="relative">
            <div
              onClick={handleProfilePicClick}
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-base-100 shadow-xl bg-base-200 cursor-pointer group relative"
            >
              <img
                src={userData?.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleProfilePicClick}
              className="btn btn-sm btn-primary btn-outline gap-2 rounded-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Change Photo
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-sm btn-ghost border-base-300 gap-2 rounded-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Change Password
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-base-content">
            {userData?.name}
          </h1>
          <p className="text-sm opacity-60">@{userData?.name}</p>

          <p className="mt-2 text-sm opacity-70 max-w-xl">
            {userData?.dateOfBirth} • {userData?.gender} • joined{" "}
            {userData?.createdAt}
          </p>

          <div className="flex gap-6 mt-4 text-xs font-medium opacity-70">
            <p>
              <span className="font-bold text-base-content">
                {data?.posts?.length || 0}
              </span>{" "}
              Posts
            </p>
          </div>
        </div>

        <div className="mt-8 border-b border-base-300 flex gap-8 text-sm font-medium">
          <button className="pb-3 border-b-2 border-primary text-primary">
            Posts
          </button>
        </div>

        <div className="mt-6 space-y-6 pb-10">
          <CreatePost query={"user posts"} />
          {data?.posts
            ?.slice()
            .reverse()
            .map((post, index) => (
              <div
                key={post._id}
                className="card bg-base-200 border border-base-300 shadow-xl p-5
            hover:border-primary/50 transition-all duration-300"
              >
                <SinglePost post={post} />
                <Commentitem post={post} />
              </div>
            ))}

          {/* No posts at all */}
          {(!data?.posts || data.posts.length === 0) && (
            <div className="text-center py-12 text-base-content/50">
              <p className="text-lg">
                No posts yet. Create your first post! ✨
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-base-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card bg-base-200 border border-base-300 p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-base-content flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Change Password
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 opacity-60"
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

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium opacity-70 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="input w-full bg-base-100 border border-base-300
                             text-base-content placeholder:opacity-40
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                             transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium opacity-70 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="input w-full bg-base-100 border border-base-300
                             text-base-content placeholder:opacity-40
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                             transition-all duration-200"
                />
                <p className="mt-2 text-xs opacity-50">
                  Must be 8+ characters with uppercase, lowercase, number, and
                  special character (#?!@$%^&*-)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-ghost border-base-300 flex-1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="btn btn-primary flex-1 rounded-xl text-primary-content"
                >
                  {changePasswordMutation.isPending
                    ? "Changing..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
