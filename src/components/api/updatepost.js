import axios from "axios";

export async function updatePost(formdata,postid) {
    const token = localStorage.getItem('token');
    let {data} = await axios.put(`https://linked-posts.routemisr.com/posts/${postid}`,
        formdata,
    {
        headers: {
            token: token,
        }
    }
) 
    return data;
    
}

