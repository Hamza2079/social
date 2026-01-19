import axios from "axios";

export async function createComment({content,post}) {
    const token = localStorage.getItem('token');
    let {data} = await axios.post('https://linked-posts.routemisr.com/comments',
        {content,post},
    {
        headers: {
            token: token,
        }
    }
) 
    return data;
    
}

