import axios from "axios";

export async function followUser(userId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.put(
    `https://route-posts.routemisr.com/users/${userId}/follow`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
