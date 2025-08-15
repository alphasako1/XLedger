import { useEffect, useState } from "react";

function Badge({ ok, children }) {
  return ok ? (
    <span className="badge badge-ok">{children ?? "Verified"}</span>
  ) : (
    <span className="badge badge-bad">{children ?? "Mismatch"}</span>
  );
}

export default function AuditorDashboard() {
  const token = localStorage.getItem("token");

  // Single-log verify
  const [caseId, setCaseId] = useState("");
  const [logId, setLogId] = useState("");
  const [singleResult, setSingleResult] = useState(null);

  // Case verify (all logs)
  const [caseIdAll, setCaseIdAll] = useState("");
  const [bulkRows, setBulkRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [caseId, logId, caseIdAll]);

  async function verifySingle(e) {
    e.preventDefault();
    setError("");
    setSingleResult(null);

    try {
      const res = await fetch(
        `/api/audit/verify_log/${caseId}/${logId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Verification failed");
        return;
      }
      setSingleResult(data);
    } catch (err) {
      console.error(err);
      setError("Request failed");
    }
  }

  async function verifyCase(e) {
    e.preventDefault();
    setError("");
    setBulkRows([]);

    try {
      const res = await fetch(
        `/api/audit/verify_case/${caseIdAll}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Case verification failed");
        return;
      }

      // The backend returns grouped logs: { original: {...}, edits: [{...}, ...] }
      // Flatten them so the table is simple to render.
      const rows = [];
      (data.logs || []).forEach((g) => {
        if (g.original) rows.push({ ...g.original, kind: "original" });
        if (Array.isArray(g.edits)) {
          g.edits.forEach((e) => rows.push({ ...e, kind: `edit v${e.version}` }));
        }
      });

      // Optional: stable sort by (log_id, version)
      rows.sort((a, b) =>
        (a.log_id || "").localeCompare(b.log_id || "") ||
        (a.version || 0) - (b.version || 0)
      );

      setBulkRows(rows);
    } catch (err) {
      console.error(err);
      setError("Request failed");
    }
  }

  return (
    <div className="container-app py-8">
      <h1 className="h1 mb-6">Auditor Dashboard</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Verify single log */}
        <section className="card">
          <div className="card-body">
            <h2 className="h2 mb-4">Verify Single Log</h2>

            <form onSubmit={verifySingle} className="grid gap-3">
              <div>
                <label className="label">Case ID</label>
                <input
                  className="input bg-white"
                  placeholder="e.g., C-1-2-01"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Log ID</label>
                <input
                  className="input bg-white"
                  placeholder="e.g., L-C-1-2-01-01"
                  value={logId}
                  onChange={(e) => setLogId(e.target.value)}
                  required
                />
              </div>

              <div>
                <button type="submit" className="btn btn-primary">
                  Verify Log
                </button>
              </div>
            </form>

            {singleResult && (
              <div className="mt-6 space-y-2 text-sm">
                <div>
                  <span className="font-medium">Log ID:</span> {singleResult.log_id}
                </div>
                <div className="break-all">
                  <span className="font-medium">On-chain hash:</span>{" "}
                  {singleResult.on_chain_hash}
                </div>
                <div className="break-all">
                  <span className="font-medium">Recomputed hash:</span>{" "}
                  {singleResult.recomputed_hash}
                </div>
                <div>
                  <span className="font-medium">Version:</span>{" "}
                  {singleResult.version}
                </div>
                <div className="pt-1">
                  <Badge ok={singleResult.verified} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Verify all logs in case */}
        <section className="card">
          <div className="card-body">
            <h2 className="h2 mb-4">Verify All Logs in Case</h2>

            <form
              onSubmit={verifyCase}
              className="grid gap-3 md:grid-cols-[1fr_auto]"
            >
              <div>
                <label className="label">Case ID</label>
                <input
                  className="input bg-white"
                  placeholder="e.g., C-1-2-01"
                  value={caseIdAll}
                  onChange={(e) => setCaseIdAll(e.target.value)}
                  required
                />
              </div>
              <div className="self-end">
                <button type="submit" className="btn btn-secondary">
                  Verify Case
                </button>
              </div>
            </form>

            <div className="mt-6 overflow-x-auto">
              {bulkRows.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Version</th>
                      <th>Type</th>
                      <th>On-chain Hash</th>
                      <th>Recomputed Hash</th>
                      <th>Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map((row) => (
                      <tr key={`${row.log_id}-v${row.version}`}>
                        <td className="whitespace-nowrap">{row.log_id}</td>
                        <td className="whitespace-nowrap">{row.version}</td>
                        <td className="whitespace-nowrap">{row.kind || "-"}</td>
                        <td className="break-all">{row.on_chain_hash}</td>
                        <td className="break-all">{row.recomputed_hash}</td>
                        <td>
                          <Badge ok={row.verified}>{row.verified ? "✓" : "✕"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-600">
                  No logs found for this case.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

