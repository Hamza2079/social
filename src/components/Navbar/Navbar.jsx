import React, { useContext } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { tokencontext } from '../../context/tokenContext';
export default function Navbar() {

  const {token,setToken} = useContext(tokencontext)

  const navigate = useNavigate()
  function handleLogout(){
    localStorage.removeItem('token')
    setToken(null)
    navigate('/')
    
  }
  
  return (
    <div className='shadow-lg'>
      <div className="navbar bg-base-100  w-[90%] mx-auto rounded-lg">
  <div className="flex-1">
    <Link to='' className="btn btn-ghost text-xl text-sky-900">Linked Post</Link>
  </div>
  <div className="flex gap-2">
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <ul
        tabIndex="-1"
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        
        {token?
        <>

        <li>
          <NavLink to='/'>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to='profile'>
            Profile
          </NavLink>
        </li>
        <li><a onClick={()=>handleLogout()}>Logout</a></li>
        
        
        </>
        :
        <>
        
        <li><NavLink to='login'>login</NavLink></li>
        <li><NavLink to='register'>Signup</NavLink></li>
        
        </>
        
        }
        
      </ul>
    </div>
  </div>
</div>
</div>
  )
}
