# Patient Companion App 🏥

A comprehensive healthcare application designed to assist patients in managing their health, tracking symptoms, and getting preliminary disease predictions using Machine Learning.

## 🌟 Features

-   **🤖 AI Disease Prediction:**
    -   Integrated Machine Learning model (Random Forest/KNN) to predict potential diseases based on user symptoms.
    -   Fuzzy matching for symptom inputs (e.g., "stomach ache" -> "stomach_pain").
    -   Confidence scores and transparent reasoning (showing matched symptoms).
-   **📝 Symptom Tracking:**
    -   Log symptoms with severity, duration, and notes.
    -   Attach images or documents to symptom logs.
    -   View history of symptoms.
-   **💊 Medication Management:**
    -   Track medications, dosages, and frequencies.
    -   **Smart Reminders:** Browser notifications to remind you when to take your pills.
-   **📅 Appointment Scheduling:**
    -   Schedule appointments with clinicians.
    -   Conflict detection to prevent overlapping bookings.
-   **📊 Health Analytics:**
    -   Visual charts showing symptom severity trends over time.
    -   Track the frequency of specific symptoms.
-   **📄 Reports:**
    -   Generate and download PDF reports of your health history for doctor visits.
-   **🔐 Secure Authentication:**
    -   Role-based access (Patient/Clinician) using Supabase Auth.
    -   Data privacy with Row Level Security (RLS) policies.

## 🛠️ Tech Stack

### Frontend
-   **Framework:** [React](https://react.dev/) (Vite)
-   **Styling:** [Tailwind CSS v3](https://tailwindcss.com/)
-   **Icons:** Lucide React
-   **Charts:** Recharts
-   **PDF Generation:** jsPDF

### Backend (ML API)
-   **Language:** Python
-   **Framework:** Flask
-   **ML Libraries:** Scikit-learn, Pandas, NumPy
-   **Algorithm:** Random Forest / K-Nearest Neighbors

### Database & Auth
-   **Provider:** [Supabase](https://supabase.com/)
-   **Database:** PostgreSQL
-   **Storage:** Supabase Storage (for attachments)

