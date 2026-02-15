import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Stethoscope, Pill, Calendar, Activity, FileText, LogOut, User } from 'lucide-react'
import ReminderManager from './ReminderManager'

const Layout = () => {
    const { signOut, profile } = useAuth()
    const location = useLocation()

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Symptoms', href: '/symptoms', icon: Stethoscope },
        { name: 'Medications', href: '/medications', icon: Pill },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Analytics', href: '/analytics', icon: Activity },
        { name: 'Reports', href: '/reports', icon: FileText },
    ]

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <ReminderManager />
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0">
                <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
                    <div className="flex items-center flex-shrink-0 px-4 mb-5">
                        <span className="text-xl font-bold text-blue-600">Patient Companion</span>
                    </div>
                    <div className="mt-5 flex-1 flex flex-col">
                        <nav className="flex-1 px-2 pb-4 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon
                                            className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                                }`}
                                        />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0">
                                <User className="h-8 w-8 rounded-full bg-gray-200 p-1 text-gray-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">{profile?.full_name || 'User'}</p>
                                <button onClick={handleSignOut} className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center mt-1">
                                    <LogOut className="h-3 w-3 mr-1" /> Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex self-stretch flex-col flex-1 md:pl-64">
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
