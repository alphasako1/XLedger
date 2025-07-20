// components/client/ClientLogViewer.js
import { useState } from 'react';
import LogItem from '../common/LogItem';

export default function ClientLogViewer({ caseId, token }) {
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);

    async function fetchLogs() {
        if (logs.length > 0) {
            setShowLogs(true); // just toggle open
            return;
        }
        const res = await fetch(`http://localhost:8000/case_logs/${caseId}`, {
            headers: { Authorization: `Bearer ${token}` }
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
        <div style={{ marginTop: '10px' }}>
            <button onClick={showLogs ? () => setShowLogs(false) : fetchLogs}>
                {showLogs ? 'Hide Logs' : 'View Logs'}
            </button>

            {showLogs && (
                <ul style={{ marginTop: '10px' }}>
                    {logs.length === 0 ? (
                        <li>No logs yet.</li>
                    ) : (
                        logs.map(log => (
                            <LogItem key={log.id} log={log} token={token} readOnly />
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
