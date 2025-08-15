import { useState } from "react";
import LogItem from "../common/LogItem";
import LogForm from "./logs/LogForm";
import CaseStatusUpdate from "./CaseStatus/CaseStatusUpdate";
import CaseStatusHistory from "../common/CaseStatusHistory";
import CaseSummaryViewer from "../common/CaseSummaryViewer";
import StatusBadge from "./StatusBadge";

/* -------- Grant Audit Access -------- */
function GrantAuditAccess({ caseId, token }) {
  const [email, setEmail] = useState("");
  const [hours, setHours] = useState(24);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function grant() {
    setLoading(true);
    setMsg(null);
    try {
      const hrs = Math.max(1, parseInt(hours || 24, 10));
      const url =
        `http://localhost:8000/audit/grant_access/${caseId}` +
        `?auditor_email=${encodeURIComponent(email)}&expiry_hours=${hrs}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to grant access");

      setMsg({ type: "ok", text: `Access granted to ${email} for ${hrs} hours.` });
      setEmail("");
      setHours(24);
    } catch (e) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-brand-dark mb-2">
        Grant Audit Access
      </div>

      {/* Responsive row: email stays readable, hours + button don't steal width */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
        <div className="flex-1 min-w-[14rem]">
          <label className="label">Auditor Email</label>
          <input
            type="email"
            className="input bg-white w-full text-slate-900 placeholder:text-slate-400"
            placeholder="auditor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="shrink-0">
          <label className="label">Hours</label>
          <input
            type="number"
            min={1}
            className="input bg-white w-28 text-slate-900"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
          />
        </div>

        <div className="shrink-0 md:self-end">
          <button
            className="btn btn-secondary h-[42px]"
            disabled={!email || loading}
            onClick={grant}
          >
            {loading ? "Granting…" : "Grant Access"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs border ${
            msg.type === "ok"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}

/* -------- Case Card -------- */
export default function CaseItem({ caseData, token, onRefresh }) {
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  async function fetchLogs() {
    const res = await fetch(`http://localhost:8000/case_logs/${caseData.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert("Failed to fetch logs");
    const data = await res.json();
    setLogs(data);
    setShowLogs(true);
  }

  return (
    <div className="card">
      <div className="card-body">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-brand-dark">
              {caseData.title}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Case ID: {caseData.id}
            </div>
            <div className="text-xs text-slate-600">
              Client ID: {caseData.client_id}
            </div>
          </div>
          <StatusBadge status={caseData.status} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowLogForm((s) => !s)}
          >
            {showLogForm ? "Close Log Form" : "Log Work"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={showLogs ? () => setShowLogs(false) : fetchLogs}
          >
            {showLogs ? "Hide Logs" : "View Logs"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowStatus((s) => !s)}
          >
            {showStatus ? "Hide Status" : "Update Status"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowAudit((s) => !s)}
          >
            {showAudit ? "Hide Audit" : "Grant Audit"}
          </button>

          {/* These two render their own toggles */}
          <CaseStatusHistory caseId={caseData.id} token={token} />
          <CaseSummaryViewer caseId={caseData.id} token={token} />
        </div>

        {/* Collapsibles */}
        {showLogForm && (
          <div className="mt-4">
            <LogForm
              caseId={caseData.id}
              token={token}
              onSuccess={async () => {
                await fetchLogs();
                setShowLogForm(false);
              }}
              onClose={() => setShowLogForm(false)}
            />
          </div>
        )}

        {showLogs && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-sm font-medium mb-2">Logs</div>
            <ul className="space-y-3 pl-0">
              {logs.length === 0 ? (
                <li className="text-sm text-slate-600">No logs yet.</li>
              ) : (
                logs.map((log) => (
                  <LogItem
                    key={log.id}
                    log={log}
                    token={token}
                    onLogUpdated={fetchLogs}
                  />
                ))
              )}
            </ul>
          </div>
        )}

        {showStatus && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
            <CaseStatusUpdate
              caseId={caseData.id}
              token={token}
              onUpdated={onRefresh}
            />
          </div>
        )}

        {showAudit && (
          <GrantAuditAccess caseId={caseData.id} token={token} />
        )}
      </div>
    </div>
  );
}
