import axios from "axios";

export async function getloggeduser() {
    const token = localStorage.getItem('token');
    let {data} = await axios.get('https://linked-posts.routemisr.com/users/profile-data',{
        headers: {
            token: token
        }
    }) 
    return data;
    
}

