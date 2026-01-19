import axios from "axios";

export async function deleteComment(commentId) {
    const token = localStorage.getItem('token');
    let {data} = await axios.delete(`https://linked-posts.routemisr.com/comments/${commentId}`,
    {
        headers: {
            token: token,
        }
    }
) 
    return data;
    
}
