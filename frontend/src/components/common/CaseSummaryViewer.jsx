// components/common/CaseSummaryViewer.jsx
import { useState } from "react";

export default function CaseSummaryViewer({ caseId, token }) {
  const [summary, setSummary] = useState(null);
  const [show, setShow] = useState(false);

  async function fetchSummary() {
    const res = await fetch(`http://localhost:8000/case_summary/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setSummary(await res.json());
      setShow(true);
    } else {
      alert("Failed to fetch summary");
    }
  }

  return (
    <div>
      <button
        className="btn btn-secondary"
        onClick={show ? () => setShow(false) : fetchSummary}
      >
        {show ? "Hide Summary" : "View Summary"}
      </button>

      {show && summary && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid gap-1 text-sm">
            <div><span className="font-medium">Title:</span> {summary.title}</div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              {summary.status.replace(/_/g, " ")}
            </div>
            <div>
              <span className="font-medium">Total Logs:</span> {summary.total_logs}
            </div>
            <div>
              <span className="font-medium">Total Time Spent:</span>{" "}
              {summary.total_time_spent} min
            </div>
            <div>
              <span className="font-medium">Lawyer Email:</span>{" "}
              {summary.lawyer_email}
            </div>
            <div>
              <span className="font-medium">Client Email:</span>{" "}
              {summary.client_email}
            </div>
            <div>
              <span className="font-medium">Created At:</span>{" "}
              {new Date(summary.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
