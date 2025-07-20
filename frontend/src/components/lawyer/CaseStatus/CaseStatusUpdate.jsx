import { useState } from 'react';

export default function CaseStatusUpdate({ caseId, token, onUpdated }) {
    const [status, setStatus] = useState('');
    const [customStatus, setCustomStatus] = useState('');
    const [reason, setReason] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        const body = {
            status,
            custom_status: status === 'other' ? customStatus : '',
            reason: reason || 'Status updated',
        };

        const res = await fetch(`http://localhost:8000/update_case_status/${caseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            alert('Case status updated');
            if (onUpdated) onUpdated();
        } else {
            const err = await res.json();
            alert(err.detail || 'Failed to update status');
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
            <label>
                Select Status:
                <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                    <option value="">--Choose--</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="awaiting_client">Awaiting Client</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="disputed">Disputed</option>
                    <option value="other">Other</option>
                </select>
            </label>
            {status === 'other' && (
                <div>
                    <label>
                        Custom Status:
                        <input
                            type="text"
                            value={customStatus}
                            onChange={(e) => setCustomStatus(e.target.value)}
                            required
                        />
                    </label>
                </div>
            )}
            <div>
                <label>
                    Reason:
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </label>
            </div>
            <button type="submit">Update Status</button>
        </form>
    );
}
