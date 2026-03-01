import axios from "axios";

export async function getUserPosts(userId, { page = 1, limit = 10 } = {}) {
  const token = localStorage.getItem("token");

  let { data } = await axios.get(
    `https://route-posts.routemisr.com/users/${userId}/posts?page=${page}&limit=${limit}&sort=-createdAt`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}
