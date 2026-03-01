import axios from "axios";

export async function getPostLikes(postId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    `https://route-posts.routemisr.com/posts/${postId}/likes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
