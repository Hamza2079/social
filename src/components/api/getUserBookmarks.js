import axios from "axios";

export async function getUserBookmarks() {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    "https://route-posts.routemisr.com/users/bookmarks",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
