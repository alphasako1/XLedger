import { useState } from "react";

export default function CaseStatusUpdate({ caseId, token, onUpdated }) {
  const [status, setStatus] = useState("");
  const [customStatus, setCustomStatus] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);

    const body = {
      status,
      custom_status: status === "other" ? customStatus : "",
      reason: reason || "Status updated",
    };

    try {
      const res = await fetch(`/api/update_case_status/${caseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update status");

      setOk("Case status updated.");
      onUpdated && onUpdated();
      setCustomStatus("");
      setReason("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {ok && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {ok}
        </div>
      )}

      <div>
        <label className="label">Select Status</label>
        <select
          className="input bg-white w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        >
          <option value="">--Choose--</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="awaiting_client">Awaiting Client</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
          <option value="cancelled">Cancelled</option>
          <option value="disputed">Disputed</option>
          <option value="other">Other (custom)</option>
        </select>
      </div>

      {status === "other" && (
        <div>
          <label className="label">Custom Status</label>
          <input
            className="input bg-white w-full"
            type="text"
            placeholder="e.g., awaiting evidence"
            value={customStatus}
            onChange={(e) => setCustomStatus(e.target.value)}
            required
          />
        </div>
      )}

      <div>
        <label className="label">Reason</label>
        <input
          className="input bg-white w-full"
          type="text"
          placeholder="Optional reason (shown in history)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="pt-1">
        <button type="submit" disabled={loading} className="btn btn-secondary">
          {loading ? "Updating…" : "Update Status"}
        </button>
      </div>
    </form>
  );
}

