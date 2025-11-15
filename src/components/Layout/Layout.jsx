import React, { use, useContext } from 'react'
import Navbar from '../Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import { tokencontext } from '../../context/tokenContext'

export default function Layout() {
  const {token} = useContext(tokencontext)
  return (
    <div>
      {token?
      <>
      <Navbar/>
      <Outlet/>
      </>
      :
      <>
      <Outlet/>
      </>
      }

    </div>
  )
}
