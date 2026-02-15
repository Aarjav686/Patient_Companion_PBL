import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
