import LogoutButton from "../../components/common/LogoutButton";

export default function Header({ showLogout = true }) {
  const isAuthed = !!localStorage.getItem("token");

  return (
    <header className="border-b border-white/60 bg-white/70 backdrop-blur">
      {/* full-width row, no centered container */}
      <div className="w-full px-4 md:px-6 lg:px-8 flex items-center justify-between py-3">
        {/* Brand: single image in a white pill */}
        <div className="inline-flex items-center rounded-3xl bg-white/95 border border-slate-200 shadow-soft px-3 py-1.5">
          <img
            src="/xledger-full.png"
            alt="XLedger"
            className="h-10 md:h-12 w-auto block"
          />
        </div>

        {/* Right side: contact chips + (optional) logout — no tagline */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <a
            href="mailto:xledger.help@gmail.com"
            className="inline-flex items-center gap-1 rounded-xl bg-white/90 border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-white shadow-soft"
          >
            {/* mail icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z"></path><path d="m22 6-10 7L2 6"></path>
            </svg>
            xledger.help@gmail.com
          </a>

          <a
            href="tel:+447399469993"
            className="inline-flex items-center gap-1 rounded-xl bg-white/90 border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-white shadow-soft"
          >
            {/* phone icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h4.09a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.58-1.33a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z"/>
            </svg>
            +44 7399 469 993
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Rennes%20Dr,%20Exeter%20EX4%204P"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-white/90 border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-white shadow-soft"
          >
            {/* map pin icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Rennes Dr, Exeter EX4 4P
          </a>

          {isAuthed && showLogout && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
