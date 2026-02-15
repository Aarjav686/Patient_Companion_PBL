import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const ReminderManager = () => {
    const { user } = useAuth()
    const [medications, setMedications] = useState([])
    // Track triggered reminders to prevent double-firing in the same minute
    const [triggeredRef, setTriggeredRef] = useState(new Set())

    useEffect(() => {
        if (user) {
            requestNotificationPermission()
            fetchReminders()

            // Subscribe to changes in medications table
            const subscription = supabase
                .channel('medications_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'medications', filter: `patient_id=eq.${user.id}` }, () => {
                    fetchReminders()
                })
                .subscribe()

            return () => {
                supabase.removeChannel(subscription)
            }
        }
    }, [user])

    useEffect(() => {
        const interval = setInterval(checkReminders, 30000) // Check every 30 seconds
        return () => clearInterval(interval)
    }, [medications])

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification")
        } else if (Notification.permission !== "granted") {
            await Notification.requestPermission()
        }
    }

    const fetchReminders = async () => {
        try {
            const { data, error } = await supabase
                .from('medications')
                .select('*')
                .eq('patient_id', user.id)
                .eq('reminder_enabled', true)

            if (error) throw error
            setMedications(data || [])
        } catch (error) {
            console.error("Error fetching reminders", error)
        }
    }

    const checkReminders = () => {
        const now = new Date()
        const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) // HH:MM format

        medications.forEach(med => {
            if (med.reminder_time === currentTime) {
                // simple key to avoid duplicate triggers for the same day/time roughly
                // actually, just checking if we recently triggered it for this med
                // But since we check every 30s, we might trigger twice in the same minute.
                // We need to track "last triggered" or ensure we only trigger once per minute ID.
                const key = `${med.id}-${currentTime}`

                if (!triggeredRef.has(key)) {
                    triggerNotification(med)
                    setTriggeredRef(prev => new Set(prev).add(key))

                    // Cleanup old keys after a minute to save memory/allow next day trigger
                    setTimeout(() => {
                        setTriggeredRef(prev => {
                            const next = new Set(prev)
                            next.delete(key)
                            return next
                        })
                    }, 65000)
                }
            }
        })
    }

    const triggerNotification = (med) => {
        if (Notification.permission === "granted") {
            new Notification(`Medication Reminder: ${med.name}`, {
                body: `It's time to take your ${med.dose} of ${med.name}. ${med.notes || ''}`,
                icon: '/vite.svg' // Placeholder icon
            })
        }
    }

    return null // This component is logical only, no UI
}

export default ReminderManager
