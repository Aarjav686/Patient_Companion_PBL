import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Loader } from 'lucide-react'

const MedicationForm = ({ onMedicationSaved, editingMedication, onCancelEdit }) => {
    const { user } = useAuth()
    const [name, setName] = useState('')
    const [dose, setDose] = useState('')
    const [frequency, setFrequency] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [notes, setNotes] = useState('')
    const [reminderEnabled, setReminderEnabled] = useState(false)
    const [reminderTime, setReminderTime] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (editingMedication) {
            setName(editingMedication.name)
            setDose(editingMedication.dose || '')
            setFrequency(editingMedication.frequency || '')
            setStartDate(editingMedication.start_date || '')
            setEndDate(editingMedication.end_date || '')
            setNotes(editingMedication.notes || '')
            setReminderEnabled(editingMedication.reminder_enabled || false)
            setReminderTime(editingMedication.reminder_time || '')
        } else {
            resetForm()
        }
    }, [editingMedication])

    const resetForm = () => {
        setName('')
        setDose('')
        setFrequency('')
        setStartDate('')
        setEndDate('')
        setNotes('')
        setReminderEnabled(false)
        setReminderTime('')
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const medicationData = {
            patient_id: user.id,
            name,
            dose,
            frequency,
            start_date: startDate || null,
            end_date: endDate || null,
            notes,
            reminder_enabled: reminderEnabled,
            reminder_time: reminderTime || null
        }

        try {
            let error
            if (editingMedication) {
                const { error: updateError } = await supabase
                    .from('medications')
                    .update(medicationData)
                    .eq('id', editingMedication.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('medications')
                    .insert([medicationData])
                error = insertError
            }

            if (error) throw error

            resetForm()
            if (onMedicationSaved) onMedicationSaved()

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingMedication ? 'Edit Medication' : 'Add New Medication'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Medication Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dose (e.g. 500mg)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={dose}
                            onChange={e => setDose(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Frequency (e.g. Daily)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={frequency}
                            onChange={e => setFrequency(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4 mt-6">
                        <div className="flex items-center">
                            <input
                                id="reminder"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={reminderEnabled}
                                onChange={e => setReminderEnabled(e.target.checked)}
                            />
                            <label htmlFor="reminder" className="ml-2 block text-sm text-gray-900">
                                Enable Reminder
                            </label>
                        </div>
                        {reminderEnabled && (
                            <input
                                type="time"
                                className="block border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-2 py-1"
                                value={reminderTime}
                                onChange={e => setReminderTime(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes / Instructions</label>
                    <textarea
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                        rows="2"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    ></textarea>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4">
                    {editingMedication && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin h-5 w-5" /> : (editingMedication ? 'Update Medication' : 'Add Medication')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default MedicationForm
