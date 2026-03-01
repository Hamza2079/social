import { createContext, useEffect, useState } from "react";

export const themeContext = createContext();

export default function ThemeContextProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "socialdark",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prevTheme) =>
      prevTheme === "socialdark" ? "sociallight" : "socialdark",
    );
  }

  return (
    <themeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </themeContext.Provider>
  );
}
