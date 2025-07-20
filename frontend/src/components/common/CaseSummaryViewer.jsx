import { useState } from 'react';

export default function CaseSummaryViewer({ caseId, token }) {
  const [summary, setSummary] = useState(null);
  const [show, setShow] = useState(false);

  async function fetchSummary() {
    const res = await fetch(`http://localhost:8000/case_summary/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setSummary(data);
      setShow(true);
    } else {
      alert('Failed to fetch summary');
    }
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={show ? () => setShow(false) : fetchSummary}>
        {show ? 'Hide Summary' : 'View Summary'}
      </button>

      {show && summary && (
        <div style={{ padding: '10px', border: '1px solid #ccc', marginTop: '10px' }}>
          <p><strong>Title:</strong> {summary.title}</p>
          <p><strong>Status:</strong> {summary.status.replace(/_/g, ' ')}</p>
          <p><strong>Total Logs:</strong> {summary.total_logs}</p>
          <p><strong>Total Time Spent:</strong> {summary.total_time_spent} min</p>
          <p><strong>Lawyer Email:</strong> {summary.lawyer_email}</p>
          <p><strong>Client Email:</strong> {summary.client_email}</p>
          <p><strong>Created At:</strong> {new Date(summary.created_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
