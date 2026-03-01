import axios from "axios";

export async function createComment({ content, post, image }) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("content", content);
  if (image) formData.append("image", image);
  let { data } = await axios.post(
    `https://route-posts.routemisr.com/posts/${post}/comments`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
