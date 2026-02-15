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

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)
-   A Supabase project

### 1. Database Setup
1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to the **SQL Editor**.
3.  Copy the contents of `schema.sql` (located in the root directory) and run it.
    -   *Note: If you face profile creation issues, run the commands in `fix_profiles.sql`.*

### 2. Frontend Setup
1.  Navigate to the project directory:
    ```bash
    cd patient-companion-app
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of `patient-companion-app` and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

### 3. ML API Setup
1.  Navigate to the `patient-companion-app` directory (if not already there).
2.  Install Python dependencies:
    ```bash
    pip install -r ml_api/requirements.txt
    ```
3.  Start the Flask API:
    ```bash
    python ml_api/app.py
    ```
    *The API runs on `http://localhost:5000` by default.*

## 📸 Screenshots
*(Add screenshots of your dashboard, symptom form, and prediction results here)*

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License
MIT
