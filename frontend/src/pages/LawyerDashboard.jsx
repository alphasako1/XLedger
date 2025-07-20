import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/common/LogoutButton';
import CaseItem from '../components/lawyer/CaseItem';
import CaseStatusUpdate from '../components/lawyer/CaseStatus/CaseStatusUpdate';
import CaseStatusHistory from '../components/common/CaseStatusHistory';
import CaseSummaryViewer from '../components/common/CaseSummaryViewer';


export default function LawyerDashboard() {
    const [cases, setCases] = useState([]);
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [showForm, setShowForm] = useState(false);

    const token = localStorage.getItem('token');
    const navigate = useNavigate();


    const [logsByCaseId, setLogsByCaseId] = useState({});
    const [expandedCaseId, setExpandedCaseId] = useState(null);


    const [terms, setTerms] = useState('');
    const [lawyerSignature, setLawyerSignature] = useState('');

    useEffect(() => {
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

        fetchCases();
    }, []);

    async function fetchLogs(caseId) {
        if (logsByCaseId[caseId]) {
            // Toggle off if already fetched and showing
            setExpandedCaseId(expandedCaseId === caseId ? null : caseId);
            return;
        }

        const res = await fetch(`http://localhost:8000/case_logs/${caseId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            alert('Failed to fetch logs');
            return;
        }

        const data = await res.json();
        setLogsByCaseId((prev) => ({ ...prev, [caseId]: data }));
        setExpandedCaseId(caseId);
    }


    async function handleCreateCase(e) {
        e.preventDefault();

        const res = await fetch('http://localhost:8000/create_case', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                title,
                client_id: parseInt(clientId),
                contract_content: terms,
                lawyer_signature: lawyerSignature
            }),
        });

        const data = await res.json();
        if (res.ok) {
            alert('Case created!');
            setCases([...cases, { ...data, title, status: 'pending' }]);
            setShowForm(false);
            setTitle('');
            setClientId('');
        } else {
            alert(data.detail || data.error || 'Failed to create case');
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Lawyer Dashboard</h1>
            <LogoutButton />

            <h2>My Cases</h2>
            {cases.length === 0 ? (
                <p>No cases yet.</p>
            ) : (
                <ul>
                    {cases.map((c) => (
                        <li key={c.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', listStyle: 'none' }}>
                            <CaseItem caseData={c} token={token} onLogClick={() => setExpandedCaseId(c.id)} />
                            <CaseStatusUpdate
                                caseId={c.id}
                                token={token}
                                onUpdated={async () => {
                                    const res = await fetch('http://localhost:8000/my_cases', {
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                    if (res.ok) {
                                        const updated = await res.json();
                                        setCases(updated);
                                    }
                                }}
                                
                            />
                            <CaseStatusHistory caseId={c.id} token={token} />
                            <CaseSummaryViewer caseId={c.id} token={token} />
                        </li>

                    ))}
                </ul>


            )}


            <hr />

            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Create New Case'}
            </button>

            {showForm && (
                <form onSubmit={handleCreateCase} style={{ marginTop: '15px' }}>
                    <label>Case Title:</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <br />
                    <label>Client ID:</label>
                    <input
                        type="number"
                        required
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                    />
                    <br />
                    <label>Contract Terms:</label>
                    <textarea
                        required
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                    />
                    <br />
                    <label>Lawyer Signature:</label>
                    <input
                        type="text"
                        required
                        value={lawyerSignature}
                        onChange={(e) => setLawyerSignature(e.target.value)}
                    />
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
}
