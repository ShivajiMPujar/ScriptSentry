
# ?? ScriptSentry: Clinical Safety Multi-Agent Graph Framework

ScriptSentry is an automated clinical safety guardrail system engineered using a **Deterministic Multi-Agent Graph** architecture. Built using Python, it programmatically audits patient prescription combinations for severe drug-to-drug interactions before generating medical intake schedules, ensuring safety is controlled structurally rather than relying on unpredictable LLM prompts.

---

## ??? System Architecture & Workflow

The framework operates as a strict pipeline to eliminate hallucination risks entirely in clinical settings:

1. **Triage Intake Node:** Captures the incoming patient profile data and the requested list of co-prescribed medications.
2. **Pharmacology Audit Node:** Connects natively via Model Context Protocol (MCP) to query a trusted, structured local interaction registry.
3. **Structural Safety Router:** Evaluates the audit payload. If a conflict is identified, it instantly hijacks the execution thread and routes to the Alert Node. If clear, it routes to the Schedule Node.
4. **Output Generation:** - *Test Case 1 (High-Risk):* Intercepts Metformin + Ibuprofen, issues a `?? [CRITICAL ALERT]`, details the renal blood flow mechanism, and hard-refuses schedule generation.
   - *Test Case 2 (Clean):* Validates Metformin + Omeprazole and constructs a safe morning/evening timeline.

---

## ??? Local Installation & Verification

### Prerequisites
- Python 3.10+
- Git

### Quick Start
```bash
# Clone the repository
git clone [https://github.com/ShivajiMPujar/ScriptSentry.git](https://github.com/ShivajiMPujar/ScriptSentry.git)
cd ScriptSentry

# Run the local multi-agent graph simulation
python app/agent.py
