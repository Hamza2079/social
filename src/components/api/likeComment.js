import axios from "axios";

export async function likeComment(postId, commentId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.put(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
