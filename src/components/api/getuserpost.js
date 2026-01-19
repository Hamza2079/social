import axios from "axios";

export async function getUserPosts(userId) {
    const token = localStorage.getItem('token');

    let {data} = await axios.get(
        `https://linked-posts.routemisr.com/users/${userId}/posts?limit=50`,
        {
            headers: {
                token: token
            }
        }
    );

    return data;
}
