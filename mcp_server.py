import json
import os

def check_interactions(medications_list):
    db_path = os.path.join("data", "drug_interactions.json")
    if not os.path.exists(db_path):
        return {"error": "Interaction database not found."}
        
    with open(db_path, "r") as f:
        data = json.load(f)
        
    found_violations = []
    meds = [m.lower().strip() for m in medications_list]
    for item in data.get("interactions", []):
        if item["drug_a"].lower() in meds and item["drug_b"].lower() in meds:
            found_violations.append(item)
            
    return {"violations": found_violations}

if __name__ == "__main__":
    print("Initializing Local ScriptSentry Data Engine...")
    test_query = ["Metformin", "Ibuprofen"]
    print(json.dumps(check_interactions(test_query), indent=2))
