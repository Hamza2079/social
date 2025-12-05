import axios from "axios";

export async function getAllPosts() {
    const token = localStorage.getItem('token');
    let {data} = await axios.get('https://linked-posts.routemisr.com/posts?limit=100',{
        headers: {
            token: token
        }
    }) 
    return data;
    
}

