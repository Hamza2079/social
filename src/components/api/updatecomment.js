import axios from "axios";

export async function updateComment(formData, commentId, postId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.put(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
