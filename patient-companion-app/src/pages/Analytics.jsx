import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Analytics = () => {
    const { user } = useAuth()
    const [severityData, setSeverityData] = useState([])
    const [frequencyData, setFrequencyData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [user])

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data: symptoms, error } = await supabase
                .from('symptoms')
                .select('symptom_name, severity, onset_date')
                .eq('patient_id', user.id)
                .order('onset_date', { ascending: true })

            if (error) throw error

            // Process Severity over Time
            // Group by date, average severity
            const severityMap = {}
            symptoms.forEach(s => {
                const date = s.onset_date
                if (!severityMap[date]) {
                    severityMap[date] = { date, totalSeverity: 0, count: 0 }
                }
                severityMap[date].totalSeverity += s.severity
                severityMap[date].count += 1
            })

            const severityChartData = Object.values(severityMap).map(d => ({
                date: d.date,
                avgSeverity: parseFloat((d.totalSeverity / d.count).toFixed(1))
            })).sort((a, b) => new Date(a.date) - new Date(b.date))

            setSeverityData(severityChartData)


            // Process Frequency
            // Count by symptom_name
            const freqMap = {}
            symptoms.forEach(s => {
                // symptom_name might be comma sep if user selected multiple
                // For now treat exact string matches or split?
                // Let's split by comma to count individual symptoms
                const names = s.symptom_name.split(',').map(n => n.trim())
                names.forEach(name => {
                    freqMap[name] = (freqMap[name] || 0) + 1
                })
            })

            const freqChartData = Object.entries(freqMap).map(([name, count]) => ({
                name,
                count
            })).sort((a, b) => b.count - a.count).slice(0, 10) // Top 10

            setFrequencyData(freqChartData)

        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-center py-10">Loading analytics...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Health Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Severity Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Symptom Severity Trend</h2>
                    <div className="h-64">
                        {severityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={severityData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 10]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="avgSeverity" stroke="#8884d8" name="Avg Severity" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* Frequency Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Most Common Symptoms</h2>
                    <div className="h-64">
                        {frequencyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={frequencyData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#82ca9d" name="Frequency" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics
