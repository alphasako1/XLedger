import { useEffect, useState } from "react";
import ContractReview from "../components/client/ContractReview";
import CaseStatusHistory from "../components/common/CaseStatusHistory";
import ClientLogViewer from "../components/client/ClientLogViewer";
import CaseSummaryViewer from "../components/common/CaseSummaryViewer";

// If you already have a StatusBadge component (used in lawyer dashboard), reuse it:
import StatusBadge from "../components/lawyer/StatusBadge";

export default function ClientDashboard() {
  const [cases, setCases] = useState([]);
  const token = localStorage.getItem("token");

  async function fetchCases() {
    const res = await fetch("http://localhost:8000/my_cases", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      alert("Failed to fetch cases");
      return;
    }
    setCases(await res.json());
  }

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCases = cases.filter((c) => c.status === "pending");
  const activeCases = cases.filter((c) => c.status !== "pending");

  return (
    <div className="container-app py-8">
      <h1 className="h1">Client Dashboard</h1>

      {/* Pending contracts */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="h2">Pending Contracts</h2>
        </div>

        {pendingCases.length === 0 ? (
          <p className="text-sm text-slate-600">
            Nothing to sign right now.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pendingCases.map((c) => (
              <div key={c.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold text-brand-dark">
                        {c.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Case ID: {c.id}
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                      Pending
                    </span>
                  </div>

                  <div className="mt-4">
                    {/* ContractReview handles fetching + signing */}
                    <ContractReview caseId={c.id} token={token} onSigned={fetchCases} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My cases */}
      <section className="mt-10">
        <h2 className="h2 mb-3">My Cases</h2>

        {activeCases.length === 0 ? (
          <p className="text-sm text-slate-600">No active cases found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeCases.map((c) => (
              <ClientCaseCard key={c.id} caseData={c} token={token} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ----------------- Cards ----------------- */

function ClientCaseCard({ caseData, token }) {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="card">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-brand-dark">{caseData.title}</div>
            <div className="mt-1 text-xs text-slate-600">Case ID: {caseData.id}</div>
          </div>
          <StatusBadge status={caseData.status} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowLogs((s) => !s)}
          >
            {showLogs ? "Hide Logs" : "View Logs"}
          </button>

          <CaseStatusHistory caseId={caseData.id} token={token} />
          <CaseSummaryViewer caseId={caseData.id} token={token} />
        </div>

        {/* Logs (read-only) */}
        {showLogs && (
  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
    <div className="text-sm font-medium mb-2">Logs</div>
    <ClientLogViewer caseId={caseData.id} token={token} embedded />
  </div>
)}
      </div>
    </div>
  );
}
