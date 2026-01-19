import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useParams, Link } from 'react-router-dom';
import { getSinglePost } from '../api/singlepost';
import Loader from "../loader/loader";
import Errorpage from "../errorpage/errorpage";
import SinglePost from '../singlePost/singlePost';
import Commentitem from '../commentitem/commentitem';

export default function PostDetails() {
  const {id} = useParams();
  const {data,isLoading,isError,error}=useQuery({
    queryKey: ['single post', id],
    queryFn: () => getSinglePost(id),
    select: (data) => data.post
  })

  if (isLoading) {
    return <Loader/>
  }
  if(isError){
    return <Errorpage title="Error" message={error.message}/>
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-start justify-center py-8 md:py-12">
      <div className="w-full max-w-3xl mx-auto">
        {/* Back link */}
        <div className="mb-4">
          <Link
            to="/home"
            className="btn btn-sm btn-ghost gap-2 rounded-full border border-primary/40 text-primary"
          >
            ← Back to feed
          </Link>
        </div>

        <div className="card bg-base-200 border border-base-300 shadow-xl p-5 md:p-7">
          <SinglePost post={data}/>
          <div className="mt-5 pt-4 border-t border-base-300">
            <Commentitem post={data}/>
          </div>
        </div>
      </div>
    </div>
  )
}
