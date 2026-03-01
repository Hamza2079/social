import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFollowSuggestions } from "../api/getFollowSuggestions";
import { followUser } from "../api/followUser";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function FollowSuggestions() {
  const queryClient = useQueryClient();
  const [followedUsers, setFollowedUsers] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["follow-suggestions"],
    queryFn: () => getFollowSuggestions(5),
  });

  const followMutation = useMutation({
    mutationFn: (userId) => followUser(userId),
    onMutate: (userId) =>
      setFollowedUsers((prev) => ({ ...prev, [userId]: !prev[userId] })),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["follow-suggestions"] }),
    onError: (_, userId) => {
      setFollowedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
      toast.error("Failed");
    },
  });

  const raw =
    data?.data?.users ||
    data?.data?.suggestions ||
    data?.users ||
    data?.suggestions ||
    data?.data;
  const suggestions = Array.isArray(raw) ? raw : [];

  if (isLoading) {
    return (
      <div className="py-4">
        <p className="text-sm font-semibold text-base-content/40 mb-4">
          Suggested for you
        </p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-base-300"></div>
              <div className="flex-1">
                <div className="h-3 bg-base-300 rounded w-24"></div>
              </div>
              <div className="h-3 bg-base-300 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions.length) return null;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-base-content/40">
          Suggested for you
        </p>
        <button className="text-xs font-bold text-base-content hover:text-base-content/60">
          See All
        </button>
      </div>
      <div className="space-y-3">
        {suggestions.map((user) => {
          const followed = followedUsers[user._id];
          return (
            <div key={user._id} className="flex items-center gap-3">
              <Link to={`/user/${user._id}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary p-[1.5px]">
                  <img
                    src={user.photo}
                    alt=""
                    className="w-full h-full rounded-full object-cover bg-base-100"
                  />
                </div>
              </Link>
              <Link to={`/user/${user._id}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate hover:text-base-content/60 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-base-content/30">
                  Suggested for you
                </p>
              </Link>
              <button
                onClick={() => followMutation.mutate(user._id)}
                className={`text-xs font-bold ${followed ? "text-base-content/40" : "text-primary hover:text-primary/70"} transition-colors`}
              >
                {followed ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
