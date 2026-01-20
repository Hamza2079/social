import { tokencontext } from "../../context/tokenContext";
import { themeContext } from "../../context/ThemeContext";
import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getAllPosts } from "../api/allpost";
import { getUserPosts } from "../api/getuserpost";

export default function Navbar() {
  const { token, setToken, userData } = useContext(tokencontext);
  const { theme, toggleTheme } = useContext(themeContext);
  const queryClient = useQueryClient();
  const location = useLocation();

  const navigate = useNavigate();

  // Prefetch data when user signs in
  useEffect(() => {
    if (token && userData?._id) {
      // Prefetch home posts
      queryClient.prefetchInfiniteQuery({
        queryKey: ["all posts"],
        queryFn: ({ pageParam = 1 }) =>
          getAllPosts({ page: pageParam, limit: 10 }),
        initialPageParam: 1,
      });

      // Prefetch user posts
      queryClient.prefetchQuery({
        queryKey: ["user posts", userData._id],
        queryFn: () => getUserPosts(userData._id, { limit: 50 }),
      });
    }
  }, [token, userData?._id, queryClient]);

  // Prefetch home posts on hover (only if not already on home page)
  const handleHomeHover = () => {
    // Don't prefetch if already on home page
    if (location.pathname === "/home") return;

    queryClient.prefetchInfiniteQuery({
      queryKey: ["all posts"],
      queryFn: ({ pageParam = 1 }) =>
        getAllPosts({ page: pageParam, limit: 10 }),
      initialPageParam: 1,
    });
  };

  // Prefetch profile posts on hover (only if not already on profile page)
  const handleProfileHover = () => {
    // Don't prefetch if already on profile page
    if (location.pathname === "/profile") return;

    if (userData?._id) {
      queryClient.prefetchQuery({
        queryKey: ["user posts", userData._id],
        queryFn: () => getUserPosts(userData._id, { limit: 50 }),
      });
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  }

  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-base-100/80 border-b border-base-300 shadow-sm transition-colors duration-300">
      <div className="navbar max-w-6xl mx-auto px-4 py-2">
        <div className="flex-1">
          <Link
            to=""
            className="text-xl md:text-2xl font-black tracking-tight text-sky-300"
          >
            Linked<span className="font-light opacity-80">/Post</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 17.95l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          {token && (
            <p className="hidden md:block text-xs opacity-70">
              Signed in as
              <span className="ml-1 font-medium text-primary">
                {userData?.name}
              </span>
            </p>
          )}

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar hover:scale-105 transition-all duration-200"
            >
              <div className="w-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                <img alt="User avatar" src={userData?.photo} />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content mt-3 w-56 p-2 rounded-2xl bg-base-100 text-base-content border border-base-300 shadow-xl backdrop-blur-xl"
            >
              {token ? (
                <>
                  <li>
                    <NavLink
                      to="/home"
                      onMouseEnter={handleHomeHover}
                      onClick={(e) => {
                        // Close dropdown by removing focus
                        e.currentTarget.blur();
                        document.activeElement?.blur();
                      }}
                      className="hover:bg-sky-500/20 hover:text-sky-200 rounded-xl"
                    >
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="profile"
                      onMouseEnter={handleProfileHover}
                      onClick={(e) => {
                        // Close dropdown by removing focus
                        e.currentTarget.blur();
                        document.activeElement?.blur();
                      }}
                      className="hover:bg-sky-500/20 hover:text-sky-200 rounded-xl"
                    >
                      Profile
                    </NavLink>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-200 hover:bg-red-500/10 rounded-xl"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink
                      to="login"
                      className="hover:bg-sky-500/20 hover:text-sky-200 rounded-xl"
                    >
                      Login
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="register"
                      className="hover:bg-sky-500/20 hover:text-sky-200 rounded-xl"
                    >
                      Sign up
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
