import React, { useContext } from 'react'
import { tokencontext } from '../../context/tokenContext'
import { getUserPosts } from '../api/getuserpost'
import { useQuery } from '@tanstack/react-query'
import Loader from '../loader/loader'
import Errorpage from '../errorpage/errorpage'
import SinglePost from '../singlePost/singlePost'

export default function Profile() {
  
  const {userData} = useContext(tokencontext)
const{data,isLoading,isError,error}= useQuery({
    queryKey: ['user posts', userData?._id],
    queryFn: () => getUserPosts(userData?._id),
    enabled: !!userData?._id,   // wait until userData is loaded
})
console.log("🟩 data: ", data)

if(isLoading){
    return <Loader/>
}
if(isError){
  return<Errorpage title="Error" message={error.message}/>
}
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="relative h-52 md:h-64 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_transparent_60%)] opacity-80" />
        <img
          src="https://images.pexels.com/photos/8386365/pexels-photo-8386365.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Cover"
          className="w-full h-full object-cover mix-blend-overlay opacity-70"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.9)] bg-slate-900/80">
              <img
                src={userData?.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          
        </div>

        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50">{userData?.name}</h1>
          <p className="text-sm text-slate-400">@{userData?.name}</p>

          <p className="mt-2 text-sm text-slate-300 max-w-xl">
            {userData?.dateOfBirth} • {userData?.gender} • joined {userData?.createdAt}
          </p>

          <div className="flex gap-6 mt-4 text-xs font-medium text-slate-300">
            <p><span className="font-bold text-slate-50">{data?.posts.length}</span> Posts</p>
          </div>
        </div>

        <div className="mt-8 border-b border-slate-700 flex gap-8 text-sm font-medium text-slate-400">
          <button className="pb-3 border-b-2 border-sky-400 text-sky-300">
            Posts
          </button>
        </div>

        <div className="mt-6 space-y-6 pb-10">
          {data?.posts.map((post, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-5
                         shadow-[0_18px_45px_rgba(15,23,42,0.9)]
                         hover:border-sky-400 hover:-translate-y-[2px] transition-all duration-300"
            >
              <SinglePost post={post}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
