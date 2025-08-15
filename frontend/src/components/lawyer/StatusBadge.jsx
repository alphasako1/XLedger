export default function StatusBadge({ status }) {
  const map = {
    pending:        { label: "Pending",        bg: "bg-amber-100",   text: "text-amber-800" },
    active:         { label: "Active",         bg: "bg-emerald-100", text: "text-emerald-800" },
    in_progress:    { label: "In Progress",    bg: "bg-blue-100",    text: "text-blue-800" },
    on_hold:        { label: "On Hold",        bg: "bg-slate-200",   text: "text-slate-800" },
    awaiting_client:{ label: "Awaiting Client",bg: "bg-purple-100",  text: "text-purple-800" },
    completed:      { label: "Completed",      bg: "bg-teal-100",    text: "text-teal-800" },
    archived:       { label: "Archived",       bg: "bg-slate-100",   text: "text-slate-700" },
    cancelled:      { label: "Cancelled",      bg: "bg-rose-100",    text: "text-rose-800" },
    disputed:       { label: "Disputed",       bg: "bg-orange-100",  text: "text-orange-800" },
  };
  const { label, bg, text } = map[status] || { label: status?.replace(/_/g, " "), bg: "bg-slate-100", text: "text-slate-800" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}
