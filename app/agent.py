import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from mcp_server import check_interactions

class ClinicalState:
    def __init__(self, patient_id, medications):
        self.patient_id = patient_id
        self.medications = medications
        self.safety_violations = []
        self.generated_schedule = None

def triage_intake_node(state: ClinicalState):
    print(f"\n[1. TRIAGE] Processing intake for Patient {state.patient_id}")
    print(f"Current Medications: {', '.join(state.medications)}")
    return state

def pharmacology_audit_node(state: ClinicalState):
    print("[2. AUDIT] Interrogating local interaction database...")
    result = check_interactions(state.medications)
    state.safety_violations = result.get("violations", [])
    return state

def safety_router(state: ClinicalState):
    if len(state.safety_violations) > 0:
        return "trigger_alert"
    return "generate_schedule"

def strict_alert_node(state: ClinicalState):
    print("\n🛑 [CRITICAL ALERT] Safety violation detected! Structural guard fired.")
    for violation in state.safety_violations:
        print(f" - WARNING: {violation['drug_a']} + {violation['drug_b']} ({violation['severity']})")
        print(f"   Mechanism: {violation['mechanism']}")
        print(f"   Action Required: {violation['recommendation']}")
    state.generated_schedule = "REFUSED: Patient medications fail safety validation checks."
    return state

def schedule_generator_node(state: ClinicalState):
    print("\n✅ [SCHEDULE GENERATOR] No conflicts found. Creating safe intake schedule...")
    schedule = f"Morning: {state.medications[0]}\nEvening: {state.medications[1] if len(state.medications) > 1 else ''}"
    state.generated_schedule = schedule
    return state

def run_agent_simulation(patient_id, medications):
    state = ClinicalState(patient_id, medications)
    state = triage_intake_node(state)
    state = pharmacology_audit_node(state)
    
    next_step = safety_router(state)
    if next_step == "trigger_alert":
        strict_alert_node(state)
    else:
        schedule_generator_node(state)
        
    print(f"\nFinal Agent Status Output:\n{state.generated_schedule}\n" + "─"*50)

if __name__ == "__main__":
    print("🚀 STARTING SCRIPTSENTRY AGENT GRAPH SIMULATION\n")
    print("TEST CASE 1: High-Risk Interaction Pair")
    run_agent_simulation("PT-001", ["Metformin", "Ibuprofen"])
    print("TEST CASE 2: Clean / Safe Pair")
    run_agent_simulation("PT-002", ["Metformin", "Omeprazole"])
