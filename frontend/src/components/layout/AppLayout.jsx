import Header from "./Header";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-full">
      <Header />
      <main className="container-app py-8">
        <div className="card">
          <div className="card-body">{children}</div>
        </div>
      </main>
    </div>
  );
}
