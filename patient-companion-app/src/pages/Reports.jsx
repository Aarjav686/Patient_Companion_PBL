import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import jsPDF from 'jspdf'
import { Loader, Download } from 'lucide-react'

const Reports = () => {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [dateRange, setDateRange] = useState('30') // Days

    const generateReport = async () => {
        setLoading(true)
        try {
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - parseInt(dateRange))

            // Fetch Data
            const { data: symptoms } = await supabase
                .from('symptoms')
                .select('*')
                .eq('patient_id', user.id)
                .gte('onset_date', startDate.toISOString())
                .order('onset_date', { ascending: true })

            const { data: medications } = await supabase
                .from('medications')
                .select('*')
                .eq('patient_id', user.id)

            const { data: appointments } = await supabase
                .from('appointments')
                .select('*')
                .eq('patient_id', user.id)
                .gte('start_time', startDate.toISOString())
                .order('start_time', { ascending: true })

            // Generate PDF
            const doc = new jsPDF()
            let y = 20

            // Title
            doc.setFontSize(22)
            doc.text('Patient Health Report', 105, y, { align: 'center' })
            y += 15

            // Patient Info
            doc.setFontSize(12)
            doc.text(`Patient: ${profile?.full_name || user.email}`, 20, y)
            y += 7
            doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, y)
            y += 7
            doc.text(`Reporting Period: Last ${dateRange} Days`, 20, y)
            y += 15

            // Symptoms Section
            doc.setFontSize(16)
            doc.text('Symptoms Log', 20, y)
            y += 10
            doc.setFontSize(10)

            if (symptoms && symptoms.length > 0) {
                symptoms.forEach(s => {
                    if (y > 270) { doc.addPage(); y = 20; }
                    const date = new Date(s.onset_date).toLocaleDateString()
                    doc.text(`- ${date}: ${s.symptom_name} (Severity: ${s.severity}/10)`, 20, y)
                    y += 5
                    // Wrap description if needed
                    if (s.description) {
                        const splitDesc = doc.splitTextToSize(`  Note: ${s.description}`, 170)
                        doc.text(splitDesc, 20, y)
                        y += (splitDesc.length * 5) + 2
                    }
                })
            } else {
                doc.text('No symptoms recorded in this period.', 20, y)
                y += 10
            }
            y += 10

            // Medications Section
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(16)
            doc.text('Current Medications', 20, y)
            y += 10
            doc.setFontSize(10)

            if (medications && medications.length > 0) {
                medications.forEach(m => {
                    if (y > 270) { doc.addPage(); y = 20; }
                    doc.text(`- ${m.name} ${m.dose} (${m.frequency})`, 20, y)
                    y += 7
                })
            } else {
                doc.text('No medications recorded.', 20, y)
                y += 10
            }
            y += 10

            // Appointments Section
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(16)
            doc.text('Appointments', 20, y)
            y += 10
            doc.setFontSize(10)

            if (appointments && appointments.length > 0) {
                appointments.forEach(a => {
                    if (y > 270) { doc.addPage(); y = 20; }
                    const date = new Date(a.start_time).toLocaleString()
                    doc.text(`- ${date}: ${a.title} (${a.status})`, 20, y)
                    y += 7
                })
            } else {
                doc.text('No appointments in this period.', 20, y)
                y += 10
            }

            // Save
            doc.save(`Health_Report_${new Date().toISOString().split('T')[0]}.pdf`)

        } catch (error) {
            console.error('Error generating report:', error)
            alert('Failed to generate report')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>

            <div className="bg-white shadow rounded-lg p-6 max-w-xl">
                <h2 className="text-lg font-semibold mb-4">Generate PDF Report</h2>
                <p className="text-gray-600 mb-6">
                    Download a summary of your symptoms, medications, and appointments to share with your healthcare provider.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                    <select
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 3 Months</option>
                        <option value="365">Last Year</option>
                    </select>
                </div>

                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                    Download PDF Report
                </button>
            </div>
        </div>
    )
}

export default Reports
