import axios from "axios";

export async function getNotification(page = 1, unread = false) {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    `https://route-posts.routemisr.com/notifications?unread=${unread}&page=${page}&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
export async function getUnreadNotificationCount() {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    "https://route-posts.routemisr.com/notifications/unread-count",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

export async function markNotificationAsRead(notificationId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.patch(
    `https://route-posts.routemisr.com/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

export async function markAllNotificationsAsRead() {
  const token = localStorage.getItem("token");
  let { data } = await axios.patch(
    "https://route-posts.routemisr.com/notifications/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
