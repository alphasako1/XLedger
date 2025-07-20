import { useEffect, useState } from 'react';
import LogoutButton from '../components/common/LogoutButton';
import ContractReview from '../components/client/ContractReview';
import CaseStatusHistory from '../components/common/CaseStatusHistory';
import ClientLogViewer from '../components/client/ClientLogViewer';
import CaseSummaryViewer from '../components/common/CaseSummaryViewer';

export default function ClientDashboard() {
    const [cases, setCases] = useState([]);

    const token = localStorage.getItem('token');

    async function fetchCases() {
        const res = await fetch('http://localhost:8000/my_cases', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            alert('Failed to fetch cases');
            return;
        }

        const data = await res.json();
        setCases(data);
    }

    useEffect(() => {
        fetchCases();
    }, []);

    const pendingCases = cases.filter(c => c.status === 'pending');
    const activeCases = cases.filter(c => c.status !== 'pending');

    return (
        <div style={{ padding: '20px' }}>
            <h1>Client Dashboard</h1>
            <LogoutButton />

            {/* 🔶 Pending Contracts Section */}
            <h2>Pending Contracts</h2>
            {pendingCases.length === 0 ? (
                <p>No pending contracts.</p>
            ) : (
                pendingCases.map(c => (
                    <div key={c.id} style={{ marginBottom: '20px' }}>
                        <p>
                            <strong>{c.title}</strong> - Awaiting your signature
                        </p>
                        <ContractReview caseId={c.id} token={token} onSigned={fetchCases} />
                    </div>
                ))
            )}

            <hr />

            {/* 🔷 Active/Other Cases Section */}
            <h2>My Cases</h2>
            {activeCases.length === 0 ? (
                <p>No active cases found.</p>
            ) : (
                <ul>
                    {activeCases.map(c => (
                        <li key={c.id}>
                            <strong>{c.title}</strong> - <em>{c.status}</em>
                            <br />
                            Case ID: {c.id}
                            <br />
                            <CaseStatusHistory caseId={c.id} token={token} />
                            <ClientLogViewer caseId={c.id} token={token} />
                            <CaseSummaryViewer caseId={c.id} token={token} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
