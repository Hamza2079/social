import { createContext, useEffect, useState } from "react";
import { getloggeduser } from "../components/api/getloggeduse";

export const tokencontext = createContext();
export default function Tokencontextprovider({ children }) {
  const [userData, setUserDAta] = useState(null);
  const [token, setToken] = useState(null);

  async function getloggedusers() {
    const res = await getloggeduser()
    setUserDAta(res.user);
  }

  // Load user data whenever we have a token (on first load OR after login)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    // If we don't have a token in state but there is one in storage, sync it
    if (!token && storedToken) {
      setToken(storedToken);
    }

    // If we now have a token, fetch the logged-in user data
    if (token || storedToken) {
      getloggedusers();
    }
  }, [token]);

  return (
    <tokencontext.Provider value={{ token, setToken, userData }}>
      {children}
    </tokencontext.Provider>
  );
}
