import React, { useContext, useEffect, useRef, useState } from "react";
import { convertToWebP } from "../../utils/convertToWebP";
import { tokencontext } from "../../context/tokenContext";
import { useNavigate } from "react-router-dom";
import { getUserPosts } from "../api/getuserpost";
import { getUserProfile } from "../api/getUserProfile";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import Loader from "../loader/loader";
import Errorpage from "../errorpage/errorpage";
import SinglePost from "../singlePost/singlePost";
import CreatePost from "../createPost/createPost";
import Commentitem from "../commentitem/commentitem";
import PostSkeleton from "../PostSkeleton/PostSkeleton";
import { uploadProfilePhoto } from "../api/uploadprofilephoto";
import { changePassword } from "../api/changepassword";
import toast from "react-hot-toast";
import {
  HiOutlineCamera,
  HiOutlineCog6Tooth,
  HiOutlineXMark,
} from "react-icons/hi2";

export default function Profile() {
  const { userData, setToken } = useContext(tokencontext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const observerTarget = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [passwordData, setPasswordData] = React.useState({
    password: "",
    newPassword: "",
  });

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileIsError,
    error: profileError,
  } = useQuery({
    queryKey: ["user-profile", userData?._id],
    queryFn: () => getUserProfile(userData?._id),
    enabled: !!userData?._id,
  });

  const {
    data,
    isLoading: postsLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user posts", "infinite", userData?._id],
    queryFn: ({ pageParam = 1 }) =>
      getUserPosts(userData?._id, { page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.meta?.pagination || lastPage?.pagination;
      if (pagination && pagination.currentPage < pagination.numberOfPages) {
        return pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: !!userData?._id,
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

  const uploadPhotoMutation = useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: () => {
      toast.success("Photo updated!");
      queryClient.invalidateQueries(["loggedUser"]);
      queryClient.invalidateQueries(["user posts"]);
    },
    onError: (e) => toast.error(e?.response?.data?.error || "Upload failed"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed!");
      setShowPasswordModal(false);
      setPasswordData({ password: "", newPassword: "" });
      setTimeout(() => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/");
      }, 1500);
    },
    onError: (e) => toast.error(e?.response?.data?.error || "Failed"),
  });

  const [isConvertingPhoto, setIsConvertingPhoto] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsConvertingPhoto(true);
      try {
        const { blob } = await convertToWebP(file);
        const webpFile = new File([blob], "photo.webp", { type: "image/webp" });
        const fd = new FormData();
        fd.append("photo", webpFile);
        uploadPhotoMutation.mutate(fd);
      } catch {
        toast.error("Failed to process image");
      } finally {
        setIsConvertingPhoto(false);
      }
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.password || !passwordData.newPassword)
      return toast.error("Fill in all fields");
    if (passwordData.newPassword.length < 8)
      return toast.error("8+ characters required");
    changePasswordMutation.mutate(passwordData);
  };

  const posts =
    data?.pages?.flatMap((page) => page?.data?.posts || page?.posts || []) ||
    [];
  console.log("profileData", profileData);
  if (profileIsError) {
    console.error("profileError", profileError);
  }

  const profile =
    profileData?.data?.user || profileData?.user || profileData?.data || {};

  const [followModalConfig, setFollowModalConfig] = useState({
    isOpen: false,
    title: "",
    users: [],
  });

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  if (postsLoading || profileLoading) return <Loader />;
  if (isError) return <Errorpage title="Error" message={error.message} />;

  return (
    <div className="min-h-screen lg:ml-[220px] pb-16 lg:pb-0">
      <div className="max-w-[935px] mx-auto px-4 sm:px-8 py-8">
        {/* Profile header — Instagram style */}
        <div className="flex items-center gap-8 sm:gap-16 mb-10">
          {/* Avatar */}
          <div
            className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-linear-to-br from-primary to-secondary p-[3px] shrink-0 cursor-pointer relative group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-[3px] rounded-full overflow-hidden bg-base-200">
              <img
                src={userData?.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`absolute inset-0 rounded-full bg-black/30 flex items-center justify-center transition-opacity ${isConvertingPhoto || uploadPhotoMutation.isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              {isConvertingPhoto || uploadPhotoMutation.isPending ? (
                <span className="loading loading-spinner loading-sm text-white"></span>
              ) : (
                <HiOutlineCamera className="w-8 h-8 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h1 className="text-xl font-normal">{userData?.name}</h1>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-sm btn-ghost bg-base-200 font-semibold text-sm rounded-lg"
                >
                  <HiOutlineCog6Tooth className="w-4 h-4" /> Settings
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-10 menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300 mt-2"
                >
                  <li>
                    <button onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </button>
                  </li>
                  <li>
                    <button onClick={() => fileInputRef.current?.click()}>
                      Change Profile Photo
                    </button>
                  </li>
                  <li className="text-error">
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-8 text-sm mb-4">
              <span>
                <b>{posts.length}</b> posts
              </span>
              <span
                onClick={() => openFollowModal("Followers", profile.followers)}
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
                onClick={() => openFollowModal("Following", profile.following)}
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

        {/* Divider */}
        <div className="border-t border-base-300"></div>

        {/* Posts tab */}
        <div className="flex justify-center gap-12 text-xs font-semibold tracking-wider uppercase text-base-content/40 -mt-px">
          <span className="border-t border-base-content py-3">Posts</span>
        </div>

        {/* Posts feed */}
        <div className="max-w-[470px] mx-auto space-y-0 mt-4">
          <div className="mb-4">
            <CreatePost query="user posts" />
          </div>
          {posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post._id}
                className="bg-base-100 border border-base-300 sm:rounded-lg mb-3"
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
            ))
          ) : (
            <p className="text-center text-base-content/30 py-16 text-sm">
              No posts yet
            </p>
          )}

          {isFetchingNextPage && (
            <div className="space-y-3">
              <PostSkeleton />
              <PostSkeleton />
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

      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
              <span></span>
              <h3 className="font-bold text-sm">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-4 space-y-3">
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, password: e.target.value })
                }
                placeholder="Current password"
                className="input input-bordered w-full input-sm"
              />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="New password"
                className="input input-bordered w-full input-sm"
              />
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="btn btn-primary btn-sm w-full"
              >
                {changePasswordMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

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
                <div key={u._id} className="flex items-center justify-between">
                  <div
                    onClick={() => {
                      closeFollowModal();
                      navigate(`/user/${u._id}`);
                    }}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={
                        u.photo ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      }
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-base-300 group-hover:border-primary transition-colors"
                    />
                    <div>
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {u.name}
                      </p>
                    </div>
                  </div>
                  {/* Notice: Follow button not shown for self-profile currently as these are just lists. It can be added if needed, but navigate is provided. */}
                  <button
                    onClick={() => {
                      closeFollowModal();
                      navigate(`/user/${u._id}`);
                    }}
                    className="btn btn-sm btn-ghost bg-base-200 text-xs rounded-lg"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
