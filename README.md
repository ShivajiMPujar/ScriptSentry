# ScriptSentry: Clinical Safety Multi-Agent Graph Framework

ScriptSentry is a decoupled, production-grade full-stack healthcare application designed to audit multi-drug prescriptions for cross-interaction kinetic risks and dynamically generate optimized, safe chronological dosing schedules. 

## 🏗️ System Architecture

The framework relies on a strictly decoupled system layout to enforce clean separation of concerns, simulating real-world distributed enterprise systems.

* **Frontend Client (UI Layer):** Built with **React** and compiled via **Vite**. It manages user triage intake, maintains state transitions via a robust interface, and handles real-time network interactions. Hosted globally on **Vercel**.
* **Backend Engine (Compute Layer):** Built using **Python** and wrapped in a high-performance **FastAPI** server structure. It utilizes state-based logic flows to ingest data arrays, assess therapeutic conflicts via an indexed drug matrix, and execute schedule optimization. Hosted globally on **Render**.

---

## 🚀 Core Functional Modules

### 1. Triage Intake Node
* Captures and validates structural patient data tracking factors (Patient ID, Name).
* Collects dynamic clinical drug prescription arrays.

### 2. Interaction Matrix Audit Node
* Ingests the prescription array into the backend via standard JSON protocols over secure networks.
* Executes vector-based validation checks against an indexed relational database matrix mapping overlapping metabolic pathways and clearance restrictions.
* Safely blocks immediate hazards (e.g., NSAID/Metformin competitive pathways affecting renal functions).

### 3. Chronological Graph Generator Node
* When interactions are approved, it dynamically calculates personalized daily dosing timelines.
* Implements precise interval spacing calculations (e.g., splitting multi-frequency medications into balanced 6/12-hour windows) to mitigate cumulative organ stress.

---

## 🛠️ Tech Stack & Dependencies

### Frontend
* **Core:** React 18+ (Functional Components, Hooks API)
* **Build Pipeline:** Vite (Fast HMR compilation)
* **Hosting:** Vercel

### Backend
* **Language:** Python 3.11+
* **Framework:** FastAPI
* **Server Engine:** Uvicorn (Asynchronous ASGI server)
* **Data Transport:** Pydantic (Strong structural data schema validation)
* **Hosting:** Render

---

## 💻 Local Setup & Installation

### Backend Environment Installation
```bash
# Navigate to the root directory
cd scriptsentry

# Spin up a virtual environment wrapper
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install core runtime server dependencies
pip install -r requirements.txt

# Launch the live local Uvicorn development server
python -m uvicorn server:app --reload --port 8000

## Frontend Environment Installation
# Move into the frontend workspace
cd frontend

# Install package dependencies
npm install

# Start the local React compilation build server
npm run dev