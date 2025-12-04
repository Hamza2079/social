import axios from "axios";


export async function getSinglePost(id) {
    const token = localStorage.getItem('token');
    let {data} = await axios.get(`https://linked-posts.routemisr.com/posts/${id}`,{
        headers: {
            token: token
        }
    }) 
    return data;

}
