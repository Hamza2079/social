import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSinglePost } from "../api/singlepost";
import Loader from "../loader/loader";
import Errorpage from "../errorpage/errorpage";
import SinglePost from "../singlePost/singlePost";
import Commentitem from "../commentitem/commentitem";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function PostDetails() {
  const { id } = useParams();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["single post", id],
    queryFn: () => getSinglePost(id),
    select: (data) => data.data?.post || data.post,
  });

  if (isLoading) return <Loader />;
  if (isError) return <Errorpage title="Error" message={error.message} />;

  return (
    <div className="min-h-screen lg:ml-[220px] pb-16 lg:pb-0">
      <div className="max-w-[470px] mx-auto py-4 px-0 sm:px-4">
        <Link
          to="/home"
          className="flex items-center gap-1 text-sm text-base-content/40 hover:text-base-content mb-4 px-3 sm:px-0"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back
        </Link>
        <article className="bg-base-100 border border-base-300 sm:rounded-lg">
          <SinglePost
            post={data}
            onCommentClick={() => setCommentsOpen((prev) => !prev)}
          />
          <Commentitem post={data} externalOpen={commentsOpen} />
        </article>
      </div>
    </div>
  );
}
