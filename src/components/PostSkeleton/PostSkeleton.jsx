import React from "react";

export default function PostSkeleton() {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl animate-pulse">
      <div className="card-body p-5 md:p-7">
        {/* User Info Skeleton */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-base-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-base-300 rounded w-32"></div>
            <div className="h-3 bg-base-300 rounded w-24"></div>
          </div>
        </div>

        {/* Post Content Skeleton */}
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-base-300 rounded w-full"></div>
          <div className="h-4 bg-base-300 rounded w-5/6"></div>
          <div className="h-4 bg-base-300 rounded w-4/6"></div>
        </div>

        {/* Image Skeleton */}
        <div className="h-64 bg-base-300 rounded-2xl mb-4"></div>

        {/* Actions Skeleton */}
        <div className="flex gap-4 pt-4 border-t border-base-300">
          <div className="h-8 bg-base-300 rounded-full w-28"></div>
          <div className="h-8 bg-base-300 rounded-full w-24"></div>
        </div>
      </div>
    </div>
  );
}
