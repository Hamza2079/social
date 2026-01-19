import axios from "axios";

export async function changePassword(passwordData) {
    const token = localStorage.getItem('token');
    let {data} = await axios.patch('https://linked-posts.routemisr.com/users/change-password',
        passwordData,
    {
        headers: {
            token: token,
        }
    }
) 
    return data;
    
}
