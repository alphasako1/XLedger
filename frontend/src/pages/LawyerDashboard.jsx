import { useEffect, useState } from "react";
import LogoutButton from "../components/common/LogoutButton";
import CaseItem from "../components/lawyer/CaseItem";

export default function LawyerDashboard() {
  const [cases, setCases] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [terms, setTerms] = useState("");
  const [lawyerSignature, setLawyerSignature] = useState("");

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  async function fetchCases() {
    const res = await fetch("/api/my_cases", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setCases(data);
  }

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateCase(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/create_case", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          client_id: parseInt(clientId, 10),
          contract_content: terms,
          lawyer_signature: lawyerSignature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to create case");
      // successful → refresh list & reset form
      await fetchCases();
      setShowCreate(false);
      setTitle(""); setClientId(""); setTerms(""); setLawyerSignature("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-app py-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
  <h1 className="h1">Lawyer Dashboard</h1>
  <button
    className="btn btn-secondary"
    onClick={() => setShowCreate((s) => !s)}
  >
    {showCreate ? "Close" : "Create New Case"}
  </button>
</div>


      {/* Create case panel */}
      {showCreate && (
        <div className="card mb-8">
          <div className="card-body">
            <h2 className="h2 mb-4">New Case</h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCase} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="label">Case Title</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="md:col-span-1">
                <label className="label">Client ID</label>
                <input type="number" className="input" value={clientId} onChange={(e) => setClientId(e.target.value)} required />
              </div>

              <div className="md:col-span-2">
                <label className="label">Contract Terms</label>
                <textarea className="input" rows={5} value={terms} onChange={(e) => setTerms(e.target.value)} required />
              </div>

              <div className="md:col-span-1">
                <label className="label">Lawyer Signature</label>
                <input className="input" value={lawyerSignature} onChange={(e) => setLawyerSignature(e.target.value)} required />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary" disabled={saving}>
                  {saving ? "Creating..." : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cases grid */}
      <h2 className="h2 mb-4">My Cases</h2>
      {cases.length === 0 ? (
        <p className="text-slate-700">No cases yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {cases.map((c) => (
            <CaseItem key={c.id} caseData={c} token={token} onRefresh={fetchCases} />
          ))}
        </div>
      )}
    </div>
  );
}

