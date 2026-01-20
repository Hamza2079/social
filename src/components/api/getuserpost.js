import axios from "axios";

export async function getUserPosts(userId, { limit = 10 } = {}) {
  const token = localStorage.getItem("token");

  ("getUserPosts - userId:", userId);
  ("getUserPosts - token:", token);

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
