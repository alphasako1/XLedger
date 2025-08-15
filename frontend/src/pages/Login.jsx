import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/layout/Header';
import HeroPanel from '../components/marketing/HeroPanel';
import SiteFooter from '../components/layout/SiteFooter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // try to read JSON error first; fall back to text
        let msg = 'Login failed';
        try {
          const body = await res.json();
          msg = body?.detail || msg;
        } catch {
          const txt = await res.text();
          if (txt) msg = txt;
        }
        setError(msg);
        return;
      }

      const data = await res.json();
      const token = data.access_token;
      const role = jwtDecode(token).role;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'lawyer') navigate('/lawyer');
      else if (role === 'client') navigate('/client');
      else if (role === 'auditor') navigate('/auditor');
    } catch {
      setError('Could not reach server. Is the backend running on http://localhost:8000?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full">
      <Header showLogout={false} />
      <main className="container-app py-12 grid gap-12 md:grid-cols-2 items-start">
        {/* Left: marketing */}
        <HeroPanel />

        {/* Right: login card */}
        <div className="card w-full max-w-xl justify-self-end">
          <div className="card-body">
            <h2 className="h2 mb-4">Login</h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="grid gap-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-secondary w-full py-3 text-base font-semibold shadow-soft disabled:opacity-60"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <p className="mt-4 text-sm">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
