import { getAllPosts } from "../api/allpost";
import { useQuery } from "@tanstack/react-query";
import Loader from "../loader/loader";
import SinglePost from "../singlePost/singlePost";
import { Link } from "react-router-dom";
import Commentitem from "../commentitem/commentitem";

export default function Home() {

  // async function getData() {
  //   const data = await getAllPosts();
  //   setPosts(data.posts);
  // }

  // useEffect(() => {
  //   getData();
  // }, []);


  const {isError,isLoading,error,data} = useQuery({
    queryKey:['all posts'],
    queryFn: getAllPosts,
    select: (data) => data.posts,
    // retry: 4,
    // retryDelay: 2000,
    // refetchInterval: 3000,
  })
console.log("🟩 data: ", data?.posts)


  if(isLoading){
    return <Loader/>
  }
  if(isError){
    return <h1 className="text-red-600">Error: {error.message}</h1>
  } 



  return (
    <div className="min-h-[calc(100vh-80px)] py-6 md:py-10">


      <div className="max-w-3xl mx-auto space-y-8 md:space-y-10">
        {data?.map((post) => (
          <div
            key={post._id}
            className="relative bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-7
                       shadow-[0_18px_45px_rgba(15,23,42,0.9)]
                       hover:border-sky-400 hover:shadow-[0_22px_60px_rgba(15,23,42,0.95)]
                       hover:-translate-y-[2px] transition-all duration-300"
          >
            <Link to={`/postDetails/${post._id}`} className="block">
              <SinglePost post={post}/>
            </Link>

            <div className="mt-4 border-t border-slate-700/60 pt-3">
              <Commentitem post={post}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
