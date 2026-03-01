import axios from "axios";

export async function createReply(postId, commentId, formData) {
  const token = localStorage.getItem("token");
  let { data } = await axios.post(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/replies`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

export async function getReplies(postId, commentId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.get(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/replies`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

export async function updateReply(postId, commentId, replyId, formData) {
  const token = localStorage.getItem("token");
  let { data } = await axios.put(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/replies/${replyId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

export async function deleteReply(postId, commentId, replyId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.delete(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/replies/${replyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

export async function likeReply(postId, commentId, replyId) {
  const token = localStorage.getItem("token");
  let { data } = await axios.put(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}
