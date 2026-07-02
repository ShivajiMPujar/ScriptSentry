# ScriptSentry: Clinical Safety Multi-Agent Graph Framework

ScriptSentry is an automated clinical safety guardrail system engineered using a **Deterministic Multi-Agent Graph** architecture. Built using Python, it programmatically audits patient prescription combinations for severe drug-to-drug interactions before generating medical intake schedules, ensuring safety is controlled structurally rather than relying on unpredictable LLM prompts.

---

## Architecture Workflow Diagram

```text
       [ Patient Prescription Input ]
                     │
                     ▼
         ┌───────────────────────┐
         │  Triage Intake Node   │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐       Queries       ┌────────────────────────┐
         │ Pharmacology Audit    ├────────────────────►│ drug_interactions.json │
         │      (via MCP)        │◄────────────────────┤   (Local Database)     │
         └───────────┬───────────┘    Local Payload    └────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Structural Safety     │
         │        Router         │
         └─────┬───────────┬─────┘
               │           │
     Conflict  │           │  No Conflict
     Detected  │           │  Detected
               ▼           ▼
  ┌───────────────────┐  ┌───────────────────┐
  │ Strict Alert Node │  │ Schedule Node     │
  │                   │  │                   │
  │  [CRITICAL ALERT] │  │ [INTAKE SCHEDULE] │
  └───────────────────┘  └───────────────────┘