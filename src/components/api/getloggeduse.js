import axios from "axios";

export async function getloggeduser() {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    "https://route-posts.routemisr.com/users/profile-data",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
