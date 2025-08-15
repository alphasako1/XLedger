// components/common/CaseStatusHistory.jsx
import { useEffect, useState } from "react";

export default function CaseStatusHistory({ caseId, token }) {
  const [history, setHistory] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) return;
    async function fetchHistory() {
      const res = await fetch(`/api/case_status_history/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory(await res.json());
      } else {
        alert("Failed to fetch status history");
      }
    }
    fetchHistory();
  }, [show, caseId, token]);

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => setShow(!show)}>
        {show ? "Hide Status History" : "View Status History"}
      </button>

      {show && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
          <ul className="space-y-2">
            {history.length === 0 ? (
              <li className="text-sm text-slate-600">No status changes yet.</li>
            ) : (
              history.map((entry, i) => (
                <li key={i} className="text-sm">
                  <div className="font-medium">
                    {new Date(entry.changed_at).toLocaleString()}
                  </div>
                  <div className="text-slate-700">
                    {entry.old_status.replace(/_/g, " ")} →{" "}
                    {entry.new_status.replace(/_/g, " ")}
                  </div>
                  {entry.reason && (
                    <div className="text-slate-600">
                      <em>Reason:</em> {entry.reason}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

