import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Calendar, AlertCircle } from 'lucide-react'

const SymptomList = ({ refreshTrigger }) => {
    const { user } = useAuth()
    const [symptoms, setSymptoms] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSymptoms()
    }, [user, refreshTrigger])

    const fetchSymptoms = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('symptoms')
                .select('*')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setSymptoms(data)
        } catch (error) {
            console.error('Error fetching symptoms:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-4">Loading symptoms...</div>
    if (symptoms.length === 0) return <div className="text-center py-4 text-gray-500">No symptoms logged yet.</div>

    return (
        <div className="space-y-4">
            {symptoms.map(symptom => (
                <div key={symptom.id} className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{symptom.symptom_name}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                Onset: {new Date(symptom.onset_date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${symptom.severity > 7 ? 'bg-red-100 text-red-800' :
                                symptom.severity > 4 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                            }`}>
                            Severity: {symptom.severity}/10
                        </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{symptom.description}</div>

                    {symptom.duration && (
                        <div className="mt-2 text-xs text-gray-500">Duration: {symptom.duration}</div>
                    )}

                    {symptom.tags && symptom.tags.prediction && (
                        <div className="mt-3 bg-indigo-50 p-2 rounded text-xs text-indigo-700">
                            <strong>AI Analysis:</strong> {symptom.tags.prediction.final_prediction}
                        </div>
                    )}

                    {symptom.attachment_url && (
                        <div className="mt-3">
                            <a
                                href="#"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                                onClick={(e) => {
                                    e.preventDefault()
                                    // In real app, generate signed url
                                    alert('File download logic would go here (requires signed URL generation)')
                                }}
                            >
                                View Attachment
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default SymptomList
