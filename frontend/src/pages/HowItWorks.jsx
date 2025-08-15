function StepCard({ title, caption, icon }) {
  return (
    <div className="card">
      <div className="card-body flex items-start gap-3">
        <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-soft">
          {icon}
        </div>
        <div>
          <div className="font-semibold text-brand-dark">{title}</div>
          <div className="text-sm text-slate-700">{caption}</div>
        </div>
      </div>
    </div>
  );
}

const icons = {
  briefcase: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green">
      <path d="M10 2h4a2 2 0 0 1 2 2v2H8V4a2 2 0 0 1 2-2Z"/><path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M12 12v2"/><path d="M4 12h16"/>
    </svg>
  ),
  contract: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green">
      <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z"/><path d="M8 10h6M8 14h4"/>
    </svg>
  ),
  handshake: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green">
      <path d="m8 13 3 3a3 3 0 0 0 4-4l-3-3"/><path d="M3 8l4-4 5 5"/><path d="M21 12l-4 4-5-5"/>
    </svg>
  ),
  live: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green">
      <circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 7.76a6 6 0 0 0 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
  folders: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green">
      <path d="M4 8h4l2 2h10v8a2 2 0 0 1-2 2H4z"/><path d="M4 8V6a2 2 0 0 1 2-2h4l2 2"/>
    </svg>
  ),
  ethereum: (
    <svg width="26" height="26" viewBox="0 0 24 24" className="text-brand-green">
      <path d="M12 2l7 10-7 4-7-4 7-10z" fill="currentColor" opacity=".85"/>
      <path d="M12 22l7-10-7 4-7-4 7 10z" fill="currentColor"/>
    </svg>
  ),
  verify: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5l-3-3V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  shield: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green">
      <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
};

function ArrowRight() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
        <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
      </svg>
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="md:hidden flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
        <path d="M12 5v14"/><path d="m5 13 7 7 7-7"/>
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  const steps = [
    { title: "Lawyer Creates Case", caption: "Start a new case and assign a client.", icon: icons.briefcase },
    { title: "Pending Contract", caption: "Draft terms and send for e-signature.", icon: icons.contract },
    { title: "Client Signs", caption: "Client signs to accept the terms.", icon: icons.handshake },
    { title: "Case Goes Live", caption: "Smart contract is created on-chain.", icon: icons.live },
    { title: "Logs & Edits", caption: "Lawyer logs work; edits are versioned.", icon: icons.folders },
    { title: "Hashed on Ethereum", caption: "Each log is hashed and anchored.", icon: icons.ethereum },
    { title: "Auditor Verifies", caption: "Auditors check the on-chain hashes.", icon: icons.verify },
    { title: "Tamper-Proof Proof", caption: "Clients get verifiable assurance.", icon: icons.shield },
  ];

  const row1 = steps.slice(0, 4);
  const row2 = steps.slice(4);

  return (
    <div className="min-h-full">

      <section className="container-app py-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-brand-dark">
          How It Works
        </h1>
        <p className="mt-3 text-slate-700 max-w-3xl">
          XLedger turns case activity into verifiable proofs. Below is the exact flow from case creation to
          tamper-proof assurance. No sensitive data is put on-chain, only cryptographic hashes.
        </p>

        {/* Mobile: vertical flow */}
        <div className="md:hidden mt-8 space-y-2">
          {steps.map((s, i) => (
            <div key={s.title}>
              <StepCard {...s} />
              {i !== steps.length - 1 && <ArrowDown />}
            </div>
          ))}
        </div>

        {/* Desktop: two rows with arrows */}
        <div className="hidden md:block mt-8 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-8 items-center gap-3">
            {row1.map((s, i) => (
              <div key={s.title} className="col-span-2">
                <StepCard {...s} />
              </div>
            ))}
            {/* Arrows overlay between col groups */}
            <div className="pointer-events-none absolute"></div>
          </div>
          {/* Arrow line between cards (row 1) */}
          <div className="flex items-center justify-between px-2">
            <div className="basis-1/4"></div><ArrowRight />
            <div className="basis-1/4"></div><ArrowRight />
            <div className="basis-1/4"></div><ArrowRight />
            <div className="basis-1/4"></div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-8 items-center gap-3">
            {row2.map((s) => (
              <div key={s.title} className="col-span-2">
                <StepCard {...s} />
              </div>
            ))}
          </div>
          {/* Arrow line between cards (row 2) */}
          <div className="flex items-center justify-between px-2">
            <div className="basis-1/4"></div><ArrowRight />
            <div className="basis-1/4"></div><ArrowRight />
            <div className="basis-1/4"></div><ArrowRight />
            <div className="basis-1/4"></div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/register" className="btn btn-secondary shadow-soft">Create free account</a>
          <a href="/login" className="btn btn-ghost">Login</a>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Tip: You can test as a lawyer and a client in different browsers to see the full flow end-to-end.
        </p>
      </section>
    </div>
  );
}
