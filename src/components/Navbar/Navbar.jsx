import { tokencontext } from "../../context/tokenContext";
import { themeContext } from "../../context/ThemeContext";
import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavLink, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getAllPosts } from "../api/allpost";
import { getUserPosts } from "../api/getuserpost";
import Notifications from "../Notifications/Notifications";
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineHome,
  HiHome,
  HiOutlineMagnifyingGlass,
  HiOutlinePlusCircle,
  HiOutlineUser,
  HiUser,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

export default function Navbar() {
  const { token, setToken, userData } = useContext(tokencontext);
  const { theme, toggleTheme } = useContext(themeContext);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && userData?._id) {
      queryClient.prefetchInfiniteQuery({
        queryKey: ["all posts"],
        queryFn: ({ pageParam = 1 }) =>
          getAllPosts({ page: pageParam, limit: 10 }),
        initialPageParam: 1,
      });
      queryClient.prefetchQuery({
        queryKey: ["user posts", userData._id],
        queryFn: () => getUserPosts(userData._id, { limit: 50 }),
      });
    }
  }, [token, userData?._id, queryClient]);

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  }

  const isHome = location.pathname === "/home";
  const isProfile = location.pathname === "/profile";

  return (
    <>
      {/* Desktop sidebar */}
      {token && (
        <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] border-r border-base-300 bg-base-100 flex-col z-40 py-8 px-4">
          <Link
            to="/home"
            className="text-xl font-bold tracking-tight mb-10 px-3"
          >
            <span className="text-primary">Linked</span>
            <span className="text-base-content/60">/Post</span>
          </Link>

          <div className="flex-1 flex flex-col gap-1">
            <NavLink
              to="/home"
              className={`flex items-center gap-4 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-base-200 ${isHome ? "font-bold" : "font-normal text-base-content/70"}`}
            >
              {isHome ? (
                <HiHome className="w-6 h-6" />
              ) : (
                <HiOutlineHome className="w-6 h-6" />
              )}{" "}
              Home
            </NavLink>
            <NavLink
              to="/profile"
              className={`flex items-center gap-4 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-base-200 ${isProfile ? "font-bold" : "font-normal text-base-content/70"}`}
            >
              {isProfile ? (
                <HiUser className="w-6 h-6" />
              ) : (
                <HiOutlineUser className="w-6 h-6" />
              )}{" "}
              Profile
            </NavLink>
            <div className="flex items-center gap-4 px-3 py-3">
              <Notifications />
              <span className="text-sm text-base-content/70">
                Notifications
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-4 px-3 py-3 rounded-lg text-sm text-base-content/70 hover:bg-base-200 transition-colors"
            >
              {theme === "socialdark" ? (
                <HiOutlineSun className="w-6 h-6" />
              ) : (
                <HiOutlineMoon className="w-6 h-6" />
              )}
              {theme === "socialdark" ? "Light mode" : "Dark mode"}
            </button>
          </div>

          <div className="mt-auto pt-4 border-t border-base-300">
            <div className="flex items-center gap-3 px-3 py-2">
              <img
                src={userData?.photo}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium truncate flex-1">
                {userData?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-3 py-3 mt-1 rounded-lg text-sm text-error/70 hover:bg-error/5 hover:text-error w-full transition-colors"
            >
              <HiOutlineArrowRightOnRectangle className="w-6 h-6" /> Log out
            </button>
          </div>
        </nav>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-base-100 border-b border-base-300">
        <div className="flex items-center justify-between px-4 h-12">
          <Link
            to={token ? "/home" : "/"}
            className="text-lg font-bold tracking-tight"
          >
            <span className="text-primary">Linked</span>
            <span className="text-base-content/60">/Post</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {theme === "socialdark" ? (
                <HiOutlineSun className="w-5 h-5" />
              ) : (
                <HiOutlineMoon className="w-5 h-5" />
              )}
            </button>
            {token && <Notifications />}
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      {token && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-300">
          <div className="flex items-center justify-around h-12">
            <NavLink
              to="/home"
              className="flex flex-col items-center justify-center p-2"
            >
              {isHome ? (
                <HiHome className="w-6 h-6" />
              ) : (
                <HiOutlineHome className="w-6 h-6 text-base-content/60" />
              )}
            </NavLink>
            <NavLink
              to="/profile"
              className="flex flex-col items-center justify-center p-2"
            >
              <div
                className={`w-7 h-7 rounded-full overflow-hidden ${isProfile ? "ring-2 ring-base-content" : ""}`}
              >
                <img
                  src={userData?.photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </NavLink>
          </div>
        </div>
      )}

      {/* Not logged in header */}
      {!token && (
        <div className="hidden lg:flex sticky top-0 z-40 bg-base-100 border-b border-base-300">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 h-14">
            <Link to="" className="text-lg font-bold tracking-tight">
              <span className="text-primary">Linked</span>
              <span className="text-base-content/60">/Post</span>
            </Link>
            <div className="flex gap-2">
              <NavLink to="login" className="btn btn-ghost btn-sm">
                Log in
              </NavLink>
              <NavLink to="register" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
