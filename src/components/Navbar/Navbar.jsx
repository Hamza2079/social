import React, { useContext } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { tokencontext } from '../../context/tokenContext';

export default function Navbar() {

  const {token,setToken,userData} = useContext(tokencontext)

  const navigate = useNavigate()
  function handleLogout(){
    localStorage.removeItem('token')
    setToken(null)
    navigate('/')
  }

  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-sky-500/30 shadow-[0_10px_40px_rgba(15,23,42,0.9)]">
      <div className="navbar max-w-6xl mx-auto px-4 py-2">
        <div className="flex-1">
          <Link
            to=""
            className="text-xl md:text-2xl font-black tracking-tight text-sky-300"
          >
            Linked<span className="font-light opacity-80">/Post</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {token && (
            <p className="hidden md:block text-xs text-sky-100/80">
              Signed in as
              <span className="ml-1 font-medium text-sky-200">{userData?.name}</span>
            </p>
          )}

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar hover:scale-105 hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-all duration-200"
            >
              <div className="w-10 rounded-full ring-2 ring-sky-400/80 ring-offset-2 ring-offset-slate-900">
                <img
                  alt="User avatar"
                  src={userData?.photo}
                />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content mt-3 w-56 p-2 rounded-2xl bg-slate-900/95 text-slate-50 border border-sky-500/40 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl"
            >
              {token ? (
                <>
                  <li>
                    <NavLink
                      to="/home"
                      className="hover:bg-sky-500/20 hover:text-sky-200 rounded-xl"
                    >
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="profile"
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
  )
}
