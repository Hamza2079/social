import axios from "axios";

export async function getUserPosts(userId, { limit = 10 } = {}) {
  const token = localStorage.getItem("token");



  let { data } = await axios.get(
    `https://linked-posts.routemisr.com/users/${userId}/posts?limit=${limit}`,
    {
      headers: {
        token: token,
      },
    },
  );

  return data;
}
