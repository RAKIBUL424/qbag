import React from 'react'
import { Outlet, useLocation } from 'react-router'
import Navbar from '../components/Navbar'
import FloatingScreenshotButton from '../components/FloatingScreenshotButton'

const MainLayout = () => {
  const location = useLocation()

  
  return (
    <>
      <Navbar/>
      
      
      <Outlet/>
      
    </>
  )
}

export default MainLayout
