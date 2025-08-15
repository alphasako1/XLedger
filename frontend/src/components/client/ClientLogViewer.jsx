// components/client/ClientLogViewer.jsx
import { useEffect, useState } from "react";
import LogItem from "../common/LogItem";

/**
 * If `embedded` is true, this component auto-fetches and renders the logs list
 * without rendering its own "View Logs" toggle button.
 */
export default function ClientLogViewer({ caseId, token, embedded = false }) {
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(embedded);

  async function fetchLogs() {
    const res = await fetch(`http://localhost:8000/case_logs/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      alert("Failed to fetch logs");
      return;
    }
    const data = await res.json();
    setLogs(data);
    setShowLogs(true);
  }

  useEffect(() => {
    if (embedded) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedded, caseId, token]);

  if (embedded) {
    // Just render the list (no buttons)
    return (
      <ul className="space-y-3 pl-0">
        {logs.length === 0 ? (
          <li className="text-sm text-slate-600">No logs yet.</li>
        ) : (
          logs.map((log) => (
            <LogItem key={log.id} log={log} token={token} readOnly />
          ))
        )}
      </ul>
    );
  }

  // Standalone mode with its own toggle
  return (
    <div className="mt-2">
      <button
        className="btn btn-secondary"
        onClick={showLogs ? () => setShowLogs(false) : fetchLogs}
      >
        {showLogs ? "Hide Logs" : "View Logs"}
      </button>

      {showLogs && (
        <ul className="space-y-3 pl-0 mt-3">
          {logs.length === 0 ? (
            <li className="text-sm text-slate-600">No logs yet.</li>
          ) : (
            logs.map((log) => (
              <LogItem key={log.id} log={log} token={token} readOnly />
            ))
          )}
        </ul>
      )}
    </div>
  );
}
