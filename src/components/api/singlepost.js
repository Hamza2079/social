import axios from "axios";

export async function getSinglePost(id) {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    `https://route-posts.routemisr.com/posts/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
