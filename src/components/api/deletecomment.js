import axios from "axios";

export async function deleteComment(commentId, postId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.delete(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
