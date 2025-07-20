import { useState } from 'react';
import LogItem from '../common/LogItem';
import LogForm from './logs/LogForm';

export default function CaseItem({ caseData, token }) {
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);

  async function fetchLogs() {
    const res = await fetch(`http://localhost:8000/case_logs/${caseData.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setLogs(data);
      setShowLogs(true);
    } else {
      alert('Failed to fetch logs');
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <strong>{caseData.title}</strong> - <em>
        {caseData.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </em>

      <br />
      Case ID: {caseData.id}
      <br />
      Client ID: {caseData.client_id}
      <br />

      <button onClick={() => setShowLogForm(!showLogForm)}>
        {showLogForm ? 'Cancel' : 'Log Work'}
      </button>
      <button onClick={showLogs ? () => setShowLogs(false) : fetchLogs}>
        {showLogs ? 'Hide Logs' : 'View Logs'}
      </button>

      {showLogForm && (
        <LogForm
          caseId={caseData.id}
          token={token}
          onSuccess={fetchLogs}
          onClose={() => setShowLogForm(false)}
        />
      )}

      {showLogs && (
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          {logs.length === 0 ? (
            <li>No logs yet.</li>
          ) : (
            logs.map((log) => (
              <LogItem
                key={log.id}
                log={log}
                token={token}
                onLogUpdated={fetchLogs}
              />
            ))
          )}
        </ul>
      )}
    </div>
  );
}
