import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Loader } from 'lucide-react'

const AppointmentForm = ({ onAppointmentSaved }) => {
    const { user } = useAuth()
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('In-Person')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Combine date/time
        const startDateTime = new Date(`${date}T${startTime}`)
        const endDateTime = new Date(`${date}T${endTime}`)

        if (endDateTime <= startDateTime) {
            setError('End time must be after start time')
            setLoading(false)
            return
        }

        try {
            // Conflict Detection
            // start_time < new_end_time AND end_time > new_start_time
            const { data: conflicts, error: conflictError } = await supabase
                .from('appointments')
                .select('id')
                .eq('patient_id', user.id)
                .lt('start_time', endDateTime.toISOString())
                .gt('end_time', startDateTime.toISOString())

            if (conflictError) throw conflictError

            if (conflicts && conflicts.length > 0) {
                throw new Error('This time slot conflicts with another appointment.')
            }

            const { error: insertError } = await supabase
                .from('appointments')
                .insert([
                    {
                        patient_id: user.id,
                        title,
                        start_time: startDateTime.toISOString(),
                        end_time: endDateTime.toISOString(),
                        location_or_mode: location,
                        notes,
                        status: 'scheduled'
                    }
                ])

            if (insertError) throw insertError

            // Reset
            setTitle('')
            setDate('')
            setStartTime('')
            setEndTime('')
            setNotes('')
            if (onAppointmentSaved) onAppointmentSaved()

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Schedule Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title / Reason</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Checkup with Dr. Smith"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="time"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                            type="time"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Location / Mode</label>
                    <select
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                    >
                        <option value="In-Person">In-Person</option>
                        <option value="Telehealth">Telehealth (Video)</option>
                        <option value="Phone">Phone Call</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                        rows="2"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    ></textarea>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Schedule Appointment'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AppointmentForm
