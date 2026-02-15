import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
    const { user, profile, signOut } = useAuth()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-700">Welcome, {profile?.full_name || user?.email}!</p>
                <p className="text-gray-500 text-sm mt-1">Role: {profile?.role || 'Guest'}</p>

                <div className="mt-6">
                    {/* Summary cards will go here */}
                    <p>Dashboard content coming soon...</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
