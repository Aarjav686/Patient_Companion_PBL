import { useState } from 'react'
import SymptomForm from '../components/SymptomForm'
import SymptomList from '../components/SymptomList'

const Symptoms = () => {
    const [refresh, setRefresh] = useState(0)

    const handleSymptomAdded = () => {
        setRefresh(prev => prev + 1)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Symptom Tracking</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <SymptomForm onSymptomAdded={handleSymptomAdded} />
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
                    <SymptomList refreshTrigger={refresh} />
                </div>
            </div>
        </div>
    )
}

export default Symptoms
