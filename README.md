# ScriptSentry - AI Clinical Safety Agent Framework

ScriptSentry is an intelligent full-stack web application designed to audit multi-drug prescriptions for cross-interaction risks and dynamically generate safe chronological dosing schedules using Generative AI.

## 🤖 Google Gemini AI Architecture

Instead of static data lookups, this framework leverages live AI reasoning to enforce clinical safety:

```text
[ React Frontend UI ] 
        │
        ▼ (POST Medication Payload)
[ Python FastAPI Backend ]
        │
        ▼ (Injects Clinical Guardrail System Prompts)
[ Google Gemini 2.5 Flash API ] ──► Analyzes biochemical conflicts
        │
        ├─► State: REFUSED  ──► Intercepts & returns risk mechanism
        └─► State: APPROVED ──► Generates safe, spaced daily schedule
        │
        ▼ (Enforced Pydantic Structured JSON Schema)
[ React Frontend UI ] ──► Dynamically renders safety alerts or timeline

## 🗺️ System Layout
Frontend Client: Built with React and compiled via Vite. It handles patient triage input, processes real-time API logs, and displays the AI results. (Hosted on Vercel)

Backend Engine: Built with Python and wrapped in an asynchronous FastAPI server structure. It handles data sanitization and acts as the secure orchestration node for the Google Gemini API. (Hosted on Render)
## 🛠️ Tech Stack
AI Core: Google Gemini API (gemini-2.5-flash)

Backend: Python 3.11+, FastAPI, Uvicorn, Pydantic (Strong data schema validation)

Frontend: React.js, Vite, TailwindCSS

Deployment: Vercel (Frontend) & Render (Backend)

## 🚀 Local Installation
1. Backend Environment
cd scriptsentry
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Ensure GEMINI_API_KEY is set in your environment variables
python -m uvicorn server:app --reload --port 8000

2. Frontend Environment
cd frontend
npm install
npm run dev