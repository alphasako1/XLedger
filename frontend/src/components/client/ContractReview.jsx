import { useState, useEffect } from 'react';

export default function ContractReview({ caseId, token, onSigned }) {
  const [contract, setContract] = useState(null);
  const [clientSignature, setClientSignature] = useState('');
  const [loading, setLoading] = useState(true); // <-- You missed this

  useEffect(() => {
    async function fetchContract() {
      try {
        const res = await fetch(`http://localhost:8000/contract/${caseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setContract(data);
        } else {
          setContract(null);
        }
      } catch (err) {
        console.error('Failed to fetch contract:', err);
        setContract(null);
      } finally {
        setLoading(false);
      }
    }

    fetchContract();
  }, [caseId, token]);

  async function handleSign() {
    const res = await fetch(`http://localhost:8000/contract/${caseId}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ client_signature: clientSignature }),
    });

    if (res.ok) {
      alert('Contract signed!');
      onSigned(); // refresh dashboard
    } else {
      const err = await res.json();
      alert(err.detail || 'Failed to sign');
    }
  }

  // handle loading and missing contract
  if (loading) return <p>Loading contract...</p>;
  if (!contract) return <p>No contract available.</p>;

  return (
    <div style={{ border: '1px solid gray', padding: '10px', marginTop: '10px' }}>
      <h3>Contract for Case {contract.case_id}</h3>
      <p><strong>Terms:</strong><br />{contract.content}</p>
      <p><strong>Lawyer Signature:</strong> {contract.lawyer_signature}</p>
      {contract.client_signature ? (
        <p><strong>Client Signature:</strong> {contract.client_signature}</p>
      ) : (
        <>
          <label>Sign as Client:</label><br />
          <input
            type="text"
            value={clientSignature}
            onChange={(e) => setClientSignature(e.target.value)}
            required
          />
          <br />
          <button onClick={handleSign}>Sign Contract</button>
        </>
      )}
    </div>
  );
}
