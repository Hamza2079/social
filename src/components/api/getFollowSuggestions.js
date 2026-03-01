import axios from "axios";

export async function getFollowSuggestions(limit = 10) {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    `https://route-posts.routemisr.com/users/suggestions?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
