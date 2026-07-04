import React, { useState } from 'react';

export default function App() {
  const [patientName, setPatientName] = useState('John Doe');
  const [patientId, setPatientId] = useState('PT-9482');
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableDrugs = ["Metformin", "Ibuprofen", "Omeprazole", "Aspirin", "Amoxicillin"];

  const handleMedToggle = (med) => {
    if (selectedMeds.includes(med)) {
      setSelectedMeds(selectedMeds.filter(m => m !== med));
    } else {
      setSelectedMeds([...selectedMeds, med]);
    }
  };

  // Crucial Integration Point: Fetching from the Python FastAPI server
  const runSafetyAudit = async () => {
    if (selectedMeds.length === 0) {
      alert("Please select at least 1 medication to process.");
      return;
    }

    setLoading(true);
    setPipelineLogs([
      { node: "[1. NETWORK NODE]", text: "Dispatching payload to Python Core Agent Router...", type: 'info', icon: '🌐' }
    ]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          patient_name: patientName,
          medications: selectedMeds
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Update the UI with data computed by Python agents
      setPipelineLogs(data.logs || []);
      setAuditResult(data);

    } catch (error) {
      console.error("API Connection Error:", error);
      setPipelineLogs([
        { node: "[🚨 NETWORK ERROR]", text: "Failed to communicate with Python FastAPI backend. Ensure server is running on port 8000.", type: 'error', icon: '❌' }
      ]);
      setAuditResult(null);
    } finally {
      setLoading(false);
    }
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
          Decoupled Full-Stack Architecture — React UI connecting to Python FastAPI State Agents.
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
          
          <button onClick={runSafetyAudit} disabled={loading} style={{ padding: '14px', backgroundColor: loading ? '#3b82f6' : COLORS.accent, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? "Routing to Python..." : "Execute Audit Pipeline"}
          </button>
        </section>

        {/* Display Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ backgroundColor: COLORS.console, padding: '24px', borderRadius: '16px', border: `1px solid ${COLORS.border}`, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px', marginBottom: '16px', fontSize: '11px' }}>
              // Remote Agent Engine Trace Logs
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
                  <p style={{ marginTop: '4px', color: COLORS.textSecondary, fontSize: '13px' }}>The Python multi-agent node has mapped out the daily dosing array timeline with appropriate chronological spacing:</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    {auditResult.schedule?.map((item, index) => (
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