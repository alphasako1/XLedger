export default function HeroPanel() {
  return (
    <div className="self-center space-y-6">
      <h1 className="text-5xl md:text-6xl font-black tracking-tight text-brand-dark">
        DISPUTE WITH THE WALL
      </h1>

      <p className="text-slate-700 max-w-prose">
        A lightweight, audit-ready case ledger. Sign contracts, log work, and
        prove integrity with on-chain verifications.
      </p>

      <ul className="space-y-3 text-slate-700">
        <li className="flex items-start gap-2">
          {/* check icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="mt-0.5 text-brand-green">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span><strong>Immutable logs</strong> — every entry is hashed and anchored on-chain.</span>
        </li>
        <li className="flex items-start gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="mt-0.5 text-brand-green">
            <path d="M10 2H3v7" /><path d="M21 14v7h-7" /><path d="M21 3 14 10" /><path d="M10 14 3 21" />
          </svg>
          <span><strong>Auditor mode</strong> — verify any log or full case history instantly.</span>
        </li>
        <li className="flex items-start gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="mt-0.5 text-brand-green">
            <path d="M20 7h-9" /><path d="M14 17H4" /><path d="M15 2v20" />
          </svg>
          <span><strong>Client e-signature</strong> — activate cases once both sides sign.</span>
        </li>
        <li className="flex items-start gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className="mt-0.5 text-brand-green">
            <path d="M12 3l9 4-9 4-9-4 9-4z" /><path d="M3 11l9 4 9-4" /><path d="M3 19l9 4 9-4" />
          </svg>
          <span><strong>Privacy-first</strong> — only hashes go on chain; your data stays in app.</span>
        </li>
      </ul>

      <div className="flex flex-wrap gap-3">
        {/* Link to register for new users, or keep as secondary CTA on login page */}
        <a href="/register" className="btn btn-secondary shadow-soft">Create free account</a>
        <a href="/how-it-works" className="btn btn-ghost">How it works</a>
      </div>

      <p className="text-xs text-slate-600">No credit card required. You can delete your account anytime.</p>
    </div>
  );
}