import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Loader, Upload, X, Plus } from 'lucide-react'

const SymptomForm = ({ onSymptomAdded }) => {
    const { user } = useAuth()
    const [availableSymptoms, setAvailableSymptoms] = useState([])
    const [selectedSymptoms, setSelectedSymptoms] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [description, setDescription] = useState('')
    const [severity, setSeverity] = useState(5)
    const [onsetDate, setOnsetDate] = useState('')
    const [duration, setDuration] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [prediction, setPrediction] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchAvailableSymptoms()
    }, [])

    const fetchAvailableSymptoms = async () => {
        try {
            const res = await fetch('http://localhost:5000/symptoms')
            if (res.ok) {
                const data = await res.json()
                setAvailableSymptoms(data)
            }
        } catch (err) {
            console.error("Failed to fetch symptoms form API", err)
        }
    }

    const handleAddSymptom = (symptom) => {
        if (!selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms([...selectedSymptoms, symptom])
        }
        setSearchTerm('')
    }

    const handleRemoveSymptom = (symptom) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
    }

    const handlePredict = async () => {
        setLoading(true)
        setError('')
        setPrediction(null)
        try {
            const res = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: selectedSymptoms })
            })
            if (!res.ok) throw new Error('Prediction failed')
            const data = await res.json()
            setPrediction(data)
        } catch (err) {
            setError('Failed to get prediction: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let attachmentUrl = null

            // Upload file if exists
            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('symptom-attachments')
                    .upload(filePath, file)

                if (uploadError) throw uploadError
                attachmentUrl = filePath
            }

            // Create symptom record
            // We store the primary symptom name as a comma joined string of selected symptoms or just the first one?
            // The schema has `symptom_name` (text).
            // I'll join them or use the first one and put others in description/tags.
            // Or maybe the user selects ONE primary symptom and the rest are for prediction?
            // I'll make `symptom_name` a summary of selected symptoms.

            const { error: insertError } = await supabase
                .from('symptoms')
                .insert([
                    {
                        patient_id: user.id,
                        symptom_name: selectedSymptoms.join(', '),
                        description: description + (prediction ? `\n\nAI Prediction: ${prediction.final_prediction} (Confidence: ${prediction.confidence})` : ''),
                        severity,
                        onset_date: onsetDate,
                        duration,
                        attachment_url: attachmentUrl,
                        tags: prediction ? { prediction: prediction } : {}
                    }
                ])

            if (insertError) throw insertError

            // Reset form
            setSelectedSymptoms([])
            setDescription('')
            setSeverity(5)
            setOnsetDate('')
            setDuration('')
            setFile(null)
            setPrediction(null)
            if (onSymptomAdded) onSymptomAdded()

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredSymptoms = availableSymptoms.filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedSymptoms.includes(s)
    ).slice(0, 5)

    return (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Log New Symptom</h2>

            {/* Symptom Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (for AI Prediction)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedSymptoms.map(s => (
                        <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                            {s}
                            <button onClick={() => handleRemoveSymptom(s)} className="ml-1 text-blue-500 hover:text-blue-700">
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        placeholder="Search and add symptoms..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && filteredSymptoms.length > 0 && (
                        <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 border border-gray-200">
                            {filteredSymptoms.map(s => (
                                <button
                                    key={s}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                    onClick={() => handleAddSymptom(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <button
                    type="button"
                    onClick={handlePredict}
                    disabled={selectedSymptoms.length === 0 || loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? 'Analyzing...' : 'Get AI Prediction'}
                </button>
                {prediction && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 font-medium">Predicted Condition: {prediction.final_prediction}</p>
                        <p className="text-green-600 text-xs">Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
                        {prediction.matched_symptoms && prediction.matched_symptoms.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                                <strong>Interpreted Symptoms:</strong>
                                <ul className="list-disc pl-4 mt-1">
                                    {prediction.matched_symptoms.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Onset Date</label>
                        <input
                            type="date"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            value={onsetDate}
                            onChange={e => setOnsetDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                            placeholder="e.g. 2 days"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Severity (1-10): {severity}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full mt-1"
                        value={severity}
                        onChange={e => setSeverity(parseInt(e.target.value))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description / Notes</label>
                    <textarea
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                        rows="3"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Attachment (Image/PDF)</label>
                    <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Upload className="h-4 w-4 inline-block mr-2" />
                            Upload File
                            <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                        </label>
                        <span className="ml-3 text-sm text-gray-500">{file ? file.name : 'No file chosen'}</span>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Save Symptom Log'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SymptomForm
