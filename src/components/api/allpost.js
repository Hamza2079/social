import axios from "axios";

const token = localStorage.getItem('token');
export async function getAllPosts() {
    let {data} = await axios.get('https://linked-posts.routemisr.com/posts?limit=50',{
        headers: {
            token: token
        }
    }) 
    return data;
       
}
