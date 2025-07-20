import { useEffect, useState } from 'react';

export default function CaseStatusHistory({ caseId, token }) {
  const [history, setHistory] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) return;

    async function fetchHistory() {
      const res = await fetch(`http://localhost:8000/case_status_history/${caseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else {
        alert('Failed to fetch status history');
      }
    }

    fetchHistory();
  }, [show, caseId, token]);

  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={() => setShow(!show)}>
        {show ? 'Hide Status History' : 'View Status History'}
      </button>
      {show && (
        <ul>
          {history.length === 0 ? (
            <li>No status changes yet.</li>
          ) : (
            history.map((entry, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>
                <strong>{new Date(entry.changed_at).toLocaleString()}</strong><br />
                {entry.old_status.replace(/_/g, ' ')} → {entry.new_status.replace(/_/g, ' ')}<br />
                <em>Reason:</em> {entry.reason}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
