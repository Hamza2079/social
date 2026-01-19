import axios from "axios";

export async function getPostComments(postId) {
    const token = localStorage.getItem('token');
    let {data} = await axios.get(`https://linked-posts.routemisr.com/posts/${postId}/comments`,{
        headers: {
            token: token
        }
    }) 
    return data;
    
}
