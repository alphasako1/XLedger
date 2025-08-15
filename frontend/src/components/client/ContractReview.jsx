import { useState, useEffect } from "react";

export default function ContractReview({ caseId, token, onSigned }) {
  const [contract, setContract] = useState(null);
  const [clientSignature, setClientSignature] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function fetchContract() {
      setMsg(null);
      try {
        const res = await fetch(`/api/contract/${caseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setContract(null);
        } else {
          setContract(await res.json());
        }
      } catch (e) {
        console.error(e);
        setContract(null);
      } finally {
        setLoading(false);
      }
    }
    fetchContract();
  }, [caseId, token]);

  async function handleSign() {
    setMsg(null);
    const res = await fetch(`http://localhost:8000/contract/${caseId}/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ client_signature: clientSignature }),
    });

    const data = await res.json();
    if (res.ok) {
      setMsg({ type: "ok", text: "Contract signed!" });
      onSigned?.();
    } else {
      setMsg({ type: "err", text: data.detail || "Failed to sign" });
    }
  }

  if (loading) return <p className="text-sm text-slate-600">Loading contract…</p>;
  if (!contract) return <p className="text-sm text-slate-600">No contract available.</p>;

  const bothSigned = contract.lawyer_signed && contract.client_signed;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-600 mb-2">Contract for Case {contract.case_id}</div>
      <div className="prose prose-sm max-w-none">
        <p><strong>Terms</strong></p>
        <p className="whitespace-pre-wrap">{contract.content}</p>
      </div>

      <div className="mt-3 text-sm">
        <div><strong>Lawyer Signature:</strong> {contract.lawyer_signature || "—"}</div>
        <div><strong>Client Signature:</strong> {contract.client_signature || (bothSigned ? "—" : "pending")}</div>
      </div>

      {!bothSigned && (
        <div className="mt-3">
          <label className="label">Sign as Client</label>
          <input
            type="text"
            className="input bg-white"
            value={clientSignature}
            onChange={(e) => setClientSignature(e.target.value)}
            placeholder="Type your name"
            required
          />
          <div className="mt-3">
            <button onClick={handleSign} className="btn btn-secondary w-full">
              Sign Contract
            </button>
          </div>
        </div>
      )}

      {msg && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}

