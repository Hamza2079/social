import axios from "axios";

export async function uploadProfilePhoto(formData) {
    const token = localStorage.getItem('token');
    let {data} = await axios.put('https://linked-posts.routemisr.com/users/upload-photo',
        formData,
    {
        headers: {
            token: token,
        }
    }
) 
    return data;
    
}
