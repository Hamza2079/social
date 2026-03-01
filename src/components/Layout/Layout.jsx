import React, { useContext } from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { tokencontext } from "../../context/tokenContext";

export default function Layout() {
  const { token } = useContext(tokencontext);
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
