import axios from "axios";

export async function likePost(postId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.put(
    `https://route-posts.routemisr.com/posts/${postId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
