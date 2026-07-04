import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="ScriptSentry Clinical Safety Graph API")

# Enable CORS so your live Vercel frontend can securely communicate with this backend local dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuditRequest(BaseModel):
    patient_id: str
    patient_name: str
    medications: List[str]

def load_clinical_matrix():
    possible_paths = [
        os.path.join("data", "drug_interactions.json"),
        os.path.join("frontend", "src", "drug_interactions.json"),
        "drug_interactions.json"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
    
    # Secure fallback dataset if paths aren't found
    return {
        "clinical_registry": {
            "omeprazole": {"frequency_per_day": 1, "preferred_window": "Early Morning (Empty Stomach)", "base_hour": 7},
            "metformin": {"frequency_per_day": 2, "preferred_window": "With Meals", "base_hour": 9},
            "amoxicillin": {"frequency_per_day": 3, "preferred_window": "Post Meals", "base_hour": 8},
            "ibuprofen": {"frequency_per_day": 2, "preferred_window": "Post Meals (With Food)", "base_hour": 13},
            "aspirin": {"frequency_per_day": 1, "preferred_window": "Morning with Food", "base_hour": 8}
        },
        "conflicts": {
            "metformin": {"ibuprofen": {"gap_required": 6, "mechanism": "NSAID interaction reduces renal clearance pathways."}},
            "aspirin": {"ibuprofen": {"gap_required": 8, "mechanism": "Antiplatelet aggregation pathway competition."}}
        }
    }

def format_hour(hr: int) -> str:
    ampm = "PM" if hr >= 12 else "AM"
    display_hr = hr % 12
    if display_hr == 0:
        display_hr = 12
    return f"{str(display_hr).zfill(2)}:00 {ampm}"

@app.get("/")
def root():
    return {"status": "ONLINE", "service": "ScriptSentry Core Agent Router"}

@app.post("/api/audit")
def audit_prescriptions(payload: AuditRequest):
    if not payload.medications:
        raise HTTPException(status_code=400, detail="Medication array cannot be empty")

    matrix = load_clinical_matrix()
    registry = matrix.get("clinical_registry", {})
    conflicts = matrix.get("conflicts", {})

    normalized = [m.lower().strip() for m in payload.medications]
    critical_conflict = None

    # Phase 1: Interaction Matrix Audit Node
    for i in range(len(normalized)):
        for j in range(i + 1, len(normalized)):
            m1, m2 = normalized[i], normalized[j]
            if m1 in conflicts and m2 in conflicts[m1]:
                critical_conflict = {
                    "pair": f"{payload.medications[i]} + {payload.medications[j]}",
                    "mechanism": conflicts[m1][m2]["mechanism"]
                }
                break
        if critical_conflict:
            break

    if critical_conflict:
        return {
            "status": "REFUSED",
            "pair": critical_conflict["pair"],
            "mechanism": critical_conflict["mechanism"],
            "logs": [
                {"node": "[1. TRIAGE NODE]", "text": f"Ingesting clinical array for {payload.patient_name}", "type": "info", "icon": "🔄"},
                {"node": "[2. AUDIT NODE]", "text": "Checking kinetic pathway conflict vectors...", "type": "info", "icon": "🔍"},
                {"node": "[🚨 STRUCTURAL ROUTER]", "text": f"Refusal state triggered: {critical_conflict['pair']} contains safety violation.", "type": "error", "icon": "🛑"}
            ]
        }

    # Phase 2: Chrono Graph Generator Node
    generated_timeline = []

    for idx, med_key in enumerate(normalized):
        med_name = payload.medications[idx]
        metadata = registry.get(med_key)

        if not metadata:
            generated_timeline.append({
                "name": med_name,
                "hourValue": 9,
                "timeString": "09:00 AM",
                "window": "Standard Routine"
            })
            continue

        freq = metadata["frequency_per_day"]
        base_hour = metadata["base_hour"]
        window_notes = metadata["preferred_window"]
        interval_spacing = 6 if freq == 3 else 12 if freq == 2 else 0

        for dose_idx in range(freq):
            calculated_hour = base_hour + (dose_idx * interval_spacing)
            if calculated_hour >= 24:
                calculated_hour -= 24

            generated_timeline.append({
                "name": med_name,
                "hourValue": calculated_hour,
                "timeString": format_hour(calculated_hour),
                "window": f"{window_notes} (Dose {dose_idx + 1}/{freq})"
            })

    generated_timeline.sort(key=lambda x: x["hourValue"])

    return {
        "status": "APPROVED",
        "schedule": generated_timeline,
        "logs": [
            {"node": "[1. TRIAGE NODE]", "text": f"Ingesting clinical array for {payload.patient_name} ({payload.patient_id})", "type": "info", "icon": "🔄"},
            {"node": "[2. AUDIT NODE]", "text": "Checking kinetic pathway conflict vectors...", "type": "info", "icon": "🔍"},
            {"node": "[3. CHRONO GENERATOR]", "text": "No absolute blocks found. Building personalized medical timelines...", "type": "success", "icon": "📅"}
        ]
    }