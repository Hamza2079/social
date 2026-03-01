import axios from "axios";

export async function uploadProfilePhoto(formData) {
  const token = localStorage.getItem("token");
  let { data } = await axios.put(
    "https://route-posts.routemisr.com/users/upload-photo",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
