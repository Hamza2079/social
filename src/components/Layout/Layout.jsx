import React, { useContext } from 'react'
import Navbar from '../Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import { tokencontext } from '../../context/tokenContext'

export default function Layout() {
  const {token} = useContext(tokencontext)
  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
      {token && <Navbar/>}
      <main className="max-w-6xl mx-auto px-3 sm:px-5 md:px-8 pt-6 pb-12">
        <Outlet/>
      </main>
    </div>
  )
}
