import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from google import genai
from google.genai import types

app = FastAPI(title="ScriptSentry Clinical Safety Graph API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connects to the Gemini engine using the environment key
client = genai.Client()

class AuditRequest(BaseModel):
    patient_id: str
    patient_name: str
    medications: List[str]

class AISafetyResponse(BaseModel):
    status: str  
    pair: str    
    mechanism: str 
    schedule: List[dict] 

@app.get("/")
def root():
    return {"status": "ONLINE", "service": "ScriptSentry Core AI Agent Router"}

@app.post("/api/audit")
def audit_prescriptions(payload: AuditRequest):
    if not payload.medications:
        raise HTTPException(status_code=400, detail="Medication array cannot be empty")

    prompt = f"""
    You are an AI Clinical Safety Agent. Analyze the following medication list for a patient named {payload.patient_name}:
    Medications: {', '.join(payload.medications)}

    CRITICAL RULES:
    1. Look for dangerous drug-to-drug interactions. If any exist, set status to "REFUSED", identify the "pair", and explain the "mechanism".
    2. If there are no severe interactions, set status to "APPROVED".
    3. If APPROVED, generate a list of daily schedule entries for each medication. For each dose, provide:
       - "name": Name of the medicine
       - "hourValue": 24-hour integer format (e.g., 7, 13, 20)
       - "timeString": Readable format (e.g., "07:00 AM", "01:00 PM")
       - "window": Instructions (e.g., "With Food", "Empty Stomach")
       Space out interacting or heavy drugs cleanly across the 24-hour timeline.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AISafetyResponse,
                temperature=0.2 
            ),
        )
        
        ai_data = json.loads(response.text)
        
        if ai_data.get("status") == "REFUSED":
            return {
                "status": "REFUSED",
                "pair": ai_data.get("pair", "Unknown Conflict"),
                "mechanism": ai_data.get("mechanism", "AI detected pathway competition."),
                "logs": [
                    {"node": "[🤖 AI INTAKE]", "text": f"Analyzing prescription array via Gemini engine...", "type": "info", "icon": "🔄"},
                    {"node": "[🚨 SAFETY GUARDRAIL]", "text": f"Refusal triggered: {ai_data.get('pair')} violates clinical safety guidelines.", "type": "error", "icon": "🛑"}
                ]
            }
        
        return {
            "status": "APPROVED",
            "schedule": ai_data.get("schedule", []),
            "logs": [
                {"node": "[🤖 AI INTAKE]", "text": "Analyzing prescription array via Gemini engine...", "type": "info", "icon": "🔄"},
                {"node": "[✅ AI GENERATOR]", "text": "No absolute blocks found. AI has generated a safe, spaced dosing schedule.", "type": "success", "icon": "📅"}
            ]
        }

    except Exception as e:
        print("Gemini API Error:", e)
        raise HTTPException(status_code=500, detail="Internal AI Processing Error")