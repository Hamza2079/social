import axios from "axios";

export async function createPost(formdata) {
    const token = localStorage.getItem('token');
    let {data} = await axios.post('https://linked-posts.routemisr.com/posts',
        formdata,
    {
        headers: {
            token: token,
        }
    }
) 
    return data;
    
}

