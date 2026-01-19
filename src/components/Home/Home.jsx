import { getAllPosts } from "../api/allpost";
import { useQuery } from "@tanstack/react-query";
import Loader from "../loader/loader";
import SinglePost from "../singlePost/singlePost";
import { Link } from "react-router-dom";
import Commentitem from "../commentitem/commentitem";
import CreatePost from "../createPost/createPost";

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
console.log("🟩 data: ", data)


  if(isLoading){
    return <Loader/>
  }
  if(isError){
    return <h1 className="text-red-600">Error: {error.message}</h1>
  } 



  return (
    <div className="min-h-[calc(100vh-80px)] py-6 md:py-10">
      <CreatePost query='all posts'/>

      <div className="max-w-3xl mx-auto space-y-8 md:space-y-10">
        {data?.map((post) => (
          <div
            key={post._id}
            className="card bg-base-200 border border-base-300 shadow-xl
                       hover:border-primary/50 transition-all duration-300"
          >
            <div className="card-body p-5 md:p-7">
              <Link to={`/postDetails/${post._id}`} className="block">
                <SinglePost post={post}/>
              </Link>

              <div className="mt-4 border-t border-base-300 pt-3">
                <Commentitem post={post}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
