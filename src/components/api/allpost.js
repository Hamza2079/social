import axios from "axios";

export async function getAllPosts({ page = 1, limit = 10 } = {}) {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    `https://route-posts.routemisr.com/posts?page=${page}&limit=${limit}&sort=-createdAt`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
