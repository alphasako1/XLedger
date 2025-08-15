import { useState } from "react";

export default function LogForm({ caseId, token, onSuccess, onClose }) {
  const [description, setDescription] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/log_progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          case_id: caseId,
          description,
          time_spent: parseInt(timeSpent, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to log progress");

      setDescription("");
      setTimeSpent("");
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-brand-dark mb-3">
        Log Work for Case: {caseId}
      </h3>

      {err && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="grid gap-3">
        <div>
          <label className="label">Description</label>
          <input
            type="text"
            className="input bg-white"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you do?"
          />
        </div>

        <div>
          <label className="label">Time Spent (minutes)</label>
          <input
            type="number"
            className="input bg-white"
            required
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            min={1}
            placeholder="e.g., 30"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={loading} className="btn btn-secondary">
            {loading ? "Submitting…" : "Submit"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
