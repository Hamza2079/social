import axios from "axios";

export async function sharePost(postId, body = "") {
  const token = localStorage.getItem("token");
  let { data } = await axios.post(
    `https://route-posts.routemisr.com/posts/${postId}/share`,
    { body },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return data;
}
