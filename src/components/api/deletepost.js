import axios from "axios";

export async function deletePost(postid) {
    const token = localStorage.getItem('token');
    let {data} = await axios.delete(`https://linked-posts.routemisr.com/posts/${postid}`,{
        headers: {
            token: token
        }
    }) 
    return data;
    
}

