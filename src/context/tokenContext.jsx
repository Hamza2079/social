import { createContext, useEffect, useState } from "react";

export const tokencontext = createContext()
export default function Tokencontextprovider({children}) {

const [token,setToken] = useState(null)

useEffect(()=>{
    if(localStorage.getItem('token')){
        setToken(localStorage.getItem('token'))
    }
},[])

    return(
        <tokencontext.Provider value={{token,setToken}}>
            {children}
        </tokencontext.Provider>
    )
}