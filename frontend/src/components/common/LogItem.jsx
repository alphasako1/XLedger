import { useState } from 'react';

export default function LogItem({ log, token, onLogUpdated, readOnly = false }) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(log.description);
  const [timeSpent, setTimeSpent] = useState(log.time_spent);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  async function handleUpdate() {
    const res = await fetch(`http://localhost:8000/edit_log/${log.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        description,
        time_spent: parseInt(timeSpent),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Log updated!');
      setEditing(false);
      onLogUpdated(); // re-fetch logs
    } else {
      alert(data.detail || 'Failed to update log');
    }
  }

  async function fetchHistory() {
    const res = await fetch(`http://localhost:8000/log_history/${log.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setHistory(data);
      setShowHistory(true);
    } else {
      alert(data.detail || 'Failed to fetch log history');
    }
  }

  function toggleHistory() {
    if (showHistory) {
      setShowHistory(false);
    } else {
      fetchHistory();
    }
  }

  return (
    <li style={{ marginBottom: '10px' }}>
      {editing ? (
        <>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
          />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <strong>{log.description}</strong> ({log.time_spent} min)
          <br />
          {new Date(log.timestamp).toLocaleString()}
          {log.is_edited && <em> (edited)</em>}
          <br />
          {!readOnly && (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}

          <button onClick={toggleHistory}>
            {showHistory ? 'Hide History' : 'View History'}
          </button>

        </>
      )}

      {showHistory && history.length > 0 && (
        <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
          {history.map((h) => (
            <li key={h.id}>
              <strong>Old Desc:</strong> {h.old_description} <br />
              <strong>Old Time:</strong> {h.old_time_spent} min <br />
              <strong>Edited At:</strong> {new Date(h.edited_at).toLocaleString()} <br />
              <strong>Edited By:</strong> {h.edited_by}
            </li>
          ))}
        </ul>
      )}

      {showHistory && history.length === 0 && (
        <p>No history found for this log.</p>
      )}
    </li>
  );
}
