import React, { useState } from 'react';
// Changed path to explicitly read from the local src folder copy
import registryData from './drug_interactions.json';

export default function App() {
  const [patientName, setPatientName] = useState('John Doe');
  const [patientId, setPatientId] = useState('PT-9482');
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const [auditResult, setAuditResult] = useState(null);

  const availableDrugs = ["Metformin", "Ibuprofen", "Omeprazole", "Aspirin", "Amoxicillin"];

  const handleMedToggle = (med) => {
    if (selectedMeds.includes(med)) {
      setSelectedMeds(selectedMeds.filter(m => m !== med));
    } else {
      setSelectedMeds([...selectedMeds, med]);
    }
  };

  const formatHour = (hr) => {
    const ampm = hr >= 12 ? 'PM' : 'AM';
    let displayHr = hr % 12;
    if (displayHr === 0) displayHr = 12;
    return `${String(displayHr).padStart(2, '0')}:00 ${ampm}`;
  };

  const runSafetyAudit = () => {
    if (selectedMeds.length === 0) {
      alert("Please select at least 1 medication to process.");
      return;
    }

    const logs = [
      { node: "[1. TRIAGE NODE]", text: `Ingesting clinical array for ${patientName} (${patientId})`, type: 'info', icon: '🔄' },
      { node: "[2. AUDIT NODE]", text: "Checking kinetic pathway conflict vectors...", type: 'info', icon: '🔍' }
    ];

    const normalized = selectedMeds.map(m => m.toLowerCase().trim());
    const registry = registryData.clinical_registry || {};
    const conflicts = registryData.conflicts || {};
    
    let criticalConflict = null;

    // Phase 1: Interaction Matrix Audit
    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j < normalized.length; j++) {
        const m1 = normalized[i];
        const m2 = normalized[j];
        if (conflicts[m1] && conflicts[m1][m2]) {
          criticalConflict = { pair: `${selectedMeds[i]} + ${selectedMeds[j]}`, mechanism: conflicts[m1][m2].mechanism };
          break;
        }
      }
      if (criticalConflict) break;
    }

    if (criticalConflict) {
      logs.push({ node: "[🚨 STRUCTURAL ROUTER]", text: `Refusal state triggered: ${criticalConflict.pair} contains a high-risk safety violation.`, type: 'error', icon: '🛑' });
      setPipelineLogs(logs);
      setAuditResult({ status: 'REFUSED', mechanism: criticalConflict.mechanism, pair: criticalConflict.pair });
      return;
    }

    // Phase 2: Chrono Graph Generator Node
    logs.push({ node: "[3. CHRONO GENERATOR]", text: "No absolute blocks found. Building personalized medical timelines...", type: 'success', icon: '📅' });
    
    let generatedTimeline = [];

    normalized.forEach((medKey, idx) => {
      const medName = selectedMeds[idx];
      const metadata = registry[medKey];

      if (!metadata) {
        generatedTimeline.push({ name: medName, hourValue: 9, timeString: "09:00 AM", window: "Standard Routine" });
        return;
      }

      const freq = metadata.frequency_per_day;
      const baseHour = metadata.base_hour;
      const windowNotes = metadata.preferred_window;

      const intervalSpacing = freq === 3 ? 6 : freq === 2 ? 12 : 0;

      for (let doseIdx = 0; doseIdx < freq; doseIdx++) {
        let calculatedHour = baseHour + (doseIdx * intervalSpacing);
        if (calculatedHour >= 24) calculatedHour -= 24;

        generatedTimeline.push({
          name: medName,
          hourValue: calculatedHour,
          timeString: formatHour(calculatedHour),
          window: `${windowNotes} (Dose ${doseIdx + 1}/${freq})`
        });
      }
    });

    // Sort timeline sequentially
    generatedTimeline.sort((a, b) => a.hourValue - b.hourValue);

    setPipelineLogs(logs);
    setAuditResult({ status: 'APPROVED', schedule: generatedTimeline });
  };

  const COLORS = {
    bg: '#0c0d0e',
    card: '#141619',
    border: '#262930',
    accent: '#2563eb',
    text: '#f3f4f6',
    textSecondary: '#9ca3af',
    console: '#050506',
    agentGreen: '#4ade80',
    agentRed: '#f87171',
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '1400px', margin: '0 auto', padding: 'clamp(15px, 4vw, 40px)', color: COLORS.text, backgroundColor: COLORS.bg, minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <header style={{ paddingBottom: '24px', borderBottom: `1px solid ${COLORS.border}`, marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: '800', letterSpacing: '-0.025em' }}>
            ScriptSentry: Clinical Safety Agent Graph
          </h1>
        </div>
        <p style={{ color: COLORS.textSecondary, margin: '8px 0 0 0', fontSize: '14px' }}>
          Deterministic workflow visualization for multi-medication intake audits.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Input Panel */}
        <section style={{ backgroundColor: COLORS.card, padding: '24px', borderRadius: '16px', border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: COLORS.accent, letterSpacing: '0.05em' }}>📋 TRIAGE INTAKE NODE</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Patient ID" style={{ padding: '10px 14px', backgroundColor: '#070809', border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text }} />
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Full Name" style={{ padding: '10px 14px', backgroundColor: '#070809', border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text }} />
          </div>
          
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px 0', color: COLORS.textSecondary }}>Select Prescriptions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {availableDrugs.map(drug => (
                <label key={drug} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: selectedMeds.includes(drug) ? 'rgba(37, 99, 235, 0.1)' : '#070809', border: `1px solid ${selectedMeds.includes(drug) ? COLORS.accent : COLORS.border}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedMeds.includes(drug)} onChange={() => handleMedToggle(drug)} style={{ accentColor: COLORS.accent }} />
                  {drug}
                </label>
              ))}
            </div>
          </div>
          
          <button onClick={runSafetyAudit} style={{ padding: '14px', backgroundColor: COLORS.accent, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Execute Audit Pipeline
          </button>
        </section>

        {/* Display Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ backgroundColor: COLORS.console, padding: '24px', borderRadius: '16px', border: `1px solid ${COLORS.border}`, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px', marginBottom: '16px', fontSize: '11px' }}>
              // Local Graph Engine Trace Logs
            </div>
            {pipelineLogs.length === 0 && <p style={{ color: '#4b5563', margin: 0, fontStyle: 'italic' }}>Awaiting pipeline execution...</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pipelineLogs.map((log, i) => (
                <div key={i} style={{ position: 'relative', paddingLeft: '24px', color: log.type === 'error' ? COLORS.agentRed : log.type === 'success' ? COLORS.agentGreen : '#e5e7eb' }}>
                  <div style={{ position: 'absolute', left: '-2px', top: '0' }}>{log.icon || '•'}</div>
                  <div><span style={{ fontWeight: '700', color: log.type === 'success' ? COLORS.agentGreen : COLORS.accent }}>{log.node}</span> {log.text}</div>
                </div>
              ))}
            </div>
          </div>

          {auditResult && (
            <div style={{ backgroundColor: COLORS.card, padding: '24px', borderRadius: '16px', border: `1px solid ${auditResult.status === 'REFUSED' ? COLORS.agentRed : COLORS.agentGreen}` }}>
              {auditResult.status === 'REFUSED' ? (
                <div>
                  <h2 style={{ margin: 0, color: COLORS.agentRed, fontSize: '16px', fontWeight: '800' }}>🛑 HIGH RISK INTERCEPTION</h2>
                  <div style={{ marginTop: '14px', backgroundColor: '#1c1212', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '14px' }}><strong style={{ color: COLORS.agentRed }}>Interacted Pair:</strong> <code>{auditResult.pair}</code></p>
                    <p style={{ margin: 0, fontSize: '13px', color: COLORS.textSecondary }}><strong>Clinical Rationale:</strong> {auditResult.mechanism}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 style={{ margin: 0, color: COLORS.agentGreen, fontSize: '16px', fontWeight: '800' }}>✅ MEDICAL SCHEDULE GENERATED</h2>
                  <p style={{ marginTop: '4px', color: COLORS.textSecondary, fontSize: '13px' }}>The multi-agent node has mapped out the daily dosing array timeline with appropriate chronological spacing:</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    {auditResult.schedule.map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070809', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
                        <div>
                          <h3 style={{ color: COLORS.text, fontSize: '15px', margin: 0 }}>{item.name}</h3>
                          <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>{item.window}</span>
                        </div>
                        <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', fontFamily: 'monospace' }}>
                          ⏰ {item.timeString}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}