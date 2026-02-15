import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react'

const AppointmentList = ({ refreshTrigger }) => {
    const { user } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAppointments()
    }, [user, refreshTrigger])

    const fetchAppointments = async () => {
        try {
            setLoading(true)
            const now = new Date().toISOString()

            // Fetch upcoming appointments
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('patient_id', user.id)
                .gte('end_time', now) // Show only future or ongoing
                .order('start_time', { ascending: true })

            if (error) throw error
            setAppointments(data)
        } catch (error) {
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id)

            if (error) throw error
            fetchAppointments()
        } catch (error) {
            console.error('Error cancelling appointment:', error)
        }
    }

    if (loading) return <div className="text-center py-4">Loading appointments...</div>
    if (appointments.length === 0) return <div className="text-center py-4 text-gray-500">No upcoming appointments.</div>

    return (
        <div className="space-y-4">
            {appointments.map(appt => {
                const startDate = new Date(appt.start_time)
                const endDate = new Date(appt.end_time)
                const isCancelled = appt.status === 'cancelled'

                return (
                    <div key={appt.id} className={`bg-white shadow rounded-lg p-4 border-l-4 ${isCancelled ? 'border-gray-300 opacity-75' : 'border-blue-500'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className={`text-lg font-medium ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {appt.title} {isCancelled && '(Cancelled)'}
                                </h3>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {startDate.toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {appt.location_or_mode}
                                    </p>
                                </div>
                            </div>
                            {!isCancelled && (
                                <button
                                    onClick={() => handleCancel(appt.id)}
                                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancel
                                </button>
                            )}
                        </div>

                        {appt.notes && (
                            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {appt.notes}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default AppointmentList
