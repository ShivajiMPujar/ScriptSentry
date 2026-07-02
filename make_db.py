
import json
data = {
    "interactions": [
        {
            "drug_a": "Metformin",
            "drug_b": "Ibuprofen",
            "severity": "HIGH",
            "mechanism": "NSAIDs reduce renal blood flow, increasing Metformin plasma concentration.",
            "recommendation": "Avoid combination."
        },
        {
            "drug_a": "Warfarin",
            "drug_b": "Aspirin",
            "severity": "CRITICAL",
            "mechanism": "Synergistic anticoagulation causing bleeding risk.",
            "recommendation": "Contraindicated."
        }
    ]
}
with open("data/drug_interactions.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print("? Local Database Generated Successfully!")

