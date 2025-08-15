export default function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} XLedger. All rights reserved.</div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="mailto:xledger.help@gmail.com" className="underline">xledger.help@gmail.com</a>
          <span>•</span>
          <a href="tel:+447399469993" className="underline">+44 7399 469 993</a>
          <span>•</span>
          <a href="https://www.google.com/maps/search/?api=1&query=Rennes%20Dr,%20Exeter%20EX4%204P" className="underline" target="_blank" rel="noreferrer">
            Rennes Dr, Exeter EX4 4P</a>
          <span>•</span>
          <a href="/privacy" className="underline">
          Privacy Notice
          </a>

        </div>
      </div>
    </footer>
  );
}
