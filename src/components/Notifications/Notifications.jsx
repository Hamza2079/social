import React, { useState, useRef, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  getNotification,
  markNotificationAsRead,
} from "../api/notifications";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiHeart,
  HiChatBubbleOvalLeft,
  HiUserPlus,
  HiShare,
} from "react-icons/hi2";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ["notification-count"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
  });

  const {
    data: notifsData,
    isLoading: notifsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications", filter],
    queryFn: ({ pageParam = 1 }) =>
      getNotification(pageParam, filter === "unread"),
    getNextPageParam: (lastPage) => {
      // The API returns meta.pagination object
      const pagination = lastPage?.meta?.pagination;
      if (pagination && pagination.currentPage < pagination.numberOfPages) {
        return pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: isOpen, // Only fetch when dropdown opens
  });

  const notifications =
    notifsData?.pages?.flatMap(
      (page) => page?.data?.notifications || page?.notifications || [],
    ) || [];

  const getNotificationDetails = (type) => {
    switch (type) {
      case "like_post":
        return {
          text: "liked your post.",
          icon: <HiHeart className="w-4 h-4 text-error" />,
        };
      case "comment_post":
        return {
          text: "commented on your post.",
          icon: <HiChatBubbleOvalLeft className="w-4 h-4 text-primary" />,
        };
      case "share_post":
        return {
          text: "shared your post.",
          icon: <HiShare className="w-4 h-4 text-success" />,
        };
      case "follow_user":
        return {
          text: "started following you.",
          icon: <HiUserPlus className="w-4 h-4 text-info" />,
        };
      default:
        return {
          text: "interacted with you.",
          icon: <HiOutlineBell className="w-4 h-4" />,
        };
    }
  };

  const unreadCount = countData?.data?.count || countData?.count || 0;

  const markReadMutation = useMutation({
    mutationFn: (id) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      toast.success("Notifications cleared");
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm btn-circle relative"
      >
        <HiOutlineBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error rounded-full text-[10px] font-bold text-error-content flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-64 md:w-80 bg-base-100 border border-base-300 rounded-lg shadow-xl overflow-hidden">
          <div className="flex flex-col border-b border-base-300 bg-base-200/50">
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-bold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <HiOutlineCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="flex px-3 gap-4 text-sm mt-1">
              <button
                className={`pb-2.5 font-medium border-b-2 transition-colors ${filter === "all" ? "border-primary text-base-content" : "border-transparent text-base-content/60 hover:text-base-content"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter("all");
                }}
              >
                All
              </button>
              <button
                className={`pb-2.5 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${filter === "unread" ? "border-primary text-base-content" : "border-transparent text-base-content/60 hover:text-base-content"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter("unread");
                }}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="bg-error text-error-content text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto w-full">
            {notifsLoading ? (
              <div className="p-8 flex justify-center">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-base-300">
                {notifications.map((notif) => {
                  const details = getNotificationDetails(notif.type);
                  // Link to post details if it relates to a post, else to their profile
                  const linkTo =
                    notif.entityType === "post" && notif.entityId
                      ? `/postDetails/${notif.entityId}`
                      : `/user/${notif.actor?._id}`;

                  return (
                    <Link
                      key={notif._id}
                      to={linkTo}
                      onClick={() => {
                        setIsOpen(false);
                        if (!notif.isRead) {
                          markReadMutation.mutate(notif._id);
                        }
                      }}
                      className={`flex gap-3 p-3 hover:bg-base-200 transition-colors ${!notif.isRead ? "bg-base-200/50" : ""}`}
                    >
                      <img
                        src={
                          notif.actor?.photo ||
                          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-tight text-base-content/90">
                          <span className="font-semibold">
                            {notif.actor?.name || "Someone"}
                          </span>{" "}
                          {details.text}
                        </p>
                        <span className="text-xs text-base-content/50 mt-1 block">
                          {new Date(notif.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <div className="shrink-0 mt-1">{details.icon}</div>
                    </Link>
                  );
                })}
                {hasNextPage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchNextPage();
                    }}
                    disabled={isFetchingNextPage}
                    className="w-full py-3 text-sm font-semibold text-primary hover:bg-base-200 transition-colors"
                  >
                    {isFetchingNextPage ? (
                      <span className="loading loading-spinner text-primary loading-sm"></span>
                    ) : (
                      "Show More"
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-base-content/50">
                <HiOutlineBell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
