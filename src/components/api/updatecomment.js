import axios from "axios";

export async function updateComment(content, commentId) {
    const token = localStorage.getItem('token');
    let {data} = await axios.put(`https://linked-posts.routemisr.com/comments/${commentId}`,
        {content},
    {
        headers: {
            token: token,
        }
    }
) 
    return data;
    
}
