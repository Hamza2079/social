import axios from "axios";

export async function getUserProfile(userId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    `https://route-posts.routemisr.com/users/${userId}/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  
  return data;
}
