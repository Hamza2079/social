import axios from "axios";

export async function changePassword(passwordData) {
  const token = localStorage.getItem("token");
  let { data } = await axios.patch(
    "https://route-posts.routemisr.com/users/change-password",
    passwordData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
