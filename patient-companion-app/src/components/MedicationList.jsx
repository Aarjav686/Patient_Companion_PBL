import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Pill, Clock, Calendar, Trash, Edit } from 'lucide-react'

const MedicationList = ({ refreshTrigger, onEdit }) => {
    const { user } = useAuth()
    const [medications, setMedications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMedications()
    }, [user, refreshTrigger])

    const fetchMedications = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('medications')
                .select('*')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setMedications(data)
        } catch (error) {
            console.error('Error fetching medications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medication?')) return
        try {
            const { error } = await supabase
                .from('medications')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchMedications()
        } catch (error) {
            console.error('Error deleting medication:', error)
        }
    }

    if (loading) return <div className="text-center py-4">Loading medications...</div>
    if (medications.length === 0) return <div className="text-center py-4 text-gray-500">No medications logged.</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map(med => (
                <div key={med.id} className="bg-white shadow rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <Pill className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{med.name}</h3>
                                <p className="text-sm text-gray-500">{med.dose} • {med.frequency}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => onEdit(med)} className="text-gray-400 hover:text-blue-500">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(med.id)} className="text-gray-400 hover:text-red-500">
                                <Trash size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 space-y-1">
                        {med.reminder_enabled && (
                            <div className="flex items-center text-sm text-yellow-600">
                                <Clock className="h-4 w-4 mr-2" />
                                Reminder: {med.reminder_time}
                            </div>
                        )}
                        {med.start_date && (
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-2" />
                                Start: {new Date(med.start_date).toLocaleDateString()}
                                {med.end_date && ` - End: ${new Date(med.end_date).toLocaleDateString()}`}
                            </div>
                        )}
                        {med.notes && (
                            <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                {med.notes}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MedicationList
