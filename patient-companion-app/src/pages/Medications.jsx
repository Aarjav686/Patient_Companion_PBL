import { useState } from 'react'
import MedicationForm from '../components/MedicationForm'
import MedicationList from '../components/MedicationList'

const Medications = () => {
    const [refresh, setRefresh] = useState(0)
    const [editingMedication, setEditingMedication] = useState(null)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Medication Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <MedicationForm
                        onMedicationSaved={() => {
                            setRefresh(p => p + 1)
                            setEditingMedication(null)
                        }}
                        editingMedication={editingMedication}
                        onCancelEdit={() => setEditingMedication(null)}
                    />
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Your Medications</h2>
                    <MedicationList
                        refreshTrigger={refresh}
                        onEdit={(med) => setEditingMedication(med)}
                    />
                </div>
            </div>
        </div>
    )
}

export default Medications
