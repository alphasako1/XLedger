import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import SiteFooter from '../components/layout/SiteFooter';
import HeroPanel from '../components/marketing/HeroPanel'; // ensure the path matches your file structure

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Registration successful! Please log in.');
      navigate('/login');
    } else {
      alert(data.detail || data.error || 'Registration failed');
    }
  }

  return (
    <div className="min-h-full">
      <Header showLogout={false} />

      <main className="container-app py-12 grid gap-12 md:grid-cols-2 items-start">
        {/* Left: marketing/hero */}
        <HeroPanel />

        {/* Right: register card */}
        <div className="card w-full max-w-xl justify-self-end">
          <div className="card-body">
            <h2 className="h2 mb-4">Register</h2>

            <form onSubmit={handleRegister} className="grid gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="lawyer">Lawyer</option>
                  <option value="client">Client</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-secondary w-full py-3 text-base font-semibold shadow-soft"
              >
                Register
              </button>
            </form>

            <p className="mt-4 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>
        <SiteFooter />
    </div>
  );
}

