import { useState } from 'react';


export default function LogForm({ caseId, token, onSuccess, onClose }) {
  const [description, setDescription] = useState('');
  const [timeSpent, setTimeSpent] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/log_progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        case_id: caseId,
        description,
        time_spent: parseInt(timeSpent),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Progress logged!');
      setDescription('');
      setTimeSpent('');
      onSuccess(); // trigger refresh or UI update
      onClose();   // close the form
    } else {
      alert(data.detail || 'Failed to log progress');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <h3>Log Work for Case: {caseId}</h3>
      <label>Description:</label>
      <input
        type="text"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <label>Time Spent (minutes):</label>
      <input
        type="number"
        required
        value={timeSpent}
        onChange={(e) => setTimeSpent(e.target.value)}
      />
      <br />
      <button type="submit">Submit</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
