import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

export default function ProtectedRoutes({children,isAuthenticated}) {
  if(!isAuthenticated){
    return <Navigate to="/login" replace/>
  }
  return (
    <div>
      {children}
    </div>
  )
}
