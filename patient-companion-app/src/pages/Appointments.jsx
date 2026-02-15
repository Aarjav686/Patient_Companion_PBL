import { useState } from 'react'
import AppointmentForm from '../components/AppointmentForm'
import AppointmentList from '../components/AppointmentList'

const Appointments = () => {
    const [refresh, setRefresh] = useState(0)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <AppointmentForm onAppointmentSaved={() => setRefresh(p => p + 1)} />
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                    <AppointmentList refreshTrigger={refresh} />
                </div>
            </div>
        </div>
    )
}

export default Appointments
