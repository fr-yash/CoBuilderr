import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Dashboard from '../screens/Dashboard'
import Home from '../screens/Home'
import Project from '../screens/Project'
import UserAuth from '../auth/UserAuth'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/project/:projectId' element={<UserAuth><Project /></UserAuth>} />
        <Route path='/' element={<UserAuth><Home/></UserAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
